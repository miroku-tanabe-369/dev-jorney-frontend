'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAuthSession } from '@aws-amplify/auth';
import { setAuthCookie } from '@/lib/set-auth-cookie';

// 認証時のルーティング処理を実行する

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error);
        // エラー時は3秒後にトップページにリダイレクト
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('認証コードが取得できませんでした');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try {
        // Amplifyが自動的に認証コードをトークンに交換するまで少し待機
        // 最大5回までリトライ（合計約2.5秒）
        let retries = 0;
        const maxRetries = 5;
        
        const checkSession = async (): Promise<boolean> => {
          try {
            const session = await fetchAuthSession();
            if (session.tokens?.idToken) {
              return true;
            }
            return false;
          } catch {
            return false;
          }
        };

        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const hasToken = await checkSession();
          
          if (hasToken) {
            // 認証トークンをCookieに保存（Server Componentsで使用するため）
            await setAuthCookie();
            setStatus('success');
            // ダッシュボードにリダイレクト
            router.push('/dashboard');
            return;
          }
          
          retries++;
        }

        // リトライ後もトークンが取得できない場合
        setStatus('error');
        setErrorMessage('トークンの取得に失敗しました。再度ログインしてください。');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setErrorMessage('認証処理中にエラーが発生しました');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">認証中...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-destructive text-xl">認証エラー</div>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">3秒後にトップページにリダイレクトします...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">リダイレクト中...</p>
      </div>
    </div>
  );
}

