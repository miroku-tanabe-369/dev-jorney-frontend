import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware: 認証トークンをCookieから取得してヘッダーに追加
 * Server Componentsで使用できるようにするため
 */
export async function middleware(request: NextRequest) {
  // API Routesと静的ファイルはスキップ
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Cookieから認証トークンを取得
  // AmplifyはデフォルトでCookieにトークンを保存しないため、
  // カスタムCookie名を使用（クライアント側で設定する必要がある）
  const tokenCookie = request.cookies.get('amplify-auth-token');
  
  // トークンが存在する場合、リクエストヘッダーに追加
  if (tokenCookie) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-auth-token', tokenCookie.value);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

