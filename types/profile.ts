/**
 * ユーザー基本情報DTO
 * users_mstテーブルから取得
 */
export interface UserDetailInfoDto {
    name: string;
    email: string;
    profile: string | null;
    icon: string | null;
    currentLevel: number;
    totalSkillPoint: number;
    completedQuestCount: number;
  }
  
  /**
   * ユーザー保有スキルDTO
   * users_skills_tranテーブルから取得
   */
  export interface UserSkillInfoDto {
    skillName: string;
    level: string;
  }
  
  export interface UserDetailResponseDto {
    userDetail: UserDetailInfoDto;
    userSkills: UserSkillInfoDto[] | null;
  }