/**
 * AMP 管理ボードからイベント履歴を取得するサービス
 *
 * boardId / columnId は ampConfig から参照するため、
 * AMP ボードが未作成・ID 未確定の環境でもロジックの実装・テストが可能。
 * 本番では AMP が生成したボードの ID を環境変数で注入して利用する。
 */

import { isAmpConfigured } from '../config/ampConfig.js';

/** AMP が記録するイベント種別（想定）。将来イベントが増えてもここに追加するだけにできる */
export const AMP_EVENT_TYPES = Object.freeze({
  APP_INSTALLED: 'app_installed',
  TRIAL_STARTED: 'trial_started',
  TRIAL_ENDED: 'trial_ended',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  APP_UNINSTALLED: 'app_uninstalled',
});

/**
 * AMP ボード用の GraphQL クエリを組み立てる。
 * カラム ID は設定から参照するため、ボード構造が変わっても設定の差し替えだけで対応可能。
 *
 * monday の items は column_values で各カラムの value を JSON 文字列などで持つ。
 * クエリは「指定ボードの全アイテム」を取得し、必須カラム（account_id, event_type, created_at）を指定する。
 *
 * @param {import('../config/ampConfig.js').AmpConfig} config
 * @returns {{ query: string, variables: Record<string, unknown> } | null} - config 未設定時は null
 */
export function buildAmpEventsQuery(config) {
  if (!isAmpConfigured(config)) return null;

  const boardId = config.boardId;
  const ids = [
    config.columns.accountId,
    config.columns.eventType,
    config.columns.createdAt,
  ].filter(Boolean);

  // 将来カラムが増えた場合は config.columns に追加し、ids に含めればよい
  if (config.columns.plan) ids.push(config.columns.plan);

  const columnIds = ids.map((id) => `"${id}"`).join(', ');

  // items_page はページネーション対応。ソートは取得後に planStatus 側で実施する。
  // monday API の items_page の引数は環境により異なるため、ここでは limit のみ指定する。
  const query = `
    query GetAmpEvents($boardId: ID!, $limit: Int) {
      boards(ids: [$boardId]) {
        id
        items_page(limit: $limit) {
          items {
            id
            column_values(ids: [${columnIds}]) {
              id
              value
              type
            }
          }
          cursor
        }
      }
    }
  `.replace(/\s+/g, ' ');

  return {
    query,
    variables: { boardId, limit: 5000 },
  };
}

/**
 * monday の column_values 配列から、指定 columnId の value を取り出す。
 * value はしばしば JSON 文字列（例: {"text":"123"}）なので、必要ならパースする。
 *
 * @param {Array<{ id: string, value: string, type?: string }>} columnValues
 * @param {string} columnId
 * @returns {string | null}
 */
function getColumnValue(columnValues, columnId) {
  const col = columnValues?.find((c) => c.id === columnId);
  if (!col || col.value == null || col.value === '') return null;
  const v = col.value;
  if (v.startsWith('{')) {
    try {
      const o = JSON.parse(v);
      return o.text ?? o.value ?? o.id ?? String(o);
    } catch {
      return v;
    }
  }
  return v;
}

/**
 * GraphQL レスポンスの items を、{ accountId, eventType, createdAt } の配列に変換する。
 *
 * @param {Array<{ id: string, column_values: Array<{ id: string, value: string }> }>} items
 * @param {import('../config/ampConfig.js').AmpColumnIds} columns
 * @returns {Array<{ accountId: string, eventType: string, createdAt: string }>}
 */
export function mapItemsToEvents(items, columns) {
  const events = [];
  for (const item of items ?? []) {
    const cv = item.column_values ?? [];
    const accountId = getColumnValue(cv, columns.accountId);
    const eventType = getColumnValue(cv, columns.eventType);
    const createdAt = getColumnValue(cv, columns.createdAt);
    if (accountId && eventType) {
      events.push({
        accountId: String(accountId).trim(),
        eventType: String(eventType).trim().toLowerCase(),
        createdAt: createdAt ?? '',
      });
    }
  }
  return events;
}

/**
 * 指定アカウントのイベント履歴を AMP ボードから取得する。
 *
 * @param {Object} deps
 * @param {import('../config/ampConfig.js').AmpConfig} deps.config - AMP 設定（後差し）
 * @param {(query: string, variables: Record<string, unknown>) => Promise<{ data?: unknown }>} deps.runQuery - GraphQL 実行関数（本番では monday API クライアントを注入）
 * @param {number | undefined} [deps.accountId] - 未指定なら全件取得し、呼び出し側でフィルタする想定
 * @returns {Promise<Array<{ accountId: string, eventType: string, createdAt: string }>>}
 */
export async function fetchAmpEvents(deps) {
  const { config, runQuery } = deps;

  if (!isAmpConfigured(config)) {
    return [];
  }

  const built = buildAmpEventsQuery(config);
  if (!built) return [];

  const res = await runQuery(built.query, built.variables);
  const boards = res?.data?.boards ?? [];
  const board = Array.isArray(boards) ? boards[0] : boards;
  const itemsPage = board?.items_page;
  const items = itemsPage?.items ?? [];

  const events = mapItemsToEvents(items, config.columns);
  return events;
}
