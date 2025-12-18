/**
 * ユーザー関連のユーティリティ関数
 */

/**
 * レベルに応じたランク名を取得する
 * 
 * - レベル1~3: Beginner
 * - レベル4~6: Intermediate
 * - レベル7~8: Advanced
 * - レベル9~10: Expert
 * 
 * @param level - ユーザーのレベル（1-10）
 * @returns ランク名
 * 
 * @example
 * getLevelRank(1) // "Beginner"
 * getLevelRank(5) // "Intermediate"
 * getLevelRank(8) // "Advanced"
 * getLevelRank(10) // "Expert"
 */
export function getLevelRank(level: number | undefined): string {
  if (!level) return 'Beginner'
  
  if (level >= 1 && level <= 3) {
    return 'Beginner'
  } else if (level >= 4 && level <= 6) {
    return 'Intermediate'
  } else if (level >= 7 && level <= 8) {
    return 'Advanced'
  } else if (level >= 9 && level <= 10) {
    return 'Expert'
  }
  
  return 'Beginner' // デフォルト値
}

