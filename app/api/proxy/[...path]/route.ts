import { NextRequest, NextResponse } from 'next/server';

/**
 * プロキシAPI Routes
 * HTTPSで配信されるフロントエンドからHTTPのバックエンドAPIにアクセスする際の
 * Mixed Contentエラーを回避するため、サーバーサイドでHTTPリクエストをプロキシします。
 * 
 * 注意: サーバーサイドではAmplifyの認証情報を直接取得できないため、
 * クライアントから送信されたAuthorizationヘッダーを使用します。
 */

// Edge Runtimeを使用（Amplifyのサーバーレス環境での制限を回避）
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GETリクエストの処理
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    return handleRequest(request, resolvedParams, 'GET');
  } catch (error) {
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
    
    // Authorizationヘッダーを複数の方法で取得を試みる
    if (!authorization) {
      // 大文字小文字を変えて試す
      authorization = request.headers.get('Authorization') || 
                      request.headers.get('AUTHORIZATION');
    }
    
    if (authorization) {
      headers['Authorization'] = authorization;
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
        body = undefined;
      }
    }
    
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
        data = JSON.stringify(parsedData);
      } catch (parseError) {
        // JSONパースに失敗した場合はテキストとして扱う
        data = await response.text();
      }
    } else {
      // JSON以外の場合はテキストとして取得
      data = await response.text();
    }
    
    // レスポンスヘッダーをコピー
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // CORS関連のヘッダーは除外（Next.jsが自動的に設定するため）
      // content-lengthヘッダーも除外（Next.jsが自動的に設定するため）
      // transfer-encodingヘッダーも除外（Next.jsが自動的に処理するため）
      if (!key.toLowerCase().startsWith('access-control-') && 
          key.toLowerCase() !== 'content-length' &&
          key.toLowerCase() !== 'transfer-encoding') {
        responseHeaders.set(key, value);
      }
    });

    // Content-Typeヘッダーを設定（レスポンスに含まれていない場合）
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
    }
    
    // 401エラーの場合、エラーレスポンスを返す
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
            errorData = { message: 'Unauthorized', statusCode: 401 };
          }
        } else {
          errorData = { message: 'Unauthorized', statusCode: 401 };
        }
      } catch (parseError) {
        // JSONパースに失敗した場合はデフォルトエラーを返す
        errorData = { message: 'Unauthorized', statusCode: 401 };
      }
      
      return NextResponse.json(
        errorData,
        {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        }
      );
    }

    // クライアントにレスポンスを返す
    // JSONレスポンスの場合は、パース済みデータをJSON文字列として返す
    if (contentType.includes('application/json') && parsedData !== null) {
      // Edge Runtime用: TextEncoderとbtoaを使用してBase64エンコード
      // TextEncoderを使用してUint8Arrayに変換し、btoaでBase64化
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(data);
      
      // 大きな配列の場合、チャンクに分割して処理
      let base64Encoded: string;
      if (uint8Array.length > 65536) {
        // 65536バイト（64KB）を超える場合はチャンクに分割
        const chunks: string[] = [];
        const chunkSize = 65536;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          // Array.from()を使用してUint8Arrayを配列に変換
          const chunkArray = Array.from(chunk);
          const chunkString = String.fromCharCode(...chunkArray);
          chunks.push(btoa(chunkString));
        }
        base64Encoded = chunks.join('');
      } else {
        // 小さい場合は一度に処理
        // Array.from()を使用してUint8Arrayを配列に変換
        const uint8ArrayAsArray = Array.from(uint8Array);
        const stringFromCharCode = String.fromCharCode(...uint8ArrayAsArray);
        base64Encoded = btoa(stringFromCharCode);
      }
      
      // Content-Typeヘッダーを明示的に設定
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
      // Base64エンコード方式であることを示すカスタムヘッダーを追加
      responseHeaders.set('X-Response-Encoding', 'base64');
      
      // Base64エンコードされたデータをJSONオブジェクトとして返す
      // { "encoded": "base64string" } の形式で返す
      const encodedResponse = {
        encoded: base64Encoded
      };
      
      // content-lengthヘッダーを削除することで、Transfer-Encoding: chunkedが使用される
      responseHeaders.delete('content-length');
      
      // Edge Runtimeでは標準のResponseオブジェクトを使用
      return new Response(JSON.stringify(encodedResponse), {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } else {
      // JSON以外の場合はテキストとして返す
      // content-lengthヘッダーを削除することで、Transfer-Encoding: chunkedが使用される
      responseHeaders.delete('content-length');
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  } catch (error) {
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

