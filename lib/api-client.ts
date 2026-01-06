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
    // レスポンスサイズの制限を解除（デフォルトは2000バイト）
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    // リクエストサイズの制限も解除
    maxRedirects: 5,
});

// バックエンドのJWTStrategyに適合させるためのインターセプターを設定
apiClient.interceptors.request.use(async (config) => {
    try {
        const session = await fetchAuthSession();
        // ID Tokenを使用（nameとemailが含まれる）
        const token = session.tokens?.idToken?.toString();
        if (token) {
            //バックエンドのExtractJwt.fromAuthHeaderAsBearerToken() に合わせる
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        // エラーは無視（認証エラーは後続の処理で検出される）
    }
    return config;
});

// レスポンスインターセプター: Base64エンコードされたレスポンスをデコードする
apiClient.interceptors.response.use(
    (response) => {
        // Base64エンコードされたレスポンスをチェック
        const encoding = response.headers['x-response-encoding'];
        if (encoding === 'base64' && response.data && typeof response.data === 'object' && response.data.encoded) {
            try {
                // Base64デコード（ブラウザ環境ではatobを使用）
                let decodedString: string;
                if (typeof window !== 'undefined' && typeof window.atob === 'function') {
                    // ブラウザ環境: atobを使用
                    decodedString = decodeURIComponent(
                        Array.from(window.atob(response.data.encoded), (c) => 
                            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                        ).join('')
                    );
                } else {
                    // Node.js環境: Bufferを使用（サーバーサイドレンダリング時）
                    const Buffer = require('buffer').Buffer;
                    decodedString = Buffer.from(response.data.encoded, 'base64').toString('utf8');
                }
                
                // JSONパース
                const trimmedData = decodedString.trim();
                if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                    response.data = JSON.parse(trimmedData);
                } else {
                    throw new Error('Decoded response data is not valid JSON.');
                }
            } catch (decodeError) {
                throw decodeError;
            }
        } else if (typeof response.data === 'string') {
            // Base64エンコードされていない通常の文字列レスポンスの場合
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                try {
                    // 不完全なJSONの場合を考慮して、可能な限りパースを試みる
                    const trimmedData = response.data.trim();
                    if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                        response.data = JSON.parse(trimmedData);
                    } else {
                        // 不完全なJSONの場合は、エラーを投げる
                        throw new Error('Response data is incomplete. Expected JSON but received incomplete string.');
                    }
                } catch (parseError) {
                    // パースに失敗した場合はエラーを投げる（呼び出し側でエラーハンドリング）
                    throw parseError;
                }
            }
        }
        return response;
    },
    (error) => {
        // エラーレスポンスでも同様に処理
        if (error.response) {
            const encoding = error.response.headers['x-response-encoding'];
            if (encoding === 'base64' && error.response.data && typeof error.response.data === 'object' && error.response.data.encoded) {
                try {
                    let decodedString: string;
                    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
                        // ブラウザ環境: atobを使用
                        decodedString = decodeURIComponent(
                            Array.from(window.atob(error.response.data.encoded), (c) => 
                                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                            ).join('')
                        );
                    } else {
                        // Node.js環境: Bufferを使用
                        const Buffer = require('buffer').Buffer;
                        decodedString = Buffer.from(error.response.data.encoded, 'base64').toString('utf8');
                    }
                    const trimmedData = decodedString.trim();
                    if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                        error.response.data = JSON.parse(trimmedData);
                    }
                } catch (decodeError) {
                    // デコードに失敗した場合はそのまま返す
                }
            } else if (typeof error.response.data === 'string') {
                const contentType = error.response.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try {
                        const trimmedData = error.response.data.trim();
                        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                            error.response.data = JSON.parse(trimmedData);
                        }
                    } catch (parseError) {
                        // パースに失敗した場合はそのまま返す
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;