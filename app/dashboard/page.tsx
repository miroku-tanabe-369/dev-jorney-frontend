'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Clock, Target, ArrowRight, CheckCircle2 } from "lucide-react"
import axios from "axios"
import { UserDashboardResponseDto, LatestCompletedQuestInfoDto } from "@/types/dashboard"

// 日付を相対的な文字列に変換するヘルパー関数
function formatRelativeDate(date: Date): string {
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

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<UserDashboardResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<UserDashboardResponseDto>('http://localhost:3000/users/dashboard')
      .then(response => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Welcome back! Here's your learning progress overview.</p>
          </div>

          {/* Status Summary - Three Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Current Level</CardTitle>
                <Trophy className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-3xl font-bold text-card-foreground">Loading...</div>
                ) : error ? (
                  <div className="text-sm text-destructive">{error}</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-card-foreground">{dashboardData?.userInfo.currentLevel}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Intermediate Developer</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Skill Points</CardTitle>
                <Star className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">{dashboardData?.userInfo.totalSkillPoint}</div>
                <p className="mt-1 text-xs text-muted-foreground">+180 this week</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Points to Next Level</CardTitle>
                <Target className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">{dashboardData?.userInfo.requiredExp}</div>
                <Progress value={dashboardData?.userInfo.progress} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Active Tasks - Two Columns */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* In Progress Quest */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">In Progress Quest</CardTitle>
                <CardDescription>Continue your current learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">{dashboardData?.currentQuest?.questName}</h3>
                    <Badge variant="secondary">Level 5</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.currentQuest?.questDetail}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-card-foreground">{dashboardData?.currentQuest?.progress} completed</span>
                  </div>
                  <Progress value={dashboardData?.currentQuest?.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>~{dashboardData?.currentQuest?.recommendedTime} left</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent" />
                    <span>+{dashboardData?.currentQuest?.skillPoint} SP</span>
                  </div>
                </div>

                {/* クエスト詳細画面へ遷移 */}
                {dashboardData?.currentQuest && (
                  <Link href={`/dashboard/quest-detail/${dashboardData.currentQuest.questCode}`}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Achievements</CardTitle>
                <CardDescription>Your latest completed quests and earned SP</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading achievements...</div>
                ) : error ? (
                  <div className="text-sm text-destructive">{error}</div>
                ) : dashboardData?.latestCompletedQuests && dashboardData.latestCompletedQuests.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.latestCompletedQuests.map((quest: LatestCompletedQuestInfoDto) => (
                      // keyはReactのリストレンダリングにおいて必須の属性
                      <div
                        key={quest.questCode}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{quest.questName}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeDate(quest.completedAt)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                          +{quest.skillPoint} SP
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No completed quests yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
