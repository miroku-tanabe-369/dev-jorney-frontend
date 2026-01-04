'use client';

import { Amplify } from 'aws-amplify';

// Amplifyの設定を初期化
export const configureAmplify = () => {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-northeast-1';
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  
  // コールバックURLとログアウトURLは現在のオリジンを使用
  const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';
  const logoutUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (!userPoolId || !userPoolClientId || !domain) {
    throw new Error('Missing required Cognito environment variables. Please check Amplify Console environment variables.');
  }

  // ドメインから末尾のスラッシュを削除
  const cleanDomain = domain.replace(/\/$/, '');

  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            oauth: {
              domain: cleanDomain,
              scopes: ['openid', 'email', 'profile'],
              redirectSignIn: [callbackUrl],
              redirectSignOut: [logoutUrl],
              responseType: 'code',
            },
          },
        },
      },
    }, { ssr: true });
  } catch (error) {
    throw error;
  }
};

