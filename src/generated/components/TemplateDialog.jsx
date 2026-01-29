import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  Stack,
  HStack,
  VStack,
  Button,
  Input,
  Field,
  Text,
  Separator,
  CloseButton,
  Box,
  createListCollection
} from '@chakra-ui/react';
import { Save, Trash2, Check } from 'lucide-react';
import { translations } from '../utils/translations';

const TemplateDialog = ({ isOpen, onClose, templateType = 'invoice', templates, onSave, language, formData, fieldMappings, onApply }) => {
  const t = translations[language];
  const isCpq = templateType === 'cpq';
  const titleText = isCpq ? (t.templatesForCPQ ?? 'CPQ用テンプレート') : (t.templatesForInvoice ?? '請求書用テンプレート');

  const [localTemplates, setLocalTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalTemplates(templates || []);
      setSelectedTemplateId('');
      // Set default template name based on language and existing template count
      const templateCount = (templates || []).length;
      const defaultName = language === 'ja' 
        ? `テンプレート${templateCount + 1}`
        : language === 'en'
        ? `Template${templateCount + 1}`
        : `Plantilla${templateCount + 1}`;
      setNewTemplateName(defaultName);
    }
  }, [isOpen, templates, language]);

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) {
      alert(t.templateSelectFirst || 'テンプレートを選択してください');
      return;
    }

    const template = localTemplates.find((tpl) => tpl.id === selectedTemplateId);
    if (template && onApply) {
      onApply(template);
      onClose();
    }
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) {
      alert(t.templateSelectFirst || 'テンプレートを選択してください');
      return;
    }
    
    const templateToDelete = localTemplates.find((tpl) => tpl.id === selectedTemplateId);
    const templateName = templateToDelete?.name || t.deleteTemplate;
    
    if (!confirm(`${templateName}${t.deleteTemplateConfirm || 'を削除しますか？'}`)) {
      return;
    }
    
    const updatedTemplates = localTemplates.filter((tpl) => tpl.id !== selectedTemplateId);
    setLocalTemplates(updatedTemplates);
    setSelectedTemplateId('');
    onSave?.(updatedTemplates);
    alert(t.templateDeleted || 'テンプレートを削除しました。');
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      alert(t.templateNameRequired || 'テンプレート名を入力してください');
      return;
    }

    // Save all formData and fieldMappings
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      data: {}, // Keep for backward compatibility
      formData: formData ? JSON.parse(JSON.stringify(formData)) : null,
      fieldMappings: fieldMappings ? JSON.parse(JSON.stringify(fieldMappings)) : null
    };

    const updatedTemplates = [...localTemplates, newTemplate];
    setLocalTemplates(updatedTemplates);
    setNewTemplateName('');
    onSave?.(updatedTemplates);
    alert(t.templateSaved || 'テンプレートを保存しました。');
  };

  const templateCollection = useMemo(
    () =>
      createListCollection({
        items: localTemplates.map((tpl) => ({ label: tpl.name, value: tpl.id }))
      }),
    [localTemplates]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{titleText}</Dialog.Title>
            <Dialog.Description>{t.templateDescription || 'テンプレートを管理します。選択して適用・削除、または新規保存ができます。'}</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <Stack spacing="6">
              {/* Template List */}
              <Field.Root>
                <Field.Label>{t.templateList || 'テンプレート一覧'}</Field.Label>
                {localTemplates.length === 0 ? (
                  <Box p="4" borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
                    <Text color="gray.500" textAlign="center">{t.noTemplates || '保存されたテンプレートはありません'}</Text>
                  </Box>
                ) : (
                  <Stack gap="2">
                    {localTemplates.map((tpl) => (
                      <HStack
                        key={tpl.id}
                        p="3"
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={selectedTemplateId === tpl.id ? 'blue.500' : 'gray.200'}
                        bg={selectedTemplateId === tpl.id ? 'blue.50' : 'white'}
                        cursor="pointer"
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                        justify="space-between"
                        gap="2"
                      >
                        <Text fontWeight={selectedTemplateId === tpl.id ? 'semibold' : 'normal'} flex="1">
                          {tpl.name}
                        </Text>
                        {selectedTemplateId === tpl.id && (
                          <HStack gap="2">
                            <Button
                              variant="solid"
                              colorPalette="blue"
                              leftIcon={<Check size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyTemplate();
                              }}
                              size="sm"
                            >
                              {t.applyTemplate || '適用'}
                            </Button>
                            <Button
                              variant="ghost"
                              colorPalette="red"
                              leftIcon={<Trash2 size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate();
                              }}
                              size="sm"
                            >
                              {t.deleteTemplate}
                            </Button>
                          </HStack>
                        )}
                      </HStack>
                    ))}
                  </Stack>
                )}
              </Field.Root>

              <Separator />

              {/* Save new template */}
              <VStack gap="3" align="stretch">
                <Text fontWeight="semibold">{t.saveNewTemplate || '新規テンプレートを保存'}</Text>
                <Field.Root>
                  <Field.Label>{t.templateName}</Field.Label>
                  <HStack>
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder={t.templateNamePlaceholder || 'テンプレート名を入力'}
                      flex="1"
                    />
                    <Button
                      variant="solid"
                      colorPalette="green"
                      leftIcon={<Save size={16} />}
                      onClick={handleSaveTemplate}
                    >
                      {t.saveTemplate}
                    </Button>
                  </HStack>
                </Field.Root>
                <Text fontSize="xs" color="gray.600">
                  {t.templateSaveDescription || '現在の請求書の内容、発行元情報、マッピング設定、画像まで全て保存されます。'}
                </Text>
              </VStack>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={onClose}>
              {t.close || '閉じる'}
            </Button>
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
