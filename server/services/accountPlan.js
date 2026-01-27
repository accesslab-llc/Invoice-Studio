/**
 * AMP を正の情報源とする「アカウント・プラン」判定のファサード
 *
 * getAccountPlanStatus / isPaidPlan / canExportPdf を、
 * AMP ボード取得・イベント履歴の導出と組み合わせて提供する。
 * AMP 未設定時はモックまたは fallback で開発・テスト可能にしている。
 */

import { isAmpConfigured } from '../config/ampConfig.js';
import { fetchAmpEvents } from './ampBoard.js';
import {
  getAccountPlanStatus as deriveStatus,
  isPaidPlan as deriveIsPaid,
  canExportPdf as deriveCanExportPdf,
  PLAN_STATUS,
} from './planStatus.js';

/** 開発用モック：AMP 未設定時に返すイベント例（free / trial / paid の検証用） */
const MOCK_EVENTS_BY_PRESET = Object.freeze({
  free: [
    { accountId: 'mock-account', eventType: 'app_installed', createdAt: '2024-01-01T00:00:00Z' },
  ],
  trial: [
    { accountId: 'mock-account', eventType: 'app_installed', createdAt: '2024-01-01T00:00:00Z' },
    { accountId: 'mock-account', eventType: 'trial_started', createdAt: '2024-01-02T00:00:00Z' },
  ],
  paid: [
    { accountId: 'mock-account', eventType: 'app_installed', createdAt: '2024-01-01T00:00:00Z' },
    { accountId: 'mock-account', eventType: 'trial_started', createdAt: '2024-01-02T00:00:00Z' },
    { accountId: 'mock-account', eventType: 'subscription_started', createdAt: '2024-01-10T00:00:00Z' },
  ],
  cancelled: [
    { accountId: 'mock-account', eventType: 'app_installed', createdAt: '2024-01-01T00:00:00Z' },
    { accountId: 'mock-account', eventType: 'subscription_started', createdAt: '2024-01-10T00:00:00Z' },
    { accountId: 'mock-account', eventType: 'subscription_cancelled', createdAt: '2024-02-01T00:00:00Z' },
  ],
});

/**
 * AMP 未設定時に、開発用のモックイベントを返す。
 * MOCK_AMP_PRESET で free / trial / paid / cancelled を切り替えて動作確認できる。
 *
 * @param {string} accountId
 * @param {{ preset?: 'free'|'trial'|'paid'|'cancelled' }} [opts]
 * @returns {Array<{ accountId: string, eventType: string, createdAt: string }>}
 */
export function getMockEventsForDevelopment(accountId, opts = {}) {
  const preset = opts.preset ?? process.env.MOCK_AMP_PRESET ?? 'free';
  const template = MOCK_EVENTS_BY_PRESET[preset] ?? MOCK_EVENTS_BY_PRESET.free;
  return template.map((e) => ({
    ...e,
    accountId: String(accountId || e.accountId),
  }));
}

/**
 * AMP またはモックから、当該アカウント分のイベントを取得する内部共通処理。
 * getAccountPlanStatus / canExportPdf の両方で利用する。
 *
 * @param {Object} deps
 * @param {string} deps.accountId
 * @param {import('../config/ampConfig.js').AmpConfig} deps.config
 * @param {(q: string, v: Record<string, unknown>) => Promise<{ data?: unknown }>} [deps.runQuery]
 * @param {{ plan?: 'free'|'trial'|'paid'|'cancelled', useMock?: boolean, preset?: string }} [deps.fallback]
 * @returns {Promise<Array<{ accountId: string, eventType: string, createdAt: string }>>}
 */
async function getEventsForAccount(deps) {
  const { accountId, config, runQuery, fallback = {} } = deps;

  if (!isAmpConfigured(config)) {
    if (fallback.useMock) {
      return getMockEventsForDevelopment(accountId, { preset: fallback.preset });
    }
    return [];
  }

  const events = await fetchAmpEvents({
    config,
    runQuery: runQuery ?? (() => Promise.resolve({ data: {} })),
  });
  return events;
}

/**
 * 指定アカウントの現在のプラン状態を返す。
 * AMP が設定されていれば AMP ボードからイベントを取得して導出し、
 * 未設定ならモックまたは fallback を使う。
 *
 * @param {Object} deps
 * @param {string} deps.accountId - monday account_id
 * @param {import('../config/ampConfig.js').AmpConfig} deps.config - AMP 設定（後差し。getAmpConfigFromEnv() など）
 * @param {(query: string, variables: Record<string, unknown>) => Promise<{ data?: unknown }>} [deps.runQuery] - GraphQL 実行。AMP 未設定時は不要
 * @param {{ plan?: 'free'|'trial'|'paid'|'cancelled', useMock?: boolean, preset?: 'free'|'trial'|'paid'|'cancelled' }} [deps.fallback] - AMP 未設定時の扱い。useMock: true で開発用モックを使用
 * @returns {Promise<'free'|'trial'|'paid'|'cancelled'>}
 */
export async function getAccountPlanStatus(deps) {
  const { accountId, fallback = {} } = deps;
  const events = await getEventsForAccount(deps);

  if (events.length === 0 && !isAmpConfigured(deps.config)) {
    return (fallback.plan ?? PLAN_STATUS.FREE);
  }

  return deriveStatus({
    events,
    accountId,
    fallback: fallback.plan ? { plan: fallback.plan } : undefined,
  });
}

/**
 * 有料プラン（課金中）かどうか。
 *
 * @param {Object} deps - getAccountPlanStatus と同様
 * @returns {Promise<boolean>}
 */
export async function isPaidPlan(deps) {
  const plan = await getAccountPlanStatus(deps);
  return plan === PLAN_STATUS.PAID;
}

/**
 * PDF エクスポートが許可されているか。
 * - paid / trial: 常に許可
 * - free: 回数制限あり（limit: 5）。呼び出し側で usedCount と比較すること。
 * - cancelled: 不許可
 *
 * @param {Object} deps - getAccountPlanStatus と同様
 * @returns {Promise<{ allowed: boolean, limit?: number }>}
 */
export async function canExportPdf(deps) {
  const { accountId, fallback = {} } = deps;
  const events = await getEventsForAccount(deps);

  if (events.length === 0 && !isAmpConfigured(deps.config)) {
    return deriveCanExportPdf({
      events: [],
      accountId,
      fallback: { plan: fallback.plan ?? PLAN_STATUS.FREE },
    });
  }

  return deriveCanExportPdf({
    events,
    accountId,
    fallback: fallback.plan ? { plan: fallback.plan } : undefined,
  });
}
