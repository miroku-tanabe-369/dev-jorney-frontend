/** 
* スキルツリー基本情報DTO
* skilltrees_mstテーブルから取得
* skilltreeProgressTranテーブルから取得
**/
export interface SkilltreeInfoDto {
    skilltreeName: string;
    progress: number;
    statusCode: string;
}

/**
 * ノード基本情報DTO
 * nodes_mstテーブルから取得
 * skilltrees_node_tranテーブルから取得
 * nodeProgressTranテーブルから取得
 */
export interface NodeInfoDto {
    nodeCode: string;
    nodeName: string;
    nodeOrder: number;
    progress: number;
    statusCode: string;
}

/**
 * 各ノード配下のクエストの一覧を取得する   
 * quest_mstテーブルから取得    
 * quest_progress_tranテーブルから取得
 */
export interface QuestInfoDto {
    questCode: string;
    questName: string;
    questOrder: number;
    questDetail: string;
    exp: number;
    skillPoint: number;
    difficulty: string;
    progress: number;
    statusCode: string;
}

export interface SkilltreeResponseDto {
    skilltreeInfo: SkilltreeInfoDto;
    nodes: NodeInfoDto[];
    quests: QuestInfoDto[];
}

