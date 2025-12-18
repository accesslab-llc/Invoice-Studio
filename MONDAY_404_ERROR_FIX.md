# Monday.comで404エラーが発生する場合の対処法

**作成日**: 2024年

## 問題

Monday.comのボードでアプリを開いた際、以下のエラーが発生：
```
Failed to load resource: the server responded with a status of 404 ()
```

URLには`sessionToken`が含まれているため、Monday.comから正しくアプリを開いているが、リソースが見つからない。

---

## 🔍 原因

### 原因1: VercelのデプロイメントURLが間違っている

Monday.com Developer Centerで設定されているiframe URLが、実際のVercelのデプロイメントURLと一致していない。

### 原因2: デプロイメントが完了していない

Vercelでデプロイメントがまだ完了していない、または失敗している。

### 原因3: デプロイメントが削除された

Vercelでデプロイメントが削除された、または期限切れになった。

---

## 🔧 解決方法

### ステップ1: Vercelのデプロイメント状態を確認

1. **Vercelダッシュボードでプロジェクトを開く**
2. **「Deployments」タブを確認**
3. **最新のデプロイメントの状態を確認**
   - ✅ **Ready**: デプロイ成功
   - ⚠️ **Building**: ビルド中（完了を待つ）
   - ❌ **Error / Failed**: ビルドエラー（修正が必要）

---

### ステップ2: 正しいURLを確認

1. **Vercelダッシュボード → Deployments**
2. **最新のデプロイメント（Ready状態）をクリック**
3. **「Visit」ボタンをクリック**
4. **表示されたURLをコピー**
   - 例: `https://invoice-studio-xi.vercel.app`
   - または: `https://invoice-studio-git-pipedream-migration-accesslab-llc.vercel.app`

**重要**: Production URL（本番環境のURL）を使用してください。

---

### ステップ3: Monday.comのアプリ設定を更新

1. **Monday.com Developer Centerにログイン**
2. **アプリ一覧からInvoiceStudioを選択**
3. **「Settings」または「Configuration」タブを開く**
4. **「iframe URL」または「App URL」を確認・更新**
   - VercelのProduction URLを入力
   - 例: `https://invoice-studio-xi.vercel.app`
5. **「Save」をクリック**

---

### ステップ4: アプリを再読み込み

1. **Monday.comのボードでアプリを開く**
2. **ページをリロード（F5またはCmd+R）**
3. **404エラーが解消されたか確認**

---

## 📝 確認チェックリスト

- [ ] VercelのデプロイメントがReady状態である
- [ ] Production URLをコピーした
- [ ] Monday.comのアプリ設定でProduction URLを入力した
- [ ] URLが`https://`で始まっている
- [ ] URLの末尾に`/`がない（通常は不要）
- [ ] アプリを再読み込みした
- [ ] 404エラーが解消された

---

## 🔍 404エラーの詳細確認

### エラーメッセージの確認

ブラウザの開発者ツール（F12）で：

1. **Networkタブを開く**
2. **404エラーが発生しているリソースを確認**
3. **リクエストURLを確認**
   - どのリソースが404になっているか確認
   - 例: `index.html`, `assets/index-xxx.js`, など

### よくある404エラーの原因

**原因1**: `index.html`が見つからない
- **解決策**: Vercelのビルド設定でOutput Directoryが`dist`になっているか確認

**原因2**: アセットファイル（JS/CSS）が見つからない
- **解決策**: ビルドが正しく完了しているか確認

**原因3**: ルーティングの問題
- **解決策**: `vercel.json`の`rewrites`設定を確認

---

## 🆘 それでも404エラーが続く場合

### 確認事項

1. **Vercelのデプロイメントが存在するか**
   - Deploymentsタブで最新のデプロイメントを確認
   - Ready状態であることを確認

2. **URLが正しいか**
   - ブラウザで直接アクセスして正常に表示されるか確認
   - 404エラーが表示されないか確認

3. **Monday.comのアプリ設定**
   - iframe URLが正しく設定されているか確認
   - URLに余分な文字（スペース、改行など）がないか確認

---

**最終更新**: 2024年

