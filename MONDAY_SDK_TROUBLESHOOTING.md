# Monday.com SDK トラブルシューティングガイド

**作成日**: 2024年

## 問題

Monday.comのAPIが`undefined`を返す。ログには以下が表示される：
```
[BoardSDK] API response received: undefined
[BoardSDK] API response type: undefined
```

---

## 🔍 原因の特定

### 確認すべき項目

1. **Monday.com Developer CenterでAPI権限が設定されているか**
2. **認証トークンが正しく取得できているか**
3. **Monday SDKが正しく初期化されているか**

---

## 🔧 解決方法

### ステップ1: Monday.com Developer CenterでAPI権限を確認

**最も重要なステップ**です。

1. **Monday.com Developer Centerにログイン**
   - https://developer.monday.com/apps

2. **アプリ一覧からInvoiceStudioを選択**

3. **「Settings」または「Configuration」タブを開く**

4. **「Permissions」または「Scopes」セクションを確認**

5. **以下の権限を有効化**:
   - ✅ `boards:read` - ボードデータの読み取り
   - ✅ `items:read` - アイテムデータの読み取り
   - ✅ `subitems:read` - サブアイテムデータの読み取り

6. **「Save」をクリック**

7. **アプリを再読み込み**

---

### ステップ2: 認証トークンの確認

ブラウザのコンソールで以下を確認：

1. **Monday.comのボードでアプリを開く**
2. **ブラウザの開発者ツール（F12）を開く**
3. **Consoleタブで以下を確認**:
   - `[BoardSDK] Token retrieved: Token exists` - 正常
   - `[BoardSDK] Token retrieved: Token is null/undefined` - 認証に問題あり

---

### ステップ3: Monday SDKの初期化確認

コンソールで以下を確認：

- `[BoardSDK] Monday SDK object is not initialized` - SDKの初期化に問題
- `[BoardSDK] monday.api() method is not available` - APIメソッドが利用不可

---

## 🆘 よくある問題と解決策

### 問題1: API権限が設定されていない

**症状**:
- `monday.api()`が`undefined`を返す
- エラーメッセージ: "Monday.com API returned undefined"

**解決策**:
1. Monday.com Developer CenterでAPI権限を設定
2. アプリを再読み込み

---

### 問題2: 認証トークンが取得できない

**症状**:
- `[BoardSDK] Token retrieved: Token is null/undefined`
- `monday.api()`が`undefined`を返す

**解決策**:
1. Monday.comのボードからアプリを開き直す
2. アプリのURLが正しく設定されているか確認
3. Monday.com Developer Centerでアプリが「Published」状態か確認

---

### 問題3: Monday SDKが正しく初期化されていない

**症状**:
- `[BoardSDK] Monday SDK object is not initialized`
- `[BoardSDK] monday.api() method is not available`

**解決策**:
1. `monday-sdk-js`のバージョンを確認（`package.json`）
2. 依存関係を再インストール: `npm install`
3. アプリを再ビルド・再デプロイ

---

## 📝 確認チェックリスト

- [ ] Monday.com Developer CenterでAPI権限を設定した
  - [ ] `boards:read`
  - [ ] `items:read`
  - [ ] `subitems:read`
- [ ] アプリを再読み込みした
- [ ] ブラウザのコンソールでトークンが取得できているか確認した
- [ ] Monday SDKが正しく初期化されているか確認した
- [ ] アプリが「Published」状態か確認した

---

## 🔍 デバッグ方法

### コンソールで確認すべきログ

**正常な場合**:
```
[BoardSDK] Monday context: { ... }
[BoardSDK] Token retrieved: Token exists
[BoardSDK] API response received: { data: ... }
```

**エラーの場合**:
```
[BoardSDK] API response received: undefined
[BoardSDK] Token retrieved: Token is null/undefined
[BoardSDK] API returned undefined or null
```

---

## 📚 参考情報

- [Monday.com App Permissions](https://developer.monday.com/apps/docs/permissions)
- [Monday.com SDK Documentation](https://developer.monday.com/apps/docs/monday-sdk-js)
- [Monday.com GraphQL API](https://developer.monday.com/api-reference/docs)

---

**最終更新**: 2024年

