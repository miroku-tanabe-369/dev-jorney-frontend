/**
 * ダッシュボード関連の型定義
 * 
 * 注意: この型定義はバックエンドのDTOと手動で同期する必要があります
 * バックエンドのDTOを変更した場合は、このファイルも同様に更新してください
 * 
 * 参照: backend/dev-jorney-backend/src/users/dto/userDashboardResponse.dto.ts
 */

/**
 * ユーザー基本情報DTO
 * users_mstテーブルから取得
 */
export interface UserInfoDto {
  name: string;
  currentLevel: number;
  requiredExp: number; // 次のレベルに必要な経験値
  totalSkillPoint: number;
  completedQuestCount: number;
}

/**
 * 進行中クエスト情報DTO
 * quest_mst, quest_progress_tranテーブルから取得
 */
export interface ProgressQuestInfoDto {
  questName: string;
  questDetail: string;
  progress: number;
  recommendedTime: string;
  skillPoint: number;
}

/**
 * 最新完了済みクエスト情報DTO
 * quest_progress_tranテーブルから取得
 */
export interface LatestCompletedQuestInfoDto {
  questCode: string;
  questName: string;
  skillPoint: number;
  completedAt: Date;
}

/**
 * ダッシュボード用の概要情報DTO
 * プロフィール詳細よりも軽量な情報を返す
 * 3つの異なるデータグループを統合
 */
export interface UserDashboardResponseDto {
  // ユーザー基本情報関連データ（users_mstテーブル）
  userInfo: UserInfoDto;

  // 進行中クエスト情報（進行中のクエストがない場合はnull）
  currentQuest: ProgressQuestInfoDto | null;

  // 最新完了済みクエスト情報
  latestCompletedQuests: LatestCompletedQuestInfoDto[] | null;
}

