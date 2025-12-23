import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Container, Stack, Heading, Text, VStack, HStack,
  Field, Input, Textarea, Select, createListCollection, Separator,
  NumberInput, SimpleGrid, Card, Badge, Skeleton, Table, Image,
  Collapsible, Alert
} from '@chakra-ui/react';
import { FileText, Download, RefreshCw, Settings, Eye, EyeOff, HelpCircle } from 'lucide-react';
import BoardSDK from './sdk/BoardSDK';
import ItemSelector from './components/ItemSelector';
import ImageUploader from './components/ImageUploader';
import FieldMappingDialog from './components/FieldMappingDialog';
import TemplateDialog from './components/TemplateDialog';
import HelpDialog from './components/HelpDialog';
import { generateInvoiceHTML } from './utils/invoiceTemplates';
import { translations } from './utils/translations';
import { TEMPLATE_FIELDS } from './constants/templateFields';

const board = new BoardSDK();

const DEFAULT_TEMPLATE = {
  id: 'default-template',
  name: 'デフォルトテンプレート',
  data: {
    companyName: 'Your Company',
    companyRep: '代表取締役 山田太郎',
    companyZip: '〒100-0001',
    companyAddress: '東京都千代田区千代田1-1-1',
    companyPhone: 'TEL: 03-1234-5678',
    companyFax: 'FAX: 03-1234-5679',
    companyEmail: 'info@company.co.jp',
    companyRegNumber: 'T1234567890123',
    bankName: 'みずほ銀行 東京支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'カブシキガイシャ ユアカンパニー'
  }
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [language, setLanguage] = useState('ja');
  const [template, setTemplate] = useState('modern');
  const [currentStep, setCurrentStep] = useState('select');
  const [pageSize, setPageSize] = useState('a4');
  const [fitToOnePage, setFitToOnePage] = useState(true);
  const [isFieldMappingOpen, setIsFieldMappingOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('none');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({
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
    subitemPrice: 'column11', // サブアイテムの価格カラム
    subitemQuantity: 'manual' // サブアイテムの数量カラム
  });
  
  // Use ref to always have the latest fieldMappings in loadSelectedItem
  const fieldMappingsRef = useRef(fieldMappings);
  useEffect(() => {
    fieldMappingsRef.current = fieldMappings;
  }, [fieldMappings]);

  const [sectionVisibility, setSectionVisibility] = useState({
    billingFrom: true,
    billingTo: true,
    paymentInfo: true,
    notes: true,
    images: true
  });

  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [formData, setFormData] = useState({
    companyLogo: null,
    signatureImage: null,
    watermarkImage: null,
    templateColors: {
      modern: '#2563eb',
      classic: '#1a1a1a',
      minimal: '#666666'
    },
    currency: 'JPY',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    companyName: '',
    companyRep: '',
    companyZip: '',
    companyAddress: '',
    companyPhone: '',
    companyFax: '',
    companyEmail: '',
    companyRegNumber: '',
    clientName: '',
    clientDepartment: '',
    clientContact: '',
    clientZip: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    paymentTerms: '30',
    bankName: '',
    accountType: '',
    accountNumber: '',
    accountHolder: '',
    items: [],
    subtotal: 0,
    taxRate: 10,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: '※振込手数料はお客様負担でお願い致します。'
  });

  const t = translations[language];
  const templateLocked = selectedTemplateId !== 'none';

  const languages = createListCollection({
    items: [
      { label: '日本語', value: 'ja' },
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' }
    ]
  });

  const layoutTemplates = createListCollection({
    items: [
      { label: t.templateModern, value: 'modern' },
      { label: t.templateClassic, value: 'classic' },
      { label: t.templateMinimal, value: 'minimal' }
    ]
  });

  const templateCollection = createListCollection({
    items: [
      { label: t.noTemplate, value: 'none' },
      ...templates.map((tpl) => ({
        label: tpl.name,
        value: tpl.id
      }))
    ]
  });

  const currencies = createListCollection({
    items: [
      { label: t.currencyJPY, value: 'JPY' },
      { label: t.currencyUSD, value: 'USD' },
      { label: t.currencyEUR, value: 'EUR' },
      { label: t.currencyGBP, value: 'GBP' },
      { label: t.currencyCNY, value: 'CNY' }
    ]
  });

  const getCurrencySymbol = (currency) => {
    const symbols = {
      JPY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥'
    };
    return symbols[currency] || '¥';
  };

  useEffect(() => {
    const saved = localStorage.getItem('invoiceFieldMappings');
    if (saved) {
      try {
        const parsedMappings = JSON.parse(saved);
        setFieldMappings(parsedMappings);
        // Fetch board data after mappings are loaded
        fetchBoardData(parsedMappings);
      } catch (e) {
        console.error('Failed to load mappings:', e);
        fetchBoardData();
      }
    } else {
      fetchBoardData();
    }

    const savedTemplates = localStorage.getItem('invoiceTemplates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        if (parsed.length > 0) {
          setTemplates(parsed);
          return;
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }

    setTemplates([DEFAULT_TEMPLATE]);
    localStorage.setItem('invoiceTemplates', JSON.stringify([DEFAULT_TEMPLATE]));
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate, formData.discount]);

  const fetchBoardData = async (mappings = fieldMappings) => {
    setLoading(true);
    setAuthError(null); // Clear previous auth errors
    try {
      console.log('[App] Starting to fetch board data...');
      
      // Initialize board SDK first
      await board.initialize();
      console.log('[App] Board SDK initialized, boardId:', board.boardId);
      
      // Get column IDs from fieldMappings dynamically
      // Resolve mapping keys (like 'clientName', 'discount', 'taxAmount') to actual column IDs
      const columnIds = [];
      Object.values(mappings).forEach(mapping => {
        if (mapping && mapping !== 'manual' && mapping !== 'subitems' && mapping !== 'name' && mapping !== 'custom') {
          // First, try to resolve mapping key to actual column ID using columnMappings
          let resolvedColumnId = mapping;
          if (board.columnMappings && board.columnMappings[mapping]) {
            resolvedColumnId = board.columnMappings[mapping];
            console.log('[App] Resolved mapping key to column ID:', mapping, '->', resolvedColumnId);
          }
          
          // Check if resolved column ID is a valid column ID (starts with text_, numeric_, date_, etc.)
          if (resolvedColumnId.startsWith('text_') || resolvedColumnId.startsWith('numeric_') || resolvedColumnId.startsWith('date_') || 
              resolvedColumnId.startsWith('board_relation_') || resolvedColumnId.startsWith('lookup_') || resolvedColumnId.startsWith('formula_') ||
              resolvedColumnId.startsWith('mirror_') || resolvedColumnId.startsWith('status_') || resolvedColumnId.startsWith('person_') ||
              resolvedColumnId.startsWith('email_') || resolvedColumnId.startsWith('phone_') || resolvedColumnId.startsWith('link_') ||
              resolvedColumnId.startsWith('file_') || resolvedColumnId.startsWith('checkbox_') || resolvedColumnId.startsWith('rating_') ||
              resolvedColumnId.startsWith('timeline_') || resolvedColumnId.startsWith('dependency_') || resolvedColumnId.startsWith('location_') ||
              resolvedColumnId.startsWith('tags_') || resolvedColumnId.startsWith('vote_') || resolvedColumnId.startsWith('hour_') ||
              resolvedColumnId.startsWith('week_') || resolvedColumnId.startsWith('item_id_') || resolvedColumnId.startsWith('auto_number_') ||
              resolvedColumnId.startsWith('creation_log_') || resolvedColumnId.startsWith('last_updated_') || resolvedColumnId.startsWith('connect_boards_') ||
              resolvedColumnId.startsWith('country_') || resolvedColumnId.startsWith('time_tracking_') || resolvedColumnId.startsWith('integration_')) {
            if (!columnIds.includes(resolvedColumnId)) {
              columnIds.push(resolvedColumnId);
            }
          } else if (mapping === 'clientName') {
            // clientName is a special mapping, try common column IDs
            const clientNameColumns = ['text_mkwjtrys', 'clientName'];
            clientNameColumns.forEach(col => {
              if (!columnIds.includes(col)) {
                columnIds.push(col);
              }
            });
          }
        }
      });
      
      // Add subitem price and quantity columns if mapped
      const subitemColumnIds = [];
      const addSubitemColumn = (mapping) => {
        if (!mapping || mapping === 'manual' || mapping === 'custom') return;
        // Check if it's a direct column ID (starts with numeric_, text_, etc.)
        if (mapping.startsWith('numeric_') || mapping.startsWith('text_') ||
            mapping.startsWith('date_') || mapping.startsWith('board_relation_') ||
            mapping.startsWith('lookup_') || mapping.startsWith('formula_') ||
            mapping.startsWith('mirror_') || mapping.startsWith('status_') ||
            mapping.startsWith('person_') || mapping.startsWith('email_') ||
            mapping.startsWith('phone_') || mapping.startsWith('link_') ||
            mapping.startsWith('file_') || mapping.startsWith('checkbox_') ||
            mapping.startsWith('rating_') || mapping.startsWith('timeline_') ||
            mapping.startsWith('dependency_') || mapping.startsWith('location_') ||
            mapping.startsWith('tags_') || mapping.startsWith('vote_') ||
            mapping.startsWith('hour_') || mapping.startsWith('week_') ||
            mapping.startsWith('item_id_') || mapping.startsWith('auto_number_') ||
            mapping.startsWith('creation_log_') || mapping.startsWith('last_updated_') ||
            mapping.startsWith('connect_boards_') || mapping.startsWith('country_') ||
            mapping.startsWith('time_tracking_') || mapping.startsWith('integration_')) {
          if (!subitemColumnIds.includes(mapping)) {
            subitemColumnIds.push(mapping);
          }
        } else {
          // It might be a mapping key (like 'column11'), try to resolve it
          const resolvedColumnId = board.columnMappings[mapping] || mapping;
          if (resolvedColumnId && resolvedColumnId !== mapping && !subitemColumnIds.includes(resolvedColumnId)) {
            console.log('[App] Resolved subitem mapping:', mapping, '->', resolvedColumnId);
            subitemColumnIds.push(resolvedColumnId);
          }
        }
      };
      
      addSubitemColumn(mappings.subitemPrice);
      addSubitemColumn(mappings.subitemQuantity);
      
      console.log('[App] Fetching columns from fieldMappings:', columnIds);
      console.log('[App] Fetching subitem columns:', subitemColumnIds);
      
      // Fetch items with dynamically determined columns
      // If no columns specified, fetch all columns (pass null to fetch all)
      // For subitems, always fetch all columns to ensure we get the data even if the mapped column ID doesn't exist
      const result = await board.items()
        .withColumns(columnIds.length > 0 ? columnIds : null) // null means fetch all columns
        .withSubItems(null) // Always fetch all subitem columns to ensure we get the data
        .withPagination({ limit: 50 })
        .execute();

      console.log('[App] Fetch result:', result);

      if (!result.items || result.items.length === 0) {
        console.warn('[App] No items found in board');
        setItems([]);
        return;
      }

      console.log('[App] Successfully fetched', result.items.length, 'items');
      setItems(result.items);
    } catch (error) {
      console.error('[App] Failed to fetch board data:', error);
      console.error('[App] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check if it's an authentication error
      const isAuthError = error.message && (
        error.message.includes('認証') ||
        error.message.includes('authentication') ||
        error.message.includes('token') ||
        error.message.includes('Failed to obtain')
      );
      
      if (isAuthError) {
        // Set authentication error for UI display
        setAuthError(error.message || '認証に失敗しました。Monday.comからアプリを開き直してください。');
        setItems([]);
      } else {
        // Other errors: set empty items
        setItems([]);
        // Only show alert if it's a critical error (not just missing token in local dev)
        if (error.message && !error.message.includes('No authentication token')) {
          alert('データの読み込みに失敗しました。\nエラー: ' + error.message + '\n\nブラウザのコンソール（F12）で詳細を確認してください。');
        } else {
          console.warn('[App] Running in local development mode without Monday.com context. Please open this app from Monday.com board.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getMappedValue = (item, mapping) => {
    if (mapping === 'manual' || !mapping) {
      console.log('[App] getMappedValue: mapping is manual or empty:', mapping);
      return '';
    }
    if (mapping === 'subitems') return item.subitems;
    if (mapping === 'name') return item.name || '';
    
    // First, try to resolve mapping key to actual column ID using columnMappings
    let resolvedColumnId = mapping;
    if (board.columnMappings && board.columnMappings[mapping]) {
      resolvedColumnId = board.columnMappings[mapping];
      console.log('[App] getMappedValue: Resolved mapping key to column ID:', mapping, '->', resolvedColumnId);
    }
    
    // Try direct property access first (transformItem uses col.id as key, or mapping key if in columnMappings)
    // Try both the mapping key and the resolved column ID
    let value = item[mapping] || item[resolvedColumnId];
    
    // If still not found and mapping is a mapping key, try to find the value using the resolved column ID
    if ((value === undefined || value === null || value === '') && resolvedColumnId !== mapping) {
      value = item[resolvedColumnId];
    }
    
    // Special handling for clientName
    if (mapping === 'clientName' && (value === undefined || value === null || value === '')) {
      value = item.clientName || item['text_mkwjtrys'] || '';
    }
    
    console.log('[App] getMappedValue:', { mapping, resolvedColumnId, value, hasValue: value !== undefined && value !== null && value !== '', itemKeys: Object.keys(item).slice(0, 10) });
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    // Return empty string if not found
    return '';
  };

  const loadSelectedItem = async () => {
    if (!selectedItemId) return;

    const selectedItem = items.find(item => item.id === selectedItemId);
    if (!selectedItem) return;
    
    // Use ref to get the latest fieldMappings (in case it was just updated)
    const currentMappings = fieldMappingsRef.current;
    
    console.log('[App] ===== loadSelectedItem DEBUG =====');
    console.log('[App] loadSelectedItem: fieldMappings (from ref):', currentMappings);
    console.log('[App] loadSelectedItem: fieldMappings (from state):', fieldMappings);
    console.log('[App] loadSelectedItem: selectedItem keys:', Object.keys(selectedItem));
    console.log('[App] loadSelectedItem: selectedItem sample values:', {
      clientName: selectedItem.clientName,
      clientDepartment: selectedItem.clientDepartment,
      clientContact: selectedItem.clientContact,
      clientZip: selectedItem.clientZip,
      clientAddress: selectedItem.clientAddress,
      clientPhone: selectedItem.clientPhone,
      clientEmail: selectedItem.clientEmail,
      discount: selectedItem.discount,
      taxAmount: selectedItem.taxAmount
    });

    let invoiceItems = [];
    if (currentMappings.items === 'subitems' && selectedItem.subitems) {
      // Helper function to resolve column ID from mapping
      const resolveColumnId = (mapping) => {
        if (!mapping || mapping === 'custom' || mapping === 'manual') return null;
        // Check if it's a direct column ID
        if (mapping.startsWith('numeric_') || mapping.startsWith('text_') ||
            mapping.startsWith('date_') || mapping.startsWith('board_relation_') ||
            mapping.startsWith('lookup_') || mapping.startsWith('formula_') ||
            mapping.startsWith('mirror_') || mapping.startsWith('status_') ||
            mapping.startsWith('person_') || mapping.startsWith('email_') ||
            mapping.startsWith('phone_') || mapping.startsWith('link_') ||
            mapping.startsWith('file_') || mapping.startsWith('checkbox_') ||
            mapping.startsWith('rating_') || mapping.startsWith('timeline_') ||
            mapping.startsWith('dependency_') || mapping.startsWith('location_') ||
            mapping.startsWith('tags_') || mapping.startsWith('vote_') ||
            mapping.startsWith('hour_') || mapping.startsWith('week_') ||
            mapping.startsWith('item_id_') || mapping.startsWith('auto_number_') ||
            mapping.startsWith('creation_log_') || mapping.startsWith('last_updated_') ||
            mapping.startsWith('connect_boards_') || mapping.startsWith('country_') ||
            mapping.startsWith('time_tracking_') || mapping.startsWith('integration_')) {
          return mapping;
        } else {
          // It might be a mapping key (like 'column11'), try to resolve it
          const resolved = board.columnMappings[mapping] || mapping;
          console.log('[App] Resolved mapping for loadSelectedItem:', mapping, '->', resolved);
          return resolved;
        }
      };
      
      // Resolve subitemPrice and subitemQuantity mapping keys to actual column IDs
      const preferredPriceColumn = resolveColumnId(currentMappings.subitemPrice);
      const preferredQuantityColumn = resolveColumnId(currentMappings.subitemQuantity);
      
      invoiceItems = selectedItem.subitems.map(sub => {

        const getNumericValue = (raw) => {
          if (raw === undefined || raw === null || raw === '') return null;
          const num = typeof raw === 'number' ? raw : parseFloat(raw);
          return Number.isFinite(num) ? num : null;
        };

        // Get price from preferred column or fallback to first numeric column
        let price = preferredPriceColumn ? getNumericValue(sub[preferredPriceColumn]) : null;
        if (price === null) {
          const numericKey = Object.keys(sub).find((key) => {
            if (['id', 'name'].includes(key)) return false;
            const value = getNumericValue(sub[key]);
            return value !== null;
          });
          price = numericKey ? getNumericValue(sub[numericKey]) : 0;
        }

        // Get quantity from preferred column or default to 1
        let quantity = preferredQuantityColumn ? getNumericValue(sub[preferredQuantityColumn]) : null;
        if (quantity === null || quantity === 0) {
          quantity = 1; // Default to 1 if not found or 0
        }

        return {
          description: sub.name || '',
          quantity: quantity ?? 1,
          price: price ?? 0
        };
      });
    }

    // Helper function to get numeric value
    const getNumericMappedValue = (item, mapping) => {
      if (mapping === 'manual' || !mapping) return 0;
      const value = getMappedValue(item, mapping);
      if (value === '' || value === null || value === undefined) return 0;
      const num = typeof value === 'number' ? value : parseFloat(value);
      return Number.isFinite(num) ? num : 0;
    };

    setFormData(prev => {
      const newFormData = {
      invoiceNumber: getMappedValue(selectedItem, currentMappings.invoiceNumber) || prev.invoiceNumber,
      clientName: getMappedValue(selectedItem, currentMappings.clientName) || '',
      clientDepartment: getMappedValue(selectedItem, currentMappings.clientDepartment) || '',
      clientContact: getMappedValue(selectedItem, currentMappings.clientContact) || '',
        clientZip: getMappedValue(selectedItem, currentMappings.clientZip) || '',
        clientAddress: getMappedValue(selectedItem, currentMappings.clientAddress) || '',
        clientPhone: getMappedValue(selectedItem, currentMappings.clientPhone) || '',
        clientEmail: getMappedValue(selectedItem, currentMappings.clientEmail) || '',
        invoiceDate: currentMappings.invoiceDate !== 'manual' && currentMappings.invoiceDate
          ? (selectedItem[currentMappings.invoiceDate] 
        ? new Date(selectedItem[currentMappings.invoiceDate]).toISOString().split('T')[0]
              : prev.invoiceDate)
        : prev.invoiceDate,
        discount: getNumericMappedValue(selectedItem, currentMappings.discount),
        taxAmount: getNumericMappedValue(selectedItem, currentMappings.taxAmount),
      items: invoiceItems.length > 0 ? invoiceItems : prev.items
      };
      
      console.log('[App] ===== FormData Update =====');
      console.log('[App] newFormData:', newFormData);
      console.log('[App] Mapping results:', {
        clientName: { mapping: currentMappings.clientName, value: newFormData.clientName },
        clientDepartment: { mapping: currentMappings.clientDepartment, value: newFormData.clientDepartment },
        clientContact: { mapping: currentMappings.clientContact, value: newFormData.clientContact },
        clientZip: { mapping: currentMappings.clientZip, value: newFormData.clientZip },
        clientAddress: { mapping: currentMappings.clientAddress, value: newFormData.clientAddress },
        clientPhone: { mapping: currentMappings.clientPhone, value: newFormData.clientPhone },
        clientEmail: { mapping: currentMappings.clientEmail, value: newFormData.clientEmail },
        discount: { mapping: currentMappings.discount, value: newFormData.discount },
        taxAmount: { mapping: currentMappings.taxAmount, value: newFormData.taxAmount }
      });
      
      return {
        ...prev,
        ...newFormData
      };
    });

    setCurrentStep('edit');
  };

  const handleSaveMappings = async (newMappings) => {
    console.log('[App] handleSaveMappings: Saving new mappings:', newMappings);
    setFieldMappings(newMappings);
    localStorage.setItem('invoiceFieldMappings', JSON.stringify(newMappings));
    
    // If we're in edit step and have a selected item, reload it with new mappings
    // This allows users to see the changes immediately after saving mappings
    if (selectedItemId && currentStep === 'edit') {
      console.log('[App] handleSaveMappings: Reloading selected item with new mappings');
      // Refetch board data with new mappings and wait for it to complete
      await fetchBoardData(newMappings);
      console.log('[App] handleSaveMappings: Board data refetched with new mappings');
      
      // Wait a bit for items state to update after fetchBoardData, then reload
      setTimeout(() => {
        loadSelectedItem();
      }, 200);
    } else {
      // If not in edit step, just refetch board data (for next time)
      await fetchBoardData(newMappings);
      console.log('[App] handleSaveMappings: Board data refetched with new mappings');
    }
  };
  const handleTemplatesSave = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('invoiceTemplates', JSON.stringify(newTemplates));
    if (selectedTemplateId !== 'none' && !newTemplates.some((tpl) => tpl.id === selectedTemplateId)) {
      setSelectedTemplateId('none');
      setFormData((prev) => ({
        ...prev,
        ...TEMPLATE_FIELDS.reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {})
      }));
    }
  };

  const handleTemplateSelect = (value) => {
    const selectedValue = value === 'none' || !value ? 'none' : value;
    setSelectedTemplateId(selectedValue);

    if (selectedValue === 'none') {
      setFormData((prev) => ({
        ...prev,
        ...TEMPLATE_FIELDS.reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {})
      }));
      return;
    }

    const template = templates.find((tpl) => tpl.id === selectedValue);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        ...template.data
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (item.quantity || 0) * (item.price || 0), 0
    );
    const discountedSubtotal = subtotal - (formData.discount || 0);
    const taxAmount = discountedSubtotal * (formData.taxRate || 0) / 100;
    const total = discountedSubtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const downloadHTML = () => {
    const exportData = {
      ...formData,
      companyName: sectionVisibility.billingFrom ? formData.companyName : '',
      companyRep: sectionVisibility.billingFrom ? formData.companyRep : '',
      companyZip: sectionVisibility.billingFrom ? formData.companyZip : '',
      companyAddress: sectionVisibility.billingFrom ? formData.companyAddress : '',
      companyPhone: sectionVisibility.billingFrom ? formData.companyPhone : '',
      companyFax: sectionVisibility.billingFrom ? formData.companyFax : '',
      companyEmail: sectionVisibility.billingFrom ? formData.companyEmail : '',
      companyRegNumber: sectionVisibility.billingFrom ? formData.companyRegNumber : '',
      clientName: sectionVisibility.billingTo ? formData.clientName : '',
      clientDepartment: sectionVisibility.billingTo ? formData.clientDepartment : '',
      clientContact: sectionVisibility.billingTo ? formData.clientContact : '',
      clientZip: sectionVisibility.billingTo ? formData.clientZip : '',
      clientAddress: sectionVisibility.billingTo ? formData.clientAddress : '',
      clientPhone: sectionVisibility.billingTo ? formData.clientPhone : '',
      clientEmail: sectionVisibility.billingTo ? formData.clientEmail : '',
      bankName: sectionVisibility.paymentInfo ? formData.bankName : '',
      accountType: sectionVisibility.paymentInfo ? formData.accountType : '',
      accountNumber: sectionVisibility.paymentInfo ? formData.accountNumber : '',
      accountHolder: sectionVisibility.paymentInfo ? formData.accountHolder : '',
      notes: sectionVisibility.notes ? formData.notes : '',
      companyLogo: sectionVisibility.images ? formData.companyLogo : null,
      signatureImage: sectionVisibility.images ? formData.signatureImage : null,
      watermarkImage: sectionVisibility.images ? formData.watermarkImage : null
    };
    const html = generateInvoiceHTML(exportData, language, template, pageSize, fitToOnePage, formData.templateColors[template]);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${formData.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageDimensions = () => {
    if (pageSize === 'letter') {
      return { width: '8.5in', height: '11in', widthMM: '216mm', heightMM: '279mm' };
    }
    return { width: '210mm', height: '297mm', widthMM: '210mm', heightMM: '297mm' };
  };

  if (loading) {
    return (
      <Container maxW="6xl" py="8">
        <Stack gap="4">
          <Skeleton height="60px" />
          <Skeleton height="400px" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py="8" colorPalette="blue">
      <Stack gap="8">
        <VStack gap="4">
          <Heading size="2xl">
            <FileText size={32} style={{ display: 'inline', marginRight: '12px' }} />
            {t.title}
          </Heading>
          <Text color="fg.muted" fontSize="lg">{t.subtitle}</Text>
        </VStack>

        {authError && (
          <Alert.Root status="error" variant="solid">
            <Alert.Title>認証エラー</Alert.Title>
            <Alert.Description>{authError}</Alert.Description>
          </Alert.Root>
        )}

        <HStack gap="4" wrap="wrap" justify="space-between">
          <HStack gap="4" wrap="wrap">
            <Button onClick={fetchBoardData} variant="outline">
              <RefreshCw size={16} /> {t.loadData}
            </Button>
            <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline" colorPalette="blue">
              <FileText size={16} /> {t.manageTemplates}
            </Button>
            <Button onClick={() => setIsHelpDialogOpen(true)} variant="outline" colorPalette="green">
              <HelpCircle size={16} /> {t.help}
            </Button>
            <Select.Root collection={languages} value={[language]} 
              onValueChange={({ value }) => {
                console.log('[App] Language change:', value);
                if (value && value.length > 0) {
                  setLanguage(value[0]);
                }
              }} size="sm" width="200px">
              <Select.Trigger><Select.ValueText /></Select.Trigger>
              <Select.Positioner>
                <Select.Content>
                  {languages.items.map(item => (
                    <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <HStack gap="3" wrap="wrap">
              <Select.Root collection={layoutTemplates} value={[template]}
                onValueChange={({ value }) => setTemplate(value[0])} size="sm" width="300px">
                <Select.Trigger><Select.ValueText /></Select.Trigger>
                <Select.Positioner>
                  <Select.Content>
                    {layoutTemplates.items.map(item => (
                      <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
              <Field.Root width="auto">
                <HStack gap="2" align="center">
                  <Text fontSize="sm" fontWeight="medium">{t.templateColor}:</Text>
                  <Input
                    type="color"
                    value={formData.templateColors[template]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      templateColors: {
                        ...prev.templateColors,
                        [template]: e.target.value
                      }
                    }))}
                    width="60px"
                    height="32px"
                    p="1"
                    cursor="pointer"
                  />
                </HStack>
              </Field.Root>
              <Select.Root collection={currencies} value={[formData.currency]}
                onValueChange={({ value }) => setFormData(prev => ({ ...prev, currency: value[0] }))}
                size="sm" width="200px">
                <Select.Trigger><Select.ValueText /></Select.Trigger>
                <Select.Positioner>
                  <Select.Content>
                    {currencies.items.map(item => (
                      <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </HStack>
          </HStack>

          <HStack gap="2">
            <Badge colorPalette={currentStep === 'select' ? 'blue' : 'gray'} size="lg">
              1. {t.selectItem}
            </Badge>
            <Badge colorPalette={currentStep === 'edit' ? 'blue' : 'gray'} size="lg">
              2. {t.editInvoice}
            </Badge>
            <Badge colorPalette={currentStep === 'download' ? 'blue' : 'gray'} size="lg">
              3. {t.download}
            </Badge>
          </HStack>
        </HStack>

        {currentStep === 'select' && (
          <Card.Root>
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="lg">{t.selectItem}</Heading>
                <Button 
                  colorPalette="blue" 
                  onClick={loadSelectedItem}
                  disabled={!selectedItemId}
                >
                  {t.createInvoice}
                </Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              <ItemSelector
                items={items}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                language={language}
              />
            </Card.Body>
          </Card.Root>
        )}

        {currentStep === 'edit' && (
          <Stack gap="6">
            <HStack justify="space-between" wrap="wrap" gap="4">
              <HStack gap="4" wrap="wrap">
                <Button variant="outline" onClick={() => setCurrentStep('select')}>
                  ← {t.backToSelection}
                </Button>
                <Button onClick={() => setIsFieldMappingOpen(true)} variant="outline" colorPalette="blue">
                  <Settings size={16} /> {t.fieldMapping}
                </Button>
              </HStack>
              <Button colorPalette="blue" onClick={() => setCurrentStep('download')}>
                {t.continueToDownload} →
              </Button>
            </HStack>

            <Card.Root>
              <Card.Header>
                <Heading size="md">{t.basicInfo}</Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <HStack gap="4">
                    <Field.Root flex="1">
                      <Field.Label>{t.invoiceNumber}</Field.Label>
                      <Input value={formData.invoiceNumber}
                        onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                    </Field.Root>
                    <Field.Root flex="1">
                      <Field.Label>{t.invoiceDate}</Field.Label>
                      <Input type="date" value={formData.invoiceDate}
                        onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} />
                    </Field.Root>
                    <Field.Root flex="1">
                      <Field.Label>{t.dueDate}</Field.Label>
                      <Input type="date" value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                    </Field.Root>
                  </HStack>
                  <Field.Root>
                    <Field.Label>{t.paymentTerms}</Field.Label>
                    <HStack>
                      <NumberInput.Root value={formData.paymentTerms}
                        onValueChange={({ value }) => setFormData({ ...formData, paymentTerms: value })}
                        min={0} size="sm" width="100px">
                        <NumberInput.Input />
                      </NumberInput.Root>
                      <Text>{t.daysFromInvoice}</Text>
                    </HStack>
                  </Field.Root>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Stack gap="3">
                  <Field.Root>
                    <Field.Label>{t.templateSelectLabel}</Field.Label>
                    <Select.Root
                      collection={templateCollection}
                      value={[selectedTemplateId]}
                      onValueChange={({ value }) => handleTemplateSelect(value[0])}
                      size="sm"
                      width="300px"
                    >
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.Positioner>
                        <Select.Content>
                          {templateCollection.items.map((item) => (
                            <Select.Item key={item.value} item={item}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Field.Root>
                </Stack>
              </Card.Body>
            </Card.Root>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
              <Card.Root>
                <Card.Header>
                  <HStack justify="space-between">
                    <Heading size="md">{t.billingFrom}</Heading>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSection('billingFrom')}
                      colorPalette={sectionVisibility.billingFrom ? 'blue' : 'gray'}
                    >
                      {sectionVisibility.billingFrom ? <Eye size={16} /> : <EyeOff size={16} />}
                      {sectionVisibility.billingFrom ? t.visible : t.hidden}
                    </Button>
                  </HStack>
                </Card.Header>
                <Collapsible.Root open={sectionVisibility.billingFrom}>
                  <Collapsible.Content>
                    <Card.Body>
                      <Stack gap="3">
                        <Field.Root>
                          <Field.Label>{t.companyName}</Field.Label>
                          <Input value={formData.companyName}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.representative}</Field.Label>
                          <Input value={formData.companyRep}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyRep: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.postalCode}</Field.Label>
                          <Input value={formData.companyZip}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyZip: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.address}</Field.Label>
                          <Textarea value={formData.companyAddress} rows={2}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyAddress: e.target.value })} />
                        </Field.Root>
                        <HStack gap="3">
                          <Field.Root flex="1">
                            <Field.Label>{t.phone}</Field.Label>
                                <Input value={formData.companyPhone}
                                  isDisabled={templateLocked}
                              onChange={e => setFormData({ ...formData, companyPhone: e.target.value })} />
                          </Field.Root>
                          <Field.Root flex="1">
                            <Field.Label>{t.fax}</Field.Label>
                                <Input value={formData.companyFax}
                                  isDisabled={templateLocked}
                              onChange={e => setFormData({ ...formData, companyFax: e.target.value })} />
                          </Field.Root>
                        </HStack>
                        <Field.Root>
                          <Field.Label>{t.email}</Field.Label>
                                <Input type="email" value={formData.companyEmail}
                                  isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyEmail: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.registrationNumber}</Field.Label>
                              <Input value={formData.companyRegNumber}
                                isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, companyRegNumber: e.target.value })} />
                        </Field.Root>
                      </Stack>
                    </Card.Body>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>
              <Card.Root>
                <Card.Header>
                  <HStack justify="space-between">
                    <Heading size="md">{t.billingTo}</Heading>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSection('billingTo')}
                      colorPalette={sectionVisibility.billingTo ? 'blue' : 'gray'}
                    >
                      {sectionVisibility.billingTo ? <Eye size={16} /> : <EyeOff size={16} />}
                      {sectionVisibility.billingTo ? t.visible : t.hidden}
                    </Button>
                  </HStack>
                </Card.Header>
                <Collapsible.Root open={sectionVisibility.billingTo}>
                  <Collapsible.Content>
                    <Card.Body>
                      <Stack gap="3">
                        <Field.Root>
                          <Field.Label>{t.clientName}</Field.Label>
                          <Input value={formData.clientName}
                            onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.department}</Field.Label>
                          <Input value={formData.clientDepartment}
                            onChange={e => setFormData({ ...formData, clientDepartment: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.contactPerson}</Field.Label>
                          <Input value={formData.clientContact}
                            onChange={e => setFormData({ ...formData, clientContact: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.postalCode}</Field.Label>
                          <Input value={formData.clientZip}
                            onChange={e => setFormData({ ...formData, clientZip: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.address}</Field.Label>
                          <Textarea value={formData.clientAddress} rows={2}
                            onChange={e => setFormData({ ...formData, clientAddress: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.phone}</Field.Label>
                          <Input value={formData.clientPhone}
                            onChange={e => setFormData({ ...formData, clientPhone: e.target.value })} />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>{t.email}</Field.Label>
                          <Input type="email" value={formData.clientEmail}
                            onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} />
                        </Field.Root>
                      </Stack>
                    </Card.Body>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>
            </SimpleGrid>

            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Heading size="md">{t.paymentInfo}</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSection('paymentInfo')}
                    colorPalette={sectionVisibility.paymentInfo ? 'blue' : 'gray'}
                  >
                    {sectionVisibility.paymentInfo ? <Eye size={16} /> : <EyeOff size={16} />}
                    {sectionVisibility.paymentInfo ? t.visible : t.hidden}
                  </Button>
                </HStack>
              </Card.Header>
              <Collapsible.Root open={sectionVisibility.paymentInfo}>
                <Collapsible.Content>
                  <Card.Body>
                    <Stack gap="3">
                      <Field.Root>
                        <Field.Label>{t.bankName}</Field.Label>
                        <Input
                          value={formData.bankName}
                          isDisabled={templateLocked}
                          onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        />
                      </Field.Root>
                      <HStack gap="3">
                        <Field.Root flex="1">
                          <Field.Label>{t.accountType}</Field.Label>
                          <Input
                            value={formData.accountType}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                          />
                        </Field.Root>
                        <Field.Root flex="1">
                          <Field.Label>{t.accountNumber}</Field.Label>
                          <Input
                            value={formData.accountNumber}
                            isDisabled={templateLocked}
                            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                          />
                        </Field.Root>
                      </HStack>
                      <Field.Root>
                        <Field.Label>{t.accountHolder}</Field.Label>
                        <Input
                          value={formData.accountHolder}
                          isDisabled={templateLocked}
                          onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                        />
                      </Field.Root>
                    </Stack>
                  </Card.Body>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Heading size="md">{t.images}</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSection('images')}
                    colorPalette={sectionVisibility.images ? 'blue' : 'gray'}
                  >
                    {sectionVisibility.images ? <Eye size={16} /> : <EyeOff size={16} />}
                    {sectionVisibility.images ? t.visible : t.hidden}
                  </Button>
                </HStack>
              </Card.Header>
              <Collapsible.Root open={sectionVisibility.images}>
                <Collapsible.Content>
                  <Card.Body>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                      <ImageUploader
                        label={t.companyLogo}
                        value={formData.companyLogo}
                        onChange={(base64) => setFormData({ ...formData, companyLogo: base64 })}
                        aspectRatio="3/1"
                      />
                      <ImageUploader
                        label={t.signature}
                        value={formData.signatureImage}
                        onChange={(base64) => setFormData({ ...formData, signatureImage: base64 })}
                        aspectRatio="2/1"
                      />
                      <ImageUploader
                        label={t.watermark}
                        value={formData.watermarkImage}
                        onChange={(base64) => setFormData({ ...formData, watermarkImage: base64 })}
                        aspectRatio="1/1"
                      />
                    </SimpleGrid>
                  </Card.Body>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Heading size="md">{t.items}</Heading>
                  <Button size="sm" onClick={addItem}>{t.addItem}</Button>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Stack gap="3">
                  {formData.items.map((item, index) => (
                    <HStack key={index} gap="3" p="3" bg="bg.subtle" borderRadius="md">
                      <Input placeholder={t.description} value={item.description} flex="2"
                        onChange={e => updateItem(index, 'description', e.target.value)} size="sm" />
                      <NumberInput.Root value={item.quantity.toString()} flex="1"
                        onValueChange={({ valueAsNumber }) => updateItem(index, 'quantity', valueAsNumber || 1)}
                        min={1} size="sm">
                        <NumberInput.Input />
                      </NumberInput.Root>
                      <NumberInput.Root value={item.price.toString()} flex="1"
                        onValueChange={({ valueAsNumber }) => updateItem(index, 'price', valueAsNumber || 0)}
                        min={0} size="sm">
                        <NumberInput.Input />
                      </NumberInput.Root>
                      <Text fontWeight="medium" minW="100px">
                        {getCurrencySymbol(formData.currency)}{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                      </Text>
                      <Button size="sm" variant="ghost" colorPalette="red" onClick={() => removeItem(index)}>
                        ×
                      </Button>
                    </HStack>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <Heading size="md">{t.summary}</Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="3">
                  <HStack justify="space-between">
                    <Text>{t.subtotal}:</Text>
                    <Text fontWeight="bold">{getCurrencySymbol(formData.currency)}{formData.subtotal.toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>{t.discount}:</Text>
                    <NumberInput.Root value={formData.discount.toString()}
                      onValueChange={({ valueAsNumber }) =>
                        setFormData({ ...formData, discount: valueAsNumber || 0 })}
                      min={0} size="sm" width="120px">
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>{t.taxRate}:</Text>
                    <NumberInput.Root value={formData.taxRate.toString()}
                      onValueChange={({ valueAsNumber }) =>
                        setFormData({ ...formData, taxRate: valueAsNumber || 0 })}
                      min={0} max={100} size="sm" width="120px">
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>{t.tax}:</Text>
                    <Text fontWeight="bold">{getCurrencySymbol(formData.currency)}{formData.taxAmount.toLocaleString()}</Text>
                  </HStack>
                  <Separator />
                  <HStack justify="space-between">
                    <Heading size="md">{t.total}:</Heading>
                    <Heading size="md" color="blue.600">{getCurrencySymbol(formData.currency)}{formData.total.toLocaleString()}</Heading>
                  </HStack>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Heading size="md">{t.notes}</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSection('notes')}
                    colorPalette={sectionVisibility.notes ? 'blue' : 'gray'}
                  >
                    {sectionVisibility.notes ? <Eye size={16} /> : <EyeOff size={16} />}
                    {sectionVisibility.notes ? t.visible : t.hidden}
                  </Button>
                </HStack>
              </Card.Header>
              <Collapsible.Root open={sectionVisibility.notes}>
                <Collapsible.Content>
                  <Card.Body>
                    <Textarea value={formData.notes} rows={4}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t.notesPlaceholder} />
                  </Card.Body>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.Root>
          </Stack>
        )}

        {currentStep === 'download' && (
          <Stack gap="6">
            <HStack justify="space-between" wrap="wrap" gap="4">
              <Button variant="outline" onClick={() => setCurrentStep('edit')}>
                ← {t.backToEdit}
              </Button>

              <HStack gap="4" wrap="wrap">
                <Field.Root width="auto">
                  <Field.Label>{t.pageSize}</Field.Label>
                  <HStack gap="2">
                    <Button
                      size="sm"
                      variant={pageSize === 'a4' ? 'solid' : 'outline'}
                      onClick={() => setPageSize('a4')}
                    >
                      A4
                    </Button>
                    <Button
                      size="sm"
                      variant={pageSize === 'letter' ? 'solid' : 'outline'}
                      onClick={() => setPageSize('letter')}
                    >
                      Letter
                    </Button>
                  </HStack>
                </Field.Root>

                <Field.Root width="auto">
                  <Field.Label>{t.pageLayout}</Field.Label>
                  <Button
                    size="sm"
                    variant={fitToOnePage ? 'solid' : 'outline'}
                    onClick={() => setFitToOnePage(!fitToOnePage)}
                  >
                    {fitToOnePage ? t.fitToOnePage : t.multiPage}
                  </Button>
                </Field.Root>
              </HStack>
            </HStack>

            <Card.Root bg="bg.subtle">
              <Card.Header>
                <Heading size="lg">{t.invoicePreview}</Heading>
                <HStack gap="4" mt="2" wrap="wrap">
                  <Text fontSize="sm" color="fg.muted">{t.previewNote}</Text>
                  <Badge colorPalette="blue" size="sm">
                    {pageSize === 'a4' ? 'A4 (210×297mm)' : 'Letter (216×279mm)'}
                  </Badge>
                  <Badge colorPalette={fitToOnePage ? 'green' : 'gray'} size="sm">
                    {fitToOnePage ? t.fitToOnePage : t.multiPage}
                  </Badge>
                </HStack>
              </Card.Header>
              <Card.Body display="flex" justifyContent="center" p="4" bg="gray.100">
                <Box
                  width={getPageDimensions().widthMM}
                  height={fitToOnePage ? getPageDimensions().heightMM : 'auto'}
                  maxH={fitToOnePage ? getPageDimensions().heightMM : 'none'}
                  bg="white"
                  boxShadow="2xl"
                  border="1px solid"
                  borderColor="gray.300"
                  overflow="hidden"
                  position="relative"
                >
                  <Box
                    p={fitToOnePage ? (
                      formData.items.length > 12 ? "5mm" :
                      formData.items.length > 8 ? "6mm" :
                      formData.items.length > 5 ? "7mm" : "8mm"
                    ) : "15mm"}
                    h="full"
                    display="flex"
                    flexDirection="column"
                  >
                    <Stack gap="3">
                      {formData.watermarkImage && (
                        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" opacity="0.1" zIndex="-1" pointerEvents="none">
                          <Image src={formData.watermarkImage} alt="Watermark" maxW="400px" maxH="400px" />
                        </Box>
                      )}

                      <VStack
                        alignItems={template === 'classic' ? 'flex-start' : 'center'}
                        justifyContent="space-between"
                        pb={template === 'minimal' ? '1' : '3'}
                        spacing={template === 'classic' ? '0' : '1'}
                        borderBottomWidth={template === 'modern' ? '2px' : template === 'classic' ? '3px' : '1px'}
                        borderBottomStyle={template === 'classic' ? 'double' : 'solid'}
                        borderColor={formData.templateColors[template]}
                      >
                        {formData.companyLogo && (
                          <Box mb="2">
                            <Image src={formData.companyLogo} alt="Company Logo" maxW="250px" maxH="60px" objectFit="contain" />
                          </Box>
                        )}
                        <Heading size="lg" color={formData.templateColors[template]} fontFamily={template === 'classic' ? 'serif' : 'inherit'} fontWeight={template === 'minimal' ? 300 : 'bold'}>
                          {t.invoice}
                        </Heading>
                        <Stack gap="0" fontSize="2xs" textAlign="center">
                          <Text><strong>{t.invoiceNumber}:</strong> {formData.invoiceNumber}</Text>
                          <Text><strong>{t.invoiceDate}:</strong> {formData.invoiceDate}</Text>
                          {formData.dueDate && <Text><strong>{t.dueDate}:</strong> {formData.dueDate}</Text>}
                        </Stack>
                      </VStack>

                      <SimpleGrid columns={2} gap="3">
                        <Box>
                          <Heading size="2xs" mb="1" pb="1" borderBottomWidth="1px" borderColor="gray.200">{t.billingTo}</Heading>
                          <Stack gap="0" fontSize="2xs" lineHeight="1.4">
                            <Text fontWeight="bold" fontSize="xs">{formData.clientName || '-'}</Text>
                            {formData.clientDepartment && <Text color="gray.700">{formData.clientDepartment}</Text>}
                            {formData.clientContact && <Text color="gray.700">{formData.clientContact} {t.sama}</Text>}
                            {formData.clientZip && <Text color="gray.600">{formData.clientZip}</Text>}
                            {formData.clientAddress && <Text color="gray.700">{formData.clientAddress}</Text>}
                            {formData.clientPhone && <Text color="gray.600">{formData.clientPhone}</Text>}
                            {formData.clientEmail && <Text color="gray.600">{formData.clientEmail}</Text>}
                          </Stack>
                        </Box>
                        <Box>
                          <Heading size="2xs" mb="1" pb="1" borderBottomWidth="1px" borderColor="gray.200">{t.billingFrom}</Heading>
                          <HStack gap="3" align="start">
                            <Stack gap="0" fontSize="2xs" lineHeight="1.4" flex="1">
                              <Text fontWeight="bold" fontSize="xs">{formData.companyName || '-'}</Text>
                              {formData.companyRep && <Text color="gray.700">{formData.companyRep}</Text>}
                              {formData.companyZip && <Text color="gray.600">{formData.companyZip}</Text>}
                              {formData.companyAddress && <Text color="gray.700">{formData.companyAddress}</Text>}
                              {formData.companyPhone && <Text color="gray.600">{formData.companyPhone}</Text>}
                              {formData.companyFax && <Text color="gray.600">{formData.companyFax}</Text>}
                              {formData.companyEmail && <Text color="gray.600">{formData.companyEmail}</Text>}
                              {formData.companyRegNumber && <Text fontSize="xs" color="gray.500">{t.registrationNumber}: {formData.companyRegNumber}</Text>}
                            </Stack>
                            {formData.signatureImage && (
                              <Box flexShrink="0">
                                <Image
                                  src={formData.signatureImage}
                                  alt="Signature"
                                  maxW={fitToOnePage ? (formData.items.length > 12 ? "50px" : formData.items.length > 8 ? "60px" : "70px") : "100px"}
                                  maxH={fitToOnePage ? (formData.items.length > 12 ? "25px" : formData.items.length > 8 ? "30px" : "35px") : "60px"}
                                  objectFit="contain"
                                />
                              </Box>
                            )}
                          </HStack>
                        </Box>
                      </SimpleGrid>

                      <Box bg={template === 'modern' ? 'blue.50' : 'gray.50'} p="1.5" borderRadius="sm" borderLeftWidth="2px" borderColor={formData.templateColors[template]}>
                        <Text fontSize="2xs" fontWeight="500" color="gray.800">{t.invoiceMessage}</Text>
                      </Box>

                      <Box borderWidth={template === 'modern' ? '2px' : '1px'} borderColor={formData.templateColors[template]} borderRadius="sm" overflow="hidden">
                        <Table.Root size="sm" variant="outline">
                          <Table.Header>
                            <Table.Row bg={template === 'modern' ? formData.templateColors[template] : template === 'classic' ? 'gray.100' : 'white'} borderBottomWidth={template === 'minimal' ? '2px' : '0'} borderBottomColor={template === 'minimal' ? formData.templateColors[template] : 'transparent'}>
                              <Table.ColumnHeader color={template === 'modern' ? 'white' : 'gray.900'} fontWeight="bold" px="1.5" py="1.5" fontSize="2xs">{t.description}</Table.ColumnHeader>
                              <Table.ColumnHeader color={template === 'modern' ? 'white' : 'gray.900'} fontWeight="bold" textAlign="center" px="1.5" py="1.5" fontSize="2xs">{t.quantity}</Table.ColumnHeader>
                              <Table.ColumnHeader color={template === 'modern' ? 'white' : 'gray.900'} fontWeight="bold" textAlign="right" px="1.5" py="1.5" fontSize="2xs">{t.unitPrice}</Table.ColumnHeader>
                              <Table.ColumnHeader color={template === 'modern' ? 'white' : 'gray.900'} fontWeight="bold" textAlign="right" px="1.5" py="1.5" fontSize="2xs">{t.amount}</Table.ColumnHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {formData.items.map((item, i) => (
                              <Table.Row key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                                <Table.Cell px="1.5" py="1" color="gray.700" fontSize="2xs">{item.description}</Table.Cell>
                                <Table.Cell textAlign="center" px="1.5" py="1" color="gray.700" fontSize="2xs">{item.quantity}</Table.Cell>
                                <Table.Cell textAlign="right" px="1.5" py="1" color="gray.700" fontSize="2xs">{getCurrencySymbol(formData.currency)}{item.price.toLocaleString()}</Table.Cell>
                                <Table.Cell textAlign="right" fontWeight="600" px="1.5" py="1" color="gray.900" fontSize="2xs">{getCurrencySymbol(formData.currency)}{(item.quantity * item.price).toLocaleString()}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      </Box>

                      <HStack justify="flex-end">
                        <Stack gap="0" minW="200px">
                          <HStack justify="space-between" py="0.5" px="1.5">
                            <Text fontSize="2xs" color="gray.700">{t.subtotal}:</Text>
                            <Text fontSize="2xs" color="gray.900">{getCurrencySymbol(formData.currency)}{formData.subtotal.toLocaleString()}</Text>
                          </HStack>
                          <HStack justify="space-between" py="0.5" px="1.5">
                            <Text fontSize="2xs" color="gray.700">{t.discount}:</Text>
                            <Text fontSize="2xs" color="gray.900">-{getCurrencySymbol(formData.currency)}{formData.discount.toLocaleString()}</Text>
                          </HStack>
                          <HStack justify="space-between" py="0.5" px="1.5">
                            <Text fontSize="2xs" color="gray.700">{t.tax} ({formData.taxRate}%):</Text>
                            <Text fontSize="2xs" color="gray.900">{getCurrencySymbol(formData.currency)}{formData.taxAmount.toLocaleString()}</Text>
                          </HStack>
                          <Box borderTopWidth="2px" borderColor="gray.800" pt="1.5" mt="0.5" px="1.5">
                            <HStack justify="space-between">
                              <Text fontWeight="bold" fontSize="xs" color="gray.900">{t.total}:</Text>
                              <Text fontWeight="bold" fontSize="sm" color={formData.templateColors[template]}>
                                {getCurrencySymbol(formData.currency)}{formData.total.toLocaleString()}
                              </Text>
                            </HStack>
                          </Box>
                        </Stack>
                      </HStack>

                      {formData.bankName && (
                        <Box bg="blue.50" p="2" borderRadius="sm" borderWidth="1px" borderColor="blue.300">
                          <Heading size="2xs" mb="1" color="blue.800">{t.paymentInfo}</Heading>
                          <Stack gap="0" fontSize="2xs" color="gray.800">
                            <Text><strong>{t.bankName}:</strong> {formData.bankName}</Text>
                            <Text><strong>{t.accountType}:</strong> {formData.accountType}　<strong>{t.accountNumber}:</strong> {formData.accountNumber}</Text>
                            <Text><strong>{t.accountHolder}:</strong> {formData.accountHolder}</Text>
                          </Stack>
                        </Box>
                      )}

                      {formData.notes && (
                        <Box bg="yellow.50" p="2" borderRadius="sm" borderLeftWidth="2px" borderColor="yellow.600">
                          <Heading size="2xs" mb="0.5" color="gray.900">{t.notes}</Heading>
                          <Text fontSize="2xs" whiteSpace="pre-wrap" lineHeight="1.4" color="gray.700">{formData.notes}</Text>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Card.Body>
              <Card.Footer>
                <HStack justify="center" gap="4" w="full" wrap="wrap">
                  <Button size="lg" onClick={downloadHTML} colorPalette="blue">
                    <Download size={20} /> {t.downloadHTML}
                  </Button>
                </HStack>
              </Card.Footer>
            </Card.Root>
          </Stack>
        )}
      </Stack>

      <FieldMappingDialog
        isOpen={isFieldMappingOpen}
        onClose={() => setIsFieldMappingOpen(false)}
        onSave={handleSaveMappings}
        language={language}
        initialMappings={fieldMappings}
      />

      <HelpDialog
        isOpen={isHelpDialogOpen}
        onClose={() => setIsHelpDialogOpen(false)}
        language={language}
      />

      <TemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        templates={templates}
        onSave={handleTemplatesSave}
        language={language}
      />
    </Container>
  );
};

export default App;