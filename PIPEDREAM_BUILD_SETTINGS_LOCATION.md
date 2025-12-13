# PipeDreamでビルド設定を探す方法

**作成日**: 2024年

## 現在の画面について

「Project Settings」モーダルを開いています。この画面には以下が表示されています：

- ✅ プロジェクト名: "Invoice Studio"
- ✅ GitHub連携: 有効（ryotarotakano-AL / Invoice-Studio）
- ✅ Project ID: proj_Dasdj5z

**しかし、この画面にはビルド設定（ビルドコマンド、出力ディレクトリ）は表示されていません。**

---

## 🔍 ビルド設定を探す方法

### 方法1: デプロイ設定を確認

PipeDreamでは、ビルド設定は「デプロイ設定」や「ホスティング設定」にある可能性があります。

#### 確認手順

1. **「Project Settings」モーダルを閉じる**（Xボタンをクリック）

2. **プロジェクトの左側パネルを確認**
   - 「Resources」
   - 「File Store」
   - 「Changelog」
   - 「Branches」
   - 「ABC Variables」
   - 「Access」
   - 「Connect」
   - **「Settings」** ← ここをクリック

3. **Settingsタブ内で探す**
   - 「Deploy」セクション
   - 「Build」セクション
   - 「Hosting」セクション
   - 「Static Site」セクション

---

### 方法2: Connectタブを確認

「Connect」タブにデプロイ設定がある可能性があります。

1. プロジェクトの左側パネルで**「Connect」**をクリック
2. デプロイ先の設定を確認
3. ビルド設定があるか確認

---

### 方法3: デプロイ先の設定を確認

PipeDreamで静的サイトをホスティングする場合、デプロイ先の設定が必要です。

#### 確認手順

1. **「Connect」タブを開く**
2. **デプロイ先を確認**（例：Vercel、Netlify、PipeDream Hostingなど）
3. **デプロイ先の設定画面でビルド設定を確認**

---

## 💡 PipeDreamの静的サイトホスティングについて

PipeDreamが静的サイトを直接ホスティングする機能がある場合：

### 設定項目（通常）

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18以上（推奨）

### 設定場所の候補

1. **「Deploy」タブ**
2. **「Hosting」タブ**
3. **「Static Site」タブ**
4. **「Settings」タブ内の「Deploy」セクション**

---

## 🆘 設定が見つからない場合

### 確認すべきこと

1. **PipeDreamのプラン**
   - 静的サイトホスティング機能が利用可能か確認
   - プランによって機能が異なる場合があります

2. **プロジェクトタイプ**
   - プロジェクトが「Static Site」タイプとして作成されているか確認
   - プロジェクトタイプによって設定項目が異なります

3. **PipeDreamのドキュメント**
   - 「Static Site Hosting」で検索
   - 「Build Settings」で検索
   - 「Deploy」で検索

---

## 📝 次のステップ

### ステップ1: Settingsタブを確認

1. 「Project Settings」モーダルを閉じる
2. プロジェクトの左側パネルで**「Settings」**をクリック
3. 表示されるセクションを確認

### ステップ2: Connectタブを確認

1. プロジェクトの左側パネルで**「Connect」**をクリック
2. デプロイ設定を確認

### ステップ3: 画面のスクリーンショットを共有

設定が見つからない場合は、以下を共有してください：

1. **Settingsタブの画面**
2. **Connectタブの画面**
3. **左側パネルの全体**

---

## 🔍 代替案: 手動デプロイ

もしPipeDreamにビルド設定の画面がない場合：

### 方法1: ローカルでビルドしてアップロード

1. ローカルでビルド:
   ```bash
   npm run build
   ```

2. `dist/`フォルダの内容をPipeDreamにアップロード

### 方法2: GitHub Actionsを使用

1. GitHub Actionsでビルド
2. ビルド結果をPipeDreamにデプロイ

---

## ✅ 確認チェックリスト

- [ ] Settingsタブを確認した
- [ ] Connectタブを確認した
- [ ] ビルド設定が見つかった / 見つからなかった
- [ ] デプロイ設定が見つかった / 見つからなかった

---

**最終更新**: 2024年

