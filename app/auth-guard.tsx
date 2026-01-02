'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchAuthSession, signInWithRedirect } from '@aws-amplify/auth';

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
          setIsAuthenticated(true);
        } else {
          // 未認証の場合はCognito Hosted UIにリダイレクト
          setIsAuthenticated(false);
          await signInWithRedirect();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        try {
          await signInWithRedirect();
        } catch (signInError) {
          console.error('Sign in redirect failed:', signInError);
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

