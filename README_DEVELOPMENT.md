# DevJorney フロントエンド開発ガイド

## 現在の状況

- Amplifyのテンプレート（TODOアプリ）が`app/page.tsx`に実装されています
- 新しいアプリケーション用のページは`app/dashboard/page.tsx`に作成されています
- 既存のテンプレートは壊さずに、段階的に移行できます

## 開発の進め方

### 1. 依存関係のインストール

```bash
cd frontend/dev-jorney-frontend
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. ページの確認

- **テンプレート（TODOアプリ）**: http://localhost:3000
- **新しいダッシュボード**: http://localhost:3000/dashboard

### 4. 段階的な移行手順

1. **新しいページを完成させる** (`app/dashboard/page.tsx`)
   - バックエンドAPIとの連携
   - 認証機能の実装
   - データの表示

2. **動作確認**
   - 新しいページが正しく動作することを確認

3. **既存ページを置き換え** (`app/page.tsx`)
   - 新しいページが完成したら、`app/page.tsx`を**置き換え**（削除ではない）
   - `app/dashboard/page.tsx`の内容を`app/page.tsx`にコピー
   - `app/dashboard/`ディレクトリは削除してOK
   - 詳細は`MIGRATION_GUIDE.md`を参照

## ファイル構造

```
app/
├── page.tsx          # テンプレート（TODOアプリ）- 残しておく
├── dashboard/
│   ├── page.tsx      # 新しいダッシュボードページ
│   └── layout.tsx    # ダッシュボード用レイアウト
└── layout.tsx        # ルートレイアウト

components/
└── sidebar.tsx       # サイドバーコンポーネント

lib/
└── utils.ts          # ユーティリティ関数
```

## 次のステップ

1. ✅ 依存関係の追加（clsx, tailwind-merge, lucide-react）
2. ✅ ユーティリティファイルの作成（lib/utils.ts）
3. ✅ 新しいダッシュボードページの作成
4. ⏳ Amplify設定ファイルの準備（amplify_outputs.json）
5. ⏳ APIクライアントの実装
6. ⏳ 認証機能の実装
7. ⏳ バックエンドAPIとの連携

## 注意事項

- **既存の`app/page.tsx`は削除しないでください**（ルートパスが機能しなくなります）
- **置き換えてください**（`app/dashboard/page.tsx`の内容を`app/page.tsx`にコピー）
- 新しい機能は`app/dashboard/`以下に実装してください
- 動作確認が完了してから、既存ページを置き換えてください
- 詳細な移行手順は`MIGRATION_GUIDE.md`を参照してください

