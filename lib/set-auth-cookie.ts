'use client';

/**
 * クライアントサイドで認証トークンをCookieに保存
 * Server Componentsで使用できるようにするため
 */

import { fetchAuthSession } from '@aws-amplify/auth';

/**
 * 認証トークンをCookieに保存
 * この関数はクライアントサイドでのみ実行される
 */
export async function setAuthCookie() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (token) {
      // Cookieにトークンを保存（HttpOnlyはfalseにして、JavaScriptからアクセス可能にする）
      // セキュリティのため、SameSite=StrictとSecureフラグを設定
      document.cookie = `amplify-auth-token=${token}; path=/; max-age=3600; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      console.log('[Set Auth Cookie] ✅ Token saved to cookie');
    } else {
      console.warn('[Set Auth Cookie] ❌ No access token found in session');
      // Cookieを削除
      document.cookie = 'amplify-auth-token=; path=/; max-age=0';
    }
  } catch (error) {
    console.error('[Set Auth Cookie] Error setting auth cookie:', error);
  }
}

/**
 * 認証トークンのCookieを削除
 */
export function removeAuthCookie() {
  document.cookie = 'amplify-auth-token=; path=/; max-age=0';
  console.log('[Remove Auth Cookie] ✅ Token cookie removed');
}

