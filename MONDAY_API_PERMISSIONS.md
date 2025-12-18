# Monday.com API権限の設定方法

**作成日**: 2024年

## 問題

Monday.comのAPIが`undefined`を返す。エラーメッセージ：
```
Monday.com API returned undefined. Please check API permissions in Monday.com Developer Center (boards:read, items:read, subitems:read).
```

---

## 🔍 原因

Monday.comのアプリ設定で、必要なAPI権限（スコープ）が設定されていない可能性があります。

---

## 🔧 解決方法

### ステップ1: Monday.com Developer Centerでアプリを開く

1. **Monday.com Developer Centerにログイン**
   - https://developer.monday.com/apps

2. **アプリ一覧からInvoiceStudioを選択**

---

### ステップ2: API権限（Permissions）を確認・設定

1. **「Settings」または「Configuration」タブを開く**

2. **「Permissions」または「Scopes」セクションを確認**

3. **以下の権限を有効化**:
   - ✅ `boards:read` - ボードデータの読み取り
   - ✅ `items:read` - アイテムデータの読み取り
   - ✅ `subitems:read` - サブアイテムデータの読み取り

4. **「Save」をクリック**

---

### ステップ3: アプリを再読み込み

1. **Monday.comのボードでアプリを開く**
2. **ページをリロード（F5またはCmd+R）**
3. **アプリが正常に動作するか確認**

---

## 📝 必要な権限の説明

### `boards:read`
- **用途**: ボードの基本情報とアイテム一覧を取得
- **必要**: ✅ 必須

### `items:read`
- **用途**: アイテムの詳細情報（カラム値など）を取得
- **必要**: ✅ 必須

### `subitems:read`
- **用途**: サブアイテムの詳細情報を取得
- **必要**: ✅ 必須（サブアイテムを使用する場合）

---

## 🔍 確認方法

### 方法1: ブラウザのコンソールで確認

1. **Monday.comのボードでアプリを開く**
2. **ブラウザの開発者ツール（F12）を開く**
3. **Consoleタブでエラーメッセージを確認**

**正常な場合**:
- `[BoardSDK] API response received: { data: ... }`

**エラーの場合**:
- `[BoardSDK] API returned undefined or null`
- `Monday.com API returned undefined. Please check API permissions...`

---

### 方法2: Monday.com Developer Centerで確認

1. **Developer Center → アプリ → Settings**
2. **「Permissions」セクションを確認**
3. **必要な権限が有効になっているか確認**

---

## 🆘 トラブルシューティング

### 権限を設定してもエラーが続く場合

**確認事項**:
1. **アプリを再読み込みしたか**
   - 権限を変更した後、アプリを再読み込みする必要があります

2. **正しいアプリを設定しているか**
   - Developer Centerで正しいアプリを選択しているか確認

3. **アプリが正しく公開されているか**
   - アプリが「Published」状態になっているか確認

---

### その他のエラー

**エラー**: "Monday SDK is not initialized"
- **原因**: Monday SDKが正しく読み込まれていない
- **解決策**: アプリのURLが正しく設定されているか確認

**エラー**: "monday.api() method is not available"
- **原因**: Monday SDKのバージョンが古い、または権限が不足している
- **解決策**: 
  1. `monday-sdk-js`のバージョンを確認
  2. API権限を確認

---

## 📚 参考情報

- [Monday.com App Permissions](https://developer.monday.com/apps/docs/permissions)
- [Monday.com GraphQL API](https://developer.monday.com/api-reference/docs)

---

**最終更新**: 2024年

