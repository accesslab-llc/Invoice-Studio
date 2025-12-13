# PipeDreamで静的サイトをデプロイする方法

**作成日**: 2024年

## 重要な発見

PipeDreamの「Configuration」タブは、**OAuthアプリケーションの設定**です。これは静的サイトのビルド設定とは異なります。

---

## 🔍 PipeDreamの静的サイトホスティングについて

### 可能性1: PipeDreamが静的サイトを直接ホスティングしない場合

PipeDreamは主に**ワークフロー自動化プラットフォーム**です。静的サイトのホスティング機能がない可能性があります。

この場合、以下の方法を検討する必要があります：

#### 方法1: 外部サービスにデプロイ（推奨）

1. **Vercelにデプロイ**
   - GitHubリポジトリをVercelに接続
   - 自動デプロイを設定
   - PipeDreamからは使用しない

2. **Netlifyにデプロイ**
   - GitHubリポジトリをNetlifyに接続
   - 自動デプロイを設定
   - PipeDreamからは使用しない

3. **GitHub Pagesにデプロイ**
   - GitHub Actionsでビルド
   - GitHub Pagesにデプロイ
   - PipeDreamからは使用しない

---

### 可能性2: PipeDreamが静的サイトをホスティングする場合

もしPipeDreamが静的サイトをホスティングする機能がある場合：

#### 確認すべき場所

1. **「Connect」タブ**
   - デプロイ先の設定があるか
   - 「Static Site」や「Hosting」のオプションがあるか

2. **「File Store」タブ**
   - ビルド済みファイルをアップロードできるか
   - 静的ファイルをホスティングできるか

3. **プロジェクトの作成方法**
   - 「Static Site」タイプのプロジェクトを作成できるか

---

## 📝 次のステップ

### ステップ1: Connectタブを確認

「Connect」タブの画面を確認して、以下を探してください：

- [ ] デプロイ先の選択肢（Vercel、Netlify、PipeDream Hostingなど）
- [ ] ビルド設定（Build Command、Output Directory）
- [ ] 静的サイトホスティングのオプション

### ステップ2: File Storeタブを確認

1. プロジェクトの左側パネルで**「File Store」**をクリック
2. ビルド済みファイルをアップロードできるか確認
3. 静的ファイルをホスティングできるか確認

### ステップ3: PipeDreamのドキュメントを確認

PipeDreamの公式ドキュメントで以下を検索：

- "Static Site Hosting"
- "Deploy Static Site"
- "Build Settings"
- "File Store"

---

## 💡 推奨される解決策

### オプション1: Vercelを使用（最も簡単）

1. **Vercelアカウントを作成**
2. **GitHubリポジトリを接続**
   - リポジトリ: `ryotarotakano-AL/Invoice-Studio`
   - ブランチ: `pipedream-migration`
3. **ビルド設定を自動検出**
   - ビルドコマンド: `npm run build`
   - 出力ディレクトリ: `dist`
4. **自動デプロイ**

**メリット**:
- 設定が簡単
- 自動HTTPS
- セキュリティヘッダーを設定可能
- SPAルーティング対応

---

### オプション2: Netlifyを使用

1. **Netlifyアカウントを作成**
2. **GitHubリポジトリを接続**
3. **ビルド設定を指定**
   - ビルドコマンド: `npm run build`
   - 出力ディレクトリ: `dist`
4. **自動デプロイ**

**メリット**:
- `_headers`と`_redirects`ファイルを自動認識
- 自動HTTPS
- 設定が簡単

---

### オプション3: GitHub Pagesを使用

1. **GitHub Actionsでビルド**
2. **GitHub Pagesにデプロイ**
3. **カスタムドメインを設定**（オプション）

**メリット**:
- 無料
- GitHubと統合

---

## 🔍 Connectタブで確認すべきこと

「Connect」タブの画面を確認して、以下を教えてください：

1. **デプロイ先の選択肢はありますか？**
   - Vercel
   - Netlify
   - PipeDream Hosting
   - その他

2. **ビルド設定の項目はありますか？**
   - Build Command
   - Output Directory
   - Node Version

3. **静的サイトホスティングのオプションはありますか？**

---

## 📸 確認してほしい画面

以下を共有してください：

1. **「Connect」タブの画面**
2. **「File Store」タブの画面**（もしあれば）
3. **プロジェクト作成時の画面**（新規プロジェクトを作成する場合の選択肢）

---

## ✅ 判断基準

### PipeDreamで静的サイトをホスティングできる場合

- 「Connect」タブに「Static Site」や「Hosting」のオプションがある
- ビルド設定の項目がある
- デプロイ先として「PipeDream Hosting」がある

### PipeDreamで静的サイトをホスティングできない場合

- 「Connect」タブに静的サイト関連のオプションがない
- ビルド設定の項目がない
- ワークフロー自動化のみの機能

この場合、**VercelやNetlifyなどの外部サービスを使用することを推奨します。**

---

**最終更新**: 2024年

