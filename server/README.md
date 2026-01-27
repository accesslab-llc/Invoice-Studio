# InvoiceStudio — バックエンド（monday.com エラー処理・AMP プラン管理）

monday の Automation / Action から呼ばれる Node.js + Express サーバー向けに、  
[公式エラーハンドリング](https://developer.monday.com/apps/docs/error-handling) に沿ったユーティリティとミドルウェア、  
および **AMP（App Management Product）を正の情報源とするプラン・アカウント管理** を置いています。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `config/ampConfig.js` | AMP 用設定オブジェクト。boardId / columnId は環境変数から後差し。ID 未確定でもロジック開発可能 |
| `services/ampBoard.js` | AMP 管理ボード取得用 GraphQL クエリ組み立て・イベント取得。設定値参照で将来カラム追加に耐える |
| `services/planStatus.js` | イベント履歴から free / trial / paid / cancelled を導出。getAccountPlanStatus, isPaidPlan, canExportPdf |
| `services/accountPlan.js` | AMP 連携のファサード。AMP 未設定時はモック（MOCK_AMP_PRESET）で開発・テスト可能 |
| `utils/mondayError.js` | severity 4000/6000 の定数、`MondayError` クラス、`throwMondayRecoverable` / `throwMondayUnrecoverable` |
| `middleware/mondayErrorHandler.js` | Express エラーミドルウェア。`MondayError` を monday 形式の JSON に変換して返す |
| `routes/invoiceAction.js` | PDF 生成ルート。accountId ありのとき AMP でプラン判定、なしのとき従来の planType で後方互換 |
| `routes/planExample.js` | AMP プラン判定の Express 使用例（/plan/status, /plan/can-export-pdf, /plan/guard-pdf, /plan/is-paid） |
| `app.js` | AMP 設定・runQuery の注入、ルート・ミドルウェアの組み合わせ |

## severity の使い分け

- **4000（復旧可能）**  
  ユーザーが設定や入力を直せば再実行できるもの。  
  例: 無料プランで PDF ダウンロードが 5 回を超えた、不正な入力  
  → 自動化は止まらず、ユーザーが修正（有料プラン等）後に再実行できる想定。

- **6000（復旧不可能）**  
  構成が壊れており、直さない限り毎回失敗するもの。  
  例: 参照ボード・グループが削除されている  
  → monday は自動化を無効化し、`disableErrorDescription` を表示する。

※ 請求書フィールドは空欄可・手入力可で、空欄はレイアウトで詰めるため「必須カラム不足」ではエラーにしない。

## monday が期待する JSON

- **4000**  
  `severityCode`, `notificationErrorTitle`, `notificationErrorDescription`, `runtimeErrorDescription`

- **6000**  
 上記に加え `disableErrorDescription` を含める。

HTTP は 4xx/5xx のいずれかにする（例: 422, 410, 402）。

## ルートでの使い方

```js
import { throwMondayRecoverable, throwMondayUnrecoverable } from '../utils/mondayError.js';

// 復旧可能（例: 無料プランで PDF が 5 回を超えた）
const usedCount = await getFreePlanPdfDownloadCount(req); // 回数取得は後で実装
if (planType === 'free' && action === 'download_pdf' && usedCount >= 5) {
  throwMondayRecoverable({
    notificationErrorTitle: 'Free plan PDF limit reached',
    notificationErrorDescription: 'You have used your 5 free PDF downloads. Upgrade or use preview only.',
    runtimeErrorDescription: `used=${usedCount}, limit=5`,
    httpStatus: 402,
  });
}

// 復旧不可能（例: ボード削除済み）
if (!(await boardExists(boardId))) {
  throwMondayUnrecoverable({
    notificationErrorTitle: 'Board not found',
    notificationErrorDescription: 'Update the automation to use a valid board.',
    disableErrorDescription: 'Automation disabled: linked board no longer exists.',
    runtimeErrorDescription: `boardId=${boardId} not found`,
  });
}
```

投げたエラーは `next(err)` でエラーハンドラに渡し、`mondayErrorHandler` がレスポンスに変換します。

## アプリへの組み込み

```js
import { mondayErrorHandler } from './middleware/mondayErrorHandler.js';
import invoiceActionRoutes from './routes/invoiceAction.js';

const app = express();
app.use(express.json());
app.use('/invoice', invoiceActionRoutes);
// ルートの「後」に登録
app.use(mondayErrorHandler);
```

エラーはサイレントに握りつぶさず、必ず monday 形式で返すようにしています。

---

## AMP を正の情報源とするプラン管理

### なぜ AMP を正の情報源にするか

monday.com Marketplace では、アプリのプラン・課金・インストール状態は **AMP が管理**します。  
AMP が生成する「管理ボード」に、`app_installed` / `trial_started` / `subscription_started` 等のイベントが記録されるため、ここを正の情報源にすることで、

- 課金状態の一元管理
- Marketplace 審査時の説明可能性
- 二重管理の排除

を満たします。

### なぜ boardId / columnId を後差し設計にするか

AMP 管理ボードは **Marketplace 公開時または AMP 初期化時に初めて作成**され、その時点で boardId と各カラムの columnId が確定します。現時点ではボードが存在しないため、コードに ID を直書きせず、**環境変数または起動時の設定オブジェクトから注入**できるようにしています。これにより、ID 確定前でもロジック開発・単体テスト・モック検証が可能になります。

### 環境変数（AMP 用）

| 変数名 | 説明 |
|--------|------|
| `AMP_BOARD_ID` | AMP 管理ボードのボード ID |
| `AMP_ACCOUNT_COLUMN_ID` | アカウント ID（account_id）を格納するカラム ID |
| `AMP_EVENT_TYPE_COLUMN_ID` | イベント種別（app_installed, trial_started 等）を格納するカラム ID |
| `AMP_CREATED_AT_COLUMN_ID` | イベント発生日時を格納するカラム ID |
| `AMP_PLAN_COLUMN_ID` | （任意）プラン名カラム ID |
| `MOCK_AMP_PRESET` | AMP 未設定時の開発用モック。`free` / `trial` / `paid` / `cancelled` で切り替え |

### プラン判定ルール（InvoiceStudio）

- **free**: トライアル未開始、またはトライアル終了後（subscription なし）
- **trial**: `trial_started` があり、`subscription_started` がまだない
- **paid**: `subscription_started` が有効（その後 `subscription_cancelled` なし）
- **cancelled**: `subscription_cancelled` 後

イベント履歴を「作成日時昇順」で並べ、上記ルールで状態機械的に導出します。

### AMP 未設定時の開発用モック

`config` に boardId 等が未設定のとき、`fallback.useMock: true` で開発用モックを使います。  
`MOCK_AMP_PRESET=paid` などで free / trial / paid / cancelled を切り替えて、PDF 制限やプラン表示の動作確認ができます。

### GraphQL クエリ例（AMP ボード取得）

`services/ampBoard.js` の `buildAmpEventsQuery(config)` が生成するクエリのイメージ。  
boardId と columnIds は設定オブジェクトから参照するため、ID 確定後に環境変数を設定すればそのまま利用できる。

```graphql
query GetAmpEvents($boardId: ID!, $limit: Int) {
  boards(ids: [$boardId]) {
    id
    items_page(limit: $limit) {
      items {
        id
        column_values(ids: ["<AMP_ACCOUNT_COLUMN_ID>", "<AMP_EVENT_TYPE_COLUMN_ID>", "<AMP_CREATED_AT_COLUMN_ID>"]) {
          id
          value
          type
        }
      }
      cursor
    }
  }
}
```

変数例: `{ "boardId": "<AMP_BOARD_ID>", "limit": 5000 }`  
取得した items を `mapItemsToEvents(items, config.columns)` で `{ accountId, eventType, createdAt }[]` に変換し、`derivePlanFromEvents(events)` でプラン状態を導出する。
