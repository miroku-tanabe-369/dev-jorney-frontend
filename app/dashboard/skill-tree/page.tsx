"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, Circle, ArrowRight } from "lucide-react"

type NodeStatus = "completed" | "in-progress" | "locked"

interface SkillNode {
  id: string
  title: string
  category: string
  level: number
  status: NodeStatus
  progress?: number
  sp: number
  description: string
}

const skillNodes: SkillNode[] = [
  {
    id: "1",
    title: "HTML Basics",
    category: "Frontend",
    level: 1,
    status: "completed",
    sp: 50,
    description: "Learn HTML fundamentals",
  },
  {
    id: "2",
    title: "CSS Fundamentals",
    category: "Frontend",
    level: 2,
    status: "completed",
    sp: 80,
    description: "Master CSS styling",
  },
  {
    id: "3",
    title: "JavaScript Basics",
    category: "Frontend",
    level: 2,
    status: "completed",
    sp: 100,
    description: "JavaScript essentials",
  },
  {
    id: "4",
    title: "Responsive Design",
    category: "Frontend",
    level: 3,
    status: "completed",
    sp: 110,
    description: "Build responsive layouts",
  },
  {
    id: "5",
    title: "React Fundamentals",
    category: "Frontend",
    level: 4,
    status: "completed",
    sp: 120,
    description: "Learn React basics",
  },
  {
    id: "6",
    title: "Advanced React",
    category: "Frontend",
    level: 5,
    status: "in-progress",
    progress: 58,
    sp: 150,
    description: "Master advanced React patterns",
  },
  {
    id: "7",
    title: "TypeScript",
    category: "Frontend",
    level: 5,
    status: "locked",
    sp: 200,
    description: "Learn TypeScript fundamentals",
  },
  {
    id: "8",
    title: "Next.js",
    category: "Frontend",
    level: 6,
    status: "locked",
    sp: 180,
    description: "Full-stack React framework",
  },
  {
    id: "9",
    title: "Node.js Basics",
    category: "Backend",
    level: 3,
    status: "completed",
    sp: 130,
    description: "Server-side JavaScript",
  },
  {
    id: "10",
    title: "Express.js",
    category: "Backend",
    level: 4,
    status: "locked",
    sp: 140,
    description: "Build REST APIs",
  },
  {
    id: "11",
    title: "Database Design",
    category: "Backend",
    level: 5,
    status: "locked",
    sp: 160,
    description: "SQL and NoSQL databases",
  },
]

export default function SkillTreePage() {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case "completed":
        return "border-primary bg-primary/20 text-primary"
      case "in-progress":
        return "border-accent bg-accent/20 text-accent"
      case "locked":
        return "border-muted bg-muted/20 text-muted-foreground"
    }
  }

  const getStatusIcon = (node: SkillNode) => {
    switch (node.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />
      case "in-progress":
        return (
          <div className="relative h-5 w-5">
            <Circle className="h-5 w-5" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {node.progress}%
            </div>
          </div>
        )
      case "locked":
        return <Lock className="h-5 w-5" />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Skill Tree</h1>
            <p className="mt-2 text-muted-foreground">
              Your personalized learning roadmap. Complete quests to unlock new skills.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Skill Tree Visualization */}
            <Card className="border-border bg-card p-6">
              <div className="space-y-8">
                {/* Frontend Path */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-card-foreground">Frontend Development</h3>
                  <div className="space-y-4">
                    {/* Level 1-2 */}
                    <div className="flex flex-wrap gap-3">
                      {skillNodes
                        .filter((n) => n.category === "Frontend" && n.level <= 2)
                        .map((node) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${getStatusColor(node.status)} ${
                              selectedNode?.id === node.id
                                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                : ""
                            }`}
                          >
                            {getStatusIcon(node)}
                            <span className="text-sm font-medium">{node.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Lvl {node.level}
                            </Badge>
                          </button>
                        ))}
                    </div>

                    {/* Connection Line */}
                    <div className="ml-16 flex items-center gap-2 text-muted-foreground">
                      <div className="h-px w-full bg-border"></div>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </div>

                    {/* Level 3-4 */}
                    <div className="flex flex-wrap gap-3">
                      {skillNodes
                        .filter((n) => n.category === "Frontend" && n.level >= 3 && n.level <= 4)
                        .map((node) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${getStatusColor(node.status)} ${
                              selectedNode?.id === node.id
                                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                : ""
                            }`}
                          >
                            {getStatusIcon(node)}
                            <span className="text-sm font-medium">{node.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Lvl {node.level}
                            </Badge>
                          </button>
                        ))}
                    </div>

                    {/* Connection Line */}
                    <div className="ml-16 flex items-center gap-2 text-muted-foreground">
                      <div className="h-px w-full bg-border"></div>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </div>

                    {/* Level 5-6 */}
                    <div className="flex flex-wrap gap-3">
                      {skillNodes
                        .filter((n) => n.category === "Frontend" && n.level >= 5)
                        .map((node) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${getStatusColor(node.status)} ${
                              selectedNode?.id === node.id
                                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                : ""
                            }`}
                          >
                            {getStatusIcon(node)}
                            <span className="text-sm font-medium">{node.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Lvl {node.level}
                            </Badge>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Backend Path */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-card-foreground">Backend Development</h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {skillNodes
                        .filter((n) => n.category === "Backend")
                        .map((node) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${getStatusColor(node.status)} ${
                              selectedNode?.id === node.id
                                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                : ""
                            }`}
                          >
                            {getStatusIcon(node)}
                            <span className="text-sm font-medium">{node.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Lvl {node.level}
                            </Badge>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Node Details Panel */}
            <Card className="border-border bg-card p-6">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-card-foreground">{selectedNode.title}</h3>
                      {getStatusIcon(selectedNode)}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Level</span>
                      <Badge variant="secondary">Level {selectedNode.level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(selectedNode.status)}>
                        {selectedNode.status === "in-progress"
                          ? "In Progress"
                          : selectedNode.status === "completed"
                            ? "Completed"
                            : "Locked"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Skill Points</span>
                      <span className="font-medium text-foreground">+{selectedNode.sp} SP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline">{selectedNode.category}</Badge>
                    </div>
                  </div>

                  {selectedNode.status === "in-progress" && (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Continue Quest
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {selectedNode.status === "locked" && (
                    <Button className="w-full" variant="secondary" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Prerequisites
                    </Button>
                  )}

                  {selectedNode.status === "completed" && (
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-sm font-medium text-primary">Quest Completed!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="space-y-2">
                    <Circle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a skill node to view details</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
