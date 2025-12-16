/** 
* クエスト詳細情報DTO
* quest_mstテーブルから取得
* quest_progress_tranテーブルから取得
**/
export interface QuestDetailResponseDto {
    questCode: string;
    questName: string;
    questDetail: string;
    exp: number;
    skillPoint: number;
    difficulty: string;
    recommendedTime: string;
    // JSONB型のフィールドは実際のデータでは配列（string[]）として格納されている
    // フロントエンドでチェックボックス表示に使用するため、配列型として定義
    learningObjectives: string[];
    achievementConditions: string[];
    checklistItems: string[];
    progress: number;
    statusCode: string;
}

