/**
 * CPQ 価格モデル1件の入力UI。
 * 各入力欄：ドロップダウンで「ボードのカラム」または「手入力」を選択し、
 * 手入力の場合は数値入力欄を表示する。
 * - Formula カラムは「計算結果の数値」として使用可能。
 * - Tiered のレンジ・Plan-based のプラン別金額は手入力必須。
 */

import { useState, useEffect } from 'react';
import { Box, Stack, Field, HStack, Text, Button, NumberInput } from '@chakra-ui/react';
import { PRICE_MODEL_TYPES, TIERED_MAX_TIERS } from '../constants/cpq';

const NUMERIC_COLUMN_TYPES = ['numbers', 'formula'];
const STATUS_COLUMN_TYPES = ['dropdown', 'color', 'status'];

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function validateTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => safeNum(a.min) - safeNum(b.min));
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const min = safeNum(t.min);
    const max = safeNum(t.max);
    if (min > max) return '各レンジで「最小」は「最大」以下にしてください。';
    if (i > 0) {
      const prevMax = safeNum(sorted[i - 1].max);
      if (min <= prevMax) return 'レンジが重なっています。前のレンジの「最大」より大きい「最小」にしてください。';
    }
  }
  return null;
}

function filterNumericColumns(columns) {
  if (!Array.isArray(columns)) return [];
  return columns.filter(c => NUMERIC_COLUMN_TYPES.includes(c.type));
}

function filterStatusColumns(columns) {
  if (!Array.isArray(columns)) return [];
  return columns.filter(c => STATUS_COLUMN_TYPES.includes(c.type));
}

/** options: { manual, itemCols, subitemCols } for optgroup display */
function SourceSlot({ label, value, options, manualValue, onSourceChange, onManualChange, isLocked, t }) {
  const isManual = !value?.columnId;
  const selectValue = isManual ? '__manual__' : (value.columnSource === 'subitem' ? `subitem__${value.columnId}` : `item__${value.columnId}`);
  const opts = options || { manual: { value: '__manual__', label: t.cpqInputSourceManual }, itemCols: [], subitemCols: [] };
  return (
    <Field.Root size="sm">
      <Field.Label>{label}</Field.Label>
      <HStack gap="2" align="flex-start" flexWrap="wrap">
        <Box
          as="select"
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '__manual__') {
              onSourceChange({ type: 'manual', value: safeNum(manualValue) });
            } else if (v.startsWith('subitem__')) {
              onSourceChange({ type: 'column', columnId: v.slice(9), columnSource: 'subitem' });
            } else {
              onSourceChange({ type: 'column', columnId: v.startsWith('item__') ? v.slice(6) : v, columnSource: 'item' });
            }
          }}
          minW="220px"
          minH="32px"
          px="2"
          rounded="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg"
          fontSize="sm"
          disabled={isLocked}
        >
          <option value={opts.manual?.value}>{opts.manual?.label}</option>
          {opts.itemCols?.length > 0 && (
            <optgroup label={t.cpqItemColumnGroup || 'アイテムのカラム'}>
              {opts.itemCols.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          )}
          {opts.subitemCols?.length > 0 && (
            <optgroup label={t.cpqSubitemColumnGroup || 'サブアイテムのカラム'}>
              {opts.subitemCols.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          )}
        </Box>
        {isManual && (
          <NumberInput.Root
            value={String(safeNum(manualValue))}
            onValueChange={({ valueAsNumber }) => onManualChange(Number.isFinite(valueAsNumber) ? valueAsNumber : 0)}
            min={0}
            step={0.01}
            size="sm"
            maxW="120px"
            disabled={isLocked}
          >
            <NumberInput.Input />
          </NumberInput.Root>
        )}
      </HStack>
    </Field.Root>
  );
}

function buildNumericOptions(numericColumns, subitemNumericColumns, t) {
  return {
    manual: { value: '__manual__', label: t.cpqInputSourceManual },
    itemCols: (numericColumns || []).map(c => ({ value: `item__${c.id}`, label: c.title })),
    subitemCols: (subitemNumericColumns || []).map(c => ({ value: `subitem__${c.id}`, label: c.title }))
  };
}

export default function CpqModelConfigEditor({ model, index, allModels = [], board, isLocked, t, onUpdate, getModelLabel }) {
  const [columns, setColumns] = useState([]);
  const [subitemColumns, setSubitemColumns] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [statusLabels, setStatusLabels] = useState([]);

  useEffect(() => {
    if (model?.type === PRICE_MODEL_TYPES.TIERED && model.config && model.config.quantity != null && model.config.rangeValue == null) {
      onUpdate({ ...model, config: { ...model.config, rangeValue: { type: 'manual', value: 0 } } });
    }
  }, [model?.id, model?.type, !!model?.config?.rangeValue]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!board?.fetchColumns) {
        setColumnsLoading(false);
        return;
      }
      setColumnsLoading(true);
      try {
        const [cols, subCols] = await Promise.all([
          board.fetchColumns().catch(() => []),
          board.fetchSubitemColumns ? board.fetchSubitemColumns().catch(() => []) : Promise.resolve([])
        ]);
        if (!cancelled) {
          setColumns(cols || []);
          setSubitemColumns(subCols || []);
        }
      } catch (e) {
        if (!cancelled) setColumns([]);
      } finally {
        if (!cancelled) setColumnsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [board]);

  useEffect(() => {
    if (model?.type !== PRICE_MODEL_TYPES.PLAN_BASED || !model.config?.statusColumnId || !board?.fetchStatusColumnLabels) {
      setStatusLabels([]);
      return;
    }
    let cancelled = false;
    board.fetchStatusColumnLabels(model.config.statusColumnId).then((labels) => {
      if (!cancelled && Array.isArray(labels)) {
        setStatusLabels(labels);
        const prev = model.config.planPrices || {};
        const planPrices = { ...prev };
        let changed = false;
        labels.forEach((label) => {
          if (planPrices[label] === undefined) {
            planPrices[label] = 0;
            changed = true;
          }
        });
        if (changed) onUpdate({ ...model, config: { ...model.config, planPrices } });
      }
    });
    return () => { cancelled = true; };
  }, [model?.type, model?.config?.statusColumnId, board]);

  const numericColumns = filterNumericColumns(columns);
  const subitemNumericColumns = filterNumericColumns(subitemColumns);
  const statusColumns = filterStatusColumns(columns);
  const numericOptions = buildNumericOptions(numericColumns, subitemNumericColumns, t);
  const tierValidationError = model?.type === PRICE_MODEL_TYPES.TIERED ? validateTiers(model.config?.tiers) : null;

  const updateConfig = (patch) => {
    onUpdate({ ...model, config: { ...model.config, ...patch } });
  };

  if (!model || !model.config) return null;

  const config = model.config;

  return (
    <Box p="3" borderWidth="1px" rounded="md" borderColor="green.200" bg="green.50" _dark={{ bg: 'green.950', borderColor: 'green.800' }}>
      {columnsLoading ? (
        <Text fontSize="sm" color="fg.muted">カラム読み込み中...</Text>
      ) : (
        <Stack gap="3">
          {model.type === PRICE_MODEL_TYPES.PER_UNIT && (
            <>
              <SourceSlot
                label={t.quantity}
                value={config.quantity}
                options={numericOptions}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 0}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <SourceSlot
                label={t.unitPrice}
                value={config.unitPrice}
                options={numericOptions}
                manualValue={config.unitPrice?.type === 'manual' ? config.unitPrice.value : 0}
                onSourceChange={(p) => updateConfig({ unitPrice: p })}
                onManualChange={(v) => updateConfig({ unitPrice: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
            </>
          )}

          {model.type === PRICE_MODEL_TYPES.FLAT_FEE && (
            <SourceSlot
              label={t.amount}
              value={config.amount}
              options={numericOptions}
              manualValue={config.amount?.type === 'manual' ? config.amount.value : 0}
              onSourceChange={(a) => updateConfig({ amount: a })}
              onManualChange={(v) => updateConfig({ amount: { type: 'manual', value: v } })}
              isLocked={isLocked}
              t={t}
            />
          )}

          {model.type === PRICE_MODEL_TYPES.TIERED && (
            <>
              <SourceSlot
                label={t.cpqTierRangeValue}
                value={config.rangeValue || { type: 'manual', value: 0 }}
                options={numericOptions}
                manualValue={config.rangeValue?.type === 'manual' ? config.rangeValue.value : 0}
                onSourceChange={(r) => updateConfig({ rangeValue: r })}
                onManualChange={(v) => updateConfig({ rangeValue: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <SourceSlot
                label={t.cpqTierMultiplyValue}
                value={config.quantity}
                options={numericOptions}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 0}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">{t.cpqTierRange}（手入力・最大{TIERED_MAX_TIERS}段階）</Text>
              {tierValidationError && (
                <Text fontSize="sm" color="red.500">{tierValidationError}</Text>
              )}
              {(config.tiers || []).map((tier, ti) => (
                <HStack key={ti} gap="2" align="center">
                  <NumberInput.Root
                    size="sm"
                    maxW="80px"
                    min={0}
                    disabled={isLocked}
                    value={String(safeNum(tier.min))}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, min: Number.isFinite(valueAsNumber) ? valueAsNumber : 0 };
                      updateConfig({ tiers });
                    }}
                  >
                    <NumberInput.Input placeholder={t.cpqTierMin} />
                  </NumberInput.Root>
                  <Text fontSize="sm">〜</Text>
                  <NumberInput.Root
                    size="sm"
                    maxW="80px"
                    min={0}
                    disabled={isLocked}
                    value={String(safeNum(tier.max))}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, max: Number.isFinite(valueAsNumber) ? valueAsNumber : 0 };
                      updateConfig({ tiers });
                    }}
                  >
                    <NumberInput.Input placeholder={t.cpqTierMax} />
                  </NumberInput.Root>
                  <NumberInput.Root
                    size="sm"
                    maxW="100px"
                    min={0}
                    step={0.01}
                    disabled={isLocked}
                    value={String(safeNum(tier.unitPrice))}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, unitPrice: Number.isFinite(valueAsNumber) ? valueAsNumber : 0 };
                      updateConfig({ tiers });
                    }}
                  >
                    <NumberInput.Input />
                  </NumberInput.Root>
                  {!isLocked && (config.tiers?.length || 0) > 1 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => {
                        const tiers = (config.tiers || []).filter((_, j) => j !== ti);
                        updateConfig({ tiers });
                      }}
                    >
                      削除
                    </Button>
                  )}
                </HStack>
              ))}
              {!isLocked && (config.tiers?.length || 0) < TIERED_MAX_TIERS && (
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="green"
                  onClick={() => {
                    const tiers = [...(config.tiers || []), { min: 0, max: 0, unitPrice: 0 }];
                    updateConfig({ tiers });
                  }}
                >
                  + レンジを追加
                </Button>
              )}
            </>
          )}

          {model.type === PRICE_MODEL_TYPES.PERCENTAGE && (
            <>
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">{t.cpqPercentageTargetModels}</Text>
              <Stack gap="1">
                {(allModels || []).filter((om) => om.id !== model.id).map((om) => {
                  const checked = (model.config.targetModelIds || []).includes(om.id);
                  return (
                    <HStack key={om.id} gap="2">
                      <Box
                        as="input"
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const ids = e.target.checked
                            ? [...(model.config.targetModelIds || []), om.id]
                            : (model.config.targetModelIds || []).filter((id) => id !== om.id);
                          updateConfig({ targetModelIds: ids });
                        }}
                        disabled={isLocked}
                      />
                      <Text fontSize="sm">{getModelLabel(om)}</Text>
                    </HStack>
                  );
                })}
              </Stack>
              <SourceSlot
                label="％の値"
                value={model.config.percentageSource}
                options={numericOptions}
                manualValue={model.config.percentageSource?.type === 'manual' ? model.config.percentageSource.value : 0}
                onSourceChange={(s) => updateConfig({ percentageSource: s })}
                onManualChange={(v) => updateConfig({ percentageSource: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <HStack gap="2">
                <Box as="input" type="checkbox" id={`pct-notation-${model.id}`} checked={model.config.isPercentageNotation !== false} onChange={(e) => updateConfig({ isPercentageNotation: e.target.checked })} disabled={isLocked} />
                <Text as="label" htmlFor={`pct-notation-${model.id}`} fontSize="sm">{t.cpqPercentageNotation}</Text>
              </HStack>
            </>
          )}

          {model.type === PRICE_MODEL_TYPES.PLAN_BASED && (
            <>
              <Field.Root size="sm">
                <Field.Label>{t.cpqStatusColumn}</Field.Label>
                <Box
                  as="select"
                  value={config.statusColumnId || ''}
                  onChange={(e) => updateConfig({ statusColumnId: e.target.value })}
                  minW="200px"
                  minH="32px"
                  px="2"
                  rounded="md"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg"
                  fontSize="sm"
                  disabled={isLocked}
                >
                  <option value="">—</option>
                  {statusColumns.map((col) => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </Box>
              </Field.Root>
              <SourceSlot
                label={t.quantity}
                value={config.quantity}
                options={numericOptions}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 1}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">{t.cpqPlanPrices}</Text>
              {statusLabels.length === 0 && config.statusColumnId ? (
                <Text fontSize="sm" color="fg.muted">ステータスカラムのラベルを取得中…</Text>
              ) : statusLabels.length === 0 ? (
                <Text fontSize="sm" color="fg.muted">ステータスカラムを選択するとラベルが表示されます</Text>
              ) : (
                statusLabels.map((label) => (
                  <HStack key={label} gap="2">
                    <Text fontSize="sm" minW="100px">{label}</Text>
                    <NumberInput.Root
                      size="sm"
                      maxW="120px"
                      min={0}
                      step={0.01}
                      disabled={isLocked}
                      value={String(safeNum((config.planPrices || {})[label]))}
                      onValueChange={({ valueAsNumber }) => {
                        const planPrices = { ...(config.planPrices || {}), [label]: valueAsNumber };
                        updateConfig({ planPrices });
                      }}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </HStack>
                ))
              )}
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}
