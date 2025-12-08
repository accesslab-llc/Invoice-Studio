# InvoiceStudio メンテナンスモード運用ガイド

## 概要

Vercel HobbyプランでInvoiceStudioを運用する際の、メンテナンス画面の切り替え方法を説明します。

## ファイル構成

- `maintenance.html` - メンテナンス画面のHTML
- `vercel.json` - 通常運用時のVercel設定
- `vercel-maintenance.json` - メンテナンスモード時のVercel設定

## メンテナンスモードの有効化方法

### 方法1: ブランチ切り替え（推奨）

1. **メンテナンス用ブランチを作成**
   ```bash
   git checkout -b maintenance
   ```

2. **vercel-maintenance.json を vercel.json にリネーム**
   ```bash
   git mv vercel-maintenance.json vercel.json
   git commit -m "Enable maintenance mode"
   git push origin maintenance
   ```

3. **Vercelでメンテナンスブランチをデプロイ**
   - Vercelダッシュボードで `maintenance` ブランチを選択
   - プロダクション環境に設定（オプション）

### 方法2: ファイル置き換え（簡易）

1. **ローカルでファイルを置き換え**
   ```bash
   cp vercel-maintenance.json vercel.json
   ```

2. **コミット・プッシュ**
   ```bash
   git add vercel.json
   git commit -m "Enable maintenance mode"
   git push origin main
   ```

3. **Vercelが自動デプロイ**

### 方法3: Vercelダッシュボードで直接編集

1. Vercelダッシュボード → プロジェクト → Settings → General
2. `vercel.json` の内容を `vercel-maintenance.json` の内容に置き換え
3. 保存（自動デプロイが開始）

## メンテナンスモードの解除方法

### 方法1: ブランチ切り替え

1. **通常運用ブランチに戻る**
   ```bash
   git checkout main  # または master
   ```

2. **vercel.json を通常版に戻す**
   - `vercel-maintenance.json` の内容を確認
   - `vercel.json` を通常版の内容に戻す

### 方法2: ファイル置き換え

1. **通常版の vercel.json に戻す**
   ```bash
   git checkout main -- vercel.json
   git commit -m "Disable maintenance mode"
   git push origin main
   ```

## メンテナンス画面のカスタマイズ

`maintenance.html` を編集することで、メンテナンス画面のデザインを変更できます。

### ロゴの差し替え

```html
<div class="logo">
  <img src="/path/to/your/logo.png" alt="InvoiceStudio Logo">
</div>
```

### メッセージの変更

```html
<div class="message">
  カスタムメッセージをここに記入
</div>
```

## 注意事項

- メンテナンスモード中は、すべてのリクエストが `maintenance.html` にリダイレクトされます
- メンテナンス画面はキャッシュされないように設定されています（`Cache-Control: no-cache`）
- メンテナンス解除後は、ブラウザのキャッシュをクリアすることを推奨します

## トラブルシューティング

### メンテナンス画面が表示されない

1. Vercelのデプロイログを確認
2. `vercel.json` の構文エラーを確認
3. ブラウザのキャッシュをクリア

### メンテナンス解除後もメンテナンス画面が表示される

1. Vercelのデプロイが完了しているか確認
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
3. CDNのキャッシュが残っている場合は、Vercelのキャッシュをパージ

## 運用フロー例

### メンテナンス開始

```bash
# 1. メンテナンスブランチを作成・切り替え
git checkout -b maintenance

# 2. vercel.json をメンテナンス版に置き換え
cp vercel-maintenance.json vercel.json

# 3. コミット・プッシュ
git add vercel.json
git commit -m "Enable maintenance mode"
git push origin maintenance

# 4. Vercelでメンテナンスブランチをデプロイ
# （または main ブランチにマージしてデプロイ）
```

### メンテナンス終了

```bash
# 1. 通常運用ブランチに戻る
git checkout main

# 2. vercel.json を通常版に戻す
git checkout HEAD -- vercel.json
# または通常版の内容を手動で復元

# 3. コミット・プッシュ
git add vercel.json
git commit -m "Disable maintenance mode"
git push origin main
```

