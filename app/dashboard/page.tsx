import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Clock, Target, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
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
                <div className="text-3xl font-bold text-card-foreground">Level 5</div>
                <p className="mt-1 text-xs text-muted-foreground">Intermediate Developer</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Skill Points</CardTitle>
                <Star className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">2,450 SP</div>
                <p className="mt-1 text-xs text-muted-foreground">+180 this week</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Points to Next Level</CardTitle>
                <Target className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">550 SP</div>
                <Progress value={65} className="mt-2" />
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
                    <h3 className="font-semibold text-card-foreground">Advanced React Patterns</h3>
                    <Badge variant="secondary">Level 5</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Master advanced React patterns including render props, compound components, and state reducers.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-card-foreground">7/12 tasks completed</span>
                  </div>
                  <Progress value={58} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>~2 hours left</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent" />
                    <span>+150 SP</span>
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Achievements</CardTitle>
                <CardDescription>Your latest completed quests and earned SP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "JavaScript ES6 Fundamentals", sp: 100, date: "2 days ago" },
                    { title: "CSS Grid Mastery", sp: 120, date: "5 days ago" },
                    { title: "Git & GitHub Essentials", sp: 80, date: "1 week ago" },
                    { title: "Responsive Web Design", sp: 110, date: "1 week ago" },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                        +{achievement.sp} SP
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
