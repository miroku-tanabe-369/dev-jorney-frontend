"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Clock, Target, Star, BookOpen, CheckCircle2 } from "lucide-react"
import { QuestDetailResponseDto } from "@/types/quest"
import { parseJsonbToArray, getCompleteButtonText } from "@/lib/quest"
import axios from "axios"

export default function QuestDetailPage() {
  const params = useParams() // パスパラメータを取得
  const questCode = params.questCode as string // /dashboard/quest-detail/:questCode から取得
  
  const [questDetailData, setQuestDetailData] = useState<QuestDetailResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isCompleting, setIsCompleting] = useState(false)

  // ボタンの活性状態を判定する関数
  function isCompleteButtonEnabled(
    checkedItems: Record<string, boolean>, 
    checklistItems: string[],
    statusCode: string | undefined
  ): boolean {
    //チェックリストの総数を取得
    const totalItems = checklistItems.length;

    // チェックリストが空の場合falseを返す
    if (totalItems === 0) {
      return false;
    }

    //チェック済みの数を取得
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    
    // ステータスが完了済みまたは進行中の場合はfalseを返却する
    const isNotInProgressOrCompleted = statusCode !== 'COMPLETED' && statusCode !== 'IN_PROGRESS';

    // 全てチェック済みかつ、完了済み・進行中でない場合のみ　true
    return completedItems === totalItems && isNotInProgressOrCompleted;
  }

  // チェックリストの完了状態を計算
  const checklistItems = parseJsonbToArray(questDetailData?.checklistItems);
  const totalItems = checklistItems.length;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const allChecked = totalItems > 0 && completedItems === totalItems;

  // クエスト完了ボタンが活性化の判定を行う
  const buttonEnabled = isCompleteButtonEnabled(
    checkedItems,
    checklistItems,
    questDetailData?.statusCode
  );

  // クエスト完了ボタンの表示テキストを取得（checkedItemsの状態も考慮）
  const buttonText = getCompleteButtonText(
    questDetailData?.statusCode,
    isCompleting,
    allChecked
  );
  

  // クエスト詳細データを取得する関数（共通化）
  const fetchQuestDetail = async () => {
    try {
      const response = await axios.get<QuestDetailResponseDto>(
        `http://localhost:3000/quest-detail/${questCode}`
      );
      setQuestDetailData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching quest detail data:', error);
      setError('Failed to load quest detail data');
      throw error;
    }
  };

  //画面描画に必要な情報を取得（初回読み込み時）
  useEffect(() => {
    if (!questCode) {
      setError('Quest code is required');
      setLoading(false);
      return;
    }

    fetchQuestDetail()
      .finally(() => {
        setLoading(false);
      });
  }, [questCode])

  // クエスト完了処理
  const handleCompleteQuest = async () => {
    setIsCompleting(true);
    setError(null);
    
    try {
      // クエスト更新APIを呼び出し
      await axios.put(
        `http://localhost:3000/quest-detail/update-quest-progress/${questCode}`,
        {},
        {
          headers: {
            // TODO: 認証トークンを設定（JWTトークンが必要）
            // 'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // 成功後、データを再取得して最新の状態を反映
      await fetchQuestDetail();
    } catch (error) {
      console.error('Error completing quest:', error);
      setError('Failed to complete quest. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Frontend Development</span>
              <span>•</span>
              <span>Level 5</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Advanced React Patterns</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left Column - Quest Details */}
            <div className="space-y-6">
              {/* Quest Metadata */}
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                        <p className="font-medium text-foreground">{questDetailData?.difficulty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-medium text-foreground">{questDetailData?.recommendedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Star className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SP Reward</p>
                        <p className="font-medium text-accent">+{questDetailData?.skillPoint} SP</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Node</p>
                        <p className="font-medium text-foreground">{questDetailData?.nodeCode}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Goals */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Learning Goals</CardTitle>
                  <CardDescription>What you'll master in this quest</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {parseJsonbToArray(questDetailData?.learningObjectives).map((goal, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-card-foreground">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Completion Criteria */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Completion Criteria</CardTitle>
                  <CardDescription>Requirements to complete this quest</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {parseJsonbToArray(questDetailData?.achievementConditions).map((criteria, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm text-card-foreground">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  disabled={!buttonEnabled || isCompleting}
                  onClick={handleCompleteQuest}
                >
                  {buttonText}
                </Button>
              </div>
            </div>

            {/* Right Column - Progress Panel */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="sticky top-8 border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Progress Checklist</CardTitle>
                  <CardDescription>Track your learning progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">
                        {questDetailData ? (
                          <>
                            {Object.values(checkedItems).filter(Boolean).length}/{parseJsonbToArray(questDetailData.checklistItems).length} completed
                          </>
                        ) : (
                          '0/0 completed'
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={questDetailData && parseJsonbToArray(questDetailData.checklistItems).length > 0 
                        ? (Object.values(checkedItems).filter(Boolean).length / parseJsonbToArray(questDetailData.checklistItems).length) * 100 
                        : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    {parseJsonbToArray(questDetailData?.checklistItems).map((task, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Checkbox
                          id={`checklist-${index}`}
                          checked={checkedItems[`checklist-${index}`]}
                          onCheckedChange={(checked) => setCheckedItems((prev) => ({ ...prev, [`checklist-${index}`]: !!checked }))}
                          className="mt-0.5"
                        />
                        <label htmlFor={`checklist-${index}`} className="flex-1 cursor-pointer text-sm leading-relaxed">
                          <div
                            className={checkedItems[`checklist-${index}`] ? "text-muted-foreground line-through" : "text-foreground"}
                          >
                            {task}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quest Reward</span>
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Ready to Claim</Badge>
                    </div>
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 p-6">
                      <div className="text-center">
                        <Star className="mx-auto mb-2 h-8 w-8 text-primary" />
                        <div className="text-2xl font-bold text-primary">+{questDetailData?.skillPoint} SP</div>
                        <p className="mt-1 text-xs text-muted-foreground">Complete all tasks to claim</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

