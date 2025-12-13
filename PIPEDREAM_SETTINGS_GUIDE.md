# PipeDream設定画面の確認方法 - ステップバイステップガイド

**作成日**: 2024年

## 概要

PipeDreamの設定画面で、InvoiceStudioをアプリとして機能させるために必要な設定を確認する手順を説明します。

---

## 📍 現在の画面について

現在、PipeDreamの「Resources」タブを見ている状態です。これはファイル一覧を表示する画面です。

ビルド設定を確認するには、**「Settings」タブ**に移動する必要があります。

---

## 🔍 ステップ1: Settingsタブに移動

### 方法1: プロジェクト内のナビゲーションから

1. 画面の上部（「📦 > Invoice Studio」の下）にあるタブを確認
2. **「Settings」**タブをクリック（⚙️ アイコン）

現在表示されているタブ:
- Resources ← 現在ここ
- File Store
- Changelog
- Branches
- ABC Variables
- Access
- Connect
- **Settings** ← ここをクリック

---

## 🔍 ステップ2: ビルド設定を確認

「Settings」タブを開くと、以下のような設定項目が表示されるはずです：

### 確認すべき項目

#### 1. ビルドコマンド（Build Command）

**探す場所**: 
- 「Build」セクション
- 「Deploy」セクション
- 「Build Settings」セクション

**確認内容**:
- [ ] ビルドコマンドが `npm run build` になっているか

**設定方法**（もし設定されていない場合）:
- 入力フィールドに `npm run build` と入力

---

#### 2. 出力ディレクトリ（Output Directory / Publish Directory）

**探す場所**:
- 「Build」セクション
- 「Deploy」セクション
- 「Build Settings」セクション

**確認内容**:
- [ ] 出力ディレクトリが `dist` になっているか

**設定方法**（もし設定されていない場合）:
- 入力フィールドに `dist` と入力

---

#### 3. Node.jsバージョン（Node Version）

**探す場所**:
- 「Environment」セクション
- 「Build Settings」セクション

**確認内容**:
- [ ] Node.jsバージョンが 18以上になっているか（推奨）

**設定方法**（もし設定されていない場合）:
- ドロップダウンから Node.js 18以上を選択

---

## 🔍 ステップ3: 環境変数の確認

### 環境変数の設定場所

「Settings」タブ内で、以下のセクションを探してください：

- 「Environment Variables」
- 「Variables」
- 「Env」セクション

### 確認すべき内容

#### ❌ 本番環境で設定しない環境変数

- [ ] `VITE_MONDAY_API_TOKEN` が設定されていないか確認
  - もし設定されていたら、**削除してください**

#### ✅ 設定可能な環境変数（オプション）

- `VITE_MONDAY_BOARD_ID`（オプション、通常は設定不要）

---

## 🔍 ステップ4: デプロイ設定の確認

### ブランチ設定

**探す場所**:
- 「Deploy」セクション
- 「Git」セクション
- 「Source」セクション

**確認内容**:
- [ ] ブランチが `pipedream-migration` または `main` になっているか

**設定方法**:
- ドロップダウンから `pipedream-migration` を選択（推奨）

---

## 🔍 ステップ5: セキュリティヘッダーの確認

### セキュリティヘッダーの設定場所

PipeDreamの設定画面で、以下のセクションを探してください：

- 「Headers」
- 「Security Headers」
- 「Custom Headers」
- 「HTTP Headers」

### 確認すべき内容

以下のヘッダーが設定されているか確認：

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: SAMEORIGIN` ← **重要**
- [ ] `X-XSS-Protection: 1; mode=block`

### 設定方法

**方法1: 設定画面で直接設定**

設定画面でヘッダーを追加できる場合：

1. 「Add Header」または「Custom Header」ボタンをクリック
2. 各ヘッダーを追加：
   - Key: `X-Content-Type-Options`, Value: `nosniff`
   - Key: `X-Frame-Options`, Value: `SAMEORIGIN`
   - Key: `X-XSS-Protection`, Value: `1; mode=block`

**方法2: `_headers`ファイルを使用**

`public/_headers`ファイルがビルド時に`dist/_headers`にコピーされます。

PipeDreamがNetlify形式の`_headers`ファイルを自動認識する場合、設定不要です。

---

## 🔍 ステップ6: SPAルーティングの確認

### リライトルールの設定場所

PipeDreamの設定画面で、以下のセクションを探してください：

- 「Redirects」
- 「Rewrites」
- 「Routing」
- 「SPA Settings」

### 確認すべき内容

- [ ] すべてのリクエスト（`/*`）が`/index.html`にリダイレクトされる設定があるか

### 設定方法

**方法1: 設定画面で直接設定**

設定画面でリライトルールを追加できる場合：

- パターン: `/*`
- リダイレクト先: `/index.html`
- ステータスコード: `200`

**方法2: `_redirects`ファイルを使用**

`public/_redirects`ファイルがビルド時に`dist/_redirects`にコピーされます。

PipeDreamがNetlify形式の`_redirects`ファイルを自動認識する場合、設定不要です。

---

## 🔍 ステップ7: HTTPSの確認

### HTTPS設定の確認場所

PipeDreamの設定画面で、以下のセクションを探してください：

- 「SSL」
- 「HTTPS」
- 「Security」
- 「Domain」

### 確認すべき内容

- [ ] HTTPSが有効になっているか
- [ ] SSL証明書が有効か

### 設定方法

PipeDreamが自動でHTTPSを提供する場合：
- 設定不要（自動で有効化）

手動設定が必要な場合：
- 「Enable HTTPS」を有効化
- SSL証明書を設定（Let's Encryptなど）

---

## 📝 設定が見つからない場合

### よくある状況

1. **設定項目が表示されない**
   - PipeDreamのバージョンやプランによって、設定項目が異なる場合があります
   - PipeDreamのドキュメントを確認してください

2. **設定画面の構造が異なる**
   - PipeDreamのUIが更新されている可能性があります
   - 左側のナビゲーションから「Settings」を探してください

3. **ビルド設定が見つからない**
   - 「Deploy」セクションを確認
   - 「Build」セクションを確認
   - 「Advanced」セクションを確認

---

## 🆘 ヘルプが必要な場合

### 確認方法

1. **PipeDreamのドキュメントを確認**
   - PipeDreamの公式ドキュメントで「Build Settings」を検索

2. **PipeDreamのサポートに問い合わせ**
   - 設定画面のスクリーンショットを添付
   - どの設定項目が見つからないか説明

3. **設定画面のスクリーンショットを共有**
   - 設定画面のスクリーンショットを共有していただければ、具体的に案内できます

---

## ✅ 確認チェックリスト（簡易版）

Settingsタブで以下を確認：

- [ ] ビルドコマンド: `npm run build`
- [ ] 出力ディレクトリ: `dist`
- [ ] 環境変数: `VITE_MONDAY_API_TOKEN`が設定されていない
- [ ] ブランチ: `pipedream-migration`（または`main`）
- [ ] セキュリティヘッダー: `X-Frame-Options: SAMEORIGIN`が設定されている
- [ ] HTTPS: 有効になっている

---

## 📸 次のステップ

1. **Settingsタブを開く**
   - プロジェクト内のナビゲーションから「Settings」をクリック

2. **設定項目を確認**
   - 上記のチェックリストに従って確認

3. **設定が見つからない場合**
   - 設定画面のスクリーンショットを共有してください
   - 具体的に案内します

---

**最終更新**: 2024年

