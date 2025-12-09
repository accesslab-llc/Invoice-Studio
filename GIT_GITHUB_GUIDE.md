# GitとGitHub完全ガイド - InvoiceStudio版

**作成日**: 2024年

## 📚 目次

1. [GitとGitHubの基本概念](#1-gitとgithubの基本概念)
2. [ブランチとは何か](#2-ブランチとは何か)
3. [よく使うコマンドの意味](#3-よく使うコマンドの意味)
4. [現在の状態の確認方法](#4-現在の状態の確認方法)
5. [実際の作業フロー](#5-実際の作業フロー)
6. [GitHub上の状態](#6-github上の状態)
7. [トラブル時の対処法](#7-トラブル時の対処法)

---

## 1. GitとGitHubの基本概念

### 1.1. Gitとは？

**Git** = バージョン管理システム（ローカルで動作）

- コードの変更履歴を記録するツール
- パソコンの中（ローカル）で動作
- 変更を「コミット」という単位で保存
- 過去の状態に戻せる

### 1.2. GitHubとは？

**GitHub** = Gitのリモートリポジトリをホスティングするサービス（クラウド上）

- コードをクラウド上に保存
- チームで共有できる
- バックアップとしても機能
- ブラウザで見られる

### 1.3. ローカルとリモートの関係

```
┌─────────────────┐         ┌─────────────────┐
│   ローカル       │  push   │   GitHub        │
│  (パソコン内)    │ ──────> │  (クラウド上)   │
│                 │         │                 │
│  InvoiceStudio/ │  pull   │  InvoiceStudio  │
│  (作業フォルダ)  │ <────── │  (リポジトリ)   │
└─────────────────┘         └─────────────────┘
```

- **ローカル**: あなたのパソコンの中のフォルダ
- **リモート**: GitHub上のリポジトリ（まだ設定されていない）

---

## 2. ブランチとは何か

### 2.1. ブランチの概念

**ブランチ** = コードの「枝分かれ」

```
mainブランチ（現在のコード）
    │
    ├─ コミット1: 認証方式の改善
    ├─ コミット2: 法務ドキュメント追加
    ├─ コミット3: スペイン語版追加
    └─ コミット4: PipeDream移行ガイド追加
         │
         └─> pipedream-migrationブランチ（新しい変更）
              │
              └─> （これからPipeDream用の変更を追加）
```

### 2.2. なぜブランチを使うのか？

**例**: PipeDream用の変更を始める場合

❌ **ブランチなしの場合**:
- `main`ブランチで直接変更
- 元のコードが失われる
- 戻れなくなる

✅ **ブランチありの場合**:
- `pipedream-migration`ブランチで変更
- `main`ブランチのコードは安全
- いつでも`main`に戻れる
- 変更を試せる

### 2.3. 現在のブランチ構成

```
main (元のコード - 安全に保管)
  │
  ├─ コミット1: 認証方式の改善
  ├─ コミット2: 法務ドキュメント追加
  ├─ コミット3: スペイン語版追加
  └─ コミット4: PipeDream移行ガイド追加
       │
       └─> pipedream-migration (現在ここ - PipeDream用の変更)
```

---

## 3. よく使うコマンドの意味

### 3.1. 状態確認コマンド

#### `git status`
**意味**: 現在の状態を確認

**表示される情報**:
- どのブランチにいるか
- 変更されたファイルがあるか
- コミット待ちのファイルがあるか

**例**:
```bash
$ git status
On branch pipedream-migration
nothing to commit, working tree clean
```

**意味**:
- `pipedream-migration`ブランチにいる
- 変更はない（すべてコミット済み）

---

#### `git branch`
**意味**: ブランチ一覧を表示

**例**:
```bash
$ git branch
  main
* pipedream-migration
```

**意味**:
- `main`ブランチが存在
- `pipedream-migration`ブランチが存在
- `*` = 現在いるブランチ

---

#### `git log`
**意味**: コミット履歴を表示

**例**:
```bash
$ git log --oneline -5
5f04cac docs: PipeDream移行ガイドを追加
83d4228 docs: スペイン語版の法務ドキュメントを追加
2b7040c docs: 法務ドキュメントの追加
831b325 feat: 認証方式の改善 - 環境分岐ロジックとセキュリティ対応
```

**意味**:
- 最新のコミットが上に表示
- `5f04cac` = コミットID（識別子）
- `docs: PipeDream移行ガイドを追加` = コミットメッセージ

---

### 3.2. ブランチ操作コマンド

#### `git checkout -b ブランチ名`
**意味**: 新しいブランチを作成して切り替え

**例**:
```bash
$ git checkout -b pipedream-migration
Switched to a new branch 'pipedream-migration'
```

**意味**:
- `pipedream-migration`という新しいブランチを作成
- そのブランチに切り替え

**分解すると**:
- `git checkout` = ブランチを切り替え
- `-b` = ブランチがなければ作成

---

#### `git checkout ブランチ名`
**意味**: ブランチを切り替え

**例**:
```bash
$ git checkout main
Switched to branch 'main'
```

**意味**:
- `main`ブランチに切り替え
- 元のコードの状態に戻る

---

### 3.3. 変更を保存するコマンド

#### `git add ファイル名`
**意味**: 変更を「ステージング」する（コミットの準備）

**例**:
```bash
$ git add PIPEDREAM_MIGRATION.md
```

**意味**:
- `PIPEDREAM_MIGRATION.md`の変更をコミットの準備リストに追加

**すべての変更を追加する場合**:
```bash
$ git add .
```
（`.` = すべてのファイル）

---

#### `git commit -m "メッセージ"`
**意味**: 変更を「コミット」する（保存）

**例**:
```bash
$ git commit -m "feat: PipeDream用の設定ファイルを追加"
```

**意味**:
- 変更をローカルに保存
- `-m` = メッセージを指定
- コミットメッセージで何を変更したか記録

**コミットメッセージの例**:
- `feat: 新機能を追加`
- `fix: バグを修正`
- `docs: ドキュメントを更新`
- `refactor: コードを整理`

---

#### `git push`
**意味**: ローカルの変更をGitHubに送信

**例**:
```bash
$ git push origin pipedream-migration
```

**意味**:
- ローカルの`pipedream-migration`ブランチをGitHubに送信
- `origin` = リモートリポジトリ（GitHub）の名前

**注意**: リモートリポジトリが設定されていない場合は、先に設定が必要

---

### 3.4. リモートリポジトリの設定

#### `git remote add origin URL`
**意味**: GitHubのリポジトリを登録

**例**:
```bash
$ git remote add origin https://github.com/your-username/InvoiceStudio.git
```

**意味**:
- GitHubのリポジトリを`origin`という名前で登録
- これで`git push`が使えるようになる

---

#### `git remote -v`
**意味**: 登録されているリモートリポジトリを確認

**例**:
```bash
$ git remote -v
origin  https://github.com/your-username/InvoiceStudio.git (fetch)
origin  https://github.com/your-username/InvoiceStudio.git (push)
```

**意味**:
- `origin`という名前でGitHubのリポジトリが登録されている
- `fetch` = 取得用
- `push` = 送信用

---

## 4. 現在の状態の確認方法

### 4.1. 現在の状態を確認するコマンド

```bash
# 1. どのブランチにいるか確認
git branch

# 2. 変更があるか確認
git status

# 3. コミット履歴を確認
git log --oneline -10

# 4. リモートリポジトリが設定されているか確認
git remote -v
```

### 4.2. 現在の状態（あなたの環境）

**ブランチ**: `pipedream-migration`（現在ここ）

**コミット履歴**:
```
5f04cac docs: PipeDream移行ガイドを追加
83d4228 docs: スペイン語版の法務ドキュメントを追加
2b7040c docs: 法務ドキュメントの追加
831b325 feat: 認証方式の改善 - 環境分岐ロジックとセキュリティ対応
```

**リモートリポジトリ**: まだ設定されていない（GitHubにプッシュするには設定が必要）

---

## 5. 実際の作業フロー

### 5.1. 基本的な作業フロー

```
1. ブランチを切り替え（または作成）
   ↓
2. コードを変更
   ↓
3. 変更を確認（git status）
   ↓
4. 変更をステージング（git add）
   ↓
5. 変更をコミット（git commit）
   ↓
6. GitHubにプッシュ（git push）
```

### 5.2. PipeDream用の変更を進める場合

#### ステップ1: ブランチを確認
```bash
$ git branch
  main
* pipedream-migration  # ← 現在ここ
```

#### ステップ2: コードを変更
- ファイルを編集
- 新しいファイルを作成

#### ステップ3: 変更を確認
```bash
$ git status
On branch pipedream-migration
Changes not staged for commit:
  modified:   vercel.json
  new file:   pipedream.json
```

**意味**:
- `vercel.json`が変更された
- `pipedream.json`が新規作成された

#### ステップ4: 変更をステージング
```bash
$ git add .
```

**意味**: すべての変更をコミットの準備リストに追加

#### ステップ5: 変更をコミット
```bash
$ git commit -m "feat: PipeDream用の設定ファイルを追加"
```

**意味**: 変更をローカルに保存

#### ステップ6: GitHubにプッシュ（リモートが設定されている場合）
```bash
$ git push origin pipedream-migration
```

**意味**: 変更をGitHubに送信

---

### 5.3. 元のコードに戻る場合

```bash
# mainブランチに切り替え
$ git checkout main

# 元のコードの状態に戻る
# （pipedream-migrationブランチの変更は見えない）
```

---

### 5.4. PipeDream用のブランチに戻る場合

```bash
# pipedream-migrationブランチに切り替え
$ git checkout pipedream-migration

# PipeDream用の変更が表示される
```

---

## 6. GitHub上の状態

### 6.1. GitHubにプッシュする前の状態

**ローカル（パソコン内）**:
```
mainブランチ
  ├─ コミット1
  ├─ コミット2
  ├─ コミット3
  └─ コミット4
       │
       └─> pipedream-migrationブランチ
```

**GitHub（クラウド上）**:
```
（まだ何もない、または古い状態）
```

### 6.2. GitHubにプッシュした後の状態

**ローカル（パソコン内）**:
```
mainブランチ
  ├─ コミット1
  ├─ コミット2
  ├─ コミット3
  └─ コミット4
       │
       └─> pipedream-migrationブランチ
            └─> コミット5（新規）
```

**GitHub（クラウド上）**:
```
mainブランチ
  ├─ コミット1
  ├─ コミット2
  ├─ コミット3
  └─ コミット4
       │
       └─> pipedream-migrationブランチ
            └─> コミット5（新規）
```

**同じ状態になる！**

---

### 6.3. GitHubで見られる情報

GitHubのリポジトリページで見られる情報:

1. **Codeタブ**: ファイル一覧
2. **Commitsタブ**: コミット履歴
3. **Branchesタブ**: ブランチ一覧
4. **Pull requestsタブ**: プルリクエスト（ブランチをマージする際に使用）

---

## 7. トラブル時の対処法

### 7.1. 変更を取り消したい

#### ファイルを変更したが、まだ`git add`していない場合
```bash
# 変更を取り消す
$ git checkout -- ファイル名

# すべての変更を取り消す
$ git checkout -- .
```

#### `git add`したが、まだ`git commit`していない場合
```bash
# ステージングを取り消す
$ git reset HEAD ファイル名

# すべてのステージングを取り消す
$ git reset HEAD
```

#### `git commit`したが、まだ`git push`していない場合
```bash
# 直前のコミットを取り消す（変更は残る）
$ git reset --soft HEAD~1

# 直前のコミットを取り消す（変更も消す）
$ git reset --hard HEAD~1
```

**注意**: `--hard`は変更を完全に消すので注意！

---

### 7.2. 間違ったブランチで作業してしまった

```bash
# 変更を保存（一時的に）
$ git stash

# 正しいブランチに切り替え
$ git checkout pipedream-migration

# 保存した変更を復元
$ git stash pop
```

---

### 7.3. ブランチを削除したい

```bash
# ブランチを削除（マージ済みの場合）
$ git branch -d ブランチ名

# ブランチを強制削除（マージしていない場合）
$ git branch -D ブランチ名
```

---

### 7.4. リモートリポジトリの状態を確認したい

```bash
# リモートのブランチ一覧を取得
$ git fetch origin

# リモートとローカルの差分を確認
$ git log origin/main..main
```

---

## 8. よくある質問

### Q1: コミットとプッシュの違いは？

**A**: 
- **コミット** = ローカル（パソコン内）に保存
- **プッシュ** = GitHub（クラウド上）に送信

コミットだけでは、GitHubには反映されません。

---

### Q2: ブランチを切り替えると、変更はどうなる？

**A**: 
- コミットしていない変更は、ブランチを切り替えても持ち越されます
- コミットした変更は、そのブランチに保存されます

---

### Q3: `main`ブランチと`pipedream-migration`ブランチの違いは？

**A**: 
- `main`: 元のコード（Vercel想定）
- `pipedream-migration`: PipeDream用の変更を進めるブランチ

`pipedream-migration`で変更しても、`main`には影響しません。

---

### Q4: GitHubにプッシュするには？

**A**: 
1. GitHubでリポジトリを作成
2. `git remote add origin URL`でリモートを設定
3. `git push origin ブランチ名`でプッシュ

---

## 9. まとめ

### 9.1. 重要なポイント

1. **Git** = ローカルで動作するバージョン管理システム
2. **GitHub** = クラウド上でコードを保存・共有するサービス
3. **ブランチ** = コードの「枝分かれ」、安全に変更を試せる
4. **コミット** = 変更をローカルに保存
5. **プッシュ** = 変更をGitHubに送信

### 9.2. 基本的な流れ

```
1. git checkout -b ブランチ名  # ブランチを作成・切り替え
2. コードを変更
3. git add .                  # 変更をステージング
4. git commit -m "メッセージ"  # 変更をコミット
5. git push origin ブランチ名  # GitHubにプッシュ
```

### 9.3. 現在の状態

- **ブランチ**: `pipedream-migration`
- **コミット**: 4つ（すべてローカルに保存済み）
- **リモート**: まだ設定されていない

---

**最終更新**: 2024年

