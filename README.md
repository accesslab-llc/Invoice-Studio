# Invoice Studio - Monday.com App

Monday.com上で動作する請求書作成アプリケーションです。ボードデータから請求書を生成・編集・ダウンロードできます。

## 機能

- ✅ 3ステップワークフロー（選択 → 編集 → ダウンロード）
- ✅ 多言語対応（日本語・英語・スペイン語）
- ✅ 複数通貨対応（JPY/USD/EUR/GBP/CNY）
- ✅ 3つのテンプレート（モダン・クラシック・ミニマル）
- ✅ カスタムカラー設定
- ✅ フィールドマッピング（ボードカラムと請求書項目のマッピング）
- ✅ リアルタイムプレビュー
- ✅ HTML形式でのダウンロード

## Monday Appとしてのセットアップ

### 1. 依存関係のインストール

```bash
npm install monday-sdk-js
```

### 2. Monday Appの設定

1. Monday.comの開発者ポータルでアプリを作成
2. アプリタイプで「iframe」を選択
3. iframe URLにアプリのURLを設定（例: `https://your-domain.com` またはローカル開発時は `http://localhost:3000`）

### 3. 必要な権限（Permissions）

Monday Appの設定で以下の権限を有効化してください：

- `boards:read` - ボードデータの読み取り
- `items:read` - アイテムデータの読み取り
- `subitems:read` - サブアイテムデータの読み取り

### 4. 使用方法

1. Monday.comのボードでアプリを開く
2. 「データ読み込み」ボタンでボードからアイテムを取得
3. アイテムを選択して請求書を作成
4. 請求書を編集・カスタマイズ
5. HTML形式でダウンロード

## 開発

### ローカル開発環境

```bash
# 開発サーバーを起動
npm run dev

# Monday Appのiframe URLに以下を設定
# http://localhost:3000
```

#### Monday APIへの接続（ローカル開発時）

ローカルで単体起動した場合は Monday App SDK から認証トークンが取得できないため、
環境変数 `VITE_MONDAY_API_TOKEN` に一時的な API Token を設定してください。

1. `.env.local` を作成し、以下のように設定  
   ```
   VITE_MONDAY_API_TOKEN=YOUR_PERSONAL_TOKEN
   ```
2. `npm run dev` を再起動  
   ※ このトークンは個人環境でのみ使用し、リポジトリにはコミットしないでください。

### プロジェクト構造

```
src/generated/
├── App.jsx                          # メインアプリケーション
├── components/
│   ├── ItemSelector.jsx            # アイテム選択UI
│   ├── ImageUploader.jsx           # 画像アップロード
│   └── FieldMappingDialog.jsx      # フィールドマッピング設定
├── utils/
│   ├── translations.js             # 多言語翻訳
│   └── invoiceTemplates.js         # HTML生成ロジック
└── sdk/
    └── BoardSDK.js                 # Monday App SDK統合
```

## BoardSDKの動作

`BoardSDK`はMonday App SDKを統合し、以下の機能を提供します：

- MondayのコンテキストからボードIDを自動取得
- GraphQL APIを使用したデータ取得
- アイテムとサブアイテムの変換
- カラム値の型に応じた適切なパース

### カスタマイズ

`BoardSDK.js`の`columnMappings`を編集することで、ボードのカラムIDをカスタマイズできます。

## トラブルシューティング

### データが取得できない

1. Monday Appの権限設定を確認
2. ボードIDが正しいか確認
3. ブラウザのコンソールでエラーを確認

### iframeで表示されない

1. iframe URLが正しく設定されているか確認
2. CORS設定を確認
3. HTTPSを使用しているか確認（本番環境）

## ライセンス

MIT

