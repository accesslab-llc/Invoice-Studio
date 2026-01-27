/**
 * AMP イベント履歴から「現在のプラン状態」を導出するサービス
 *
 * 単純に「最新イベントだけ見る」のではなく、業務ルールに沿った状態機械で判定する。
 * これにより、トライアル→有料→解約などの遷移を正しく反映できる。
 *
 * プラン種別が増えても（例: Business / Enterprise）、
 * 判定ルールを定数・テーブルで持つ構成にすることでロジックの書き換えを抑える。
 */

import { AMP_EVENT_TYPES } from './ampBoard.js';

/** InvoiceStudio が扱うプラン状態。将来追加してもここに列挙するだけにできる */
export const PLAN_STATUS = Object.freeze({
  FREE: 'free',
  TRIAL: 'trial',
  PAID: 'paid',
  CANCELLED: 'cancelled',
});

/**
 * イベント履歴を「作成日時昇順」でソートし、
 * 時系列に沿って最終的なプラン状態を導出する。
 *
 * 判定ルール（InvoiceStudio）:
 * - free: トライアル未開始、またはトライアル終了後（subscription もない）
 * - trial: trial_started があり、subscription_started がまだない
 * - paid: subscription_started が有効（その後に subscription_cancelled がなければ paid）
 * - cancelled: subscription_cancelled 後
 *
 * イベントの解釈:
 * - app_installed: インストールのみ。単体では free のまま。
 * - trial_started: トライアル開始 → trial。subscription_started がまだなければ trial 継続。
 * - trial_ended: （将来追加可）トライアル終了 → subscription がなければ free。
 * - subscription_started: 有料開始 → paid。
 * - subscription_cancelled: 解約 → cancelled。以降は paid に戻らない。
 * - app_uninstalled: （必要なら）アンインストール後は参照しない前提でここでは状態を変えない。
 *
 * @param {Array<{ accountId: string, eventType: string, createdAt: string }>} events - 当該 account のイベント（昇順推奨）
 * @returns {'free'|'trial'|'paid'|'cancelled'}
 */
export function derivePlanFromEvents(events) {
  const sorted = [...(events ?? [])].sort(
    (a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')
  );

  let status = PLAN_STATUS.FREE;

  for (const ev of sorted) {
    switch (ev.eventType) {
      case AMP_EVENT_TYPES.APP_INSTALLED:
        // インストールだけでは free のまま（既に trial/paid なら変えない）
        if (status === PLAN_STATUS.FREE) status = PLAN_STATUS.FREE;
        break;
      case AMP_EVENT_TYPES.TRIAL_STARTED:
        if (status !== PLAN_STATUS.PAID && status !== PLAN_STATUS.CANCELLED) {
          status = PLAN_STATUS.TRIAL;
        }
        break;
      case AMP_EVENT_TYPES.TRIAL_ENDED:
        // トライアル終了。有料未契約なら free
        if (status === PLAN_STATUS.TRIAL) {
          status = PLAN_STATUS.FREE;
        }
        break;
      case AMP_EVENT_TYPES.SUBSCRIPTION_STARTED:
        status = PLAN_STATUS.PAID;
        break;
      case AMP_EVENT_TYPES.SUBSCRIPTION_CANCELLED:
        if (status === PLAN_STATUS.PAID) {
          status = PLAN_STATUS.CANCELLED;
        }
        break;
      case AMP_EVENT_TYPES.APP_UNINSTALLED:
        // 必要に応じて「無効」扱いにする。ここでは状態は変えない（履歴は残る前提）
        break;
      default:
        break;
    }
  }

  return status;
}

/**
 * アカウントごとのイベント一覧を、accountId でグループ化する。
 *
 * @param {Array<{ accountId: string, eventType: string, createdAt: string }>} events
 * @returns {Map<string, Array<{ accountId: string, eventType: string, createdAt: string }>>}
 */
function groupEventsByAccount(events) {
  const byAccount = new Map();
  for (const ev of events ?? []) {
    const key = String(ev.accountId ?? '').trim();
    if (!key) continue;
    const list = byAccount.get(key) ?? [];
    list.push(ev);
    byAccount.set(key, list);
  }
  return byAccount;
}

/**
 * 指定アカウントの現在のプラン状態を返す。
 * AMP が未設定の場合は fallback の結果を使う（開発用モックや「free 扱い」など）。
 *
 * @param {Object} deps
 * @param {Array<{ accountId: string, eventType: string, createdAt: string }>} deps.events - 当該 account を含むイベント一覧（fetchAmpEvents の戻りなど）
 * @param {string} deps.accountId - monday account_id
 * @param {{ plan?: 'free'|'trial'|'paid'|'cancelled' }} [deps.fallback] - AMP 未設定時のフォールバック（例: { plan: 'free' }）
 * @returns {'free'|'trial'|'paid'|'cancelled'}
 */
export function getAccountPlanStatus(deps) {
  const { events, accountId, fallback } = deps;
  const byAccount = groupEventsByAccount(events);
  const accountEvents = byAccount.get(String(accountId ?? '').trim()) ?? [];

  if (accountEvents.length === 0 && fallback?.plan) {
    return fallback.plan;
  }

  return derivePlanFromEvents(accountEvents);
}

/**
 * 有料プラン（課金中）かどうか。
 *
 * @param {Object} deps - getAccountPlanStatus と同様
 * @returns {boolean}
 */
export function isPaidPlan(deps) {
  return getAccountPlanStatus(deps) === PLAN_STATUS.PAID;
}

/**
 * PDF エクスポートが許可されているか。
 * - paid / trial: 許可
 * - free: 回数制限あり（呼び出し側で usedCount < 5 をチェック）
 * - cancelled: 不許可（または「期限まで許可」などに拡張可能）
 *
 * @param {Object} deps - getAccountPlanStatus と同様
 * @returns {{ allowed: boolean, limit?: number }}
 */
export function canExportPdf(deps) {
  const plan = getAccountPlanStatus(deps);
  if (plan === PLAN_STATUS.PAID || plan === PLAN_STATUS.TRIAL) {
    return { allowed: true };
  }
  if (plan === PLAN_STATUS.FREE) {
    return { allowed: true, limit: 5 };
  }
  // cancelled
  return { allowed: false };
}
