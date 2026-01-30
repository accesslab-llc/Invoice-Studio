/**
 * CPQ（Configure / Price / Quote）用の定数・型定義
 * 請求書ロジックは変更せず、価格決定の補助のみを行う。
 */

/** 価格モデル種別（固定。自由な数式は持たない） */
export const PRICE_MODEL_TYPES = Object.freeze({
  PER_UNIT: 'per_unit',
  TIERED: 'tiered',
  FLAT_FEE: 'flat_fee',
  PLAN_BASED: 'plan_based',
  PERCENTAGE: 'percentage', // 選択したモデルにかける％
});

/** モデルの役割：加算（通常料金） or 減算（ディスカウント） */
export const MODEL_ROLES = Object.freeze({
  ADD: 'add',
  SUBTRACT: 'subtract',
});

/** 価格モデル最大数 */
export const CPQ_MAX_MODELS = 20;

/** Tiered の最大段階数 */
export const TIERED_MAX_TIERS = 10;

/** CPQ ステップ */
export const CPQ_STEPS = Object.freeze({
  SELECT: 'select',
  TRANSITION: 'transition',
  PRICE_MODEL: 'priceModel',
  RESULT: 'result',
});

/**
 * 空の価格モデル定義を1つ返す（Per-unit デフォルト）
 * @param {string} [id] - 一意ID
 */
export function createEmptyPriceModel(id = `pm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`) {
  return createPriceModel(PRICE_MODEL_TYPES.PER_UNIT, MODEL_ROLES.ADD, id);
}

/**
 * 指定した種別・役割で価格モデルを1つ作成する（追加時の選択用）
 * @param {string} type - PRICE_MODEL_TYPES のいずれか
 * @param {string} role - MODEL_ROLES.ADD または MODEL_ROLES.SUBTRACT
 * @param {string} [id] - 一意ID
 */
export function createPriceModel(type, role, id = `pm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`) {
  const base = { id, type, role };
  switch (type) {
    case PRICE_MODEL_TYPES.PER_UNIT:
      return { ...base, config: { quantity: { type: 'manual', value: 0 }, unitPrice: { type: 'manual', value: 0 } } };
    case PRICE_MODEL_TYPES.TIERED:
      return { ...base, config: { rangeValue: { type: 'manual', value: 0 }, quantity: { type: 'manual', value: 0 }, tiers: [{ min: 0, max: 10, unitPrice: 0 }] } };
    case PRICE_MODEL_TYPES.FLAT_FEE:
      return { ...base, config: { amount: { type: 'manual', value: 0 } } };
    case PRICE_MODEL_TYPES.PLAN_BASED:
      return { ...base, config: { statusColumnId: '', planPrices: {}, quantity: { type: 'manual', value: 1 } } };
    case PRICE_MODEL_TYPES.PERCENTAGE:
      return { ...base, config: { targetModelIds: [], percentageSource: { type: 'manual', value: 10 }, isPercentageNotation: true } };
    default:
      return { ...base, config: { quantity: { type: 'manual', value: 0 }, unitPrice: { type: 'manual', value: 0 } } };
  }
}

/** レンジが重複せず min <= max かつ前レンジの max より次の min が大きいか */
export function isTiersValid(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return false;
  const sorted = [...tiers].sort((a, b) => Number(a.min) - Number(b.min));
  for (let i = 0; i < sorted.length; i++) {
    const min = Number(sorted[i].min);
    const max = Number(sorted[i].max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return false;
    if (i > 0 && min <= Number(sorted[i - 1].max)) return false;
  }
  return true;
}

/**
 * CPQ 価格モデルから参照しているカラム ID を収集（アイテム用・サブアイテム用）
 */
export function getColumnIdsFromCpqModels(models) {
  const itemIds = new Set();
  const subitemIds = new Set();
  if (!Array.isArray(models)) return { itemIds: [], subitemIds: [] };
  models.forEach((model) => {
    const cfg = model?.config;
    if (!cfg) return;
    const add = (source) => {
      if (source?.type === 'column' && source.columnId) {
        if (source.columnSource === 'subitem') subitemIds.add(source.columnId);
        else itemIds.add(source.columnId);
      }
    };
    if (cfg.quantity) add(cfg.quantity);
    if (cfg.unitPrice) add(cfg.unitPrice);
    if (cfg.amount) add(cfg.amount);
    if (cfg.rangeValue) add(cfg.rangeValue);
    if (cfg.statusColumnId) itemIds.add(cfg.statusColumnId);
    if (cfg.percentageSource) add(cfg.percentageSource);
  });
  return { itemIds: Array.from(itemIds), subitemIds: Array.from(subitemIds) };
}

/**
 * 入力がすべて埋まっているか（手入力の場合は value が数値であること）
 */
export function isPriceModelComplete(model) {
  if (!model || !model.config) return false;
  switch (model.type) {
    case PRICE_MODEL_TYPES.PER_UNIT: {
      const q = model.config.quantity;
      const p = model.config.unitPrice;
      const qOk = q?.type === 'manual' ? typeof q.value === 'number' : Boolean(q?.columnId);
      const pOk = p?.type === 'manual' ? typeof p.value === 'number' : Boolean(p?.columnId);
      return qOk && pOk;
    }
    case PRICE_MODEL_TYPES.FLAT_FEE: {
      const a = model.config.amount;
      if (a?.type === 'manual') return typeof a.value === 'number';
      return Boolean(a?.columnId);
    }
    case PRICE_MODEL_TYPES.TIERED: {
      const tiers = model.config.tiers;
      const rangeValue = model.config.rangeValue;
      const quantity = model.config.quantity;
      if (!Array.isArray(tiers) || tiers.length === 0) return false;
      if (!isTiersValid(tiers)) return false;
      const rangeOk = rangeValue?.type === 'manual' ? typeof rangeValue.value === 'number' : Boolean(rangeValue?.columnId);
      const qOk = quantity?.type === 'manual' ? typeof quantity.value === 'number' : Boolean(quantity?.columnId);
      return rangeOk && qOk && tiers.every(t => typeof t.min === 'number' && typeof t.max === 'number' && typeof t.unitPrice === 'number');
    }
    case PRICE_MODEL_TYPES.PLAN_BASED: {
      const statusColumnId = model.config.statusColumnId;
      const planPrices = model.config.planPrices;
      const hasPlanPrices = planPrices && typeof planPrices === 'object' && Object.keys(planPrices).length > 0;
      return Boolean(statusColumnId && hasPlanPrices);
    }
    case PRICE_MODEL_TYPES.PERCENTAGE: {
      const targetModelIds = model.config.targetModelIds;
      const percentageSource = model.config.percentageSource;
      const hasTargets = Array.isArray(targetModelIds) && targetModelIds.length > 0;
      const pctOk = percentageSource?.type === 'manual' ? typeof percentageSource.value === 'number' : Boolean(percentageSource?.columnId);
      return hasTargets && pctOk;
    }
    default:
      return false;
  }
}
