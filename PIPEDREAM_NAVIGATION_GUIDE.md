# PipeDreamの画面ナビゲーションガイド

**作成日**: 2024年

## 現在の画面について

現在、**「Workspace Settings」**（ワークスペース全体の設定）を見ています。

ビルド設定を確認するには、**プロジェクトの設定**に移動する必要があります。

---

## 📍 プロジェクトの設定に移動する方法

### ステップ1: プロジェクトに戻る

1. 左側のナビゲーションで**「Projects」**をクリック
2. 「Invoice Studio」プロジェクトを選択

### ステップ2: プロジェクトのSettingsタブを開く

プロジェクトを開いたら：

1. 画面の上部（「📦 > Invoice Studio」の下）にあるタブを確認
2. **「Settings」**タブ（⚙️ アイコン）をクリック

---

## 🔍 2種類のSettingsがある

PipeDreamには2種類のSettingsがあります：

### 1. Workspace Settings（現在ここ）

- **場所**: 左側ナビゲーションの「Settings」
- **内容**: ワークスペース全体の設定
  - ワークスペース名
  - 環境変数（ワークスペース全体）
  - メンバーシップ
  - 請求情報

### 2. Project Settings（確認したいのはこちら）

- **場所**: プロジェクト内の「Settings」タブ
- **内容**: プロジェクト固有の設定
  - ビルドコマンド
  - 出力ディレクトリ
  - デプロイ設定
  - プロジェクトの環境変数

---

## 📝 確認すべき設定の場所

### ビルド設定

**場所**: プロジェクトの「Settings」タブ内

探すセクション：
- 「Build」
- 「Deploy」
- 「Build Settings」

### 環境変数

**注意**: 環境変数は2箇所に設定できます

1. **Workspace Settings** → 「Environment Variables」
   - ワークスペース全体で共有される環境変数

2. **Project Settings** → 「Environment Variables」
   - プロジェクト固有の環境変数（優先）

**推奨**: プロジェクトの環境変数を使用

---

## 🎯 次のステップ

1. **左側のナビゲーションで「Projects」をクリック**
2. **「Invoice Studio」プロジェクトを選択**
3. **プロジェクト内の「Settings」タブを開く**
4. **ビルド設定を確認**

---

## 💡 補足: Workspace Settingsの「Environment Variables」

現在見ている「Workspace Settings」の「Environment Variables」も確認できますが、通常はプロジェクト固有の環境変数を使用する方が良いです。

もしWorkspace Settingsの環境変数を使用する場合：
- 「Environment Variables」タブをクリック
- `VITE_MONDAY_API_TOKEN`が設定されていないか確認（本番環境では設定しない）

---

**最終更新**: 2024年

