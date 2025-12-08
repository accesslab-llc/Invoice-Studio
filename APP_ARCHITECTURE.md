# InvoiceStudio - アプリケーション仕様書

## 概要

InvoiceStudioは、Monday.comのボードデータから請求書を生成するReactベースのSPA（Single Page Application）です。Monday.comのiframeアプリとして動作し、Monday.comのGraphQL APIを使用してボードデータを取得し、請求書をHTML形式で生成・ダウンロードできます。

---

## 技術スタック

### フロントエンド
- **React 19.2.0** - UIフレームワーク
- **Vite 6.0.7** - ビルドツール・開発サーバー
- **Chakra UI 3.29.0** - UIコンポーネントライブラリ
- **Monday SDK JS 0.5.6** - Monday.com API統合

### 言語・形式
- **JavaScript (ES6+)** - メイン言語
- **JSX** - Reactコンポーネント記法
- **HTML/CSS** - 請求書テンプレート生成

### ビルド・デプロイ
- **Vite** - 静的サイトとしてビルド（`dist`フォルダに出力）
- **npm** - パッケージ管理

---

## アーキテクチャ概要

### 全体構成

```
Monday.com (iframe)
    ↓
InvoiceStudio (React SPA)
    ├── Monday App SDK (認証・API呼び出し)
    ├── BoardSDK (データ取得・変換)
    ├── App.jsx (メインアプリケーション)
    ├── Components (UIコンポーネント)
    └── Utils (請求書生成・翻訳)
```

### データフロー

```
1. Monday.comボードでアプリを開く
   ↓
2. Monday App SDKで認証トークンを取得
   ↓
3. BoardSDKでボードIDを取得（コンテキスト or 環境変数）
   ↓
4. GraphQL APIでボードデータを取得
   ↓
5. データを変換・整形
   ↓
6. ユーザーがアイテムを選択
   ↓
7. 請求書フォームにデータをマッピング
   ↓
8. ユーザーが編集・カスタマイズ
   ↓
9. HTMLテンプレートを生成
   ↓
10. ブラウザでダウンロード
```

---

## 主要コンポーネント

### 1. `src/main.jsx` - エントリーポイント

**役割**: アプリケーションの初期化とエラーハンドリング

**処理内容**:
- Reactアプリケーションのマウント
- Chakra UIプロバイダーの設定
- グローバルエラーハンドリング（`window.addEventListener`）
- エラー時のフォールバックUI表示

**特徴**:
- `StrictMode`でReactの厳格モードを有効化
- エラー発生時はHTMLで直接エラーメッセージを表示

### 2. `src/generated/App.jsx` - メインアプリケーション

**役割**: アプリケーション全体の状態管理とUI制御

**主要な状態管理**:
- `items`: Monday.comから取得したアイテム一覧
- `selectedItemId`: 選択されたアイテムID
- `formData`: 請求書フォームの全データ
- `fieldMappings`: ボードカラムと請求書項目のマッピング設定
- `templates`: 保存されたテンプレート一覧
- `currentStep`: 現在のステップ（'select' | 'edit' | 'download'）
- `language`: 選択された言語（'ja' | 'en' | 'es'）
- `template`: レイアウトテンプレート（'modern' | 'classic' | 'minimal'）

**主要な機能**:
- **3ステップワークフロー**:
  1. **選択ステップ**: アイテムを選択
  2. **編集ステップ**: 請求書を編集・カスタマイズ
  3. **ダウンロードステップ**: プレビュー表示・HTMLダウンロード

- **データ取得**: `fetchBoardData()`でMonday.comからボードデータを取得
- **データマッピング**: `loadSelectedItem()`で選択アイテムのデータをフォームにマッピング
- **計算**: `calculateTotals()`で小計・税額・合計を自動計算
- **HTML生成**: `downloadHTML()`で請求書HTMLを生成・ダウンロード

**ローカルストレージ使用**:
- `invoiceFieldMappings`: フィールドマッピング設定
- `invoiceTemplates`: 保存されたテンプレート

### 3. `src/generated/sdk/BoardSDK.js` - Monday.com統合SDK

**役割**: Monday.com APIとの通信とデータ変換

**主要メソッド**:

#### `initialize()`
- ボードIDの取得
- 優先順位:
  1. 環境変数 `VITE_MONDAY_BOARD_ID`
  2. Monday.comコンテキストから取得
  3. フォールバック: デフォルトボードID `'18144711310'`

#### `getToken()`
- 認証トークンの取得
- 優先順位:
  1. 環境変数 `VITE_MONDAY_API_TOKEN`（ローカル開発用）
  2. URLパラメータ `sessionToken`
  3. Monday SDK `monday.get('token')`
- タイムアウト: 2秒

#### `query(query, variables)`
- GraphQLクエリの実行
- Monday SDKの`api()`メソッドを使用（CORS・認証を自動処理）
- エラーハンドリングとログ出力

#### `fetchItems(options)`
- ボードアイテムの取得
- カーソルベースのページネーション対応
- カラムとサブアイテムのカラムを指定可能
- GraphQLクエリを動的に構築

#### `transformItem(item)` / `transformSubItem(subitem)`
- Monday.com APIのデータ形式をアプリ形式に変換
- カラムタイプに応じた値のパース:
  - `numeric`: JSONパースして数値抽出
  - `date`: JSONパースして日付抽出
  - `text`: テキストそのまま
  - `people`: JSONパースして名前を抽出

**カラムマッピング**:
- ハードコードされたカラムIDマッピング（`columnMappings`）
- 例: `clientName: 'text_mkwjtrys'`, `discount: 'numeric_mkwjxbfn'`

**サブアイテムボードID**:
- `subitemBoardId: '18144719619'`（ハードコード）

### 4. `src/generated/utils/invoiceTemplates.js` - 請求書生成

**役割**: 請求書HTMLの生成

**主要関数**:

#### `generateInvoiceHTML(data, lang, template, pageSize, fitToOnePage, customColor)`
- 請求書HTMLを生成
- パラメータ:
  - `data`: 請求書データ（会社情報、クライアント情報、明細等）
  - `lang`: 言語（'ja' | 'en' | 'es'）
  - `template`: テンプレート（'modern' | 'classic' | 'minimal'）
  - `pageSize`: 用紙サイズ（'a4' | 'letter'）
  - `fitToOnePage`: 1ページに収めるかどうか
  - `customColor`: カスタムカラー

**生成されるHTMLの構造**:
- DOCTYPE宣言
- メタタグ（charset, title）
- インラインCSS（動的生成）
- 請求書コンテンツ:
  - ヘッダー（ロゴ、請求書タイトル、請求書番号・日付）
  - 請求先・発行元情報
  - 明細テーブル
  - 合計金額
  - 振込先情報（オプション）
  - 備考（オプション）
- 透かし画像（オプション）
- 自動印刷スクリプト（`window.print()`）

**動的スタイリング**:
- `getTemplateStyles()`: テンプレートとアイテム数に応じて動的にCSSを生成
- フォントサイズ・パディングのスケーリング（`fitToOnePage`時）
- テンプレート別の色・スタイル設定

### 5. `src/generated/components/ItemSelector.jsx` - アイテム選択UI

**役割**: Monday.comから取得したアイテム一覧の表示と選択

**機能**:
- アイテム一覧のテーブル表示
- 検索機能（アイテム名・クライアント名でフィルタリング）
- ラジオボタンでアイテム選択
- サブアイテム数の表示
- ステータス表示（サブアイテムあり/なし）

**表示項目**:
- アイテム名
- クライアント名
- 日付（`column3`）
- サブアイテム数
- ステータス

### 6. `src/generated/utils/translations.js` - 多言語対応

**役割**: 多言語翻訳データの提供

**対応言語**:
- 日本語（'ja'）
- 英語（'en'）
- スペイン語（'es'）

**翻訳キー例**:
- `title`, `subtitle`, `invoice`, `invoiceNumber`, `invoiceDate`等
- 各言語で約100以上の翻訳キーを定義

---

## Monday.comとの統合

### 認証の仕組み

**現在の実装**:
1. **Monday App SDK**: `monday-sdk-js`を使用
2. **トークン取得の優先順位**:
   - 環境変数（ローカル開発用）
   - URLパラメータ（`sessionToken`）
   - Monday SDK（`monday.get('token')`）

**課題**:
- OAuth 2.0フローの明示的な実装なし
- short-lived token（seamless auth）の明示的な使用なし
- 個人APIトークンに依存する可能性あり

### データ取得の仕組み

**GraphQL API使用**:
- Monday.comのGraphQL APIエンドポイントにクエリを送信
- `monday.api()`メソッドでCORS・認証を自動処理

**取得するデータ**:
- ボードアイテム（ID、名前、カラム値）
- サブアイテム（ID、名前、カラム値）
- カーソルベースのページネーション

**クエリ例**:
```graphql
query GetBoardItems($boardId: [ID!]!, $limit: Int, $columnIds: [String!]) {
  boards(ids: $boardId) {
    items_page(limit: $limit) {
      cursor
      items {
        id
        name
        column_values(ids: $columnIds) {
          id
          text
          value
          type
        }
        subitems {
          id
          name
          column_values(ids: $subItemColumnIds) {
            id
            text
            value
            type
          }
        }
      }
    }
  }
}
```

### ボードIDの取得

**優先順位**:
1. 環境変数 `VITE_MONDAY_BOARD_ID`
2. Monday.comコンテキスト（`monday.get('context')`）
3. フォールバック: `'18144711310'`

---

## データマッピング

### フィールドマッピング

**設定可能なマッピング**:
- `invoiceNumber`: 請求書番号のマッピング先
- `invoiceDate`: 請求日のマッピング先
- `clientName`: クライアント名のマッピング先
- `clientDepartment`: 部署のマッピング先
- `clientContact`: 担当者のマッピング先
- `discount`: 割引額のマッピング先
- `taxAmount`: 税額のマッピング先
- `items`: 明細のマッピング先（'subitems'）
- `subitemPrice`: サブアイテムの価格カラム

**保存場所**: `localStorage`の`invoiceFieldMappings`

### テンプレート機能

**テンプレートとは**:
- 発行元情報（会社名、住所、銀行口座等）を保存・再利用
- 複数のテンプレートを保存可能

**保存されるデータ**:
- テンプレート名
- 会社情報（名前、代表者、住所、電話、FAX、メール、登録番号）
- 銀行口座情報（銀行名、口座種別、口座番号、口座名義）

**保存場所**: `localStorage`の`invoiceTemplates`

**デフォルトテンプレート**: アプリ起動時に1つ作成される

---

## 請求書生成の仕組み

### HTML生成プロセス

1. **データ収集**: フォームデータ、選択されたテンプレート、言語設定を収集
2. **スタイル生成**: テンプレート・アイテム数・用紙サイズに応じてCSSを動的生成
3. **HTML構築**: テンプレートリテラルでHTML文字列を構築
4. **画像埋め込み**: Base64エンコードされた画像（ロゴ、署名、透かし）を埋め込み
5. **Blob生成**: HTML文字列からBlobオブジェクトを作成
6. **ダウンロード**: `<a>`タグでダウンロードをトリガー

### 動的スタイリング

**アイテム数に応じたスケーリング**:
- `fitToOnePage`が有効な場合、アイテム数に応じてフォントサイズ・パディングを調整
- アイテム数が多いほど小さく表示

**テンプレート別スタイル**:
- **Modern**: 青系、太いボーダー、モダンなデザイン
- **Classic**: 黒系、二重線ボーダー、セリフフォント
- **Minimal**: グレー系、シンプルなデザイン

**カスタムカラー**: 各テンプレートでカラーをカスタマイズ可能

---

## 状態管理

### React State（`useState`）

**App.jsx内の主要な状態**:
- `items`: アイテム一覧
- `selectedItemId`: 選択されたアイテムID
- `formData`: 請求書フォームの全データ
- `fieldMappings`: フィールドマッピング設定
- `templates`: テンプレート一覧
- `currentStep`: 現在のステップ
- `language`: 言語設定
- `template`: レイアウトテンプレート
- `pageSize`: 用紙サイズ
- `fitToOnePage`: 1ページに収めるかどうか
- `sectionVisibility`: セクションの表示/非表示

### ローカルストレージ

**保存されるデータ**:
- `invoiceFieldMappings`: フィールドマッピング設定（JSON）
- `invoiceTemplates`: テンプレート一覧（JSON）

**特徴**:
- 暗号化なし（平文で保存）
- ブラウザのローカルストレージに保存
- ユーザーごと・ブラウザごとに独立

---

## エラーハンドリング

### グローバルエラーハンドリング

**`main.jsx`**:
- `window.addEventListener('error')`: JavaScriptエラーをキャッチ
- `window.addEventListener('unhandledrejection')`: Promise拒否をキャッチ
- エラー時はHTMLで直接エラーメッセージを表示

### アプリケーション内エラーハンドリング

**`App.jsx`**:
- `fetchBoardData()`: try-catchでエラーをキャッチ
- エラー時は空のアイテム配列を設定
- コンソールにエラーログを出力

**`BoardSDK.js`**:
- 各メソッドでtry-catchを使用
- エラー時は`null`や空配列を返す
- 詳細なログ出力（開発用）

---

## パフォーマンス最適化

### ビルド最適化

**Viteの機能**:
- コード分割（自動）
- Tree shaking（未使用コードの削除）
- 本番ビルド時の最適化

### 実行時最適化

**React最適化**:
- `useMemo`（`ItemSelector.jsx`で検索結果をメモ化）
- 条件付きレンダリング
- コンポーネントの分割

---

## セキュリティ

### 現在の実装

**認証**:
- Monday App SDKによる認証
- 環境変数によるフォールバック（ローカル開発用）

**データ保存**:
- ローカルストレージに平文で保存（暗号化なし）
- 個人情報は一時的なみ（ダウンロードのみ）

**通信**:
- Monday.com APIへの通信（HTTPS必須）
- CORSはMonday SDKが自動処理

### 課題

- ローカルストレージの暗号化なし
- 環境変数の扱い（`.gitignore`未確認）
- 本番環境のHTTPS設定未確認

---

## デプロイメント

### ビルド

**コマンド**: `npm run build`
**出力**: `dist`フォルダに静的ファイル（HTML、CSS、JS）

### ホスティング要件

**静的サイトホスティング**:
- Vercel、Netlify、GitHub Pages等が適している
- サーバーサイドの処理は不要

**必要な設定**:
- HTTPS必須（Monday.comのiframe要件）
- カスタムドメイン推奨
- CORS設定（Monday.comからのアクセス許可）

### Vercelホスティング設定

**使用プラン**: Vercel Hobby プラン

**設定ファイル**:
- `vercel.json`: 通常運用時の設定
- `vercel-maintenance.json`: メンテナンスモード時の設定

#### 通常運用時の設定（`vercel.json`）

**リライトルール**:
- すべてのリクエストを`index.html`にリダイレクト（SPAルーティング対応）

**セキュリティヘッダー**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`（Monday.comのiframe要件）
- `X-XSS-Protection: 1; mode=block`

#### メンテナンスモード時の設定（`vercel-maintenance.json`）

**リライトルール**:
- すべてのリクエストを`maintenance.html`にリダイレクト

**キャッシュ設定**:
- `Cache-Control: no-cache, no-store, must-revalidate`（メンテナンス画面をキャッシュしない）

### メンテナンス画面

**ファイル**: `maintenance.html`

**デザイン仕様**:
- ブランドカラー: `#14406B`（グラデーション背景）
- レスポンシブデザイン（スマホ・タブレット・PC対応）
- ローディングスピナーアニメーション

**表示内容**:
- ロゴ（仮のSVG画像、後で差し替え可能）
- 日本語メッセージ: "InvoiceStudio は現在メンテナンス中です。数分後に再度アクセスしてください。"
- 英語メッセージ: "InvoiceStudio is currently undergoing maintenance. Please try again in a few minutes."

**技術仕様**:
- インラインCSS（外部ファイル不要）
- Flexboxで中央配置
- メディアクエリで画面サイズに応じたフォントサイズ調整

### メンテナンスモードの切り替え運用

#### メンテナンスモード有効化

**方法1: ファイル置き換え（推奨）**
```bash
cp vercel-maintenance.json vercel.json
git add vercel.json
git commit -m "Enable maintenance mode"
git push origin main
```

**方法2: ブランチ切り替え**
```bash
git checkout -b maintenance
cp vercel-maintenance.json vercel.json
git add vercel.json
git commit -m "Enable maintenance mode"
git push origin maintenance
```

#### メンテナンスモード解除

```bash
# 通常版の vercel.json に戻す
git checkout HEAD -- vercel.json
# または通常版の内容を手動で復元

git add vercel.json
git commit -m "Disable maintenance mode"
git push origin main
```

**注意事項**:
- Vercelは自動デプロイを実行
- メンテナンス解除後はブラウザのキャッシュをクリアすることを推奨

### 環境変数の管理

**`.gitignore`設定**:
- `.env.local` をGitにコミットしない（認証ポリシー準拠）
- その他の環境変数ファイルも除外

**本番環境**:
- Vercelダッシュボードで環境変数を設定
- `VITE_MONDAY_API_TOKEN` は設定しない（本番では使用しない）

---

## 開発環境

### ローカル開発

**起動**: `npm run dev`
**ポート**: 5173（Viteデフォルト）
**ホスト**: `host: true`（外部アクセス許可、iframe用）

### 環境変数

**開発用**:
- `.env.local`に設定（Gitにコミットしない）
- `VITE_MONDAY_API_TOKEN`: 個人APIトークン（ローカル開発用）
- `VITE_MONDAY_BOARD_ID`: ボードID（オプション）

### デバッグ

**コンソールログ**:
- 各SDKメソッドで詳細なログを出力
- `[BoardSDK]`, `[App]`などのプレフィックスで識別

---

## 今後の改善点

### 認証
- OAuth 2.0フローの明示的な実装
- short-lived token（seamless auth）の使用

### セキュリティ
- ローカルストレージの暗号化
- 環境変数の適切な管理
- 本番環境のHTTPS確認

### 機能拡張
- PDF生成機能
- メール送信機能
- 複数請求書の一括生成
- 請求書履歴の保存

---

## 参考情報

### フレームワーク・ライブラリ
- **Monday.com Apps Framework**: https://developer.monday.com/apps/docs/introduction-to-the-apps-framework
- **Monday.com GraphQL API**: https://developer.monday.com/api-reference/docs
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev
- **Chakra UI Documentation**: https://chakra-ui.com

### ホスティング・デプロイ
- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Configuration**: https://vercel.com/docs/project-configuration
- **MAINTENANCE.md**: メンテナンスモード運用ガイド（プロジェクト内）

---

**最終更新**: 2024年

