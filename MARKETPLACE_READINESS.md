# InvoiceStudio - Monday.comマーケットプレイス対応状況レポート

## 概要

このドキュメントは、InvoiceStudioをMonday.comのマーケットプレイスで販売するために必要な要件に対する現状の対応状況をまとめたものです。

---

## 1. 認証（技術的なセキュリティ・権限の話）

### 1-1. Monday APIの認証方式

**現状**: ✅ **対応完了**

- ✅ `monday-sdk-js`を使用してMonday App SDKと統合（`BoardSDK.js`）
- ✅ `monday.api()`メソッドで自動認証（内部でトークンを自動取得）
- ✅ 環境変数`VITE_MONDAY_API_TOKEN`によるフォールバック機能あり（ローカル開発用）
- ✅ URLパラメータの`sessionToken`も確認している
- ✅ 環境分岐ロジック実装済み（DEV/PROD）
- ✅ エラーハンドリング実装済み

**備考**:
- Monday SDKの`api()`メソッドが内部でOAuth 2.0とshort-lived tokenを自動処理
- 本番環境では個人APIトークンを使用しない（`.env.local`はローカル開発専用）

### 1-2. OAuth & Permissions（スコープ）の設計

**現状**: ✅ **対応完了**

- ✅ READMEに必要なスコープの記載あり
- ✅ Developer Centerで`boards:read`スコープを設定済み
- ✅ `boards:read`スコープでアイテムとサブアイテムも正常に取得できることを確認済み
- ✅ 動作確認済み（Monday.comのボードでアプリが正常に動作）

**設定済みスコープ**:
- `boards:read` - ボードデータ、アイテムデータ、サブアイテムデータの読み取り（すべて含まれる）

**備考**:
- Monday.comのAPIでは、`boards:read`スコープでボード、アイテム、サブアイテムのすべてのデータを読み取れる
- 追加のスコープ（`items:read`、`subitems:read`）は不要

### 1-3. セキュリティ要件（認証まわりでチェックされること）

**現状**: ✅ **対応完了**

| 要件 | 現状 | 備考 |
|------|------|------|
| すべての通信がTLS 1.2以上のHTTPS | ✅ 対応完了 | Vercelが自動でHTTPSを提供（TLS 1.2以上） |
| APIトークンは暗号化して保存 | ✅ 該当なし | トークンはメモリのみ、DB保存なし |
| GitHubなどに秘密情報を直書きしない | ✅ 対応完了 | `.gitignore`に`.env.local`が含まれている |
| PII（個人情報）を保存する場合は暗号化 | ✅ 該当なし | 個人情報の保存なし（localStorageのみ、サーバー保存なし） |
| SQLインジェクションなどへの対策 | ✅ 該当なし | 外部DB未使用 |
| Burp scanという脆弱性スキャンを通す | ⚠️ 未実施 | 脆弱性スキャン未実施（任意） |

---

## 2. 認知（マーケットプレイスでの承認・公式感）

### 2-1. 「このアプリはmonday.comに承認されていません」問題

**現状**: ❌ **未対応**

- マーケットプレイス審査を通過していないため、OAuth画面などで警告が表示される可能性がある

### 2-2. マーケットプレイス審査（App review）の中身

**現状**: ❌ **未対応**

| チェック項目 | 現状 |
|------------|------|
| Product / UX | ✅ 基本的なUI実装あり |
| App listing page | ❌ 未作成 |
| Documentation & support | ⚠️ READMEのみ、サポート窓口なし |
| Legal | ❌ プライバシーポリシー・利用規約なし |
| Privacy & security | ❌ セキュリティ情報のドキュメントなし |
| Partnership | ❌ 未確認 |
| Monetization | ❌ 料金プラン未設定 |

---

## 3. 公開後の認知度アップの話

### 3-1. App listing（アプリ紹介ページ）

**現状**: ❌ **未作成**

- アプリアイコン: ❌ 未確認
- スクリーンショット: ❌ 未作成
- 説明文: ⚠️ READMEのみ
- 料金プラン: ❌ 未設定

### 3-2. Security & Compliance情報

**現状**: ❌ **未作成**

- どんなデータを保存しているか: ❌ 説明なし
- データの暗号化方法: ❌ 説明なし
- インフラ（AWS/GCPなど）: ❌ 情報なし
- インシデント対応ポリシー: ❌ なし

---

## 4. ドキュメント・法務系

**現状**: ❌ **未対応**

- プライバシーポリシー: ❌ なし
- 利用規約 / EULA: ❌ なし
- 簡単なシステム構成図 / データフロー図: ❌ なし

---

## 5. その他の確認事項

### データ保存について

- ✅ `localStorage`を使用: フィールドマッピングとテンプレートを保存
- ❌ 暗号化なし: 平文で保存されている
- ✅ 個人情報の保存: 請求書データは一時的なみ（ダウンロードのみ）

### 環境変数の扱い

- ⚠️ `.gitignore`の存在未確認
- ✅ READMEに「リポジトリにコミットしないでください」の記載あり

---

## 6. インフラ・サーバー・ホスティング

### 6-1. 本番環境のホスティング

**現状**: ❌ **未対応**

Monday.comのマーケットプレイスで公開するには、**ローカルホストではなく、本番環境のサーバーが必要**です。

#### 必須要件

| 項目 | 説明 | 現状 | 優先度 |
|------|------|------|--------|
| **ホスティングサーバー** | 静的ファイル（HTML/CSS/JS）を配信するサーバー | ❌ 未用意 | 🔴 高 |
| **ドメイン** | カスタムドメイン（例: `invoice-studio.com`）またはサブドメイン | ❌ 未取得 | 🔴 高 |
| **SSL証明書** | HTTPS必須（Let's Encrypt無料証明書でも可） | ❌ 未設定 | 🔴 高 |
| **HTTPS対応** | TLS 1.2以上、すべての通信を暗号化 | ⚠️ 要確認 | 🔴 高 |
| **HSTS設定** | HTTP Strict Transport Securityの有効化 | ❌ 未設定 | 🔴 高 |

#### 推奨要件

| 項目 | 説明 | 現状 | 優先度 |
|------|------|------|--------|
| **CDN（Content Delivery Network）** | グローバルな配信速度向上（Cloudflare、AWS CloudFront等） | ❌ 未設定 | 🟡 中 |
| **CI/CDパイプライン** | 自動ビルド・デプロイ（GitHub Actions、GitLab CI等） | ❌ 未構築 | 🟡 中 |
| **モニタリング** | アプリの稼働状況・エラー監視（Sentry、Datadog等） | ❌ 未設定 | 🟡 中 |
| **ログ管理** | アクセスログ・エラーログの収集・分析 | ❌ 未設定 | 🟡 中 |
| **バックアップ** | 設定ファイル・データの定期バックアップ | ❌ 未設定 | 🟡 中 |
| **災害対策（DR）** | 冗長化・フェイルオーバー | ❌ 未対応 | 🟢 低 |

### 6-2. ホスティングオプション

#### 静的サイトホスティング（推奨）

InvoiceStudioはViteでビルドされた静的サイト（SPA）のため、以下のサービスが適しています：

**無料・低コストオプション**:
- ✅ **Vercel** - 無料プランあり、自動HTTPS、CDN内蔵、Git連携
- ✅ **Netlify** - 無料プランあり、自動HTTPS、CDN内蔵、Git連携
- ✅ **GitHub Pages** - 無料、自動HTTPS、カスタムドメイン対応
- ✅ **Cloudflare Pages** - 無料プランあり、高速CDN、自動HTTPS

**有料・エンタープライズ向け**:
- **AWS S3 + CloudFront** - スケーラブル、高可用性
- **Google Cloud Storage + Cloud CDN** - GCPエコシステム
- **Azure Static Web Apps** - Microsoftエコシステム

#### サーバーレス・コンテナホスティング

将来的にバックエンドが必要になった場合：

- **AWS Lambda + API Gateway**
- **Vercel Serverless Functions**
- **Netlify Functions**
- **Docker + AWS ECS / Google Cloud Run**

### 6-3. ドメインとDNS設定

**現状**: ❌ **未対応**

- カスタムドメインの取得が必要
- DNS設定（Aレコード、CNAMEレコード）
- SSL証明書の自動更新設定

**推奨ドメイン取得サービス**:
- Namecheap
- Google Domains
- AWS Route 53
- Cloudflare Registrar

### 6-4. ビルド・デプロイ設定

**現状**: ⚠️ **部分的対応**

- ✅ `npm run build`でビルド可能（`dist`フォルダに出力）
- ❌ 本番環境へのデプロイスクリプトなし
- ❌ CI/CDパイプライン未構築
- ❌ 環境変数の本番環境設定なし

**必要な設定**:
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- 環境変数の本番環境での管理（`.env.production`等）

### 6-5. セキュリティヘッダー設定

**現状**: ❌ **未対応**

本番環境で設定すべきセキュリティヘッダー：

- `Content-Security-Policy (CSP)` - XSS対策
- `X-Frame-Options` - クリックジャッキング対策
- `X-Content-Type-Options: nosniff` - MIMEタイプスニッフィング対策
- `Referrer-Policy` - リファラー情報の制御
- `Permissions-Policy` - ブラウザ機能の制御

### 6-6. パフォーマンス最適化

**現状**: ⚠️ **部分的対応**

- ✅ Viteでビルド（自動最適化あり）
- ❌ 本番環境でのパフォーマンステスト未実施
- ❌ 画像最適化未確認
- ❌ キャッシュ戦略未設定

**推奨対応**:
- 画像の最適化（WebP形式、遅延読み込み）
- コード分割・Tree shaking（Viteで自動対応）
- ブラウザキャッシュ設定（Cache-Controlヘッダー）
- Gzip/Brotli圧縮

### 6-7. コスト見積もり

**月額コスト目安**（小規模運用）:

| 項目 | 無料プラン | 有料プラン（目安） |
|------|-----------|------------------|
| ホスティング | Vercel/Netlify無料プラン | $0-20/月 |
| ドメイン | - | $10-15/年 |
| SSL証明書 | Let's Encrypt（無料） | $0 |
| CDN | 無料プラン内蔵 | $0-10/月 |
| モニタリング | 無料プラン（制限あり） | $0-20/月 |
| **合計** | **$0-1/月** | **$10-50/月** |

**注意**: トラフィックが増えるとコストが上がる可能性あり

---

## 対応状況サマリー

| カテゴリ | 対応状況 | 優先度 |
|---------|---------|--------|
| 認証方式（OAuth/seamless auth） | ✅ 対応完了 | 🔴 高 |
| OAuthスコープの設計・ドキュメント | ✅ 対応完了 | 🔴 高 |
| セキュリティ要件（HTTPS、暗号化等） | ✅ 対応完了 | 🔴 高 |
| **本番環境ホスティング** | ✅ **対応完了** | 🔴 **高** |
| **ドメイン・SSL証明書** | ✅ **対応完了** | 🔴 **高** |
| プライバシーポリシー | ✅ 対応完了 | 🔴 高 |
| 利用規約 | ✅ 対応完了 | 🔴 高 |
| App listing（マーケットプレイス用） | ❌ 未作成 | 🟡 中 |
| Security & Compliance情報 | ❌ 未作成 | 🟡 中 |
| システム構成図 | ❌ 未作成 | 🟡 中 |
| CI/CDパイプライン | ❌ 未構築 | 🟡 中 |
| モニタリング・ログ | ❌ 未設定 | 🟡 中 |
| サポート窓口 | ❌ 未設定 | 🟡 中 |
| 料金プラン | ❌ 未設定 | 🟢 低 |

---

## 次のステップ（優先順位順）

### 🔴 高優先度（マーケットプレイス審査に必須）

1. **認証方式の改善** ✅ **完了**
   - ✅ 本番環境では `sessionToken` / `monday.get('token')` のみ使用
   - ✅ 個人APIトークンはローカル開発専用
   - ✅ `getToken()` の環境分岐ロジック（DEV/PROD）実装済み
   - ✅ エラーハンドリング（トークン取得失敗時のUI表示）実装済み
   - ✅ `monday.api()`メソッドで自動認証（内部でトークンを自動取得）

2. **OAuthスコープの設計** ✅ **完了**
   - ✅ 読み取り専用スコープのみ使用（`boards:read`）
   - ✅ Developer Centerでスコープを設定済み
   - ✅ `boards:read`でアイテムとサブアイテムも正常に取得できることを確認済み

3. **本番環境のインフラ構築** ✅ **完了**
   - ✅ ホスティングサーバーの選定・セットアップ（Vercel）
   - ✅ Production URL: `https://invoice-studio-xi.vercel.app`
   - ✅ SSL証明書の取得・設定（Vercelが自動提供）
   - ✅ HTTPSの有効化確認（TLS 1.2以上）
   - ✅ セキュリティヘッダーの設定（CSP、X-Content-Type-Options等）
   - ✅ 本番環境用の環境変数設定（`VITE_MONDAY_API_TOKEN`は設定しない）

4. **セキュリティ要件の対応** ✅ **完了**
   - ✅ `.env.local` を `.gitignore` に追加済み
   - ✅ 本番環境では `VITE_MONDAY_API_TOKEN` を設定しない
   - ✅ `.gitignore` の確認・更新済み
   - ✅ ログ出力からトークン値を除外済み
   - ⚠️ Burp scanなどの脆弱性スキャン未実施（任意）
   - ⚠️ パフォーマンステスト・負荷テスト未実施（任意）

5. **CI/CDパイプラインの構築** 🟡 **推奨**
   - GitHub Actions / GitLab CI等の設定
   - 自動ビルド・デプロイの設定
   - テストの自動実行

6. **法務ドキュメントの作成** ✅ **完了**
   - ✅ データ保存方針決定済み（`localStorage` のみ、サーバー保存なし）
   - ✅ プライバシーポリシー作成済み（日本語・英語・スペイン語）
   - ✅ 利用規約 / EULA作成済み（日本語・英語・スペイン語）

### 🟡 中優先度（マーケットプレイス公開に必要）

7. **App listingページの作成**
   - アプリアイコン
   - 3〜5枚のスクリーンショット
   - 1〜2分の画面キャプチャ動画（任意）
   - 説明テキスト（日本語＋英語）
   - ターゲット・メリット・ユースケース例

8. **Security & Compliance情報の作成**
   - データ保存方法の説明
   - 暗号化方法の説明
   - インフラ情報（使用しているホスティングサービス、リージョン等）
   - インシデント対応ポリシー

9. **システム構成図の作成**
   - monday → InvoiceStudio → （必要なら）外部ストレージのデータフロー図
   - インフラ構成図（ホスティング、CDN、DNS等）

10. **モニタリング・ログの設定** 🟡 **推奨**
    - エラー監視（Sentry等）
    - アクセスログの収集
    - パフォーマンス監視

11. **サポート窓口の設定**
    - サポートメールアドレスまたはサイト
    - FAQ・使い方ドキュメント

### 🟢 低優先度（公開後のマーケティング）

12. **料金プランの決定**
    - 無料で出すのか
    - サブスク（月額/年額）
    - 無料トライアル期間

13. **CDNの最適化**（トラフィック増加時）
    - Cloudflare、AWS CloudFront等の設定
    - キャッシュ戦略の最適化

14. **災害対策・冗長化**（大規模運用時）
    - 複数リージョンへのデプロイ
    - 自動フェイルオーバー

---

## 7. 認証・環境別動作ポリシー（決定済み方針）

### 7-1. 全体方針

✅ **決定済み方針**:

- アプリは **完全フロントエンド（バックエンド無し）** とする
- Monday.com のデータ操作は **読み取り専用** とする（書き込みはしない）
- 本番環境では **monday が発行する短命トークン（sessionToken / monday.get('token')）のみ** を使用する
- 個人の API トークン（`VITE_MONDAY_API_TOKEN`）は **ローカル開発専用** とし、本番では一切使用しない

### 7-2. トークン取得関数（getToken）の方針

#### 環境判定のルール

- `import.meta.env.DEV === true` のとき → **開発環境**
- `import.meta.env.PROD === true` のとき → **本番環境**

#### 開発環境（DEV）のトークン取得ルール

**優先順位**:
1. `import.meta.env.VITE_MONDAY_API_TOKEN` - 設定されていれば最優先で使用（ローカルでの動作確認・デバッグ用）
2. URL クエリパラメータ `sessionToken`
3. `monday.get("token")`

※ 開発環境では、`VITE_MONDAY_API_TOKEN` が存在しない場合でも、`sessionToken` / `monday.get('token')` で動作するようにする

#### 本番環境（PROD）のトークン取得ルール

**必須ルール**:
- 個人トークン・envトークンは一切使用しない

**取得順序**:
1. URL クエリパラメータ `sessionToken` をチェック
   - 存在する場合 → それをトークンとして使用
2. `monday.get("token")` を呼び出す
   - `res.data` にトークンがある場合 → 使用
3. 上記どちらでも取得できない場合 → **エラーとして扱う**

**エラー時の方針**:
- `getToken()` 内で **例外（throw Error）** を投げる
- 上位の呼び出し側で `try/catch` し、ユーザーに「認証エラーです。アプリを開き直してください」などのエラーメッセージを表示する
- コンソールログにはエラー内容のみを出し、**トークン値そのものは絶対に出力しない**

### 7-3. 環境変数・.env ファイルの運用方針

#### 使用する環境変数

- **`VITE_MONDAY_API_TOKEN`**
  - ローカル開発専用の個人 API トークン
  - `import.meta.env.DEV` のときのみ参照してよい

- **`VITE_MONDAY_BOARD_ID`**
  - 開発中のデフォルトボードID（存在する場合のみ使用）
  - 本番では、できるだけ context から取得したボードIDを優先する

#### .env ファイル運用

- `VITE_MONDAY_API_TOKEN` は `.env.local` にのみ定義する
- `.env.local` は **必ず `.gitignore` に追加し、Git にコミットしない**
- 本番用の `.env.production`（または Vercel/Netlify の環境変数）には、`VITE_MONDAY_API_TOKEN` を設定しない（空のまま or 未定義）

### 7-4. ログ・エラーハンドリングポリシー

#### ログ出力

**禁止事項**:
- トークンの「値」はログに出力しない

**許可されるログメッセージ例**:
- `[BoardSDK] Using DEV env token`
- `[BoardSDK] Using sessionToken from URL`
- `[BoardSDK] Using token from monday.get("token")`
- `[BoardSDK] Failed to obtain token`

#### エラーハンドリング

- `getToken()` がトークンを取得できなかった場合は `Error` を throw する
- エラーは呼び出し側で `try/catch` し、ユーザーにわかりやすいUIを表示する
  - 例：赤いアラートボックスで「認証に失敗しました。monday からアプリを開き直してください。」と表示
- エラー UI には、トークン値や内部的なスタックトレースは表示しない

### 7-5. スコープ（権限）ポリシー

✅ **決定済み方針**:

InvoiceStudio v1 では、**読み取り専用スコープのみ**を使用する。

**必要なスコープ**:
- `boards:read` - ボードデータの読み取り
- `items:read` - アイテムデータの読み取り
- `subitems:read` - サブアイテムデータの読み取り

**使用しないスコープ**:
- 書き込み系スコープ（`boards:write`, `items:write` 等）は付与しない

認証方式（`sessionToken` / `monday.get('token')`）は、これらのスコープが有効になっている前提で動作する。

### 7-6. データ保存ポリシー

✅ **決定済み方針**:

- InvoiceStudio は **当社サーバーを持たない**
- Monday.com のデータは、`monday.api()` を使い、ユーザーのブラウザ上でのみ読み取り・処理する

**永続的に保存するデータ**（ユーザーのブラウザの `localStorage` のみ）:
- フィールドマッピング設定 (`invoiceFieldMappings`)
- テンプレート（会社情報・口座情報等）(`invoiceTemplates`)

**保存しないデータ**:
- 当社側で用意するサーバー / DB に、トークン・請求書内容・個人情報を保存しない

### 7-7. 方針変更時のルール

将来、バックエンドや書き込み機能を追加する場合は：

1. **認証ポリシー**（`getToken`の仕様）と、トークンの保存方法（サーバー側で保持の有無）を再設計する
2. **スコープ（権限）**を再検討し、必要な書き込みスコープを最小限追加する
3. **プライバシーポリシー・利用規約・Security & Compliance** の内容を更新する

---

## 結論

現状、InvoiceStudioは**開発段階**にあり、マーケットプレイス公開に向けた準備は**ほぼ未着手**の状態です。

特に**認証・セキュリティ・法務面**の対応が必須であり、これらを完了しないとマーケットプレイス審査を通過できません。

まずは**高優先度**の項目から順番に対応していくことを推奨します。

---

## 参考情報

### Monday.com関連
- Monday.com Apps Framework: https://developer.monday.com/apps/docs/introduction-to-the-apps-framework
- App review checklist: Monday Developer Center内で確認
- Security & Compliance: Monday Developer Center内で設定

### ホスティング・インフラ
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- GitHub Pages: https://pages.github.com
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Let's Encrypt (SSL証明書): https://letsencrypt.org

### セキュリティ
- OWASP Top 10: https://owasp.org/www-project-top-ten
- Security Headers: https://securityheaders.com
- SSL Labs (SSL/TLS テスト): https://www.ssllabs.com/ssltest

### CI/CD
- GitHub Actions: https://docs.github.com/actions
- GitLab CI/CD: https://docs.gitlab.com/ee/ci

---

**最終更新**: 2024年（確認日時を記録してください）

