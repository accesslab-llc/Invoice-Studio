# GitHub認証設定ガイド

**作成日**: 2024年

## 問題

GitHubにプッシュしようとすると、以下のエラーが発生しました：

```
remote: Permission to ryotarotakano-AL/Invoice-Studio.git denied to Charov1228.
fatal: unable to access 'https://github.com/ryotarotakano-AL/Invoice-Studio.git/': The requested URL returned error: 403
```

**原因**: 別のアカウント（Charov1228）で認証しようとしているため、`ryotarotakano-AL`のリポジトリにアクセスできません。

---

## 解決方法: Personal Access Token（PAT）を使用

### ステップ1: GitHubでPersonal Access Tokenを作成

1. **GitHubにログイン**
   - https://github.com にアクセス
   - `ryotarotakano-AL`アカウントでログイン

2. **Personal Access Tokenを作成**
   - 右上のプロフィール画像をクリック
   - 「Settings」を選択
   - 左メニューの「Developer settings」をクリック
   - 「Personal access tokens」→「Tokens (classic)」を選択
   - 「Generate new token」→「Generate new token (classic)」をクリック

3. **トークンの設定**
   - **Note**: `InvoiceStudio Git Access`（任意の名前）
   - **Expiration**: 適切な期間を選択（例: 90 days, No expiration）
   - **Scopes**: 以下の権限にチェック
     - ✅ `repo`（すべてのリポジトリへのアクセス）
     - ✅ `workflow`（GitHub Actionsの使用、必要に応じて）

4. **トークンを生成**
   - 「Generate token」をクリック
   - **重要**: トークンが表示されるので、すぐにコピーして安全な場所に保存
   - このトークンは2度と表示されません

---

### ステップ2: リモートURLを更新（トークンを使用）

#### 方法1: URLにトークンを埋め込む（一時的）

```bash
# リモートURLを更新（トークンを埋め込む）
git remote set-url origin https://YOUR_TOKEN@github.com/ryotarotakano-AL/Invoice-Studio.git
```

**注意**: `YOUR_TOKEN`を実際のトークンに置き換えてください。

**例**:
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/ryotarotakano-AL/Invoice-Studio.git
```

---

#### 方法2: Git Credential Managerを使用（推奨）

macOSの場合、キーチェーンを使用できます：

```bash
# リモートURLを更新（ユーザー名を含める）
git remote set-url origin https://ryotarotakano-AL@github.com/ryotarotakano-AL/Invoice-Studio.git

# プッシュ時にトークンを入力
git push -u origin pipedream-migration
```

プッシュ時にパスワードを求められたら、**Personal Access Token**を入力してください。

---

### ステップ3: キーチェーンの認証情報をクリア（必要に応じて）

別のアカウント（Charov1228）の認証情報が残っている場合：

```bash
# キーチェーンからGitHubの認証情報を削除
git credential-osxkeychain erase
host=github.com
protocol=https
```

（空行を入力してEnterで確定）

---

### ステップ4: プッシュを再試行

```bash
# 現在のブランチをプッシュ
git push -u origin pipedream-migration
```

認証情報を求められたら、Personal Access Tokenを入力してください。

---

## 代替方法: SSH認証を使用

### ステップ1: SSH鍵を生成

```bash
# SSH鍵を生成（まだ持っていない場合）
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### ステップ2: SSH鍵をGitHubに登録

1. 公開鍵をコピー:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. GitHubに登録:
   - GitHub → Settings → SSH and GPG keys
   - 「New SSH key」をクリック
   - 公開鍵を貼り付けて保存

### ステップ3: リモートURLをSSHに変更

```bash
git remote set-url origin git@github.com:ryotarotakano-AL/Invoice-Studio.git
```

### ステップ4: プッシュ

```bash
git push -u origin pipedream-migration
```

---

## 確認方法

### リモートリポジトリの確認

```bash
git remote -v
```

**表示例**:
```
origin  https://github.com/ryotarotakano-AL/Invoice-Studio.git (fetch)
origin  https://github.com/ryotarotakano-AL/Invoice-Studio.git (push)
```

### 認証の確認

```bash
# プッシュを試行（認証が求められる）
git push -u origin pipedream-migration
```

---

## トラブルシューティング

### エラー: "Permission denied"

**原因**: 認証情報が間違っている、または権限がない

**解決策**:
1. Personal Access Tokenが正しいか確認
2. トークンに`repo`スコープが含まれているか確認
3. リポジトリへのアクセス権限があるか確認

---

### エラー: "Authentication failed"

**原因**: キーチェーンに古い認証情報が残っている

**解決策**:
```bash
# キーチェーンからGitHubの認証情報を削除
git credential-osxkeychain erase
host=github.com
protocol=https
```

---

### エラー: "Repository not found"

**原因**: リポジトリ名が間違っている、またはアクセス権限がない

**解決策**:
1. リポジトリURLが正しいか確認
2. リポジトリが存在するか確認
3. アクセス権限があるか確認

---

## セキュリティの注意事項

1. **Personal Access Tokenは秘密情報**
   - トークンを他人に共有しない
   - トークンをGitにコミットしない
   - トークンが漏洩した場合は、すぐに無効化する

2. **トークンの有効期限**
   - 定期的にトークンを更新する
   - 不要になったトークンは削除する

3. **最小権限の原則**
   - 必要なスコープのみを付与する
   - 不要な権限は付けない

---

## 参考情報

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Credential Manager](https://docs.github.com/en/get-started/getting-started-with-git/caching-your-git-credentials)
- [SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**最終更新**: 2024年

