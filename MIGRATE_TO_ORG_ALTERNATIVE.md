# リポジトリを組織に移行する方法（Danger Zoneがない場合）

**作成日**: 2024年

## 問題

GitHubのSettingsページに「Danger Zone」が表示されない。

---

## 🔍 原因

「Danger Zone」が表示されない理由：

1. **権限が不足している**
   - リポジトリの所有者（Owner）権限が必要
   - 組織のリポジトリの場合、組織の管理者権限が必要

2. **組織の設定**
   - 組織の設定でリポジトリの移行が制限されている可能性

3. **リポジトリの種類**
   - フォークされたリポジトリの場合、移行できない場合がある

---

## ✅ 解決方法: 組織に新しいリポジトリを作成

「Danger Zone」が表示されない場合、組織に新しいリポジトリを作成して、コードをプッシュする方法が確実です。

---

## 📝 手順

### ステップ1: 組織に新しいリポジトリを作成

1. **GitHubで組織 `accesslab-llc` にアクセス**
   - https://github.com/accesslab-llc

2. **「Repositories」タブをクリック**

3. **「New」ボタンをクリック**

4. **リポジトリ情報を入力**
   - **Repository name**: `Invoice-Studio`
   - **Description**: （任意、例：「Monday.com invoice generation app」）
   - **Visibility**: 
     - **Public**: 誰でも見られる（推奨：オープンソースの場合）
     - **Private**: 組織のメンバーのみ（推奨：会社の内部プロジェクトの場合）
   - **Initialize this repository with**: 
     - ✅ **チェックを外す**（既存のコードをプッシュするため）

5. **「Create repository」をクリック**

---

### ステップ2: ローカルのリモートURLを更新

組織に新しいリポジトリを作成した後、ローカルのリモートURLを更新します。

#### 現在のリモートURLを確認

```bash
git remote -v
```

**表示例**:
```
origin	https://ryotarotakano-AL@github.com/ryotarotakano-AL/Invoice-Studio.git (fetch)
origin	https://ryotarotakano-AL@github.com/ryotarotakano-AL/Invoice-Studio.git (push)
```

#### リモートURLを組織のリポジトリに更新

```bash
# リモートURLを組織のリポジトリに更新
git remote set-url origin https://github.com/accesslab-llc/Invoice-Studio.git

# 確認
git remote -v
```

**更新後の表示例**:
```
origin	https://github.com/accesslab-llc/Invoice-Studio.git (fetch)
origin	https://github.com/accesslab-llc/Invoice-Studio.git (push)
```

---

### ステップ3: 組織のリポジトリにプッシュ

#### すべてのブランチをプッシュ

```bash
# pipedream-migrationブランチをプッシュ
git push origin pipedream-migration

# mainブランチをプッシュ
git push origin main
```

#### すべてのブランチとタグをプッシュ（一括）

```bash
# すべてのブランチをプッシュ
git push origin --all

# すべてのタグをプッシュ（もしあれば）
git push origin --tags
```

---

### ステップ4: 動作確認

1. **GitHubで組織のリポジトリを確認**
   - https://github.com/accesslab-llc/Invoice-Studio
   - ファイルが正しく表示されているか確認
   - ブランチが正しく表示されているか確認

2. **ローカルでリモートURLを確認**
   ```bash
   git remote -v
   ```

3. **プッシュが成功したか確認**
   ```bash
   git fetch origin
   git branch -r
   ```

---

## 🔄 既存のリポジトリの扱い

### オプション1: 個人アカウントのリポジトリを削除

組織に移行した後、個人アカウントのリポジトリを削除できます：

1. **個人アカウントのリポジトリを開く**
   - https://github.com/ryotarotakano-AL/Invoice-Studio

2. **Settings → Danger Zone → Delete this repository**

3. **確認メッセージを入力して削除**

**注意**: 削除する前に、組織のリポジトリにすべてのコードが正しくプッシュされているか確認してください。

---

### オプション2: 個人アカウントのリポジトリを保持

個人アカウントのリポジトリをバックアップとして保持することもできます。

---

## 📝 Vercelで組織のリポジトリをインポート

組織にリポジトリを作成した後、Vercelでインポートします：

### ステップ1: Vercelで組織を選択

1. **Vercelダッシュボード → Add New... → Project**

2. **「Import Git Repository」を選択**

3. **Vercelのインストール画面で `accesslab-llc`（組織）を選択**

4. **「Configure >」または「>」ボタンをクリック**

### ステップ2: リポジトリへのアクセス権限を設定

1. **「All repositories」または「Only select repositories」を選択**

2. **「Only select repositories」を選択した場合**:
   - 「Select repositories」をクリック
   - `Invoice-Studio` を選択
   - 「Save」をクリック

### ステップ3: リポジトリをインポート

1. **Vercelのプロジェクト作成画面に戻る**

2. **組織 `accesslab-llc` の下にリポジトリ一覧が表示される**

3. **`Invoice-Studio` を検索または選択**

4. **「Import」をクリック**

---

## ⚠️ 注意事項

### 権限の確認

組織のリポジトリを作成・プッシュするには：

- [ ] 組織 `accesslab-llc` のメンバーであること
- [ ] リポジトリを作成する権限があること
- [ ] リポジトリにプッシュする権限があること

権限がない場合、組織の管理者に依頼してください。

---

### リポジトリ名の重複

組織に既に `Invoice-Studio` という名前のリポジトリがある場合：

- 別の名前を使用する（例：`invoice-studio`、`InvoiceStudio`）
- または、既存のリポジトリを使用する

---

## ✅ 確認チェックリスト

- [ ] 組織 `accesslab-llc` のメンバーである
- [ ] 組織にリポジトリを作成する権限がある
- [ ] 組織に新しいリポジトリ `Invoice-Studio` を作成した
- [ ] ローカルのリモートURLを組織のリポジトリに更新した
- [ ] すべてのブランチを組織のリポジトリにプッシュした
- [ ] GitHubで組織のリポジトリを確認した
- [ ] Vercelで組織のリポジトリをインポートした

---

## 🆘 トラブルシューティング

### 組織にリポジトリを作成できない

**原因**: 組織のメンバーではない、または権限が不足している

**解決策**:
- 組織の管理者に依頼
- 組織のメンバーに追加してもらう
- リポジトリを作成する権限を取得

---

### プッシュできない

**原因**: 認証の問題、または権限が不足している

**解決策**:
```bash
# 認証情報を確認
git config --global user.name
git config --global user.email

# Personal Access Tokenを使用
git remote set-url origin https://YOUR_TOKEN@github.com/accesslab-llc/Invoice-Studio.git
```

---

### Vercelで組織のリポジトリが見つからない

**原因**: Vercelアプリが組織に承認されていない

**解決策**:
1. 組織の管理者にVercelアプリの承認を依頼
2. Vercelダッシュボードで組織を再選択

---

**最終更新**: 2024年

