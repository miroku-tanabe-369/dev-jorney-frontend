"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, Circle, ArrowRight } from "lucide-react"
import { NodeInfoDto, SkilltreeResponseDto, QuestInfoDto } from "@/types/skilltrss"
import apiClient from "@/lib/api-client"

type NodeStatus = "completed" | "in-progress" | "locked"

export default function SkillTreePage() {
  const [skilltreeData, setSkilltreeData] = useState<SkilltreeResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeInfoDto | null>(null)

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

  //画面描画に必要な情報を取得
  useEffect(() => {
    apiClient.get<SkilltreeResponseDto>('skilltrees/FSD_001')
      .then(response => {
        console.log('[SkillTree] Full response data:', response.data);
        console.log('[SkillTree] Response data keys:', Object.keys(response.data || {}));
        console.log('[SkillTree] skilltreeInfo:', response.data?.skilltreeInfo);
        console.log('[SkillTree] nodes array:', response.data?.nodes);
        console.log('[SkillTree] nodes length:', response.data?.nodes?.length);
        console.log('[SkillTree] nodes content:', JSON.stringify(response.data?.nodes, null, 2));
        console.log('[SkillTree] quests array:', response.data?.quests);
        console.log('[SkillTree] quests length:', response.data?.quests?.length);
        setSkilltreeData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching skilltree data:', error);
        setError('Failed to load skilltree data');
        setLoading(false);
      });
  }, [])

  // statusCodeをNodeStatusに変換するヘルパー関数
  const getNodeStatus = (statusCode: string): NodeStatus => {
    switch (statusCode) {
      case "COMPLETED":
        return "completed"
      case "IN_PROGRESS":
        return "in-progress"
      case "LOCKED":
        return "locked"
      default:
        return "locked"
    }
  }

  const getStatusIcon = (node: NodeInfoDto) => {
    const status = getNodeStatus(node.statusCode)
    switch (status) {
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
                {/* Skill Tree Nodes */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-card-foreground">{skilltreeData?.skilltreeInfo.skilltreeName}</h3>
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading nodes...</div>
                  ) : error ? (
                    <div className="text-sm text-destructive">{error}</div>
                  ) : skilltreeData?.nodes && skilltreeData.nodes.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {[...skilltreeData.nodes]
                        .sort((a, b) => a.nodeOrder - b.nodeOrder)
                        .map((node) => {
                          console.log('[SkillTree] Rendering node:', node);
                          const status = getNodeStatus(node.statusCode)
                          return (
                            <button
                              key={node.nodeCode}
                              onClick={() => setSelectedNode(node)}
                              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${getStatusColor(status)} ${
                                selectedNode?.nodeCode === node.nodeCode
                                  ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                  : ""
                              }`}
                            >
                              {getStatusIcon(node)}
                              <span className="text-sm font-medium">{node.nodeName}</span>
                              {/* TODO：ノードのレベルの代わりにノードの順序を暫定的に表示 */}
                              <Badge variant="outline" className="text-xs">
                                Order {node.nodeOrder}
                              </Badge>
                            </button>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No nodes available.</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Node Details Panel */}
            <Card className="border-border bg-card p-6">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-card-foreground">{selectedNode.nodeName}</h3>
                      {getStatusIcon(selectedNode)}
                    </div>
                    {/* TODO: おそらくここのNodeCode:は不要のため、プレビューしてみて削除予定 */}
                    <p className="text-sm text-muted-foreground">Node Code: {selectedNode.nodeCode}</p>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    {/* TODO: ノードのレベルの記載の代わりにノードの順序を表示 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order</span>
                      <Badge variant="secondary">{selectedNode.nodeOrder}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(getNodeStatus(selectedNode.statusCode))}>
                        {selectedNode.statusCode === "IN_PROGRESS"
                          ? "In Progress"
                          : selectedNode.statusCode === "COMPLETED"
                            ? "Completed"
                            : "Locked"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Skill Points</span>
                      <span className="font-medium text-foreground">
                        +{skilltreeData?.quests
                          ?.filter(quest => quest.questCode.startsWith(selectedNode.nodeCode))
                          .reduce((sum, quest) => sum + quest.skillPoint, 0) || 0} SP
                      </span>
                    </div>
                  </div>

                  {selectedNode.statusCode === "IN_PROGRESS" && (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Continue Quest
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {selectedNode.statusCode === "LOCKED" && (
                    <Button className="w-full" variant="secondary" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Prerequisites
                    </Button>
                  )}

                  {selectedNode.statusCode === "COMPLETED" && (
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-sm font-medium text-primary">Node Completed!</p>
                    </div>
                  )}

                  {/* Quests List */}
                  <div className="border-t border-border pt-4">
                    <h4 className="mb-3 text-sm font-semibold text-card-foreground">Quests</h4>
                    {skilltreeData?.quests && skilltreeData.quests.filter(quest => quest.questCode.startsWith(selectedNode.nodeCode)).length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {[...skilltreeData.quests]
                          .filter(quest => quest.questCode.startsWith(selectedNode.nodeCode))
                          .sort((a, b) => a.questOrder - b.questOrder)
                          .map((quest: QuestInfoDto) => (
                            <Link
                              key={quest.questCode}
                              href={`/dashboard/quest-detail/${quest.questCode}`}
                              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                  {quest.statusCode === "COMPLETED" ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  ) : quest.statusCode === "IN_PROGRESS" ? (
                                    <Circle className="h-4 w-4 text-accent" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-card-foreground">{quest.questName}</p>
                                  <p className="text-xs text-muted-foreground">Difficulty {quest.difficulty}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                                +{quest.skillPoint} SP
                              </Badge>
                            </Link>
                          ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No quests available for this node.</div>
                    )}
                  </div>
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
