# Monday.com OAuth Scopeの確認

**作成日**: 2024年

## 現在の状況

Monday.com Developer CenterのOAuth Scope設定画面で、`items:read`と`subitems:read`が表示されていません。

表示されているスコープ：
- ✅ `boards:read` - チェック済み
- `boards:write`
- `me:read`
- `docs:read`, `docs:write`
- `workspaces:read`, `workspaces:write`
- その他多数

---

## 🔍 可能性

### 可能性1: `boards:read`に含まれている

Monday.comのAPIでは、`boards:read`スコープでボードのデータを読み取る際に、アイテムやサブアイテムも含まれる可能性があります。

**確認方法**:
1. `boards:read`のみで試す
2. アプリを再読み込み
3. コンソールでエラーを確認

---

### 可能性2: 別の場所に設定がある

`items:read`と`subitems:read`が別のセクション（例：API Permissions、GraphQL Permissions）にある可能性があります。

**確認方法**:
1. Developer Centerの他のタブを確認
2. 「API Permissions」や「GraphQL Permissions」セクションを探す
3. 検索機能で「items」や「subitems」を検索

---

### 可能性3: Monday.comのAPIスコープが変更された

Monday.comのAPIスコープが変更され、`items:read`と`subitems:read`が廃止された可能性があります。

**確認方法**:
1. Monday.comのAPIドキュメントを確認
2. 最新のスコープ一覧を確認

---

## 🔧 推奨される対処法

### ステップ1: `boards:read`のみで試す

1. **現在の設定を保存**（`boards:read`がチェックされていることを確認）
2. **Monday.comのボードでアプリを再読み込み**
3. **ブラウザのコンソールでエラーを確認**

**期待される結果**:
- `[BoardSDK] API response received: { data: ... }` - 正常
- `[BoardSDK] API response received: undefined` - まだエラー

---

### ステップ2: 他のセクションを確認

1. **Developer Centerの他のタブを確認**
   - 「Settings」
   - 「Configuration」
   - 「API」
   - 「Permissions」
   - 「Scopes」

2. **検索機能を使用**
   - 「items」で検索
   - 「subitems」で検索

---

### ステップ3: Monday.comのドキュメントを確認

1. **Monday.com Developer Documentationを確認**
   - https://developer.monday.com/apps/docs/permissions
   - 最新のスコープ一覧を確認

---

## 📝 確認チェックリスト

- [ ] `boards:read`がチェックされている
- [ ] 設定を保存した
- [ ] アプリを再読み込みした
- [ ] ブラウザのコンソールでエラーを確認した
- [ ] Developer Centerの他のセクションを確認した
- [ ] Monday.comのドキュメントを確認した

---

## 🆘 それでも`undefined`が返ってくる場合

### 確認事項

1. **認証トークンが取得できているか**
   - コンソールで`[BoardSDK] Token retrieved: Token exists`が表示されるか確認

2. **Monday SDKが正しく初期化されているか**
   - コンソールで`[BoardSDK] Monday SDK object is not initialized`が表示されないか確認

3. **アプリが正しく公開されているか**
   - Developer Centerでアプリが「Published」状態か確認

---

**最終更新**: 2024年

