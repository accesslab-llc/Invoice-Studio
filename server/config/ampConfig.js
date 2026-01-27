/**
 * AMP（App Management Product）用設定オブジェクト
 *
 * 【なぜ AMP を正の情報源とするか】
 * monday.com Marketplace では、アプリのプラン・課金・インストール状態は AMP が管理します。
 * AMP が生成する「管理ボード」に、app_installed / trial_started / subscription_started 等の
 * イベントが記録されるため、ここを正の情報源にすることで、
 * - 課金状態の一元管理
 * - Marketplace 審査時の説明可能性
 * - 二重管理の排除
 * を満たします。
 *
 * 【なぜ boardId / columnId を後差し設計にするか】
 * AMP 管理ボードは Marketplace 公開時または AMP 初期化時に初めて作成され、
 * その時点で初めて boardId / 各カラムの columnId が確定します。
 * 現時点ではボードが存在しないため、コードに ID を直書きせず、
 * 環境変数または起動時の設定オブジェクトから注入できるようにしています。
 * これにより、ID 確定前でもロジック開発・単体テスト・モック検証が可能になります。
 */

/**
 * 環境変数から AMP 設定を組み立てる。
 * 未設定の項目は undefined のままにし、呼び出し側で「AMP 未設定」と判断できるようにする。
 *
 * @returns {AmpConfig}
 */
export function getAmpConfigFromEnv() {
  return {
    boardId: process.env.AMP_BOARD_ID ?? undefined,
    columns: {
      accountId: process.env.AMP_ACCOUNT_COLUMN_ID ?? undefined,
      eventType: process.env.AMP_EVENT_TYPE_COLUMN_ID ?? undefined,
      plan: process.env.AMP_PLAN_COLUMN_ID ?? undefined,
      createdAt: process.env.AMP_CREATED_AT_COLUMN_ID ?? undefined,
    },
  };
}

/**
 * 設定オブジェクトを渡して上書きする（テスト・差し替え用）。
 *
 * @param {Partial<AmpConfig>} overrides
 * @returns {(base?: AmpConfig) => AmpConfig}
 */
export function createAmpConfig(overrides = {}) {
  return (base) => ({
    ...(base ?? getAmpConfigFromEnv()),
    ...overrides,
    columns: {
      ...(base?.columns ?? getAmpConfigFromEnv().columns),
      ...overrides.columns,
    },
  });
}

/**
 * AMP が利用可能か（boardId と必須カラムがすべて設定されているか）
 *
 * @param {AmpConfig} config
 * @returns {boolean}
 */
export function isAmpConfigured(config) {
  const c = config?.columns;
  return Boolean(
    config?.boardId &&
      c?.accountId &&
      c?.eventType &&
      c?.createdAt
  );
}

/**
 * @typedef {Object} AmpConfig
 * @property {string | undefined} boardId - AMP 管理ボードのボード ID
 * @property {AmpColumnIds} columns - カラム ID のマップ（将来カラムが増えてもここに追加するだけにできる）
 */

/**
 * @typedef {Object} AmpColumnIds
 * @property {string | undefined} accountId - アカウント ID（monday account_id）を格納するカラム
 * @property {string | undefined} eventType - イベント種別（app_installed, trial_started 等）を格納するカラム
 * @property {string | undefined} [plan] - プラン名（任意。イベント履歴から導出する場合は未使用可）
 * @property {string | undefined} createdAt - イベント発生日時を格納するカラム
 */
