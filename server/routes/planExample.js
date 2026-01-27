/**
 * AMP を正の情報源とした「プラン・アカウント判定」の Express 使用例
 *
 * ルート内で getAccountPlanStatus / isPaidPlan / canExportPdf をどう使うかを示す。
 * 本番では runQuery に monday GraphQL API クライアントを注入し、
 * config は getAmpConfigFromEnv() または起動時に読み込んだ設定を渡す。
 */

import { Router } from 'express';
import { getAmpConfigFromEnv, isAmpConfigured } from '../config/ampConfig.js';
import {
  getAccountPlanStatus,
  isPaidPlan,
  canExportPdf,
} from '../services/accountPlan.js';
import { throwMondayRecoverable, HTTP_PAYMENT_REQUIRED } from '../utils/mondayError.js';

const router = Router();

// 設定はアプリ起動時に注入する想定。ここでは env から取得する例。
const AMP_CONFIG = getAmpConfigFromEnv();

// runQuery は本番では monday GraphQL API を呼ぶ関数に差し替える。
// AMP 未設定時はモックで動作確認するため、空のデータを返すダミーでよい。
async function runQuery(query, variables) {
  if (!isAmpConfigured(AMP_CONFIG)) {
    return { data: {} };
  }
  // 本番例: return await mondayApiClient.request(query, variables);
  return { data: {} };
}

/**
 * 使用例 1: アカウントの現在プランを返す
 * GET /plan/status?accountId=12345 または body で accountId を渡す。
 *
 * AMP が未設定のときは fallback.useMock で開発用モックを用い、
 * MOCK_AMP_PRESET=paid などで trial/paid/cancelled を切り替えて検証できる。
 */
router.get('/status', async (req, res, next) => {
  try {
    const accountId = req.query.accountId ?? req.body?.accountId ?? req.headers['x-account-id'];
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    // AMP が未設定のときは useMock: true で開発用モックを使う。
    // 本番では AMP 設定を入れ、fallback は useMock: false または省略する。
    const plan = await getAccountPlanStatus({
      accountId: String(accountId),
      config: AMP_CONFIG,
      runQuery,
      fallback: {
        useMock: !isAmpConfigured(AMP_CONFIG),
        plan: 'free',
        preset: process.env.MOCK_AMP_PRESET,
      },
    });

    res.status(200).json({ accountId, plan });
  } catch (err) {
    next(err);
  }
});

/**
 * 使用例 2: PDF エクスポート可否の判定を AMP ベースで行う
 * POST /plan/can-export-pdf { "accountId": "12345" }
 *
 * 戻り: { allowed: boolean, limit?: number, plan: string }
 * - paid / trial: allowed=true, limit なし
 * - free: allowed=true, limit=5（呼び出し側で usedCount < limit をチェック）
 * - cancelled: allowed=false
 */
router.post('/can-export-pdf', async (req, res, next) => {
  try {
    const accountId = req.body?.accountId ?? req.headers['x-account-id'];
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const deps = {
      accountId: String(accountId),
      config: AMP_CONFIG,
      runQuery,
      fallback: {
        useMock: !isAmpConfigured(AMP_CONFIG),
        plan: 'free',
        preset: process.env.MOCK_AMP_PRESET,
      },
    };

    const result = await canExportPdf(deps);
    const plan = await getAccountPlanStatus(deps);

    res.status(200).json({
      allowed: result.allowed,
      limit: result.limit,
      plan,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 使用例 3: PDF 生成前に「プラン＋回数」でガードする
 * POST /plan/guard-pdf { "accountId": "12345", "usedCount": 3 }
 *
 * 許可なら 200、制限超過なら monday 形式の 402 を返す。
 */
router.post('/guard-pdf', async (req, res, next) => {
  try {
    const accountId = req.body?.accountId ?? req.headers['x-account-id'];
    const usedCount = Number(req.body?.usedCount ?? 0);

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const deps = {
      accountId: String(accountId),
      config: AMP_CONFIG,
      runQuery,
      fallback: {
        useMock: !isAmpConfigured(AMP_CONFIG),
        plan: 'free',
        preset: process.env.MOCK_AMP_PRESET,
      },
    };

    const pdfPolicy = await canExportPdf(deps);

    if (!pdfPolicy.allowed) {
      // cancelled 等で PDF 不可
      throwMondayRecoverable({
        notificationErrorTitle: 'PDF export not available',
        notificationErrorDescription:
          'Your plan does not allow PDF export. Please upgrade or reactivate your subscription.',
        runtimeErrorDescription: `InvoiceStudio: PDF not allowed for account ${accountId}`,
        httpStatus: HTTP_PAYMENT_REQUIRED,
      });
    }

    if (pdfPolicy.limit != null && usedCount >= pdfPolicy.limit) {
      // 無料プランの 5 回超過
      throwMondayRecoverable({
        notificationErrorTitle: 'Free plan PDF limit reached',
        notificationErrorDescription:
          `You have used your ${pdfPolicy.limit} free PDF downloads. Upgrade to a paid plan to download more PDFs, or use preview only.`,
        runtimeErrorDescription: `InvoiceStudio: Free-plan PDF limit exceeded. used=${usedCount}, limit=${pdfPolicy.limit}`,
        httpStatus: HTTP_PAYMENT_REQUIRED,
      });
    }

    res.status(200).json({ allowed: true });
  } catch (err) {
    next(err);
  }
});

/**
 * 使用例 4: isPaidPlan の利用
 * GET /plan/is-paid?accountId=12345
 * 有料プラン（課金中）かどうかだけを返す。
 */
router.get('/is-paid', async (req, res, next) => {
  try {
    const accountId = req.query.accountId ?? req.body?.accountId ?? req.headers['x-account-id'];
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const paid = await isPaidPlan({
      accountId: String(accountId),
      config: AMP_CONFIG,
      runQuery,
      fallback: {
        useMock: !isAmpConfigured(AMP_CONFIG),
        plan: 'free',
        preset: process.env.MOCK_AMP_PRESET,
      },
    });

    res.status(200).json({ accountId, paid });
  } catch (err) {
    next(err);
  }
});

export default router;
