# リポジトリを組織（Organization）に移行する方法

**作成日**: 2024年

## 概要

個人アカウント `ryotarotakano-AL` 内のリポジトリ `Invoice-Studio` を、組織 `accesslab-llc` に移行する手順です。

---

## 📝 移行方法

### 方法1: GitHubでリポジトリを移行（推奨）

GitHubの機能を使ってリポジトリを組織に移行します。

#### ステップ1: リポジトリの設定を開く

1. **GitHubでリポジトリを開く**
   - https://github.com/ryotarotakano-AL/Invoice-Studio

2. **「Settings」タブをクリック**

3. **「Danger Zone」セクションまでスクロール**

#### ステップ2: リポジトリを移行

1. **「Transfer ownership」** をクリック

2. **移行先を選択**
   - 「Transfer to:」のドロップダウンから **`accesslab-llc`** を選択

3. **リポジトリ名を確認**
   - リポジトリ名は `Invoice-Studio` のまま（変更可能）

4. **確認メッセージを入力**
   - 「I understand, transfer this repository」と入力

5. **「I understand, transfer this repository」ボタンをクリック**

#### ステップ3: 移行後の確認

移行後、リポジトリのURLが変更されます：

- **移行前**: https://github.com/ryotarotakano-AL/Invoice-Studio
- **移行後**: https://github.com/accesslab-llc/Invoice-Studio

---

### 方法2: 組織に新しいリポジトリを作成してコードをプッシュ

既存のリポジトリを保持しつつ、組織に新しいリポジトリを作成する方法です。

#### ステップ1: 組織に新しいリポジトリを作成

1. **GitHubで組織 `accesslab-llc` にアクセス**
   - https://github.com/accesslab-llc

2. **「Repositories」タブをクリック**

3. **「New」ボタンをクリック**

4. **リポジトリ情報を入力**
   - **Repository name**: `Invoice-Studio`
   - **Description**: （任意）
   - **Visibility**: Public または Private（会社のポリシーに従う）
   - **Initialize this repository with**: チェックを外す（既存のコードをプッシュするため）

5. **「Create repository」をクリック**

#### ステップ2: ローカルのリモートURLを更新

1. **現在のリモートURLを確認**
   ```bash
   git remote -v
   ```

2. **組織のリポジトリをリモートに追加**
   ```bash
   git remote add organization https://github.com/accesslab-llc/Invoice-Studio.git
   ```

3. **組織のリポジトリにプッシュ**
   ```bash
   git push organization pipedream-migration
   git push organization main
   ```

4. **デフォルトのリモートを組織に変更（オプション）**
   ```bash
   git remote set-url origin https://github.com/accesslab-llc/Invoice-Studio.git
   git remote remove organization
   ```

---

## 🔄 移行後の作業

### ステップ1: ローカルのリモートURLを更新

リポジトリを移行した後、ローカルのリモートURLを更新する必要があります：

```bash
# 現在のリモートURLを確認
git remote -v

# リモートURLを組織のものに更新
git remote set-url origin https://github.com/accesslab-llc/Invoice-Studio.git

# 確認
git remote -v
```

### ステップ2: Vercelで組織のリポジトリをインポート

1. **Vercelダッシュボード → Add New... → Project**

2. **「Import Git Repository」を選択**

3. **組織 `accesslab-llc` を選択**

4. **リポジトリ `Invoice-Studio` を検索または選択**

5. **「Import」をクリック**

### ステップ3: VercelのGitHubアプリの権限を確認

組織のリポジトリにアクセスするには、組織の管理者がVercelアプリを承認する必要がある場合があります。

1. **GitHubで組織 `accesslab-llc` の設定を確認**
   - Settings → Third-party access → OAuth Apps
   - 「Vercel」アプリが承認されているか確認

2. **承認されていない場合**
   - 組織の管理者に依頼
   - Vercelアプリを組織に承認してもらう

---

## ⚠️ 注意事項

### 移行時の注意点

1. **リポジトリのURLが変更される**
   - 移行後、リポジトリのURLが変更されます
   - 既存のリンクや参照を更新する必要があります

2. **権限の確認**
   - 組織のリポジトリにアクセスする権限があるか確認
   - 組織の管理者に確認が必要な場合があります

3. **既存の連携の確認**
   - 他のサービス（CI/CD、デプロイツールなど）との連携を確認
   - リモートURLを更新する必要があります

4. **ブランチとコミット履歴**
   - 移行後も、すべてのブランチとコミット履歴が保持されます

---

## 📝 推奨される手順

### ステップ1: 組織の管理者に確認

1. **組織 `accesslab-llc` の管理者に連絡**
2. **リポジトリを移行することを伝える**
3. **必要な権限があるか確認**

### ステップ2: リポジトリを移行

1. **方法1（推奨）**: GitHubの「Transfer ownership」機能を使用
2. **または方法2**: 組織に新しいリポジトリを作成してコードをプッシュ

### ステップ3: ローカルの設定を更新

1. **リモートURLを更新**
2. **動作確認**

### ステップ4: Vercelでインポート

1. **組織のリポジトリをVercelでインポート**
2. **デプロイ設定を確認**

---

## 🔍 確認チェックリスト

- [ ] 組織の管理者に移行の許可を得た
- [ ] リポジトリを移行した（または組織に新しいリポジトリを作成した）
- [ ] ローカルのリモートURLを更新した
- [ ] リモートURLが正しく更新されたか確認した
- [ ] 組織のリポジトリにプッシュできるか確認した
- [ ] Vercelで組織のリポジトリをインポートした

---

## 🆘 トラブルシューティング

### 移行できない

**原因**: 組織の管理者権限がない

**解決策**:
- 組織の管理者に依頼して移行してもらう
- または、組織の管理者権限を取得する

### リモートURLの更新ができない

**原因**: 認証情報の問題

**解決策**:
```bash
# リモートURLを更新
git remote set-url origin https://github.com/accesslab-llc/Invoice-Studio.git

# プッシュを試行（認証が求められる）
git push origin pipedream-migration
```

### Vercelで組織のリポジトリが見つからない

**原因**: Vercelアプリが組織に承認されていない

**解決策**:
1. 組織の管理者にVercelアプリの承認を依頼
2. Vercelダッシュボードで組織を再選択

---

**最終更新**: 2024年

