import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Stack,
  Heading,
  Text,
  Select,
  Field,
  Input,
  CloseButton,
  createListCollection,
  Card,
  HStack,
  Badge,
  Separator,
  Spinner
} from '@chakra-ui/react';
import { Settings, Save } from 'lucide-react';
import { translations } from '../utils/translations';
import BoardSDK from '../sdk/BoardSDK';

// Default mappings - defined outside component to avoid recreation
const defaultMappings = {
  invoiceNumber: 'manual',
  invoiceDate: 'column3',
  clientName: 'clientName',
  clientDepartment: 'manual',
  clientContact: 'manual',
  clientZip: 'manual',
  clientAddress: 'manual',
  clientPhone: 'manual',
  clientEmail: 'manual',
  discount: 'discount',
  taxAmount: 'taxAmount',
  items: 'subitems',
  subitemPrice: 'column11' // サブアイテムの価格カラム
};

// Base column items (always available - includes commonly used columns)
const baseColumnItems = [
  { label: '手動入力 (Manual Input)', value: 'manual' },
  { label: 'Name - アイテム名', value: 'name' },
  { label: 'Client Name - 請求先名', value: 'clientName' },
  { label: 'Column1 - ユーザー', value: 'column1' },
  { label: 'Column2 - 状況', value: 'column2' },
  { label: 'Column3 - 請求日', value: 'column3' },
  { label: 'Discount - 割引額', value: 'discount' },
  { label: 'Tax Amount - 税額', value: 'taxAmount' },
  { label: 'Column11 - 数値1', value: 'column11' },
  { label: 'Column21 - 数値2', value: 'column21' },
  { label: 'Subitems - サブアイテム（明細）', value: 'subitems' },
  { label: 'カスタム列 ID (直接入力)', value: 'custom' }
];

const fieldKeys = Object.keys(defaultMappings);

const FieldMappingDialog = ({ isOpen, onClose, onSave, language, initialMappings }) => {
  const [mappings, setMappings] = useState(defaultMappings);
  const [boardColumns, setBoardColumns] = useState(createListCollection({ items: baseColumnItems }));
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = translations[language] || translations.ja;
  const board = new BoardSDK();

  // Fetch board columns dynamically when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchColumns = async () => {
      setLoadingColumns(true);
      try {
        await board.initialize();
        const columns = await board.fetchColumns();
        
        console.log('[FieldMappingDialog] Fetched columns:', columns);
        console.log('[FieldMappingDialog] Column count:', columns.length);
        
        // Map column types to readable labels
        const getColumnTypeLabel = (type) => {
          const typeMap = {
            'mirror': 'ミラー',
            'mirror__': 'ミラー',
            'text': 'テキスト',
            'numeric': '数値',
            'date': '日付',
            'status': 'ステータス',
            'person': 'ユーザー',
            'email': 'メール',
            'phone': '電話',
            'link': 'リンク',
            'file': 'ファイル',
            'checkbox': 'チェックボックス',
            'rating': '評価',
            'timeline': 'タイムライン',
            'formula': '数式',
            'dependency': '依存関係',
            'location': '場所',
            'tags': 'タグ',
            'vote': '投票',
            'hour': '時間',
            'week': '週',
            'item_id': 'アイテムID',
            'board_relation': 'ボード関連',
            'auto_number': '自動番号',
            'creation_log': '作成ログ',
            'last_updated': '最終更新',
            'name': '名前'
          };
          return typeMap[type] || type;
        };
        
        // Create a map of actual column IDs from the board
        const actualColumnIds = new Set(columns.map(col => col.id));
        const actualColumnMap = new Map(columns.map(col => [col.id, col]));
        
        // Filter base columns to only include those that exist in the actual board
        // Also include special values like 'manual', 'name', 'subitems', 'custom'
        const validBaseColumns = baseColumnItems.filter(item => {
          // Always include special values
          if (['manual', 'name', 'subitems', 'custom'].includes(item.value)) {
            return true;
          }
          // For mapped columns (like 'clientName', 'column1', etc.), check if they exist in actual columns
          // These are mapping keys, not actual column IDs, so we need to check differently
          // For now, we'll include all base columns and let the user choose
          // The actual validation happens when loading data
          return true;
        });
        
        // Create column items from fetched columns
        const dynamicColumns = columns.map(col => ({
          label: `${col.title} (${getColumnTypeLabel(col.type)})`,
          value: col.id
        }));
        
        console.log('[FieldMappingDialog] Dynamic columns created:', dynamicColumns.length);
        console.log('[FieldMappingDialog] Mirror columns in dynamic:', dynamicColumns.filter(c => c.label.includes('ミラー')));
        
        // Get existing base column values to avoid duplicates
        const baseColumnValues = new Set(validBaseColumns.map(item => item.value));
        
        // Filter out dynamic columns that already exist in base columns
        const uniqueDynamicColumns = dynamicColumns.filter(col => !baseColumnValues.has(col.value));
        
        console.log('[FieldMappingDialog] Valid base columns:', validBaseColumns.length);
        console.log('[FieldMappingDialog] Unique dynamic columns (after filtering):', uniqueDynamicColumns.length);
        console.log('[FieldMappingDialog] Final columns count:', validBaseColumns.length + uniqueDynamicColumns.length);
        
        // Combine base columns with unique dynamic columns
        const allColumns = [
          ...validBaseColumns,
          ...uniqueDynamicColumns
        ];
        
        setBoardColumns(createListCollection({ items: allColumns }));
        console.log('[FieldMappingDialog] Loaded', columns.length, 'columns from board,', uniqueDynamicColumns.length, 'unique dynamic columns added');
      } catch (error) {
        console.error('FieldMappingDialog: Failed to fetch columns:', error);
        // Fallback to base columns only
        setBoardColumns(createListCollection({ items: baseColumnItems }));
      } finally {
        setLoadingColumns(false);
      }
    };
    
    fetchColumns();
  }, [isOpen]);

  useEffect(() => {
    // Only reset mappings when dialog opens and initialMappings changes
    if (!isOpen) return;
    
    // Use initialMappings if provided, otherwise load from localStorage
    if (initialMappings) {
      const merged = { ...defaultMappings, ...initialMappings };
      setMappings(merged);
      console.log('FieldMappingDialog: Loaded mappings from initialMappings:', merged);
    } else {
      const saved = localStorage.getItem('invoiceFieldMappings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with defaults to ensure all fields are present
          const merged = { ...defaultMappings, ...parsed };
          setMappings(merged);
          console.log('FieldMappingDialog: Loaded mappings from localStorage:', merged);
        } catch (e) {
          console.error('Failed to load mappings:', e);
          setMappings(defaultMappings);
        }
      } else {
        setMappings(defaultMappings);
        console.log('FieldMappingDialog: Using default mappings:', defaultMappings);
      }
    }
  }, [isOpen, initialMappings]); // Reset when dialog opens or initialMappings changes

  // Debug: Log current mappings and boardColumns
  useEffect(() => {
    if (isOpen) {
      console.log('FieldMappingDialog: Current mappings:', mappings);
      console.log('FieldMappingDialog: Available boardColumns:', boardColumns.items.map(i => ({ value: i.value, label: i.label })));
    }
  }, [isOpen, mappings, boardColumns]);

  const handleSave = () => {
    localStorage.setItem('invoiceFieldMappings', JSON.stringify(mappings));
    onSave(mappings);
    onClose();
  };

  const fieldLabels = {
    invoiceNumber: { ja: '請求書番号', en: 'Invoice Number', es: 'Número de Factura' },
    invoiceDate: { ja: '請求日', en: 'Invoice Date', es: 'Fecha de Factura' },
    clientName: { ja: '請求先名', en: 'Client Name', es: 'Nombre del Cliente' },
    clientDepartment: { ja: '部署', en: 'Department', es: 'Departamento' },
    clientContact: { ja: '担当者', en: 'Contact Person', es: 'Persona de Contacto' },
    clientZip: { ja: '郵便番号', en: 'Postal Code', es: 'Código Postal' },
    clientAddress: { ja: '住所', en: 'Address', es: 'Dirección' },
    clientPhone: { ja: '電話番号', en: 'Phone Number', es: 'Número de Teléfono' },
    clientEmail: { ja: 'メールアドレス', en: 'Email Address', es: 'Dirección de Correo' },
    discount: { ja: '割引', en: 'Discount', es: 'Descuento' },
    taxAmount: { ja: '税額', en: 'Tax Amount', es: 'Importe del Impuesto' },
    items: { ja: '明細', en: 'Line Items', es: 'Artículos' },
    subitemPrice: { ja: 'サブアイテム価格カラム', en: 'Subitem Price Column', es: 'Columna de Precio de Subartículo' }
  };

  const getFieldLabel = (fieldKey) => {
    return fieldLabels[fieldKey]?.[language] || fieldKey;
  };

  const columnExists = (value) =>
    !!value && boardColumns.items.some(item => item.value === value && value !== 'custom');

  const isCustomValue = (value) => value && !columnExists(value);

  const getSelectValue = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    // Use mappingValue if it exists and is not empty, otherwise use defaultValue
    const actual = (mappingValue && mappingValue !== '') ? mappingValue : defaultValue;
    if (!actual || actual === '') return 'custom';
    // Check if the value exists in boardColumns
    const exists = boardColumns.items.some(item => item.value === actual);
    return exists ? actual : 'custom';
  };

  const getDisplayLabel = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    const actual = mappingValue && mappingValue.length > 0 ? mappingValue : defaultValue;
    if (!actual) return '未設定';
    if (isCustomValue(actual)) return actual;
    const column = boardColumns.items.find((i) => i.value === actual);
    return column ? column.label : actual;
  };

  const handleSelectChange = (fieldKey, selected) => {
    console.log('[FieldMappingDialog] handleSelectChange:', fieldKey, selected);
    setSaving(true);
    
    setMappings((prev) => {
      let updatedMappings;
      if (selected === 'custom') {
        const current = prev[fieldKey];
        // If current value is a custom value (not in boardColumns), keep it, otherwise clear
        const isCustom = current && !boardColumns.items.some(item => item.value === current);
        updatedMappings = {
          ...prev,
          [fieldKey]: isCustom ? current : ''
        };
      } else {
        console.log('[FieldMappingDialog] Setting mapping:', fieldKey, 'to', selected);
        updatedMappings = { ...prev, [fieldKey]: selected };
      }
      
      // Auto-save after state update
      setTimeout(() => {
        try {
          localStorage.setItem('invoiceFieldMappings', JSON.stringify(updatedMappings));
          // Call onSave callback to notify parent component
          if (onSave) {
            onSave(updatedMappings);
          }
          console.log('[FieldMappingDialog] Auto-saved mappings');
        } catch (error) {
          console.error('[FieldMappingDialog] Failed to auto-save:', error);
        } finally {
          setSaving(false);
        }
      }, 100);
      
      return updatedMappings;
    });
  };

  const renderCustomInput = (fieldKey, placeholder) => {
    if (getSelectValue(fieldKey) !== 'custom') return null;
    return (
      <Input
        mt="2"
        value={mappings[fieldKey] || ''}
        onChange={(e) => setMappings((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
        placeholder={placeholder}
      />
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxH="90vh">
          <Dialog.Header>
            <HStack justify="space-between" align="center">
              <HStack gap="2">
                <Settings size={24} />
                <Text>{t.fieldMappingTitle}</Text>
              </HStack>
              {saving && (
                <HStack gap="2" color="blue.500">
                  <Spinner size="sm" />
                  <Text fontSize="sm">保存中...</Text>
                </HStack>
              )}
            </HStack>
            <Dialog.Description>{t.fieldMappingDescription}</Dialog.Description>
          </Dialog.Header>

          <Dialog.Body overflowY="auto" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <Stack gap="6">
              <Card.Root bg="blue.50" borderColor="blue.200">
                <Card.Body p="4">
                  <Stack gap="2">
                    <HStack gap="2">
                      <Badge colorPalette="blue">{t.fieldMappingHint}</Badge>
                      <Text fontSize="sm" fontWeight="medium">
                        {t.fieldMappingAbout}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted">
                      {t.fieldMappingHintText}
                    </Text>
                    {loadingColumns && (
                      <Text fontSize="xs" color="fg.muted" fontStyle="italic">
                        ボードのカラムを読み込み中...
                      </Text>
                    )}
                  </Stack>
                </Card.Body>
              </Card.Root>

              <Separator />

              <Stack gap="4">
                <Heading size="sm">{t.fieldMappingBasicInfo}</Heading>

                <Field.Root>
                  <Field.Label>{getFieldLabel('invoiceNumber')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('invoiceNumber')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('invoiceNumber', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('invoiceNumber', '例: text_mkwjtrys')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('invoiceNumber')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('invoiceDate')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('invoiceDate')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('invoiceDate', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('invoiceDate', '例: column3')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('invoiceDate')}
                  </Field.HelperText>
                </Field.Root>
              </Stack>

              <Separator />

              <Stack gap="4">
                <Heading size="sm">{t.fieldMappingBillingInfo}</Heading>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientName')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientName')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientName', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientName', '例: text_mkwjtrys')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientName')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientDepartment')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientDepartment')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientDepartment', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientDepartment', '例: text_department')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientDepartment')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientContact')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientContact')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientContact', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientContact', '例: text_contact')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientContact')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientZip')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientZip')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientZip', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientZip', '例: text_zip')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientZip')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientAddress')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientAddress')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientAddress', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientAddress', '例: text_address')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientAddress')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientPhone')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientPhone')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientPhone', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientPhone', '例: text_phone')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientPhone')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientEmail')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('clientEmail')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('clientEmail', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('clientEmail', '例: text_email')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientEmail')}
                  </Field.HelperText>
                </Field.Root>
              </Stack>

              <Separator />

              <Stack gap="4">
                <Heading size="sm">{t.fieldMappingAmountItems}</Heading>

                <Field.Root>
                  <Field.Label>{getFieldLabel('discount')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('discount')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('discount', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('discount', '例: numeric_mkwjxbfn')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('discount')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('taxAmount')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('taxAmount')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('taxAmount', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('taxAmount', '例: numeric_mkwqnby1')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('taxAmount')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('items')}</Field.Label>
                  <Select.Root
                    collection={boardColumns}
                    value={[getSelectValue('items')]}
                    onValueChange={(details) => {
                      console.log('[FieldMappingDialog] Select onValueChange:', details);
                      if (details.value && details.value.length > 0) {
                        handleSelectChange('items', details.value[0]);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content zIndex="modal" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {boardColumns.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  {renderCustomInput('items', '例: subitems')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('items')}
                  </Field.HelperText>
                </Field.Root>

                {getSelectValue('items') === 'subitems' && (
                  <Field.Root>
                    <Field.Label>{getFieldLabel('subitemPrice')}</Field.Label>
                    <Select.Root
                      collection={boardColumns}
                      value={[getSelectValue('subitemPrice')]}
                      onValueChange={(details) => {
                        console.log('[FieldMappingDialog] Select onValueChange:', details);
                        if (details.value && details.value.length > 0) {
                          handleSelectChange('subitemPrice', details.value[0]);
                        }
                      }}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder={t.fieldMappingSelectColumn} />
                      </Select.Trigger>
                      <Select.Positioner>
                        <Select.Content zIndex="popover">
                          {boardColumns.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                    {renderCustomInput('subitemPrice', '例: numeric_mkwjthws')}
                    <Field.HelperText fontSize="xs">
                      {t.fieldMappingCurrent} {getDisplayLabel('subitemPrice')}
                    </Field.HelperText>
                  </Field.Root>
                )}
              </Stack>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                {t.fieldMappingCancel}
              </Button>
            </Dialog.ActionTrigger>
            <Button colorPalette="blue" onClick={handleSave}>
              <Save size={16} /> {t.fieldMappingSave}
            </Button>
          </Dialog.Footer>

          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default FieldMappingDialog;

