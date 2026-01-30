/**
 * CPQ 計算ロジック
 * 選択アイテム＋価格モデル定義から baseAmount, optionsTotal, discountTotal, taxAmount, total を算出する。
 */

import { PRICE_MODEL_TYPES, MODEL_ROLES } from '../constants/cpq';

function parseNumeric(raw) {
  if (raw == null) return NaN;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/[^\d.-]/g, ''));
    return Number.isNaN(n) ? NaN : n;
  }
  return NaN;
}

/**
 * 入力ソースから数値を取得（アイテムカラム / サブアイテムカラム / 手入力）
 * @param {{ type: string, columnId?: string, columnSource?: string, value?: number }} source
 * @param {{ [key: string]: any }} item - 変換済みアイテム（columnId で値参照可）
 * @param {{ [key: string]: any }[]} subitems - 変換済みサブアイテム配列
 */
export function resolveInput(source, item, subitems = []) {
  if (!source) return 0;
  if (source.type === 'manual') {
    const n = source.value == null ? NaN : Number(source.value);
    return Number.isFinite(n) ? n : 0;
  }
  if (source.type !== 'column' || !source.columnId) return 0;
  const colId = source.columnId;
  if (source.columnSource === 'subitem') {
    const values = (subitems || []).map(sub => parseNumeric(sub[colId]));
    return values.reduce((sum, n) => sum + (Number.isNaN(n) ? 0 : n), 0);
  }
  const n = parseNumeric(item[colId]);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * ステータスカラムの現在ラベルを取得（アイテム → サブアイテムは未使用時はアイテムのみ）
 */
export function getStatusLabel(item, subitems, statusColumnId) {
  if (!item || !statusColumnId) return '';
  const raw = item[statusColumnId];
  if (raw != null && raw !== '') return String(raw).trim();
  return '';
}

/**
 * 1モデルあたりの金額を計算
 */
export function computeModelValue(model, item, subitems = []) {
  if (!model?.config) return 0;
  const cfg = model.config;
  switch (model.type) {
    case PRICE_MODEL_TYPES.PER_UNIT: {
      const q = resolveInput(cfg.quantity, item, subitems);
      const p = resolveInput(cfg.unitPrice, item, subitems);
      return q * p;
    }
    case PRICE_MODEL_TYPES.TIERED: {
      const rangeVal = resolveInput(cfg.rangeValue, item, subitems);
      const quantity = resolveInput(cfg.quantity, item, subitems);
      const tiers = Array.isArray(cfg.tiers) ? cfg.tiers : [];
      const tier = tiers.find(t => rangeVal >= t.min && rangeVal <= t.max);
      if (!tier) return 0;
      return quantity * (tier.unitPrice ?? 0);
    }
    case PRICE_MODEL_TYPES.FLAT_FEE:
      return resolveInput(cfg.amount, item, subitems);
    case PRICE_MODEL_TYPES.PLAN_BASED: {
      const label = getStatusLabel(item, subitems, cfg.statusColumnId);
      const planPrice = (cfg.planPrices && typeof cfg.planPrices[label] === 'number') ? cfg.planPrices[label] : 0;
      const q = cfg.quantity ? resolveInput(cfg.quantity, item, subitems) : 1;
      return planPrice * q;
    }
    default:
      return 0;
  }
}

/**
 * 全モデルを適用して CPQ 計算結果を返す
 * PERCENTAGE は「選択したモデルにかける」なので2パスで計算
 */
export function runCPQCalculation(models, item, taxRate = 10) {
  let baseAmount = 0;
  let optionsTotal = 0;
  let discountTotal = 0;
  const subitems = item?.subitems ?? [];

  if (!Array.isArray(models) || !item) {
    return {
      baseAmount: 0,
      optionsTotal: 0,
      discountTotal: 0,
      taxRate,
      taxAmount: 0,
      total: 0,
      modelValuesById: {}
    };
  }

  const modelValuesById = {};
  const nonPctModels = models.filter((m) => m.type !== PRICE_MODEL_TYPES.PERCENTAGE);
  const pctModels = models.filter((m) => m.type === PRICE_MODEL_TYPES.PERCENTAGE);

  for (const model of nonPctModels) {
    const value = computeModelValue(model, item, subitems);
    modelValuesById[model.id] = value;
    if (model.role === MODEL_ROLES.ADD) {
      if (model.optionFee) {
        optionsTotal += value;
      } else {
        baseAmount += value;
      }
    } else {
      discountTotal += value;
    }
  }

  for (const model of pctModels) {
    const cfg = model.config;
    const targetSum = (cfg.targetModelIds || []).reduce((s, id) => s + (modelValuesById[id] ?? 0), 0);
    const pctRaw = resolveInput(cfg.percentageSource, item, subitems);
    const pct = cfg.isPercentageNotation ? pctRaw / 100 : pctRaw;
    const value = targetSum * pct;
    modelValuesById[model.id] = value;
    if (model.role === MODEL_ROLES.ADD) {
      optionsTotal += value;
    } else {
      discountTotal += value;
    }
  }

  const subtotal = baseAmount + optionsTotal - discountTotal;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  return {
    baseAmount,
    optionsTotal,
    discountTotal,
    taxRate,
    taxAmount,
    total,
    modelValuesById
  };
}

/**
 * 書き戻し用: 計算結果と modelValuesById を返す（A/B の行組み立て用）
 */
export function runCPQCalculationWithDetails(models, item, taxRate = 10) {
  const result = runCPQCalculation(models, item, taxRate);
  const modelValuesById = result.modelValuesById ?? {};
  const { modelValuesById: _mv, ...rest } = result;
  return { result: rest, modelValuesById };
}
