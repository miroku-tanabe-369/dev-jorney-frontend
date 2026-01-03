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
  
  console.log('[Server API Client] ========================================');
  console.log('[Server API Client] Making API request (bypassing proxy)');
  console.log('[Server API Client] URL:', url);
  console.log('[Server API Client] Method:', options.method || 'GET');
  console.log('[Server API Client] Token provided:', !!options.token);
  console.log('[Server API Client] Token length:', options.token?.length || 0);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 認証トークンが提供されている場合はAuthorizationヘッダーを追加
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
    console.log('[Server API Client] ✅ Authorization header set');
  } else {
    console.warn('[Server API Client] ⚠️ No token provided');
  }
  
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: headers,
  };
  
  if (options.body && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  try {
    console.log('[Server API Client] Sending request...');
    const response = await fetch(url, fetchOptions);
    
    console.log('[Server API Client] Response status:', response.status);
    console.log('[Server API Client] Response statusText:', response.statusText);
    console.log('[Server API Client] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Server API Client] ❌ Error response:', errorText);
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText, status: response.status };
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log('[Server API Client] Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      const jsonData = await response.json() as T;
      console.log('[Server API Client] ✅ JSON response parsed successfully');
      console.log('[Server API Client] Response data keys:', jsonData ? Object.keys(jsonData as any) : 'null');
      console.log('[Server API Client] ========================================');
      return jsonData;
    } else {
      const text = await response.text();
      console.log('[Server API Client] ✅ Text response received, length:', text.length);
      console.log('[Server API Client] ========================================');
      return text as T;
    }
  } catch (error) {
    console.error('[Server API Client] ❌ Request failed:', error);
    console.error('[Server API Client] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Server API Client] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Server API Client] ========================================');
    throw error;
  }
}

