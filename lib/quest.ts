/**
 * クエスト関連のユーティリティ関数
 */

/**
 * JSONB型のデータを配列に変換する
 * 
 * カンマ区切りの文字列の場合は配列に分割、既に配列の場合はそのまま返す
 * 
 * @param data - JSONB型のデータ（文字列、配列、またはundefined）
 * @returns 文字列の配列
 * 
 * @example
 * parseJsonbToArray("item1, item2, item3") // ["item1", "item2", "item3"]
 * parseJsonbToArray(["item1", "item2"]) // ["item1", "item2"]
 * parseJsonbToArray(undefined) // []
 */
export function parseJsonbToArray(data: string | string[] | undefined): string[] {
  if (!data) return []
  
  // 既に配列の場合はそのまま返す
  if (Array.isArray(data)) {
    return data
  }
  
  // 文字列の場合はカンマ区切りで分割
  if (typeof data === 'string') {
    return data.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }
  
  //ここに到達する可能性は理論上ないが、TypeScriptの型安全性をチェックするために設定。
  return []
}

/**
 * クエスト完了ボタンの表示テキストを取得する
 * 
 * @param statusCode - クエストのステータスコード
 * @param isCompleting - クエスト完了処理中かどうか
 * @param allChecked - チェックリストが全て完了しているかどうか
 * @returns ボタンに表示するテキスト
 * 
 * @example
 * getCompleteButtonText('COMPLETED', false, true) // "Quest Completed"
 * getCompleteButtonText('IN_PROGRESS', false, false) // "In Progress"
 * getCompleteButtonText('NOT_STARTED', true, true) // "Completing..."
 * getCompleteButtonText('NOT_STARTED', false, true) // "Ready to Complete"
 * getCompleteButtonText('NOT_STARTED', false, false) // "Complete Quest"
 */
export function getCompleteButtonText(
  statusCode: string | undefined,
  isCompleting: boolean = false,
  allChecked: boolean = false
): string {
  if (statusCode === 'COMPLETED') {
    return 'Quest Completed';
  }
  
  if (statusCode === 'IN_PROGRESS') {
    return 'In Progress';
  }
  
  if (isCompleting) {
    return 'Completing...';
  }
  
  // チェックリストが全て完了している場合は「Ready to Complete」と表示
  if (allChecked) {
    return 'Ready to Complete';
  }
  
  return 'Complete Quest';
}

