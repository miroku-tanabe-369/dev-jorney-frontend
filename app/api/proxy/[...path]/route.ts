import { NextRequest, NextResponse } from 'next/server';

/**
 * プロキシAPI Routes
 * HTTPSで配信されるフロントエンドからHTTPのバックエンドAPIにアクセスする際の
 * Mixed Contentエラーを回避するため、サーバーサイドでHTTPリクエストをプロキシします。
 * 
 * 注意: サーバーサイドではAmplifyの認証情報を直接取得できないため、
 * クライアントから送信されたAuthorizationヘッダーを使用します。
 */

// GETリクエストの処理
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  console.log('[Proxy] GET request received');
  try {
    const resolvedParams = await params;
    console.log('[Proxy] Params resolved:', resolvedParams);
    return handleRequest(request, resolvedParams, 'GET');
  } catch (error) {
    console.error('[Proxy] Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POSTリクエストの処理
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

// PUTリクエストの処理
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

// DELETEリクエストの処理
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

/**
 * リクエストを処理する共通関数
 */
async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  // 環境変数からバックエンドAPIのベースURLを取得
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     process.env.NEXT_PUBLIC_API_URL;
  
  // 環境変数が設定されていない、またはHTTPでない場合はエラー
  if (!apiBaseUrl || !apiBaseUrl.startsWith('http://')) {
    console.error('API base URL not configured or not HTTP:', apiBaseUrl);
    return NextResponse.json(
      { error: 'API base URL not configured or not HTTP' },
      { status: 500 }
    );
  }

  try {
    // リクエストパスを構築
    // 例: ['users', 'dashboard'] → 'users/dashboard'
    const path = params.path.join('/');
    const url = new URL(path, apiBaseUrl);
    
    // クエリパラメータを追加
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // リクエストヘッダーをコピー（Authorizationヘッダーを含む）
    const headers: HeadersInit = {};
    
    // Authorizationヘッダーを明示的に取得して転送（重要）
    // Next.jsのheadersは大文字小文字を区別しないため、小文字で取得
    let authorization = request.headers.get('authorization');
    
    // すべてのヘッダーをログ出力（デバッグ用）
    const allHeaders = Array.from(request.headers.entries());
    console.log('[Proxy] ========================================');
    console.log('[Proxy] All incoming headers:', allHeaders.map(([k, v]) => [k, k.toLowerCase() === 'authorization' ? v.substring(0, 30) + '...' : v]));
    console.log('[Proxy] Header count:', allHeaders.length);
    
    // Authorizationヘッダーを複数の方法で取得を試みる
    if (!authorization) {
      // 大文字小文字を変えて試す
      authorization = request.headers.get('Authorization') || 
                      request.headers.get('AUTHORIZATION');
    }
    
    if (authorization) {
      headers['Authorization'] = authorization;
      // デバッグ用ログ（本番環境では削除可能）
      console.log('[Proxy] ✅ Authorization header found');
      console.log('[Proxy] Authorization header length:', authorization.length);
      console.log('[Proxy] Authorization header prefix:', authorization.substring(0, 30) + '...');
      console.log('[Proxy] Is Bearer token?', authorization.startsWith('Bearer '));
    } else {
      console.warn('[Proxy] ❌ Authorization header not found in request');
      console.warn('[Proxy] This will cause 401 Unauthorized error');
      // すべてのヘッダー名を出力
      console.log('[Proxy] Header names:', allHeaders.map(([k]) => k));
    }
    
    // その他のヘッダーをコピー
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // ホスト関連のヘッダーとAuthorization（既に処理済み）は除外
      if (!['host', 'connection', 'content-length', 'content-encoding', 'authorization'].includes(lowerKey)) {
        headers[key] = value;
      }
    });

    // Content-Typeヘッダーが設定されていない場合はデフォルトを設定
    if (method !== 'GET' && method !== 'DELETE' && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    // リクエストボディを取得（GET/DELETEの場合は不要）
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
        body = undefined;
      }
    }

    // デバッグ用ログ（本番環境では削除可能）
    console.log('[Proxy] ========================================');
    console.log('[Proxy] Request method:', method);
    console.log('[Proxy] Request path:', path);
    console.log('[Proxy] Forwarding request to:', url.toString());
    console.log('[Proxy] Request headers keys:', Object.keys(headers));
    console.log('[Proxy] Authorization in headers?', !!headers['Authorization']);
    if (headers['Authorization']) {
      console.log('[Proxy] Authorization value (first 30 chars):', headers['Authorization'].substring(0, 30) + '...');
    }
    console.log('[Proxy] ========================================');
    
    // バックエンドAPIにリクエストを送信
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });
    
    // レスポンスデータを取得
    // Content-Typeを確認して、JSONの場合はパースして返す
    const contentType = response.headers.get('content-type') || '';
    let data: string;
    let parsedData: any = null;
    
    if (contentType.includes('application/json')) {
      // JSONレスポンスの場合、パースする
      try {
        parsedData = await response.json();
        console.log('[Proxy] ✅ Successfully parsed JSON response');
        console.log('[Proxy] Parsed data keys:', Object.keys(parsedData || {}));
        // デバッグ用に文字列化（ログ出力用のみ）
        data = JSON.stringify(parsedData);
      } catch (parseError) {
        // JSONパースに失敗した場合はテキストとして扱う
        console.error('[Proxy] ❌ Failed to parse JSON response, treating as text:', parseError);
        data = await response.text();
        console.error('[Proxy] Raw response data length:', data.length);
        console.error('[Proxy] Raw response data (first 500 chars):', data.substring(0, 500));
      }
    } else {
      // JSON以外の場合はテキストとして取得
      console.log('[Proxy] ⚠️ Content-Type is not JSON, treating as text');
      data = await response.text();
    }
    
    // デバッグ用ログ（詳細版）
    console.log('[Proxy] ========================================');
    console.log('[Proxy] Response status:', response.status);
    console.log('[Proxy] Response status text:', response.statusText);
    console.log('[Proxy] Response data length:', data.length);
    console.log('[Proxy] Response data (first 200 chars):', data.substring(0, 200));
    
    if (response.status === 401) {
      console.error('[Proxy] ❌ 401 Unauthorized Error');
      console.error('[Proxy] Error response body (full):', data);
      console.error('[Proxy] Authorization header was sent?', !!headers['Authorization']);
      console.error('[Proxy] Authorization variable exists?', !!authorization);
      if (headers['Authorization']) {
        console.error('[Proxy] Authorization header value (first 50 chars):', headers['Authorization'].substring(0, 50) + '...');
      } else {
        console.error('[Proxy] ⚠️ Authorization header was NOT included in forwarded headers!');
        console.error('[Proxy] This is the root cause of the 401 error.');
      }
      console.error('[Proxy] Request URL:', url.toString());
      console.error('[Proxy] All forwarded headers:', Object.keys(headers));
      console.error('[Proxy] Authorization variable value (first 50 chars):', authorization ? authorization.substring(0, 50) + '...' : 'null');
    } else if (response.status >= 400) {
      console.error('[Proxy] ❌ Error response:', response.status, data);
    } else {
      console.log('[Proxy] ✅ Success response');
    }
    console.log('[Proxy] ========================================');
    
    // レスポンスヘッダーをコピー
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // CORS関連のヘッダーは除外（Next.jsが自動的に設定するため）
      if (!key.toLowerCase().startsWith('access-control-')) {
        responseHeaders.set(key, value);
      }
    });

    // Content-Typeヘッダーを設定（レスポンスに含まれていない場合）
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
    }
    
    // レスポンスサイズを制限しないように設定（parsedDataがある場合はそのサイズを使用）
    // 注意: content-lengthはNextResponse.json()が自動的に設定するため、手動設定は不要
    // ただし、デバッグ用にログ出力
    if (parsedData !== null) {
      console.log('[Proxy] Parsed data size:', JSON.stringify(parsedData).length, 'bytes');
    } else {
      console.log('[Proxy] Text data size:', data.length, 'bytes');
    }

    // 401エラーの場合、詳細情報をレスポンスに含める（デバッグ用）
    if (response.status === 401) {
      let errorData: any = {};
      try {
        // 既にパース済みの場合はそれを使用、そうでない場合はパースを試みる
        if (parsedData) {
          errorData = parsedData;
        } else if (data && data.trim().length > 0) {
          // 不完全なJSONの場合を考慮して、可能な限りパースを試みる
          const trimmedData = data.trim();
          if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
            errorData = JSON.parse(trimmedData);
          } else {
            // JSONが不完全な場合、手動で構築
            errorData = { message: 'Unauthorized', statusCode: 401, rawResponse: data };
          }
        } else {
          errorData = { message: 'Unauthorized', statusCode: 401 };
        }
      } catch (parseError) {
        // JSONパースに失敗した場合は文字列として扱う
        console.error('[Proxy] Failed to parse error response as JSON:', parseError);
        console.error('[Proxy] Raw response data:', data);
        errorData = { 
          message: 'Unauthorized', 
          statusCode: 401, 
          rawResponse: data,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        };
      }
      
      // デバッグ情報を必ず含める
      const debugResponse = {
        ...errorData,
        _debug: {
          authorizationHeaderReceived: !!authorization,
          authorizationHeaderForwarded: !!headers['Authorization'],
          forwardedHeaders: Object.keys(headers),
          requestUrl: url.toString(),
          allIncomingHeaders: Array.from(request.headers.entries()).map(([k]) => k),
          authorizationHeaderValue: authorization ? authorization.substring(0, 50) + '...' : null,
          responseDataLength: data.length,
          responseDataPreview: data.substring(0, 200),
        }
      };
      
      console.log('[Proxy] Returning 401 error with debug info:', JSON.stringify(debugResponse, null, 2));
      
      return NextResponse.json(
        debugResponse,
        {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        }
      );
    }

    // クライアントにレスポンスを返す
    // JSONレスポンスの場合は、パース済みデータをJSON文字列として返す
    console.log('[Proxy] Content-Type:', contentType);
    console.log('[Proxy] Parsed data exists:', parsedData !== null);
    console.log('[Proxy] Parsed data type:', typeof parsedData);
    
    if (contentType.includes('application/json') && parsedData !== null) {
      console.log('[Proxy] ✅ Returning JSON response as string');
      console.log('[Proxy] JSON string length:', data.length);
      // Content-Typeヘッダーを明示的に設定
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
      // NextResponse.json()の代わりに、明示的にJSON文字列を返す
      // Amplifyのサーバーレス環境でNextResponse.json()が正しく動作しない場合があるため
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } else {
      console.log('[Proxy] ⚠️ Returning text response (not JSON or parsedData is null)');
      // JSON以外の場合はテキストとして返す
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error('[Proxy] ========================================');
    console.error('[Proxy] ❌ Proxy error occurred');
    console.error('[Proxy] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Proxy] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[Proxy] ========================================');
    
    return NextResponse.json(
      { 
        error: 'Failed to proxy request',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

