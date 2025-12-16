import type React from "react"
import { Analytics } from "@vercel/analytics/react"

//Vercel Analyticsを追加
// 1.ページビューの追跡
// 2.パフォーマンス測定
// 3.リアルタイム統計

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
