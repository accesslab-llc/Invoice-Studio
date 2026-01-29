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

function filterNumericColumns(columns) {
  if (!Array.isArray(columns)) return [];
  return columns.filter(c => NUMERIC_COLUMN_TYPES.includes(c.type));
}

function filterStatusColumns(columns) {
  if (!Array.isArray(columns)) return [];
  return columns.filter(c => STATUS_COLUMN_TYPES.includes(c.type));
}

/** 1つのスロット（カラム or 手入力）のUI */
function SourceSlot({ label, value, options, manualValue, onSourceChange, onManualChange, isLocked, t }) {
  const isManual = !value?.columnId;
  return (
    <Field.Root size="sm">
      <Field.Label>{label}</Field.Label>
      <HStack gap="2" align="flex-start" flexWrap="wrap">
        <Box
          as="select"
          value={value?.columnId ? value.columnId : '__manual__'}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '__manual__') {
              onSourceChange({ type: 'manual', value: manualValue ?? 0 });
            } else {
              onSourceChange({ type: 'column', columnId: v });
            }
          }}
          minW="160px"
          minH="32px"
          px="2"
          rounded="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg"
          fontSize="sm"
          disabled={isLocked}
        >
          <option value="__manual__">{t.cpqInputSourceManual}</option>
          {(options || []).map((col) => (
            <option key={col.id} value={col.id}>{col.title}</option>
          ))}
        </Box>
        {isManual && (
          <NumberInput.Root
            value={String(manualValue ?? 0)}
            onValueChange={({ valueAsNumber }) => onManualChange(valueAsNumber)}
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

export default function CpqModelConfigEditor({ model, index, board, isLocked, t, onUpdate, getModelLabel }) {
  const [columns, setColumns] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!board?.fetchColumns) {
        setColumnsLoading(false);
        return;
      }
      setColumnsLoading(true);
      try {
        const cols = await board.fetchColumns();
        if (!cancelled) setColumns(cols || []);
      } catch (e) {
        if (!cancelled) setColumns([]);
      } finally {
        if (!cancelled) setColumnsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [board]);

  const numericColumns = filterNumericColumns(columns);
  const statusColumns = filterStatusColumns(columns);

  const updateConfig = (patch) => {
    onUpdate({ ...model, config: { ...model.config, ...patch } });
  };

  if (!model || !model.config) return null;

  const config = model.config;

  return (
    <Box p="3" borderWidth="1px" rounded="md" borderColor="green.200" bg="green.50" _dark={{ bg: 'green.950', borderColor: 'green.800' }}>
      <Text fontWeight="semibold" fontSize="sm" mb="2">{getModelLabel(model)}</Text>
      {columnsLoading ? (
        <Text fontSize="sm" color="fg.muted">カラム読み込み中...</Text>
      ) : (
        <Stack gap="3">
          {model.type === PRICE_MODEL_TYPES.PER_UNIT && (
            <>
              <SourceSlot
                label={t.quantity}
                value={config.quantity}
                options={numericColumns}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 0}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <SourceSlot
                label={t.unitPrice}
                value={config.unitPrice}
                options={numericColumns}
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
              options={numericColumns}
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
                label={t.quantity}
                value={config.quantity}
                options={numericColumns}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 0}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">{t.cpqTierRange}（手入力・最大{TIERED_MAX_TIERS}段階）</Text>
              {(config.tiers || []).map((tier, ti) => (
                <HStack key={ti} gap="2" align="center">
                  <NumberInput.Root
                    size="sm"
                    maxW="80px"
                    min={0}
                    disabled={isLocked}
                    value={String(tier.min)}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, min: valueAsNumber };
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
                    value={String(tier.max)}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, max: valueAsNumber };
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
                    value={String(tier.unitPrice)}
                    onValueChange={({ valueAsNumber }) => {
                      const tiers = [...(config.tiers || [])];
                      tiers[ti] = { ...tier, unitPrice: valueAsNumber };
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
                options={numericColumns}
                manualValue={config.quantity?.type === 'manual' ? config.quantity.value : 1}
                onSourceChange={(q) => updateConfig({ quantity: q })}
                onManualChange={(v) => updateConfig({ quantity: { type: 'manual', value: v } })}
                isLocked={isLocked}
                t={t}
              />
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">{t.cpqPlanPrices}</Text>
              {Object.entries(config.planPrices || {}).map(([label, amount]) => (
                <HStack key={label} gap="2">
                  <Box as="input"
                    type="text"
                    value={label}
                    onChange={(e) => {
                      const planPrices = { ...(config.planPrices || {}) };
                      delete planPrices[label];
                      planPrices[e.target.value.trim()] = amount;
                      updateConfig({ planPrices });
                    }}
                    placeholder="ラベル"
                    size="sm"
                    maxW="120px"
                    px="2"
                    py="1"
                    rounded="md"
                    borderWidth="1px"
                    borderColor="border"
                    disabled={isLocked}
                  />
                  <NumberInput.Root
                    size="sm"
                    maxW="100px"
                    min={0}
                    step={0.01}
                    disabled={isLocked}
                    value={String(amount)}
                    onValueChange={({ valueAsNumber }) => {
                      const planPrices = { ...(config.planPrices || {}), [label]: valueAsNumber };
                      updateConfig({ planPrices });
                    }}
                  >
                    <NumberInput.Input />
                  </NumberInput.Root>
                  {!isLocked && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => {
                        const planPrices = { ...(config.planPrices || {}) };
                        delete planPrices[label];
                        updateConfig({ planPrices });
                      }}
                    >
                      削除
                    </Button>
                  )}
                </HStack>
              ))}
              {!isLocked && (
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="green"
                  onClick={() => {
                    const keys = Object.keys(config.planPrices || {});
                    const key = keys.length === 0 ? '新規' : `新規${keys.length + 1}`;
                    const planPrices = { ...(config.planPrices || {}), [key]: 0 };
                    updateConfig({ planPrices });
                  }}
                >
                  + プラン金額を追加
                </Button>
              )}
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}
