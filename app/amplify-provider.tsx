'use client';

import { useEffect, useState } from 'react';
import { configureAmplify } from '@/lib/amplify-config';

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      configureAmplify();
    } catch (error) {
      console.error('Failed to configure Amplify:', error);
      setConfigError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-destructive text-xl">設定エラー</div>
          <p className="text-muted-foreground mb-2">{configError}</p>
          <p className="text-sm text-muted-foreground">
            Amplifyコンソールで環境変数が正しく設定されているか確認してください。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

