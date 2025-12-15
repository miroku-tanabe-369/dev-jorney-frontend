# テンプレートから本番アプリへの移行ガイド

## 重要な注意事項

**`app/page.tsx`は削除してはいけません！**

`app/page.tsx`はNext.jsのルートページ（`/`）なので、削除するとルートパスにアクセスできなくなります。
代わりに、**置き換え**を行ってください。

## 移行手順

### ステップ1: テンプレートコードのバックアップ（オプション）

必要に応じて、テンプレートコードを別ファイルに保存：

```bash
# テンプレートコードをバックアップ（必要に応じて）
cp app/page.tsx app/page.template.backup.tsx
```

### ステップ2: app/page.tsxをダッシュボードページに置き換え

`app/dashboard/page.tsx`の内容を`app/page.tsx`にコピーして置き換えます。

**置き換え後の`app/page.tsx`の例：**

```tsx
"use client";

import { Sidebar } from "@/components/sidebar";

/**
 * ダッシュボードページ（ルートページ）
 * 
 * ルートパス（/）でダッシュボードを表示
 */
export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
        {/* ダッシュボードのコンテンツ */}
      </main>
    </div>
  );
}
```

### ステップ3: app/dashboard/page.tsxを削除

`app/dashboard/page.tsx`は不要になるので削除します：

```bash
rm -rf app/dashboard
```

または、IDEから削除してください。

### ステップ4: 動作確認

1. 開発サーバーを起動：`npm run dev`
2. http://localhost:3000 にアクセス
3. ダッシュボードが正しく表示されることを確認
4. サイドバーの`Dashboard`リンクが正しく動作することを確認

## サイドバーの設定確認

サイドバー（`components/sidebar.tsx`）では、`Dashboard`の`href`が`"/"`になっています：

```tsx
const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  // ...
]
```

この設定に合わせて、`app/page.tsx`をダッシュボードページにする必要があります。

## まとめ

- ❌ **削除しない**: `app/page.tsx`を削除するとルートパスが機能しなくなります
- ✅ **置き換える**: `app/page.tsx`をダッシュボードページの内容に置き換えます
- ✅ **統合する**: `app/dashboard/page.tsx`の内容を`app/page.tsx`に統合します
- ✅ **削除する**: `app/dashboard/`ディレクトリは削除してOKです

## チェックリスト

移行前に以下を確認してください：

- [ ] 全ての画面が完成している
- [ ] ダッシュボードページが正しく動作している
- [ ] バックエンドAPIとの連携が完了している
- [ ] 認証機能が実装されている
- [ ] 動作確認が完了している

移行後：

- [ ] `app/page.tsx`がダッシュボードページになっている
- [ ] `app/dashboard/`ディレクトリが削除されている
- [ ] ルートパス（`/`）でダッシュボードが表示される
- [ ] サイドバーの`Dashboard`リンクが正しく動作する

