import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  Stack,
  HStack,
  Button,
  Input,
  Textarea,
  Field,
  Text,
  Select,
  Separator,
  CloseButton,
  createListCollection
} from '@chakra-ui/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { TEMPLATE_FIELDS } from '../constants/templateFields';
import { translations } from '../utils/translations';

const TemplateDialog = ({ isOpen, onClose, templates, onSave, language }) => {
  const t = translations[language];

  const emptyData = useMemo(
    () =>
      TEMPLATE_FIELDS.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}),
    []
  );

  const initialTemplate = useMemo(
    () => ({
      id: '',
      name: '',
      data: { ...emptyData }
    }),
    [emptyData]
  );

  const [localTemplates, setLocalTemplates] = useState([]);
  const [currentTemplateId, setCurrentTemplateId] = useState('');
  const [formValues, setFormValues] = useState(initialTemplate);

  const templateSelectCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: t.newTemplate, value: '' },
          ...localTemplates.map((tpl) => ({ label: tpl.name, value: tpl.id }))
        ]
      }),
    [localTemplates, t.newTemplate]
  );

  useEffect(() => {
    if (isOpen) {
      setLocalTemplates(templates || []);
      setCurrentTemplateId('');
      setFormValues(initialTemplate);
    }
  }, [isOpen, templates, initialTemplate]);

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  const handleSelectTemplate = (id) => {
    if (!id) {
      setCurrentTemplateId('');
      setFormValues(initialTemplate);
      return;
    }
    const target = localTemplates.find((tpl) => tpl.id === id);
    if (target) {
      setCurrentTemplateId(target.id);
      setFormValues({
        id: target.id,
        name: target.name,
        data: { ...emptyData, ...target.data }
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!formValues.name.trim()) {
      alert(t.templateNameRequired);
      return;
    }

    let updatedTemplates;
    if (currentTemplateId) {
      updatedTemplates = localTemplates.map((tpl) =>
        tpl.id === currentTemplateId
            ? { ...tpl, name: formValues.name.trim(), data: formValues.data }
            : tpl
      );
    } else {
      const newTemplate = {
        id: Date.now().toString(),
        name: formValues.name.trim(),
        data: formValues.data
      };
      updatedTemplates = [...localTemplates, newTemplate];
      setCurrentTemplateId(newTemplate.id);
      setFormValues(newTemplate);
    }

    setLocalTemplates(updatedTemplates);
    onSave?.(updatedTemplates);
    alert(t.templateSaved);
  };

  const handleDeleteTemplate = () => {
    if (!currentTemplateId) return;
    
    // Get template name for confirmation message
    const templateToDelete = localTemplates.find((tpl) => tpl.id === currentTemplateId);
    const templateName = templateToDelete?.name || t.deleteTemplate;
    
    // Show confirmation dialog
    if (!confirm(`${templateName}${t.deleteTemplateConfirm || 'を削除しますか？'}`)) {
      return;
    }
    
    const updatedTemplates = localTemplates.filter((tpl) => tpl.id !== currentTemplateId);
    setLocalTemplates(updatedTemplates);
    setCurrentTemplateId('');
    setFormValues(initialTemplate);
    onSave?.(updatedTemplates);
    alert(t.templateDeleted || 'テンプレートを削除しました。');
  };

  const renderCompanyFields = () => (
    <Stack gap="3">
      <Field.Root>
        <Field.Label>{t.companyName}</Field.Label>
        <Input
          value={formValues.data.companyName}
          onChange={(e) => handleFieldChange('companyName', e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t.representative}</Field.Label>
        <Input
          value={formValues.data.companyRep}
          onChange={(e) => handleFieldChange('companyRep', e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t.postalCode}</Field.Label>
        <Input
          value={formValues.data.companyZip}
          onChange={(e) => handleFieldChange('companyZip', e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t.address}</Field.Label>
        <Textarea
          value={formValues.data.companyAddress}
          onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
          rows={2}
        />
      </Field.Root>
      <HStack gap="3">
        <Field.Root flex="1">
          <Field.Label>{t.phone}</Field.Label>
          <Input
            value={formValues.data.companyPhone}
            onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
          />
        </Field.Root>
        <Field.Root flex="1">
          <Field.Label>{t.fax}</Field.Label>
          <Input
            value={formValues.data.companyFax}
            onChange={(e) => handleFieldChange('companyFax', e.target.value)}
          />
        </Field.Root>
      </HStack>
      <Field.Root>
        <Field.Label>{t.email}</Field.Label>
        <Input
          value={formValues.data.companyEmail}
          onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t.registrationNumber}</Field.Label>
        <Input
          value={formValues.data.companyRegNumber}
          onChange={(e) => handleFieldChange('companyRegNumber', e.target.value)}
        />
      </Field.Root>
    </Stack>
  );

  const renderPaymentFields = () => (
    <Stack gap="3" mt="4">
      <Field.Root>
        <Field.Label>{t.bankName}</Field.Label>
        <Input
          value={formValues.data.bankName}
          onChange={(e) => handleFieldChange('bankName', e.target.value)}
        />
      </Field.Root>
      <HStack gap="3">
        <Field.Root flex="1">
          <Field.Label>{t.accountType}</Field.Label>
          <Input
            value={formValues.data.accountType}
            onChange={(e) => handleFieldChange('accountType', e.target.value)}
          />
        </Field.Root>
        <Field.Root flex="1">
          <Field.Label>{t.accountNumber}</Field.Label>
          <Input
            value={formValues.data.accountNumber}
            onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
          />
        </Field.Root>
      </HStack>
      <Field.Root>
        <Field.Label>{t.accountHolder}</Field.Label>
        <Input
          value={formValues.data.accountHolder}
          onChange={(e) => handleFieldChange('accountHolder', e.target.value)}
        />
      </Field.Root>
    </Stack>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t.manageTemplates}</Dialog.Title>
            <Dialog.Description>{t.templateDescription}</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <Stack spacing="6">
              <Field.Root>
                <Field.Label>{t.templateSelectLabel}</Field.Label>
                <HStack>
                  <Select.Root
                    collection={templateSelectCollection}
                    value={currentTemplateId ? [currentTemplateId] : ['']}
                    onValueChange={({ value }) => handleSelectTemplate(value[0] || '')}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder={t.selectTemplatePlaceholder} />
                    </Select.Trigger>
                    <Select.Positioner>
                      <Select.Content>
                        {templateSelectCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  <Button leftIcon={<Plus size={16} />} onClick={() => handleSelectTemplate('')}>
                    {t.newTemplate}
                  </Button>
                </HStack>
              </Field.Root>

              <Field.Root>
                <Field.Label>{t.templateName}</Field.Label>
                <Input
                  value={formValues.name}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t.templateNamePlaceholder}
                />
              </Field.Root>

              <Separator />

              <Text fontWeight="semibold">{t.billingFrom}</Text>
              {renderCompanyFields()}

              <Separator />

              <Text fontWeight="semibold">{t.paymentInfo}</Text>
              {renderPaymentFields()}
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack spacing="3" justify="flex-start" w="full">
                <Button
                  variant="solid"
                  colorScheme="blue"
                  leftIcon={<Save size={16} />}
                  onClick={handleSaveTemplate}
                >
                  {t.saveTemplate}
                </Button>
                {currentTemplateId && (
                  <Button variant="ghost" colorScheme="red" leftIcon={<Trash2 size={16} />} onClick={handleDeleteTemplate}>
                    {t.deleteTemplate}
                  </Button>
                )}
            </HStack>
          </Dialog.Footer>

          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export default TemplateDialog;


