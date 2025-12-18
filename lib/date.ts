/**
 * 日付関連のユーティリティ関数
 */

/**
 * 日付を相対的な文字列に変換する
 * 
 * 現在時刻からの経過時間を人間が読みやすい形式で返す
 * 
 * @param date - 変換する日付
 * @returns 相対的な日付文字列（例: "Today", "2 days ago", "1 week ago"）
 * 
 * @example
 * formatRelativeDate(new Date()) // "Today"
 * formatRelativeDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // "2 days ago"
 * formatRelativeDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) // "1 week ago"
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day ago";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 14) {
    return "1 week ago";
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

