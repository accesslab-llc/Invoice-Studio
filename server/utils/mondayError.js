/**
 * monday.com 公式ドキュメント準拠のエラーハンドリングユーティリティ
 * @see https://developer.monday.com/apps/docs/error-handling
 *
 * InvoiceStudio の Automation / Action 呼び出し時に、
 * Marketplace 審査とユーザー体験を考慮した一貫したエラー応答を返すために使用します。
 */

// --- Severity codes (monday.com 公式) ---
/** 4000: 復旧可能 — ユーザーが設定・入力を直せば再実行できる */
export const SEVERITY_RECOVERABLE = 4000;

/** 6000: 復旧不可能 — 構成が壊れており今後も失敗し続ける */
export const SEVERITY_UNRECOVERABLE = 6000;

// --- HTTP status (monday が扱う 4xx/5xx) ---
/** 復旧可能エラー用の標準ステータス（入力・設定の誤り） */
export const HTTP_UNPROCESSABLE = 422;

/** 復旧不可能エラー用（リソースが恒久的に存在しない） */
export const HTTP_GONE = 410;

/** 認証・認可系 */
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;

/** 有料機能アクセス拒否（例: FreeプランでPDF出力） */
export const HTTP_PAYMENT_REQUIRED = 402;

/**
 * monday.com が期待する JSON ボディの型
 * @typedef {Object} MondayErrorPayload
 * @property {4000|6000} severityCode
 * @property {string} notificationErrorTitle - ユーザーへの通知タイトル（短く）
 * @property {string} notificationErrorDescription - ユーザー向け説明・対処案
 * @property {string} runtimeErrorDescription - Activity Log 用の詳細（ログ向け）
 * @property {string} [disableErrorDescription] - severity 6000 のみ。自動化無効化時の説明
 */

/**
 * Monday 用カスタムエラー
 * Express ミドルウェアが catch して適切な HTTP レスポンスに変換する。
 */
export class MondayError extends Error {
  /**
   * @param {Object} opts
   * @param {4000|6000} opts.severityCode
   * @param {string} opts.notificationErrorTitle
   * @param {string} opts.notificationErrorDescription
   * @param {string} opts.runtimeErrorDescription
   * @param {string} [opts.disableErrorDescription] - 6000 のとき必須推奨
   * @param {number} [opts.httpStatus] - 省略時は severity から算出
   */
  constructor({
    severityCode,
    notificationErrorTitle,
    notificationErrorDescription,
    runtimeErrorDescription,
    disableErrorDescription,
    httpStatus,
  }) {
    super(runtimeErrorDescription);
    this.name = 'MondayError';
    this.severityCode = severityCode;
    this.notificationErrorTitle = notificationErrorTitle;
    this.notificationErrorDescription = notificationErrorDescription;
    this.runtimeErrorDescription = runtimeErrorDescription;
    this.disableErrorDescription = disableErrorDescription;
    this.httpStatus =
      httpStatus ??
      (severityCode === SEVERITY_UNRECOVERABLE ? HTTP_GONE : HTTP_UNPROCESSABLE);
  }

  /**
   * monday が期待する JSON ボディを返す
   * @returns {MondayErrorPayload}
   */
  toMondayPayload() {
    const payload = {
      severityCode: this.severityCode,
      notificationErrorTitle: this.notificationErrorTitle,
      notificationErrorDescription: this.notificationErrorDescription,
      runtimeErrorDescription: this.runtimeErrorDescription,
    };
    if (this.severityCode === SEVERITY_UNRECOVERABLE && this.disableErrorDescription) {
      payload.disableErrorDescription = this.disableErrorDescription;
    }
    return payload;
  }
}

/**
 * 復旧可能エラーを投げるヘルパー（severity 4000）
 * 「ユーザーが設定や入力を直せば再実行できる」場合に使用。
 *
 * @param {Object} opts
 * @param {string} opts.notificationErrorTitle - 短いタイトル
 * @param {string} opts.notificationErrorDescription - 対処法が分かる説明
 * @param {string} [opts.runtimeErrorDescription] - 省略時は notificationErrorDescription を流用
 * @param {number} [opts.httpStatus=422]
 * @throws {MondayError}
 */
export function throwMondayRecoverable({
  notificationErrorTitle,
  notificationErrorDescription,
  runtimeErrorDescription,
  httpStatus = HTTP_UNPROCESSABLE,
}) {
  throw new MondayError({
    severityCode: SEVERITY_RECOVERABLE,
    notificationErrorTitle,
    notificationErrorDescription,
    runtimeErrorDescription: runtimeErrorDescription ?? notificationErrorDescription,
    httpStatus,
  });
}

/**
 * 復旧不可能エラーを投げるヘルパー（severity 6000）
 * 「今後も必ず失敗する構成」のときに使用。monday は自動化を無効化する。
 *
 * @param {Object} opts
 * @param {string} opts.notificationErrorTitle
 * @param {string} opts.notificationErrorDescription
 * @param {string} opts.disableErrorDescription - 自動化無効化時に表示する文
 * @param {string} [opts.runtimeErrorDescription]
 * @param {number} [opts.httpStatus=410]
 * @throws {MondayError}
 */
export function throwMondayUnrecoverable({
  notificationErrorTitle,
  notificationErrorDescription,
  disableErrorDescription,
  runtimeErrorDescription,
  httpStatus = HTTP_GONE,
}) {
  throw new MondayError({
    severityCode: SEVERITY_UNRECOVERABLE,
    notificationErrorTitle,
    notificationErrorDescription,
    runtimeErrorDescription: runtimeErrorDescription ?? notificationErrorDescription,
    disableErrorDescription,
    httpStatus,
  });
}

/**
 * 汎用ヘルパー。severity を明示的に指定する場合に使用。
 * 通常は throwMondayRecoverable / throwMondayUnrecoverable を推奨。
 *
 * @param {4000|6000} severityCode
 * @param {Object} opts
 * @param {string} opts.notificationErrorTitle
 * @param {string} opts.notificationErrorDescription
 * @param {string} [opts.runtimeErrorDescription]
 * @param {string} [opts.disableErrorDescription] - 6000 のとき推奨
 * @param {number} [opts.httpStatus]
 * @throws {MondayError}
 */
export function throwMondayError(severityCode, opts) {
  const runtime =
    opts.runtimeErrorDescription ?? opts.notificationErrorDescription;
  const payload = {
    severityCode,
    notificationErrorTitle: opts.notificationErrorTitle,
    notificationErrorDescription: opts.notificationErrorDescription,
    runtimeErrorDescription: runtime,
    httpStatus: opts.httpStatus,
  };
  if (severityCode === SEVERITY_UNRECOVERABLE && opts.disableErrorDescription) {
    payload.disableErrorDescription = opts.disableErrorDescription;
  }
  throw new MondayError(payload);
}
