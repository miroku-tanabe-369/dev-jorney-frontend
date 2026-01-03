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

// レスポンスインターセプター: Base64エンコードされたレスポンスをデコードする
apiClient.interceptors.response.use(
    (response) => {
        // Base64エンコードされたレスポンスをチェック
        const encoding = response.headers['x-response-encoding'];
        if (encoding === 'base64' && response.data && typeof response.data === 'object' && response.data.encoded) {
            try {
                console.log('[API Client] ✅ Detected Base64 encoded response, decoding...');
                console.log('[API Client] Base64 string length:', response.data.encoded.length);
                
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
                
                console.log('[API Client] Decoded string length:', decodedString.length);
                console.log('[API Client] Decoded string preview (first 300 chars):', decodedString.substring(0, 300));
                console.log('[API Client] Decoded string preview (last 100 chars):', decodedString.substring(Math.max(0, decodedString.length - 100)));
                
                // JSONパース
                const trimmedData = decodedString.trim();
                if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                    response.data = JSON.parse(trimmedData);
                    console.log('[API Client] ✅ Successfully decoded and parsed Base64 response');
                    console.log('[API Client] Parsed data keys:', Object.keys(response.data));
                } else {
                    console.error('[API Client] ❌ Decoded string is not valid JSON');
                    console.error('[API Client] First 100 chars:', trimmedData.substring(0, 100));
                    console.error('[API Client] Last 100 chars:', trimmedData.substring(Math.max(0, trimmedData.length - 100)));
                    throw new Error('Decoded response data is not valid JSON.');
                }
            } catch (decodeError) {
                console.error('[API Client] ❌ Failed to decode Base64 response:', decodeError);
                throw decodeError;
            }
        } else if (typeof response.data === 'string') {
            // Base64エンコードされていない通常の文字列レスポンスの場合
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                try {
                    console.log('[API Client] ⚠️ Response data is string, auto-parsing JSON...');
                    console.log('[API Client] String length:', response.data.length);
                    console.log('[API Client] String preview (first 300 chars):', response.data.substring(0, 300));
                    console.log('[API Client] String preview (last 100 chars):', response.data.substring(Math.max(0, response.data.length - 100)));
                    
                    // 不完全なJSONの場合を考慮して、可能な限りパースを試みる
                    const trimmedData = response.data.trim();
                    if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
                        response.data = JSON.parse(trimmedData);
                        console.log('[API Client] ✅ Successfully parsed JSON string');
                    } else {
                        console.error('[API Client] ❌ JSON string is incomplete (does not start with { or end with })');
                        console.error('[API Client] First 100 chars:', trimmedData.substring(0, 100));
                        console.error('[API Client] Last 100 chars:', trimmedData.substring(Math.max(0, trimmedData.length - 100)));
                        // 不完全なJSONの場合は、エラーを投げる
                        throw new Error('Response data is incomplete. Expected JSON but received incomplete string.');
                    }
                } catch (parseError) {
                    console.error('[API Client] ❌ Failed to parse JSON string:', parseError);
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
                    console.error('[API Client] ❌ Failed to decode Base64 error response:', decodeError);
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