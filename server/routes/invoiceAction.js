/**
 * InvoiceStudio — Automation / Action 用ルート例
 *
 * monday の Custom Action Run URL から呼ばれる想定。
 * エラーは throwMondayRecoverable / throwMondayUnrecoverable で投げ、
 * mondayErrorHandler が monday 形式の JSON に変換して返します。
 *
 * プラン判定は AMP（App Management Product）を正の情報源とする。
 * accountId が渡されているときは getAccountPlanStatus / canExportPdf で AMP を参照する。
 */

import { Router } from 'express';
import { isAmpConfigured } from '../config/ampConfig.js';
import { canExportPdf } from '../services/accountPlan.js';
import {
  throwMondayRecoverable,
  throwMondayUnrecoverable,
  HTTP_PAYMENT_REQUIRED,
} from '../utils/mondayError.js';

const router = Router();

/**
 * 例: PDF 生成 / 請求書ダウンロード用アクション
 * POST /invoice/generate 想定（payload に boardId, itemId, groupId, accountId 等が入る）
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { boardId, itemId, groupId, accountId, payload } = req.body ?? {};
    const ampConfig = req.app.get('ampConfig');
    const runQuery = req.app.get('runQuery');

    // ------ severity 4000: AMP ベースで PDF 可否・無料回数制限を判定 ------
    // accountId がある場合は AMP（またはモック）でプランと PDF ポリシーを取得する。
    if (payload?.action === 'download_pdf' && accountId) {
      const deps = {
        accountId: String(accountId),
        config: ampConfig,
        runQuery: runQuery ?? (() => Promise.resolve({ data: {} })),
        fallback: {
          useMock: !isAmpConfigured(ampConfig),
          plan: 'free',
        },
      };

      const pdfPolicy = await canExportPdf(deps);
      if (!pdfPolicy.allowed) {
        throwMondayRecoverable({
          notificationErrorTitle: 'PDF export not available',
          notificationErrorDescription:
            'Your plan does not allow PDF export. Please upgrade or reactivate your subscription.',
          runtimeErrorDescription: `InvoiceStudio: PDF not allowed for account ${accountId}`,
          httpStatus: HTTP_PAYMENT_REQUIRED,
        });
      }

      if (pdfPolicy.limit != null) {
        const usedCount = await getFreePlanPdfDownloadCount(req);
        if (usedCount >= pdfPolicy.limit) {
          throwMondayRecoverable({
            notificationErrorTitle: 'Free plan PDF limit reached',
            notificationErrorDescription:
              `You have used your ${pdfPolicy.limit} free PDF downloads. Upgrade to a paid plan to download more PDFs, or use preview only.`,
            runtimeErrorDescription: `InvoiceStudio: Free-plan PDF limit exceeded. used=${usedCount}, limit=${pdfPolicy.limit}`,
            httpStatus: HTTP_PAYMENT_REQUIRED,
          });
        }
      }
    }

    // 後方互換: accountId がなく planType で渡されている場合は従来どおり判定
    if (payload?.action === 'download_pdf' && !accountId) {
      const planType = req.body?.planType ?? 'free';
      if (planType === 'free') {
        const usedCount = await getFreePlanPdfDownloadCount(req);
        const freeLimit = 5;
        if (usedCount >= freeLimit) {
          throwMondayRecoverable({
            notificationErrorTitle: 'Free plan PDF limit reached',
            notificationErrorDescription:
              `You have used your ${freeLimit} free PDF downloads. Upgrade to a paid plan to download more PDFs, or use preview only.`,
            runtimeErrorDescription: `InvoiceStudio: Free-plan PDF limit exceeded. used=${usedCount}, limit=${freeLimit}`,
            httpStatus: HTTP_PAYMENT_REQUIRED,
          });
        }
      }
    }

    // ------ severity 6000: 指定ボードが存在しない ------
    // 参照先が削除されているなど、設定を直さないと今後も必ず失敗するため復旧不可能。
    const boardExists = await checkBoardExists(boardId);
    if (!boardExists) {
      throwMondayUnrecoverable({
        notificationErrorTitle: 'Board not found',
        notificationErrorDescription:
          'The board used by this automation no longer exists or you don\'t have access to it. Please update the automation to use a valid board.',
        disableErrorDescription:
          'The automation was disabled because the linked board no longer exists or is inaccessible. Update the automation and choose a valid board, then re-enable.',
        runtimeErrorDescription: `InvoiceStudio: Board not found or inaccessible. boardId=${boardId}`,
      });
    }

    // ------ severity 6000: 指定グループが存在しない ------
    // グループ削除などで恒久的に参照できない場合も復旧不可能。
    const groupExists = await checkGroupExists(boardId, groupId);
    if (!groupExists) {
      throwMondayUnrecoverable({
        notificationErrorTitle: 'Group not found',
        notificationErrorDescription:
          'The group used by this automation was deleted or is invalid. Please update the automation to use an existing group on the board.',
        disableErrorDescription:
          'The automation was disabled because the target group no longer exists. Update the automation to select a valid group, then re-enable.',
        runtimeErrorDescription: `InvoiceStudio: Group not found. boardId=${boardId}, groupId=${groupId}`,
      });
    }

    // 請求書フィールドは空欄可・手入力可で、空欄はレイアウトで詰めて表示するため、
    // 「必須カラム不足」でエラーにはしない。

    // 以降は実際の PDF 生成処理…
    res.status(200).json({ success: true, message: 'Invoice generated' });
  } catch (err) {
    // MondayError はそのまま next に渡す（mondayErrorHandler が JSON に変換）
    next(err);
  }
});

/**
 * ダミー: ボード存在チェック（実装時は monday GraphQL 等で取得）
 */
async function checkBoardExists(boardId) {
  return Boolean(boardId);
}

/**
 * ダミー: グループ存在チェック（実装時は monday API で取得）
 */
async function checkGroupExists(boardId, groupId) {
  return Boolean(boardId && groupId);
}

/**
 * 無料プランでの PDF ダウンロード使用回数を返す。後で実装。
 * @param {import('express').Request} req - accountId / userId 等は req から取得する想定
 * @returns {Promise<number>}
 */
async function getFreePlanPdfDownloadCount(req) {
  // TODO: 実装（例: DB または monday のアカウント単位でカウントし、期間でリセット）
  return 0;
}

export default router;
