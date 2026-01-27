/**
 * Express 用 monday.com エラーレスポンスミドルウェア
 * @see https://developer.monday.com/apps/docs/error-handling
 *
 * MondayError を catch し、monday が期待する JSON と HTTP ステータスで返します。
 * それ以外の Error は 500 として扱い、本番では詳細を伏せたメッセージにします。
 */

import { MondayError, SEVERITY_RECOVERABLE } from '../utils/mondayError.js';

/**
 * monday 用エラーハンドリングミドルウェア
 * ルートの最後に app.use(mondayErrorHandler) として登録する。
 *
 * @param {Error} err - next(err) で渡されたエラー
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function mondayErrorHandler(err, req, res, next) {
  // 既にレスポンスを送っていたら何もしない
  if (res.headersSent) {
    return next(err);
  }

  // MondayError は monday 形式で返す（サイレントにしない）
  if (err instanceof MondayError) {
    const status = err.httpStatus ?? (err.severityCode === SEVERITY_RECOVERABLE ? 422 : 410);
    res.status(status).json(err.toMondayPayload());
    return;
  }

  // その他のエラーは 500。本番では runtime 詳細を出しすぎない
  const isProd = process.env.NODE_ENV === 'production';
  const runtimeDescription = isProd
    ? 'An unexpected error occurred. Please try again or contact support.'
    : (err.message || String(err));

  res.status(500).json({
    severityCode: 6000,
    notificationErrorTitle: 'InvoiceStudio Error',
    notificationErrorDescription:
      'Something went wrong on the server. Please try again later or contact support.',
    runtimeErrorDescription: runtimeDescription,
    disableErrorDescription:
      'The automation was disabled due to a server error. Re-enable after the issue is resolved.',
  });
}
