'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchAuthSession, signInWithRedirect, signOut } from '@aws-amplify/auth';
import { setAuthCookie, removeAuthCookie } from '@/lib/set-auth-cookie';

// アプリケーション全体の認証チェックを行う

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // null: 認証チェック false: 未認証 true: 認証済み

  useEffect(() => {
    const checkAuth = async () => {
      // コールバックページは認証チェックをスキップ
      if (pathname === '/callback') {
        setIsAuthenticated(true);
        return;
      }

      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken) {
          // 認証トークンをCookieに保存（Server Componentsで使用するため）
          await setAuthCookie();
          setIsAuthenticated(true);
        } else {
          // Cookieを削除
          removeAuthCookie();
          // 未認証の場合はCognito Hosted UIにリダイレクト
          setIsAuthenticated(false);
          await signInWithRedirect();
        }
      } catch (error: any) {
        // Cookieを削除
        removeAuthCookie();
        setIsAuthenticated(false);
        
        // UserAlreadyAuthenticatedExceptionが発生した場合、古いセッションをクリア
        const isAlreadyAuthenticatedError = 
          error?.name === 'UserAlreadyAuthenticatedException' || 
          error?.message?.includes('already a signed in user');
        
        if (isAlreadyAuthenticatedError) {
          try {
            // 古いセッションをクリア
            await signOut();
            removeAuthCookie();
            // 少し待ってからサインインにリダイレクト
            await new Promise(resolve => setTimeout(resolve, 100));
            await signInWithRedirect();
          } catch (signOutError) {
            removeAuthCookie();
            // サインアウトに失敗しても、サインインにリダイレクトを試みる
            try {
              await signInWithRedirect();
            } catch (signInError) {
              // エラーは無視（リダイレクト処理は継続）
            }
          }
        } else {
          // その他のエラーの場合は通常通りサインインにリダイレクト
          try {
            await signInWithRedirect();
          } catch (signInError: any) {
            // UserAlreadyAuthenticatedExceptionが発生した場合も同様に処理
            if (signInError?.name === 'UserAlreadyAuthenticatedException' || 
                signInError?.message?.includes('already a signed in user')) {
              try {
                await signOut();
                removeAuthCookie();
                await new Promise(resolve => setTimeout(resolve, 100));
                await signInWithRedirect();
              } catch (finalError) {
                // エラーは無視（リダイレクト処理は継続）
              }
            }
          }
        }
      }
    };

    checkAuth();
  }, [pathname]);

  if (isAuthenticated === null) {
    // 認証チェック中はローディング表示
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">認証中...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    // リダイレクト中
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">ログイン画面にリダイレクト中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

