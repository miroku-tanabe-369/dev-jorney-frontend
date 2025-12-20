'use client'

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, Star, Target, Flame, Calendar, Award, Edit2, Save, X, Camera } from "lucide-react"
import { UserDetailResponseDto, UserSkillInfoDto } from "@/types/profile"
import { useEffect, useState, useRef } from "react"
import { getLevelRank } from "@/lib/user"
import apiClient from "@/lib/api-client"

export default function ProfilePage() {

  const [userProfile, setUserProfile] = useState<UserDetailResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 編集モードの状態管理
  const [isEditingUserCard, setIsEditingUserCard] = useState(false)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  
  // 編集用のフォームデータ
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    profile: '',
    icon: null as string | null,
  })
  
  // アイコン画像のプレビュー用
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // プロフィールデータを取得する関数
  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get<UserDetailResponseDto>('/users/profile')
      setUserProfile(response.data)
      // フォームデータを初期化
      setEditFormData({
        name: response.data.userDetail.name,
        email: response.data.userDetail.email,
        profile: response.data.userDetail.profile || '',
        icon: response.data.userDetail.icon,
      })
      setIconPreview(response.data.userDetail.icon || null)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile data:', error)
      setError('Failed to load user profile data')
      setLoading(false)
    }
  }

  //画面描画に必要な情報を追加
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // アイコン画像の選択処理
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      // 画像ファイルの形式チェック
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // FileReaderでBase64に変換
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setIconPreview(base64String)
        setEditFormData(prev => ({ ...prev, icon: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  // User Cardの編集開始
  const handleStartEditUserCard = () => {
    setIsEditingUserCard(true)
  }

  // User Cardの編集キャンセル
  const handleCancelEditUserCard = () => {
    setIsEditingUserCard(false)
    // フォームデータを元の値に戻す
    if (userProfile) {
      setEditFormData({
        name: userProfile.userDetail.name,
        email: userProfile.userDetail.email,
        profile: userProfile.userDetail.profile || '',
        icon: userProfile.userDetail.icon,
      })
      setIconPreview(userProfile.userDetail.icon || null)
    }
  }

  // User Cardの保存処理
  const handleSaveUserCard = async () => {
    try {
      setError(null)
      await apiClient.put(
        '/users/profile',
        {
          name: editFormData.name,
          email: editFormData.email,
          profile: editFormData.profile,
          icon: editFormData.icon,
        }
      )
      
      // 成功後、データを再取得
      await fetchUserProfile()
      setIsEditingUserCard(false)
    } catch (error) {
      console.error('Error updating user profile:', error)
      setError('Failed to update profile. Please try again.')
    }
  }

  // Basic Informationの編集開始
  const handleStartEditBasicInfo = () => {
    setIsEditingBasicInfo(true)
  }

  // Basic Informationの編集キャンセル
  const handleCancelEditBasicInfo = () => {
    setIsEditingBasicInfo(false)
    // フォームデータを元の値に戻す
    if (userProfile) {
      setEditFormData({
        name: userProfile.userDetail.name,
        email: userProfile.userDetail.email,
        profile: userProfile.userDetail.profile || '',
        icon: userProfile.userDetail.icon,
      })
    }
  }

  // Basic Informationの保存処理
  const handleSaveBasicInfo = async () => {
    try {
      setError(null)
      await apiClient.put(
        '/users/profile',
        {
          name: editFormData.name,
          email: editFormData.email,
          profile: editFormData.profile,
          icon: editFormData.icon,
        }
      )
      
      // 成功後、データを再取得
      await fetchUserProfile()
      setIsEditingBasicInfo(false)
    } catch (error) {
      console.error('Error updating user profile:', error)
      setError('Failed to update profile. Please try again.')
    }
  }

  // アイコンの初期表示用（名前の頭文字を取得）
  const getInitials = (name: string | undefined) => {
    if (!name) return 'JD'
    const names = name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

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

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left Column - User Summary */}
            <div className="space-y-6">
              {/* User Card */}
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    {/* 編集ボタン */}
                    {!isEditingUserCard && (
                      <div className="mb-4 flex w-full justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleStartEditUserCard}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="relative mb-4">
                      {isEditingUserCard ? (
                        <div className="relative">
                          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
                            {iconPreview ? (
                              <img
                                src={iconPreview}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl font-bold text-white">
                                {getInitials(editFormData.name)}
                              </span>
                            )}
                          </div>
                          <label
                            htmlFor="icon-upload"
                            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90"
                          >
                            <Camera className="h-4 w-4" />
                            <input
                              id="icon-upload"
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleIconChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                          {userProfile?.userDetail.icon ? (
                            <img
                              src={userProfile.userDetail.icon}
                              alt="Profile"
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl font-bold text-white">
                              {getInitials(userProfile?.userDetail.name)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {isEditingUserCard ? (
                      <div className="w-full space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <Input
                            value={editFormData.name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <Input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditUserCard}
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveUserCard}
                            className="flex-1"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                    <h2 className="text-2xl font-bold text-card-foreground">{userProfile?.userDetail.name}</h2>
                    <p className="text-sm text-muted-foreground">{userProfile?.userDetail.email}</p>
                      </>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary">Level {userProfile?.userDetail.currentLevel}</Badge>
                      <Badge variant="outline">
                        {getLevelRank(userProfile?.userDetail.currentLevel)}
                      </Badge>
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
                        <p className="font-semibold text-foreground">Level {userProfile?.userDetail.currentLevel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                        <Star className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Skill Points</p>
                        <p className="font-semibold text-foreground">{userProfile?.userDetail.totalSkillPoint} SP</p>
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
                        <p className="font-semibold text-foreground">{userProfile?.userDetail.completedQuestCount} Quests</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                        <Flame className="h-5 w-5 text-orange-500" />
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
                  <div className="flex items-center justify-between">
                    <div>
                  <CardTitle className="text-card-foreground">Basic Information</CardTitle>
                  <CardDescription>Your profile details</CardDescription>
                    </div>
                    {!isEditingBasicInfo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleStartEditBasicInfo}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingBasicInfo ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <Input
                            value={editFormData.name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <Input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <Textarea
                          value={editFormData.profile}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, profile: e.target.value }))}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={handleCancelEditBasicInfo}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveBasicInfo}
                          className="flex-1"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <p className="mt-1 text-foreground">{userProfile?.userDetail.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="mt-1 text-foreground">{userProfile?.userDetail.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                          {userProfile?.userDetail.profile || 'No bio provided'}
                    </p>
                  </div>
                    </>
                  )}
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
                    {userProfile?.userSkills?.map((skill: UserSkillInfoDto) => (
                      <Badge key={skill.skillCode} variant="secondary" className="px-3 py-1.5">
                        <span className="font-medium">{skill.skillName}</span>
                        <span className="ml-2 text-xs text-muted-foreground">• {skill.level}</span>
                      </Badge>
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
