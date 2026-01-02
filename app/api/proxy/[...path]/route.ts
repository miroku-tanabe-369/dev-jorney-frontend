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
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

// POSTリクエストの処理
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

// PUTリクエストの処理
export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

// DELETEリクエストの処理
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE');
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
    
    // レスポンスデータを取得（一度だけ読み取る）
    const data = await response.text();
    
    // デバッグ用ログ
    console.log('[Proxy] Response status:', response.status);
    if (response.status === 401) {
      console.error('[Proxy] ❌ 401 Unauthorized - Token may be invalid or missing');
      console.error('[Proxy] Error response body:', data);
    } else if (response.status >= 400) {
      console.error('[Proxy] ❌ Error response:', response.status, data);
    } else {
      console.log('[Proxy] ✅ Success response');
    }
    
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
      responseHeaders.set('content-type', 'application/json');
    }

    // クライアントにレスポンスを返す
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to proxy request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

