/**
 * サーバーサイドでAmplifyの認証トークンを取得する
 * headers()から取得（Middlewareで設定されたヘッダー）
 */

import { headers } from 'next/headers';

/**
 * リクエストヘッダーから認証トークンを取得
 * Middlewareで設定されたヘッダーから取得
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const headersList = await headers();
    const token = headersList.get('x-auth-token');
    
    if (token) {
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('[Get Server Token] Error getting token from headers:', error);
    return null;
  }
}

