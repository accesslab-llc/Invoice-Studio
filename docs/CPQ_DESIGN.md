# InvoiceStudio CPQ 統合設計

## 1. 基本思想（2レイヤー構成）

| レイヤー | 役割 | 請求書ロジックとの関係 |
|----------|------|------------------------|
| **CPQ レイヤー** | 価格決定の補助。ルールベースで計算し、結果を monday カラムに書き戻す | 請求書は関知しない |
| **請求書レイヤー** | 既存。monday カラムの値をそのまま使用 | CPQ の有無を意識しない |

- CPQ は「価格決定の補助」であり、**請求書ロジックを置き換えない**。
- 請求書は従来どおり「カラムの値を読んで表示・PDF 化」するだけ。

---

## 2. UI フロー

```
[起動]
   ↓
[初期画面：処理選択 + 言語 + 通貨]  ← 必須。ここで言語・通貨を確定し、以降は表示しない
   ├─ A) CPQ で金額を計算する  → CPQ フロー
   └─ B) 請求書を作成する      → 請求書フロー（既存 1.選択 → 2.編集 → 3.ダウンロード）
```

### CPQ フロー詳細

```
[Step 1] アイテム選択
   - UI は請求書のアイテム選択と共通（色だけ CPQ 用に変更）
   - 選択後「次へ」

[Step 2] 遷移選択
   - A) 価格モデル設定画面へ進む
   - B) 価格モデル設定をスキップして計算結果へ（※設定済みの場合のみ B 可能）

[Step 3] 価格モデル設定（最大20モデル）
   - 中央に「＋」→ モデル種別（Per-unit / Tiered / Flat fee / Plan-based）＋ 加算/減算 を選択
   - 各モデル：入力欄は「monday カラム or 手入力」をドロップダウンで選択
   - 画面上部：テンプレート設定（請求書と共通）、編集ロック（初期ロック、解除時は注意ポップアップ）
   - 必須が1つでも空なら「計算結果へ」は進めない

[Step 4] 計算結果
   - 表示：基本料金、オプション合計、割引額、税率、税額、合計金額
   - 各項目ごとに「書き戻し先 monday カラム」を選択（未マッピング可）
   - 画面上部：テンプレート、編集ロック（解除時は注意）
   - 「書き戻す」→ カラムに書き込み → 初期画面へ戻る
```

---

## 3. データ構造

### 3.1 エントリ時（共通）

- `appMode`: `null` | `'cpq'` | `'invoice'` … 未選択 / CPQ / 請求書
- `language`, `currency` … 初期画面で一度だけ設定し、両フローで共有

### 3.2 価格モデル定義（CPQ 専用）

```ts
// モデル種別（固定。ユーザー定義の数式は持たない）
type PriceModelType = 'per_unit' | 'tiered' | 'flat_fee' | 'plan_based';

// 加算 or 減算
type ModelRole = 'add' | 'subtract';

// 入力ソース：monday カラム ID または手入力
type InputSource = { type: 'column'; columnId: string } | { type: 'manual'; value: number };

// 1モデルあたりの定義（種別ごとに config が異なる）
interface PriceModelDef {
  id: string;
  type: PriceModelType;
  role: ModelRole;
  config: PerUnitConfig | TieredConfig | FlatFeeConfig | PlanBasedConfig;
}

// Per-unit / Time-based
interface PerUnitConfig {
  quantity: InputSource;  // 数量 or 時間
  unitPrice: InputSource;
}

// Tiered（最大10段階）
interface TieredConfig {
  tiers: Array<{ min: number; max: number; unitPrice: number }>;
  quantity: InputSource;
}

// Flat fee
interface FlatFeeConfig {
  amount: InputSource;
}

// Plan-based（ステータス × 数量 or 固定）
interface PlanBasedConfig {
  statusColumnId: string;
  planPrices: Record<string, number>;  // ステータスラベル → 金額
  quantity?: InputSource;              // 省略時は Flat 扱い
}
```

### 3.3 計算結果（CPQ 出力）

```ts
interface CPQCalculationResult {
  baseAmount: number;      // 基本料金
  optionsTotal: number;    // オプション合計（加算モデル合計）
  discountTotal: number;   // 割引合計（減算モデル合計）
  taxRate: number;         // 税率 (%)
  taxAmount: number;      // 税額
  total: number;          // 合計
}
```

### 3.4 書き戻しマッピング

```ts
// 計算結果の各項目 → monday カラム ID（未設定は書き戻さない）
interface CPQWriteBackMapping {
  baseAmount?: string;
  optionsTotal?: string;
  discountTotal?: string;
  taxRate?: string;
  taxAmount?: string;
  total?: string;
}
```

---

## 4. 計算ロジック（擬似コード）

- **CPQ レイヤー**でのみ実行。請求書レイヤーは `formData`（カラム由来の値）をそのまま表示するだけ。

```ts
function runCPQCalculation(
  models: PriceModelDef[],
  itemContext: { item; subitems; columnValues }
): CPQCalculationResult {
  let baseAmount = 0;
  let optionsTotal = 0;
  let discountTotal = 0;

  for (const model of models) {
    const value = computeModelValue(model, itemContext);
    if (model.role === 'add') {
      if (baseAmount === 0 && optionsTotal === 0) baseAmount = value;
      else optionsTotal += value;
    } else {
      discountTotal += value;
    }
  }

  const subtotal = baseAmount + optionsTotal - discountTotal;
  const taxRate = itemContext.taxRate ?? 10;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  return {
    baseAmount,
    optionsTotal,
    discountTotal,
    taxRate,
    taxAmount,
    total,
  };
}

function computeModelValue(model: PriceModelDef, ctx): number {
  switch (model.type) {
    case 'per_unit': {
      const q = resolveInput(model.config.quantity, ctx);
      const p = resolveInput(model.config.unitPrice, ctx);
      return q * p;
    }
    case 'tiered': {
      const q = resolveInput(model.config.quantity, ctx);
      const tier = model.config.tiers.find(t => q >= t.min && q <= t.max);
      return tier ? q * tier.unitPrice : 0;
    }
    case 'flat_fee':
      return resolveInput(model.config.amount, ctx);
    case 'plan_based': {
      const statusLabel = getStatusLabel(ctx, model.config.statusColumnId);
      const planPrice = model.config.planPrices[statusLabel] ?? 0;
      const q = model.config.quantity ? resolveInput(model.config.quantity, ctx) : 1;
      return planPrice * q;
    }
    default:
      return 0;
  }
}

function resolveInput(source: InputSource, ctx): number {
  if (source.type === 'manual') return source.value;
  const raw = ctx.columnValues[source.columnId];
  // Formula カラムの場合は「計算結果の数値」を使用
  return parseNumeric(raw) ?? 0;
}
```

- 請求書側は **CPQ を呼ばない**。`formData.subtotal`, `formData.taxAmount`, `formData.total` 等は既存どおり「カラム／手入力」から `calculateTotals()` で算出する。

---

## 5. CPQ と請求書の分離（実装方針）

| 対象 | 場所 | 責務 |
|------|------|------|
| エントリ | App 最上位 | `appMode` / 言語 / 通貨を一度だけ設定 |
| 請求書フロー | 既存 App | `appMode === 'invoice'` のときのみ表示。言語・通貨はエントリ値を参照し、ヘッダーには出さない |
| CPQ フロー | 同一 App 内の `appMode === 'cpq'` ブロック | `cpqStep`, 価格モデル定義、計算、書き戻し。請求書の `formData` や `calculateTotals` は触らない |
| 書き戻し | CPQ Step 4 | monday API でカラム更新。完了後は `appMode = null` で初期画面へ |

- 請求書の「編集」「ダウンロード」は、CPQ が書き戻した結果を「ただのカラム値」として読むだけ。

---

## 6. 対応する価格モデル（固定）

1. **Per-unit / Time-based** … 数量 × 単価（入力はカラム or 手入力、Formula は計算結果の数値のみ使用）
2. **Tiered** … 最大10段階の数量レンジと単価。レンジ条件は固定、ユーザーが自由な条件式を書くことは不可
3. **Flat fee** … 1つの金額（カラム or 手入力）
4. **Plan-based** … ステータスカラムのラベルごとに金額を設定し、選択中ラベル × 数量（or 固定）で計算

いずれも **加算** または **減算** として扱う。自由な数式・AI・業種特化ロジックは実装しない。

---

## 7. ロックと安全設計

- CPQ 適用後は「価格ロック」をサポート可能（フラグで制御）。
- ロック中は再計算不可。
- 書き戻し先カラムの上書きは事前に警告を表示する。

---

## 8. 非目標（実装しない）

- 自由形式の数式ビルダー
- AI による価格決定
- 全業種対応をうたう設計
- リアルタイム相場連動
- 汎用ルールエンジン

このドキュメントに沿って、エントリ画面・CPQ フロー・データ構造・計算ロジックを実装する。
