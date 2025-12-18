# 認証関連のタスク状況

**最終更新**: 2024年

## ✅ 完了したタスク

### 1. 認証方式の改善
- ✅ 環境分岐ロジックの実装（DEV/PROD）
  - 本番環境では `sessionToken` / `monday.get('token')` のみ使用
  - 個人APIトークンはローカル開発専用
- ✅ エラーハンドリングの実装
  - トークン取得失敗時のUI表示
  - 詳細なデバッグログ

### 2. Monday.com API統合
- ✅ Monday SDKの初期化
- ✅ `monday.api()`メソッドの使用
- ✅ ボードIDの取得（コンテキストから）
- ✅ API権限の設定（`boards:read`）

### 3. セキュリティヘッダー
- ✅ `X-Frame-Options`を`Content-Security-Policy`に変更
- ✅ Monday.comのiframe内で表示可能に修正
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`

### 4. 本番環境ホスティング
- ✅ Vercelへのデプロイ完了
- ✅ Production URL: `https://invoice-studio-xi.vercel.app`
- ✅ HTTPS有効化（Vercelが自動提供）

### 5. 法務ドキュメント
- ✅ プライバシーポリシー（日本語・英語・スペイン語）
- ✅ 利用規約（日本語・英語・スペイン語）

---

## ⚠️ 残っているタスク

### 1. OAuthスコープの確認・設定

**現状**:
- ✅ `boards:read` - 設定済み・動作確認済み
- ⚠️ `items:read` - 設定状況不明（Monday.comのOAuth Scope設定に表示されていない）
- ⚠️ `subitems:read` - 設定状況不明（Monday.comのOAuth Scope設定に表示されていない）

**確認事項**:
- Monday.com Developer Centerで`items:read`と`subitems:read`が利用可能か確認
- 利用可能な場合、設定を追加
- 利用不可能な場合、`boards:read`のみで動作するか確認

**次のステップ**:
1. Monday.com Developer CenterでOAuth Scope設定を再確認
2. `items:read`と`subitems:read`が利用可能か確認
3. 利用可能な場合、設定を追加
4. アプリを再読み込みして動作確認

---

### 2. セキュリティ要件の確認

**現状**:
- ✅ HTTPS有効化（Vercelが自動提供）
- ✅ `.gitignore`に`.env.local`が含まれている
- ⚠️ ログ出力からトークン値を除外（実装済み）
- ❌ 脆弱性スキャン（Burp scan）未実施

**次のステップ**:
1. `.gitignore`の確認（既に`.env.local`が含まれている）
2. 脆弱性スキャンの実施（任意）

---

### 3. ドキュメント化

**現状**:
- ✅ READMEに必要なスコープの記載あり
- ⚠️ 各スコープの使用理由の説明が不足

**次のステップ**:
1. 各スコープの使用理由をドキュメント化
2. Developer Centerでのスコープ設定手順をドキュメント化

---

## 📝 現在の認証フロー

### 本番環境（Production）

1. **Monday.comのボードでアプリを開く**
2. **Monday SDKが自動で認証を処理**
   - `sessionToken`をURLパラメータから取得
   - または`monday.get('token')`でトークンを取得
3. **`monday.api()`でGraphQL APIを呼び出し**
   - Monday SDKが内部でトークンを自動取得
   - CORSと認証を自動処理

### 開発環境（Development）

1. **ローカルで開発サーバーを起動**
2. **環境変数`VITE_MONDAY_API_TOKEN`を設定**（オプション）
3. **Monday.comのボードからアプリを開く**
   - `sessionToken`をURLパラメータから取得
   - または環境変数から取得

---

## 🔍 確認すべき項目

### 1. OAuthスコープの確認

Monday.com Developer Centerで：
- `boards:read` - ✅ 設定済み
- `items:read` - ⚠️ 確認が必要
- `subitems:read` - ⚠️ 確認が必要

### 2. アプリの動作確認

Monday.comのボードで：
- ✅ アプリが正常に表示される
- ✅ ボードデータが取得できる
- ⚠️ アイテムデータが取得できるか確認
- ⚠️ サブアイテムデータが取得できるか確認

---

## 📚 参考情報

- [MARKETPLACE_READINESS.md](./MARKETPLACE_READINESS.md) - マーケットプレイス対応状況
- [MONDAY_API_PERMISSIONS.md](./MONDAY_API_PERMISSIONS.md) - API権限設定ガイド

---

**最終更新**: 2024年

