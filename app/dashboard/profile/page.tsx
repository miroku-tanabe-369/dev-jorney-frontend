import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Flame, Calendar, Award } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="mt-2 text-muted-foreground">Your learning statistics, goals, and achievements.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left Column - User Summary */}
            <div className="space-y-6">
              {/* User Card */}
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
                      JD
                    </div>

                    <h2 className="text-2xl font-bold text-card-foreground">John Developer</h2>
                    <p className="text-sm text-muted-foreground">john.dev@example.com</p>

                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary">Level 5</Badge>
                      <Badge variant="outline">Intermediate</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Cards */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Level</p>
                        <p className="font-semibold text-foreground">Level 5</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Progress value={65} className="mb-1 h-1.5 w-20" />
                      <p className="text-xs text-muted-foreground">65% to next</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                        <Star className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Skill Points</p>
                        <p className="font-semibold text-foreground">2,450 SP</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
                        <Target className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Completed Quests</p>
                        <p className="font-semibold text-foreground">18 Quests</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Learning Streak</p>
                        <p className="font-semibold text-foreground">12 Days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Basic Information</CardTitle>
                  <CardDescription>Your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="mt-1 text-foreground">John Developer</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1 text-foreground">john.dev@example.com</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      Passionate full-stack developer focused on building modern web applications. Currently
                      specializing in React and TypeScript, with a growing interest in backend technologies.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2024</span>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Goal */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Learning Goal</CardTitle>
                  <CardDescription>Your long-term development objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      My goal is to become a proficient full-stack developer within the next 12 months. I want to master
                      React and modern frontend frameworks, gain expertise in TypeScript, and build solid backend skills
                      with Node.js and databases. Ultimately, I aim to contribute to large-scale open-source projects
                      and build production-ready applications.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Acquired Skills */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Acquired Skills</CardTitle>
                  <CardDescription>Technologies and frameworks you've mastered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "HTML", level: "Expert" },
                      { name: "CSS", level: "Expert" },
                      { name: "JavaScript", level: "Advanced" },
                      { name: "React", level: "Advanced" },
                      { name: "Responsive Design", level: "Advanced" },
                      { name: "Git", level: "Intermediate" },
                      { name: "Node.js", level: "Intermediate" },
                      { name: "REST APIs", level: "Intermediate" },
                      { name: "Tailwind CSS", level: "Advanced" },
                    ].map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5">
                        <span className="font-medium">{skill.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">• {skill.level}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Certifications</CardTitle>
                  <CardDescription>Your earned certificates and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Frontend Development Master",
                        issuer: "DevJourney",
                        date: "March 2024",
                        color: "text-primary",
                      },
                      {
                        name: "JavaScript Advanced Patterns",
                        issuer: "DevJourney",
                        date: "February 2024",
                        color: "text-accent",
                      },
                      {
                        name: "Responsive Web Design",
                        issuer: "DevJourney",
                        date: "January 2024",
                        color: "text-info",
                      },
                    ].map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${cert.color}`}
                        >
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{cert.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Issued by {cert.issuer} • {cert.date}
                          </p>
                        </div>
                      </div>
                    ))}
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
