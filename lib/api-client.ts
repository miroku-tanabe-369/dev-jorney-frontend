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

// ストリーミングレスポンスを処理するヘルパー関数
async function handleStreamingResponse(response: Response): Promise<any> {
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }
    
    const decoder = new TextDecoder();
    let result = '';
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            result += decoder.decode(value, { stream: true });
        }
        
        // ストリームの最後のチャンクをデコード
        result += decoder.decode();
        
        console.log('[API Client] ✅ Streamed response received, length:', result.length);
        console.log('[API Client] Response preview (first 300 chars):', result.substring(0, 300));
        console.log('[API Client] Response preview (last 100 chars):', result.substring(Math.max(0, result.length - 100)));
        
        // JSONパースを試みる
        const trimmedData = result.trim();
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
            return JSON.parse(trimmedData);
        } else {
            throw new Error('Response data is incomplete. Expected JSON but received incomplete string.');
        }
    } finally {
        reader.releaseLock();
    }
}

// ストリーミングレスポンスをサポートするためのカスタムリクエスト関数
export async function apiRequest<T = any>(url: string, options: {
    method?: string;
    data?: any;
    headers?: Record<string, string>;
} = {}): Promise<T> {
    const baseURL = getBaseURL();
    const fullUrl = baseURL + url;
    
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const fetchOptions: RequestInit = {
            method: options.method || 'GET',
            headers: headers,
        };
        
        if (options.data && options.method !== 'GET') {
            fetchOptions.body = JSON.stringify(options.data);
        }
        
        const response = await fetch(fullUrl, fetchOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // ストリーミングレスポンスを処理
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const parsedData = await handleStreamingResponse(response);
            return parsedData as T;
        } else {
            const text = await response.text();
            return text as T;
        }
    } catch (error) {
        console.error('[API Client] ❌ Request failed:', error);
        throw error;
    }
}

// レスポンスインターセプター: 文字列レスポンスを自動的にJSONパースする
apiClient.interceptors.response.use(
    (response) => {
        // レスポンスデータが文字列の場合、JSONパースを試みる
        if (typeof response.data === 'string') {
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
        if (error.response && typeof error.response.data === 'string') {
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
        return Promise.reject(error);
    }
);

export default apiClient;