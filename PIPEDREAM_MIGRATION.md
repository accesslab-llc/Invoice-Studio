# InvoiceStudio - PipeDream移行ガイド

**作成日**: 2024年

## 概要

このドキュメントは、InvoiceStudioをVercelからPipeDreamに移行する際に必要な変更点と対応策をまとめたものです。

---

## 1. 現在の構成（Vercel想定）

### 1.1. デプロイ設定ファイル

- `vercel.json`: Vercel用の設定（リライトルール、セキュリティヘッダー）
- `vercel-maintenance.json`: メンテナンスモード用の設定
- `maintenance.html`: メンテナンス画面

### 1.2. ビルド・デプロイ

- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `dist/`
- **静的サイト**: ViteでビルドされたSPA（Single Page Application）

### 1.3. 環境変数

- 開発環境: `.env.local`（Gitにコミットしない）
- 本番環境: Vercelダッシュボードで設定

---

## 2. PipeDreamへの移行で必要な変更点

### 2.1. デプロイ設定ファイルの変更

#### ❌ 削除または置き換えが必要なファイル

- `vercel.json` → PipeDream用の設定ファイルに置き換え
- `vercel-maintenance.json` → PipeDream用のメンテナンス設定に置き換え

#### ✅ 保持するファイル

- `vite.config.js`: ビルド設定（変更不要）
- `package.json`: 依存関係（変更不要）
- `maintenance.html`: メンテナンス画面（使用可能）

---

## 3. 具体的な変更内容

### 3.1. セキュリティヘッダーの設定

**現在（Vercel）**: `vercel.json`で設定
```json
{
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

**PipeDream対応**: PipeDreamの設定方法に合わせて設定
- PipeDreamのダッシュボードでセキュリティヘッダーを設定
- または、`_headers`ファイル（Netlify形式）を作成
- または、PipeDreamの設定ファイル（`pipedream.json`など）を作成

**対応策**:
1. PipeDreamのドキュメントを確認し、セキュリティヘッダーの設定方法を確認
2. 必要に応じて`_headers`ファイルまたはPipeDream用の設定ファイルを作成

---

### 3.2. SPAルーティングの設定

**現在（Vercel）**: `vercel.json`でリライトルールを設定
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**PipeDream対応**: PipeDreamのルーティング設定方法に合わせて設定

**対応策**:
1. PipeDreamのドキュメントでSPAルーティングの設定方法を確認
2. 必要に応じて`_redirects`ファイル（Netlify形式）を作成
3. または、PipeDreamの設定ファイルでリライトルールを設定

---

### 3.3. メンテナンスモードの実装

**現在（Vercel）**: `vercel-maintenance.json`でメンテナンスモードを切り替え

**PipeDream対応**: PipeDreamの機能に合わせて実装

**対応策**:
1. PipeDreamの環境変数や設定でメンテナンスモードを制御
2. または、PipeDreamのワークフローでメンテナンス画面を表示
3. または、`maintenance.html`を手動でデプロイして切り替え

---

### 3.4. 環境変数の設定

**現在（Vercel）**: Vercelダッシュボードで環境変数を設定

**PipeDream対応**: PipeDreamの環境変数設定方法に合わせる

**必要な環境変数**:
- `VITE_MONDAY_BOARD_ID`（オプション、開発用）
- `VITE_MONDAY_API_TOKEN`（開発環境のみ、本番では使用しない）

**対応策**:
1. PipeDreamのダッシュボードで環境変数を設定
2. 本番環境では`VITE_MONDAY_API_TOKEN`を設定しない（認証ポリシーに準拠）

---

### 3.5. ビルド・デプロイプロセス

**現在（Vercel）**: Git連携で自動デプロイ

**PipeDream対応**: PipeDreamのデプロイ方法に合わせる

**対応策**:
1. PipeDreamのデプロイ方法を確認（Git連携、CLI、手動アップロード等）
2. CI/CDパイプラインをPipeDream用に調整
3. ビルドコマンド: `npm run build`（変更不要）
4. 出力ディレクトリ: `dist/`（変更不要）

---

### 3.6. ドメイン・HTTPS設定

**現在（Vercel）**: Vercelが自動でHTTPSを提供

**PipeDream対応**: PipeDreamのドメイン・HTTPS設定方法に合わせる

**対応策**:
1. PipeDreamのカスタムドメイン設定方法を確認
2. SSL証明書の設定方法を確認（自動証明書か手動設定か）
3. HTTPS必須（Monday.comのiframe要件）

---

### 3.7. セキュリティ要件の確認

**必須要件**:
- HTTPS必須（TLS 1.2以上）
- `X-Frame-Options: SAMEORIGIN`（Monday.comのiframe要件）
- セキュリティヘッダーの設定

**対応策**:
1. PipeDreamでこれらの要件を満たせるか確認
2. 不足している場合は、PipeDreamのサポートに問い合わせ

---

## 4. 新規作成が必要なファイル

### 4.1. PipeDream用の設定ファイル

PipeDreamのドキュメントに基づいて、以下のいずれかを作成する必要があります：

- `pipedream.json`: PipeDream用の設定ファイル（存在する場合）
- `_headers`: Netlify形式のヘッダー設定ファイル
- `_redirects`: Netlify形式のリダイレクト設定ファイル

**注意**: PipeDreamの実際の設定方法は、PipeDreamのドキュメントを確認してください。

### 4.2. 設定ファイルの変換例

#### 現在の設定（`vercel.json`）

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

#### Netlify形式の変換例（`_headers`と`_redirects`）

**`_headers`ファイル**（`dist/`フォルダに配置）:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
```

**`_redirects`ファイル**（`dist/`フォルダに配置）:
```
/*    /index.html   200
```

**注意**: PipeDreamがNetlify形式をサポートしているか確認してください。

#### PipeDream用の設定ファイル例（仮）

PipeDreamの実際の設定方法に合わせて、以下のようなファイルを作成する必要があるかもしれません：

**`pipedream.json`（仮）**:
```json
{
  "build": {
    "command": "npm run build",
    "output": "dist"
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": {
    "/(.*)": {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block"
    }
  }
}
```

**重要**: 上記は仮の例です。PipeDreamの実際の設定方法は、PipeDreamのドキュメントを確認してください。

---

### 4.3. デプロイスクリプト（オプション）

PipeDream CLIを使用する場合、デプロイスクリプトを作成：

```bash
#!/bin/bash
# deploy.sh

# ビルド
npm run build

# PipeDreamにデプロイ
# （PipeDream CLIのコマンドを確認）
```

### 4.4. メンテナンスモードの設定例

**現在の設定（`vercel-maintenance.json`）**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/maintenance.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

**PipeDream対応**: PipeDreamの環境変数や設定でメンテナンスモードを制御する方法を確認してください。

**対応策の例**:
1. 環境変数`MAINTENANCE_MODE=true`を設定してメンテナンスモードを有効化
2. ビルド時に`maintenance.html`を`index.html`にコピー
3. または、PipeDreamの設定でリライトルールを変更

---

## 5. 確認事項チェックリスト

移行前に以下を確認してください：

### 5.1. PipeDreamの機能確認

- [ ] PipeDreamで静的サイトのホスティングが可能か
- [ ] SPAルーティング（リライトルール）が設定できるか
- [ ] セキュリティヘッダーが設定できるか
- [ ] カスタムドメインが設定できるか
- [ ] HTTPS（TLS 1.2以上）が自動で提供されるか
- [ ] 環境変数が設定できるか
- [ ] Git連携で自動デプロイが可能か

### 5.2. 設定ファイルの確認

- [ ] `vercel.json`の内容をPipeDream用に変換
- [ ] セキュリティヘッダーの設定方法を確認
- [ ] SPAルーティングの設定方法を確認
- [ ] メンテナンスモードの実装方法を確認

### 5.3. 環境変数の確認

- [ ] PipeDreamで環境変数を設定
- [ ] 本番環境で`VITE_MONDAY_API_TOKEN`を設定しないことを確認

### 5.4. テスト

- [ ] ビルドが正常に完了するか確認
- [ ] デプロイ後、アプリが正常に動作するか確認
- [ ] Monday.comのiframe内で正常に動作するか確認
- [ ] セキュリティヘッダーが正しく設定されているか確認
- [ ] HTTPSが有効になっているか確認

---

## 6. 移行手順（仮）

**注意**: 以下の手順は、PipeDreamの実際の機能に合わせて調整してください。

### ステップ1: PipeDreamアカウントの準備

1. PipeDreamアカウントを作成
2. プロジェクトを作成
3. デプロイ方法を確認（Git連携、CLI、手動アップロード等）

### ステップ2: 設定ファイルの準備

1. PipeDreamのドキュメントを確認
2. 必要な設定ファイルを作成（`pipedream.json`、`_headers`、`_redirects`等）
3. `vercel.json`の内容をPipeDream用に変換

### ステップ3: 環境変数の設定

1. PipeDreamのダッシュボードで環境変数を設定
2. 本番環境では`VITE_MONDAY_API_TOKEN`を設定しない

### ステップ4: ビルド・デプロイ

1. ローカルでビルドをテスト: `npm run build`
2. PipeDreamにデプロイ
3. 動作確認

### ステップ5: ドメイン・HTTPS設定

1. カスタムドメインを設定
2. SSL証明書の設定（自動または手動）
3. HTTPSが有効になっているか確認

### ステップ6: セキュリティ確認

1. セキュリティヘッダーが正しく設定されているか確認
2. `X-Frame-Options: SAMEORIGIN`が設定されているか確認
3. HTTPSが有効になっているか確認

---

## 7. 参考情報

### 7.1. 現在の設定ファイル

- `vercel.json`: Vercel用の設定（リライトルール、セキュリティヘッダー）
- `vercel-maintenance.json`: メンテナンスモード用の設定
- `vite.config.js`: Viteのビルド設定
- `package.json`: 依存関係とビルドスクリプト

### 7.2. 重要な設定値

**ビルドコマンド**: `npm run build`
**出力ディレクトリ**: `dist/`
**エントリーポイント**: `index.html`

### 7.3. セキュリティ要件

- HTTPS必須（TLS 1.2以上）
- `X-Frame-Options: SAMEORIGIN`（Monday.comのiframe要件）
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

---

## 8. 注意事項

### 8.1. コード変更は不要

**重要**: アプリケーションのコード（`src/`配下）は変更不要です。

変更が必要なのは、**デプロイ設定ファイルのみ**です。

### 8.2. 認証ポリシーは変更不要

`BoardSDK.js`の認証ロジック（環境分岐）は変更不要です。

本番環境では、PipeDreamで`VITE_MONDAY_API_TOKEN`を設定しないことで、正しく動作します。

### 8.3. ビルド設定は変更不要

`vite.config.js`と`package.json`のビルド設定は変更不要です。

---

## 9. 次のステップ

1. **PipeDreamのドキュメントを確認**
   - 静的サイトのホスティング方法
   - セキュリティヘッダーの設定方法
   - SPAルーティングの設定方法
   - 環境変数の設定方法

2. **PipeDreamのサポートに問い合わせ**（必要に応じて）
   - 静的サイトのホスティングが可能か
   - SPAルーティングの設定方法
   - セキュリティヘッダーの設定方法

3. **設定ファイルを作成**
   - PipeDream用の設定ファイルを作成
   - `vercel.json`の内容をPipeDream用に変換

4. **テスト環境で動作確認**
   - ビルドが正常に完了するか
   - デプロイ後、アプリが正常に動作するか
   - Monday.comのiframe内で正常に動作するか

---

## 10. トラブルシューティング

### 10.1. ビルドエラー

- `npm run build`が失敗する場合、`package.json`の依存関係を確認
- `node_modules/`を削除して`npm install`を再実行

### 10.2. デプロイエラー

- PipeDreamのデプロイログを確認
- ビルドコマンドと出力ディレクトリが正しく設定されているか確認

### 10.3. ルーティングエラー

- SPAルーティングの設定が正しいか確認
- すべてのリクエストが`index.html`にリダイレクトされるか確認

### 10.4. セキュリティヘッダーエラー

- セキュリティヘッダーが正しく設定されているか確認
- `X-Frame-Options: SAMEORIGIN`が設定されているか確認

---

**最終更新**: 2024年

