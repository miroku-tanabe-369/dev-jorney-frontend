import axios from "axios"
import { fetchAuthSession } from '@aws-amplify/auth'

/**
 * バックエンドAPIのベースURLを取得
 * 本番環境（HTTPS）でHTTPのAPI URLが指定されている場合、
 * Next.js API Routes経由でプロキシする
 */
const getBaseURL = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (apiUrl) {
    // ブラウザ環境でHTTPS接続かつHTTPのAPI URLが指定されている場合
    if (typeof window !== 'undefined' && 
        window.location.protocol === 'https:' && 
        apiUrl.startsWith('http://')) {
      // Next.js API Routes経由でプロキシ
      return '/api/proxy';
    }
    // その他の場合（ローカル開発環境など）は直接API URLを使用
    return apiUrl;
  }
  
  // デフォルト値（ローカル開発環境）
  return 'http://localhost:3001';
};

// 共通部分のURLを定義する
// axiosのインスタンスを定義して共通的にURLを使いまわせる
const apiClient = axios.create({
    baseURL: getBaseURL(),
});

// バックエンドのJWTStrategyに適合させるためのインターセプターを設定
apiClient.interceptors.request.use(async (config) => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString(); //Access Tokenを取得
        if (token) {
            //バックエンドのExtractJwt.fromAuthHeaderAsBearerToken() に合わせる
            config.headers.Authorization = `Bearer ${token}`;
            // デバッグ用ログ
            console.log('[API Client] ✅ Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
            console.log('[API Client] Request URL:', config.url);
            console.log('[API Client] Base URL:', config.baseURL);
        } else {
            console.warn('[API Client] ❌ No access token found in session');
        }
    } catch (error) {
        console.error('[API Client] Error fetching auth session:', error);
    }
    return config;
});

// レスポンスインターセプター: 文字列レスポンスを自動的にJSONパースする
apiClient.interceptors.response.use(
    (response) => {
        // レスポンスデータが文字列の場合、JSONパースを試みる
        if (typeof response.data === 'string') {
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                try {
                    console.log('[API Client] ⚠️ Response data is string, auto-parsing JSON...');
                    response.data = JSON.parse(response.data);
                    console.log('[API Client] ✅ Successfully parsed JSON string');
                } catch (parseError) {
                    console.error('[API Client] ❌ Failed to parse JSON string:', parseError);
                    // パースに失敗した場合はそのまま返す（エラーハンドリングは呼び出し側で行う）
                }
            }
        }
        return response;
    },
    (error) => {
        // エラーレスポンスでも同様に処理
        if (error.response && typeof error.response.data === 'string') {
            const contentType = error.response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                try {
                    error.response.data = JSON.parse(error.response.data);
                } catch (parseError) {
                    // パースに失敗した場合はそのまま返す
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;