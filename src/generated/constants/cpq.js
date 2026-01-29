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
      return { ...base, config: { quantity: { type: 'manual', value: 0 }, tiers: [{ min: 0, max: 10, unitPrice: 0 }] } };
    case PRICE_MODEL_TYPES.FLAT_FEE:
      return { ...base, config: { amount: { type: 'manual', value: 0 } } };
    case PRICE_MODEL_TYPES.PLAN_BASED:
      return { ...base, config: { statusColumnId: '', planPrices: {}, quantity: { type: 'manual', value: 1 } } };
    default:
      return { ...base, config: { quantity: { type: 'manual', value: 0 }, unitPrice: { type: 'manual', value: 0 } } };
  }
}

/**
 * 入力がすべて埋まっているか（手入力の場合は value が数値であること）
 * @param {{ type: string, config?: object }} model
 * @returns {boolean}
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
      const quantity = model.config.quantity;
      if (!Array.isArray(tiers) || tiers.length === 0) return false;
      const qOk = quantity?.type === 'manual' ? typeof quantity.value === 'number' : Boolean(quantity?.columnId);
      return qOk && tiers.every(t => typeof t.min === 'number' && typeof t.max === 'number' && typeof t.unitPrice === 'number');
    }
    case PRICE_MODEL_TYPES.PLAN_BASED: {
      const statusColumnId = model.config.statusColumnId;
      const planPrices = model.config.planPrices;
      return Boolean(statusColumnId && planPrices && typeof planPrices === 'object');
    }
    default:
      return false;
  }
}
