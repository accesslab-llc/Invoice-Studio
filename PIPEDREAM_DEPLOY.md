# InvoiceStudio - PipeDreamデプロイ手順

**作成日**: 2024年

## 概要

このドキュメントは、InvoiceStudioをPipeDreamにデプロイする手順を説明します。

---

## 前提条件

- PipeDreamアカウントを持っていること
- Gitリポジトリが設定されていること（オプション）
- Node.jsとnpmがインストールされていること（ローカルビルドの場合）

---

## デプロイ方法

### 方法1: Git連携による自動デプロイ（推奨）

1. **PipeDreamでプロジェクトを作成**
   - PipeDreamダッシュボードにログイン
   - 新しいプロジェクトを作成
   - プロジェクトタイプ: "Static Site" または "Web App" を選択

2. **Gitリポジトリを接続**
   - プロジェクト設定でGitリポジトリを接続
   - ブランチ: `pipedream-migration` を選択（または `main`）

3. **ビルド設定を指定**
   - ビルドコマンド: `npm run build`
   - 出力ディレクトリ: `dist`
   - ルートディレクトリ: `/`（プロジェクトルート）

4. **環境変数を設定**（必要に応じて）
   - `VITE_MONDAY_BOARD_ID`（オプション、開発用）
   - **注意**: `VITE_MONDAY_API_TOKEN`は本番環境では設定しない

5. **デプロイ**
   - 設定を保存すると自動でデプロイが開始されます

---

### 方法2: 手動アップロード

1. **ローカルでビルド**
   ```bash
   npm install
   npm run build
   ```

2. **distフォルダを確認**
   - `dist/`フォルダにビルドされたファイルが生成されます
   - `dist/_headers`と`dist/_redirects`が含まれていることを確認

3. **PipeDreamにアップロード**
   - PipeDreamダッシュボードで手動アップロード機能を使用
   - `dist/`フォルダの内容をアップロード

---

## 設定ファイルの説明

### `_headers`（Netlify形式）

`public/_headers`ファイルがビルド時に`dist/_headers`にコピーされます。

**内容**:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
```

**役割**:
- セキュリティヘッダーを設定
- `X-Frame-Options: SAMEORIGIN`はMonday.comのiframe要件

---

### `_redirects`（Netlify形式）

`public/_redirects`ファイルがビルド時に`dist/_redirects`にコピーされます。

**内容**:
```
/*    /index.html   200
```

**役割**:
- SPAルーティング対応
- すべてのリクエストを`index.html`にリダイレクト

---

### `pipedream.json`

PipeDream用の設定ファイル（参考用）。

**注意**: PipeDreamの実際の設定方法は、PipeDreamのドキュメントを確認してください。

---

## 環境変数の設定

### 本番環境

**設定しない環境変数**:
- `VITE_MONDAY_API_TOKEN`（本番環境では使用しない）

**設定可能な環境変数**:
- `VITE_MONDAY_BOARD_ID`（オプション、デフォルトボードID）

### 開発環境

`.env.local`ファイルに設定（Gitにコミットしない）:
```
VITE_MONDAY_API_TOKEN=your_personal_token_here
VITE_MONDAY_BOARD_ID=your_board_id_here
```

---

## デプロイ後の確認事項

### 1. アプリが正常に動作するか

- [ ] アプリが表示される
- [ ] Monday.comのiframe内で正常に動作する
- [ ] データの読み込みが正常に動作する

### 2. セキュリティヘッダーが設定されているか

ブラウザの開発者ツール（F12）で確認:

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-XSS-Protection: 1; mode=block`

### 3. HTTPSが有効になっているか

- [ ] URLが`https://`で始まっている
- [ ] ブラウザで「安全な接続」と表示される

### 4. SPAルーティングが動作するか

- [ ] 直接URLにアクセスしても正常に表示される
- [ ] ページをリロードしても正常に表示される

---

## カスタムドメインの設定

1. **PipeDreamでカスタムドメインを設定**
   - プロジェクト設定でカスタムドメインを追加
   - DNS設定をPipeDreamの指示に従って設定

2. **SSL証明書の設定**
   - PipeDreamが自動でSSL証明書を発行（Let's Encrypt等）
   - または、手動でSSL証明書をアップロード

---

## メンテナンスモード

### 方法1: 環境変数で制御（推奨）

1. PipeDreamの環境変数に`MAINTENANCE_MODE=true`を設定
2. アプリ側で環境変数を読み取り、メンテナンス画面を表示

### 方法2: 手動でメンテナンス画面をデプロイ

1. `maintenance.html`を`index.html`にリネーム
2. デプロイ
3. メンテナンス終了後、元の`index.html`に戻す

---

## トラブルシューティング

### ビルドエラー

**問題**: `npm run build`が失敗する

**解決策**:
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### ルーティングエラー

**問題**: 直接URLにアクセスすると404エラーになる

**解決策**:
- `_redirects`ファイルが`dist/`フォルダに含まれているか確認
- PipeDreamの設定でSPAルーティングが有効になっているか確認

---

### セキュリティヘッダーが設定されない

**問題**: セキュリティヘッダーが反映されない

**解決策**:
- `_headers`ファイルが`dist/`フォルダに含まれているか確認
- PipeDreamの設定でヘッダー設定が有効になっているか確認
- PipeDreamのサポートに問い合わせ

---

### iframeで表示されない

**問題**: Monday.comのiframe内で表示されない

**解決策**:
- `X-Frame-Options: SAMEORIGIN`が設定されているか確認
- HTTPSが有効になっているか確認
- Monday.comのアプリ設定でiframe URLが正しく設定されているか確認

---

## 参考情報

- [PipeDream Documentation](https://pipedream.com/docs/)（PipeDreamの公式ドキュメント）
- [PIPEDREAM_MIGRATION.md](./PIPEDREAM_MIGRATION.md)（移行ガイド）
- [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md)（アーキテクチャ仕様）

---

**最終更新**: 2024年

