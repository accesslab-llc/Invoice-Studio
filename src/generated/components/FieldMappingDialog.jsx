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
  Separator
} from '@chakra-ui/react';
import { Settings, Save } from 'lucide-react';
import { translations } from '../utils/translations';

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

const boardColumnItems = [
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

const boardColumns = createListCollection({ items: boardColumnItems });
const fieldKeys = Object.keys(defaultMappings);

const FieldMappingDialog = ({ isOpen, onClose, onSave, language, initialMappings }) => {
  const [mappings, setMappings] = useState(defaultMappings);
  const t = translations[language] || translations.ja;

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
  }, [isOpen, mappings]);

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
    const actual = mappingValue && mappingValue.length > 0 ? mappingValue : defaultValue;
    if (!actual) return 'custom';
    return isCustomValue(actual) ? 'custom' : actual;
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
    setMappings((prev) => {
      if (selected === 'custom') {
        const current = prev[fieldKey];
        return {
          ...prev,
          [fieldKey]: isCustomValue(current) ? current : ''
        };
      }
      return { ...prev, [fieldKey]: selected };
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
            <Dialog.Title>
              <HStack gap="2">
                <Settings size={24} />
                <Text>{t.fieldMappingTitle}</Text>
              </HStack>
            </Dialog.Title>
            <Dialog.Description>{t.fieldMappingDescription}</Dialog.Description>
          </Dialog.Header>

          <Dialog.Body overflowY="auto">
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('invoiceNumber', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('invoiceDate', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientName', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientDepartment', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientContact', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientZip', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientAddress', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientPhone', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('clientEmail', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('discount', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('taxAmount', value[0]);
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
                    onValueChange={({ value }) => {
                      if (value && value.length > 0) {
                        handleSelectChange('items', value[0]);
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
                      onValueChange={({ value }) => {
                        if (value && value.length > 0) {
                          handleSelectChange('subitemPrice', value[0]);
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

