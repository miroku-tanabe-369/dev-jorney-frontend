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
        }
    } catch (error) {
        console.error('Error fetching auth session:', error);
    }
    return config;
});

export default apiClient;