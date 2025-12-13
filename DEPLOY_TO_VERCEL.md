# InvoiceStudioをVercelにデプロイする方法

**作成日**: 2024年

## 概要

PipeDreamには静的サイトのホスティング機能がないため、**Vercel**を使用してInvoiceStudioをデプロイする方法を説明します。

---

## ✅ Vercelを使用する理由

1. **設定が簡単**: GitHubリポジトリを接続するだけで自動デプロイ
2. **自動HTTPS**: SSL証明書が自動で発行される
3. **セキュリティヘッダー対応**: `vercel.json`で設定可能
4. **SPAルーティング対応**: 自動で対応
5. **無料プランあり**: 個人・小規模プロジェクトに最適

---

## 📝 デプロイ手順

### ステップ1: Vercelアカウントを作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでサインアップ（推奨）

---

### ステップ2: プロジェクトをインポート

1. Vercelダッシュボードにログイン
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」を選択
4. GitHubリポジトリを検索:
   - `ryotarotakano-AL/Invoice-Studio`
5. 「Import」をクリック

---

### ステップ3: ビルド設定を確認

Vercelが自動で設定を検出しますが、確認してください：

#### Framework Preset
- **Vite** を選択（自動検出される可能性が高い）

#### Root Directory
- `.`（プロジェクトルート）

#### Build Command
- `npm run build`

#### Output Directory
- `dist`

#### Install Command
- `npm install`（自動）

---

### ステップ4: 環境変数の設定

**重要**: 本番環境では `VITE_MONDAY_API_TOKEN` を設定しない

#### 設定しない環境変数
- ❌ `VITE_MONDAY_API_TOKEN`（本番環境では使用しない）

#### 設定可能な環境変数（オプション）
- `VITE_MONDAY_BOARD_ID`（オプション、通常は設定不要）

**設定方法**:
1. 「Environment Variables」セクションを開く
2. 必要に応じて環境変数を追加
3. **注意**: `VITE_MONDAY_API_TOKEN`は追加しない

---

### ステップ5: デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（数分かかります）
3. デプロイが完了すると、URLが表示されます

---

## 🔧 設定ファイルの確認

### vercel.json

プロジェクトには既に `vercel.json` が含まれています：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

この設定により：
- ✅ SPAルーティングが有効
- ✅ セキュリティヘッダーが設定される
- ✅ `X-Frame-Options: SAMEORIGIN`が設定される（Monday.comのiframe要件）

---

## 🌐 カスタムドメインの設定（オプション）

### ステップ1: ドメインを追加

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」をクリック
3. ドメインを入力
4. DNS設定をVercelの指示に従って設定

### ステップ2: SSL証明書

- Vercelが自動でSSL証明書を発行します（Let's Encrypt）
- 設定不要

---

## 🔍 デプロイ後の確認事項

### 1. アプリが正常に動作するか

- [ ] アプリが表示される
- [ ] エラーメッセージが表示されない
- [ ] コンソールにエラーがない（F12で確認）

### 2. Monday.comとの連携

- [ ] Monday.comのiframe内で正常に表示される
- [ ] 「データ読み込み」ボタンが動作する
- [ ] ボードデータが正常に取得できる
- [ ] 認証エラーが発生しない

### 3. セキュリティヘッダー

ブラウザの開発者ツール（F12）→ Networkタブで確認：

- [ ] `X-Content-Type-Options: nosniff`が設定されている
- [ ] `X-Frame-Options: SAMEORIGIN`が設定されている
- [ ] `X-XSS-Protection: 1; mode=block`が設定されている

### 4. HTTPS

- [ ] URLが`https://`で始まっている
- [ ] ブラウザで「安全な接続」と表示される
- [ ] SSL証明書が有効

### 5. SPAルーティング

- [ ] 直接URLにアクセスしても正常に表示される
- [ ] ページをリロードしても正常に表示される
- [ ] 404エラーが発生しない

---

## 🔄 自動デプロイの設定

### GitHub連携による自動デプロイ

VercelはGitHubリポジトリと連携しているため、自動でデプロイされます：

- **mainブランチへのプッシュ**: 本番環境にデプロイ
- **その他のブランチへのプッシュ**: プレビュー環境にデプロイ

### ブランチの選択

デプロイするブランチを選択できます：

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Git」をクリック
3. 「Production Branch」を設定
   - `main` または `pipedream-migration` を選択

---

## 📝 メンテナンスモード

メンテナンスモードを有効化する方法：

### 方法1: vercel-maintenance.jsonを使用

1. `vercel-maintenance.json`の内容を`vercel.json`にコピー
2. コミット・プッシュ
3. Vercelが自動でデプロイ

### 方法2: 環境変数で制御

1. Vercelの環境変数に`MAINTENANCE_MODE=true`を設定
2. アプリ側で環境変数を読み取り、メンテナンス画面を表示

---

## 🆘 トラブルシューティング

### ビルドエラー

**問題**: ビルドが失敗する

**解決策**:
1. Vercelのビルドログを確認
2. ローカルで`npm run build`を実行して確認
3. `package.json`の依存関係を確認

---

### ルーティングエラー

**問題**: 直接URLにアクセスすると404エラーになる

**解決策**:
1. `vercel.json`の`rewrites`設定を確認
2. ビルドログで`vercel.json`が正しく読み込まれているか確認

---

### セキュリティヘッダーが設定されない

**問題**: セキュリティヘッダーが反映されない

**解決策**:
1. `vercel.json`の`headers`設定を確認
2. ビルドログで`vercel.json`が正しく読み込まれているか確認
3. ブラウザのキャッシュをクリア

---

## 📚 参考情報

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Configuration](https://vercel.com/docs/project-configuration)
- [vercel.json](./vercel.json) - プロジェクト内の設定ファイル

---

## ✅ まとめ

1. **Vercelアカウントを作成**
2. **GitHubリポジトリをインポート**
3. **ビルド設定を確認**（自動検出される）
4. **環境変数を設定**（`VITE_MONDAY_API_TOKEN`は設定しない）
5. **デプロイ**

これで、InvoiceStudioがVercelでホスティングされ、Monday.comのiframe内で正常に動作します。

---

**最終更新**: 2024年

