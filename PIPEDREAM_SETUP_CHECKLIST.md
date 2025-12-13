# PipeDream設定チェックリスト

**作成日**: 2024年

## 概要

PipeDreamでInvoiceStudioをアプリとして機能させるために必要な設定を確認するチェックリストです。

---

## ✅ 必須設定項目

### 1. ビルド設定

#### ビルドコマンド
```
npm run build
```

#### 出力ディレクトリ
```
dist
```

#### ルートディレクトリ
```
/（プロジェクトルート）
```

#### Node.jsバージョン
- Node.js 18以上を推奨
- PipeDreamの設定で指定可能な場合は指定

**確認方法**: PipeDreamのプロジェクト設定で確認

---

### 2. 環境変数の設定

#### ❌ 本番環境で設定しない環境変数

- `VITE_MONDAY_API_TOKEN`
  - **理由**: 本番環境では個人APIトークンを使用しない（セキュリティポリシー）
  - アプリは`sessionToken`または`monday.get('token')`を使用

#### ✅ 設定可能な環境変数（オプション）

- `VITE_MONDAY_BOARD_ID`
  - **用途**: デフォルトボードID（オプション）
  - **注意**: 通常はMonday.comのコンテキストから自動取得されるため、設定不要

**設定方法**: PipeDreamのプロジェクト設定 → 環境変数

---

### 3. セキュリティヘッダーの設定

#### 必須ヘッダー

以下のヘッダーが設定されている必要があります：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` ← **重要**: Monday.comのiframe要件
- `X-XSS-Protection: 1; mode=block`

#### 設定方法

**方法1: `_headers`ファイルを使用（推奨）**

`public/_headers`ファイルがビルド時に`dist/_headers`にコピーされます。

PipeDreamがNetlify形式の`_headers`ファイルをサポートしている場合、自動で適用されます。

**方法2: PipeDreamの設定で直接指定**

PipeDreamの設定画面でセキュリティヘッダーを直接設定できる場合：

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

**確認方法**: 
1. デプロイ後、ブラウザの開発者ツール（F12）を開く
2. Networkタブでリクエストを確認
3. Response Headersに上記のヘッダーが含まれているか確認

---

### 4. SPAルーティングの設定

#### 必須設定

すべてのリクエストを`index.html`にリダイレクトする必要があります。

#### 設定方法

**方法1: `_redirects`ファイルを使用（推奨）**

`public/_redirects`ファイルがビルド時に`dist/_redirects`にコピーされます。

内容:
```
/*    /index.html   200
```

PipeDreamがNetlify形式の`_redirects`ファイルをサポートしている場合、自動で適用されます。

**方法2: PipeDreamの設定で直接指定**

PipeDreamの設定画面でリライトルールを設定できる場合：

- パターン: `/*`
- リダイレクト先: `/index.html`
- ステータスコード: `200`

**確認方法**:
1. デプロイ後、アプリのURLに直接アクセス
2. ページが正常に表示されるか確認
3. ページをリロードしても正常に表示されるか確認

---

### 5. HTTPS設定

#### 必須要件

- **HTTPS必須**: Monday.comのiframe要件のため、HTTPSが必須です
- **TLS 1.2以上**: セキュリティ要件

#### 設定方法

PipeDreamが自動でHTTPSを提供する場合：
- 設定不要（自動で有効化）

手動設定が必要な場合：
- PipeDreamの設定でSSL証明書を設定
- Let's Encryptなどの無料証明書を使用可能

**確認方法**:
1. デプロイ後のURLが`https://`で始まっているか確認
2. ブラウザで「安全な接続」と表示されるか確認

---

### 6. ドメイン設定（オプション）

#### カスタムドメイン

Monday.comのアプリ設定で使用するURLを設定する場合：

1. PipeDreamでカスタムドメインを設定
2. DNS設定をPipeDreamの指示に従って設定
3. SSL証明書が自動で発行されるか確認

#### デフォルトドメイン

PipeDreamが提供するデフォルトドメインを使用する場合：
- 設定不要
- デフォルトドメインのURLをMonday.comのアプリ設定で使用

---

## 🔍 デプロイ後の確認事項

### 1. アプリの基本動作

- [ ] アプリが正常に表示される
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

## 🛠️ PipeDreamの設定画面で確認すべき項目

### プロジェクト設定

1. **ビルド設定**
   - [ ] ビルドコマンド: `npm run build`
   - [ ] 出力ディレクトリ: `dist`
   - [ ] Node.jsバージョン: 18以上

2. **環境変数**
   - [ ] `VITE_MONDAY_API_TOKEN`が設定されていない（本番環境）
   - [ ] `VITE_MONDAY_BOARD_ID`は設定不要（オプション）

3. **デプロイ設定**
   - [ ] ブランチ: `pipedream-migration`（または`main`）
   - [ ] 自動デプロイ: 有効（推奨）

### セキュリティ設定

1. **セキュリティヘッダー**
   - [ ] `X-Frame-Options: SAMEORIGIN`が設定されている
   - [ ] その他のセキュリティヘッダーが設定されている

2. **HTTPS**
   - [ ] HTTPSが有効になっている
   - [ ] SSL証明書が有効

### ルーティング設定

1. **SPAルーティング**
   - [ ] すべてのリクエストが`index.html`にリダイレクトされる
   - [ ] 404エラーが発生しない

---

## 📝 トラブルシューティング

### 問題1: アプリが表示されない

**確認事項**:
1. ビルドが成功しているか（PipeDreamのログを確認）
2. 出力ディレクトリが正しく設定されているか
3. `dist/index.html`が存在するか

**解決策**:
- ビルドログを確認
- ローカルで`npm run build`を実行して確認

---

### 問題2: Monday.comのiframe内で表示されない

**確認事項**:
1. `X-Frame-Options: SAMEORIGIN`が設定されているか
2. HTTPSが有効になっているか
3. Monday.comのアプリ設定でURLが正しく設定されているか

**解決策**:
- セキュリティヘッダーを確認
- HTTPSが有効になっているか確認

---

### 問題3: 認証エラーが発生する

**確認事項**:
1. `VITE_MONDAY_API_TOKEN`が設定されていないか（本番環境では設定しない）
2. Monday.comのアプリ設定で権限（スコープ）が正しく設定されているか

**解決策**:
- 環境変数を確認
- Monday.comのアプリ設定で権限を確認

---

### 問題4: ページをリロードすると404エラーになる

**確認事項**:
1. SPAルーティングの設定が正しいか
2. `_redirects`ファイルが`dist/`に含まれているか

**解決策**:
- `_redirects`ファイルを確認
- PipeDreamのルーティング設定を確認

---

## 📚 参考情報

- [PIPEDREAM_DEPLOY.md](./PIPEDREAM_DEPLOY.md) - デプロイ手順の詳細
- [PIPEDREAM_MIGRATION.md](./PIPEDREAM_MIGRATION.md) - 移行ガイド
- [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) - アーキテクチャ仕様

---

**最終更新**: 2024年

