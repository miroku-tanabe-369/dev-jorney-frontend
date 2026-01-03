/**
 * サーバーサイド用のAPIクライアント
 * Server ComponentsやServer Actionsから使用する
 */

/**
 * バックエンドAPIのベースURLを取得
 */
function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL environment variable.');
  }
  
  return apiUrl;
}

/**
 * サーバーサイドでバックエンドAPIを呼び出す
 * @param endpoint APIエンドポイント（例: 'users/dashboard'）
 * @param options リクエストオプション
 * @returns APIレスポンス
 */
export async function serverApiRequest<T = any>(
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    token?: string; // 認証トークン（Access Token）
  } = {}
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 認証トークンが提供されている場合はAuthorizationヘッダーを追加
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: headers,
  };
  
  if (options.body && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText, status: response.status };
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      const text = await response.text();
      return text as T;
    }
  } catch (error) {
    console.error('[Server API Client] Request failed:', error);
    throw error;
  }
}

