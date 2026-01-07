import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Stack,
  Heading,
  Text,
  Field,
  Input,
  CloseButton,
  Card,
  HStack,
  Badge,
  Separator,
  Box
} from '@chakra-ui/react';
import { Settings, Save } from 'lucide-react';
import { translations } from '../utils/translations';
import BoardSDK from '../sdk/BoardSDK';

// Default mappings - defined outside component to avoid recreation
const defaultMappings = {
  invoiceNumber: 'manual',
  invoiceDate: 'column3',
  dueDate: 'manual',
  validUntil: 'manual',
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
};

// Base column items will be generated dynamically based on language

const fieldKeys = Object.keys(defaultMappings);

const FieldMappingDialog = ({ isOpen, onClose, onSave, language, initialMappings }) => {
  const [mappings, setMappings] = useState(defaultMappings);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const t = translations[language] || translations.ja;
  const board = new BoardSDK();
  
  // Generate base column items dynamically based on language
  const baseColumnItems = useMemo(() => [
    { label: t.fieldMappingManualInput, value: 'manual' },
    { label: t.fieldMappingNotRequired, value: 'none' },
    { label: language === 'ja' ? t.fieldMappingItemName : `${t.fieldMappingName} - ${t.fieldMappingItemName}`, value: 'name' },
    { label: language === 'ja' ? t.fieldMappingClientName : `Client Name - ${t.fieldMappingClientName}`, value: 'clientName' },
    { label: language === 'ja' ? `${t.fieldMappingColumn1} - ${t.fieldMappingUser}` : `${t.fieldMappingColumn1} - ${t.fieldMappingUser}`, value: 'column1' },
    { label: language === 'ja' ? `${t.fieldMappingColumn2} - ${t.fieldMappingStatus}` : `${t.fieldMappingColumn2} - ${t.fieldMappingStatus}`, value: 'column2' },
    { label: language === 'ja' ? `${t.fieldMappingColumn3} - ${t.fieldMappingInvoiceDate}` : `${t.fieldMappingColumn3} - ${t.fieldMappingInvoiceDate}`, value: 'column3' },
    { label: language === 'ja' ? t.fieldMappingDiscount : `Discount - ${t.fieldMappingDiscount}`, value: 'discount' },
    { label: language === 'ja' ? t.fieldMappingTaxAmount : `Tax Amount - ${t.fieldMappingTaxAmount}`, value: 'taxAmount' },
    { label: language === 'ja' ? `${t.fieldMappingColumn11} - ${t.fieldMappingNumeric1}` : `${t.fieldMappingColumn11} - ${t.fieldMappingNumeric1}`, value: 'column11' },
    { label: language === 'ja' ? `${t.fieldMappingColumn21} - ${t.fieldMappingNumeric2}` : `${t.fieldMappingColumn21} - ${t.fieldMappingNumeric2}`, value: 'column21' },
    { label: t.fieldMappingCustomColumn, value: 'custom' }
  ], [language, t]);
  
  // Get subitems option for items field only
  const getSubitemsOption = () => ({
    label: language === 'ja' ? t.fieldMappingSubitems : `Subitems - ${t.fieldMappingSubitems}`,
    value: 'subitems'
  });
  
  const [boardColumnsItems, setBoardColumnsItems] = useState(baseColumnItems);
  
  // Update base column items when language changes
  useEffect(() => {
    // Only update if we haven't loaded board columns yet (i.e., still using base items)
    // If board columns are already loaded, we'll merge base items with existing dynamic columns
    setBoardColumnsItems(prev => {
      // Check if we have dynamic columns (columns from board)
      const hasDynamicColumns = prev.some(item => 
        item.value && 
        !['manual', 'none', 'name', 'clientName', 'column1', 'column2', 'column3', 'discount', 'taxAmount', 'column11', 'column21', 'custom'].includes(item.value)
      );
      
      if (!hasDynamicColumns) {
        // No dynamic columns yet, just use base items
        return baseColumnItems;
      } else {
        // We have dynamic columns, merge base items with existing dynamic columns
        const dynamicColumns = prev.filter(item => 
          item.value && 
          !['manual', 'none', 'name', 'clientName', 'column1', 'column2', 'column3', 'discount', 'taxAmount', 'column11', 'column21', 'custom'].includes(item.value)
        );
        return [...baseColumnItems, ...dynamicColumns];
      }
    });
  }, [baseColumnItems]);
  
  // Use items prop directly instead of collection to avoid a.options is not iterable error
  // This is a different approach from App.jsx, but necessary for dynamic data
  const subitemLabel = t.subitemLabel || 'Subitem';
  const subitemLabelPattern = `[${subitemLabel}]`;
  const validBoardColumnsItems = useMemo(() => {
    const filtered = boardColumnsItems.filter(item => item && item.value && item.label);
    const subitemCount = filtered.filter(item => item.label && item.label.includes(subitemLabelPattern)).length;
    console.log('[FieldMappingDialog] validBoardColumnsItems:', {
      total: filtered.length,
      subitemCount: subitemCount,
      subitemItems: filtered.filter(item => item.label && item.label.includes(subitemLabelPattern)).map(item => ({ value: item.value, label: item.label }))
    });
    return filtered;
  }, [boardColumnsItems, language, subitemLabelPattern]);

  // Note: We don't use key prop to force remount like App.jsx
  // The collection object is stabilized with useMemo, so Select components should handle updates correctly

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
        
        // Map column types to readable labels based on language
        const getColumnTypeLabel = (type) => {
          const typeMap = {
            'mirror': t.columnTypeMirror || 'Mirror',
            'mirror__': t.columnTypeMirror || 'Mirror',
            'text': t.columnTypeText || 'Text',
            'numeric': t.columnTypeNumeric || 'Numeric',
            'numbers': t.columnTypeNumeric || 'Numeric',
            'date': t.columnTypeDate || 'Date',
            'status': t.columnTypeStatus || 'Status',
            'person': t.columnTypePerson || 'Person',
            'email': t.columnTypeEmail || 'Email',
            'phone': t.columnTypePhone || 'Phone',
            'link': t.columnTypeLink || 'Link',
            'file': t.columnTypeFile || 'File',
            'checkbox': t.columnTypeCheckbox || 'Checkbox',
            'rating': t.columnTypeRating || 'Rating',
            'timeline': t.columnTypeTimeline || 'Timeline',
            'formula': t.columnTypeFormula || 'Formula',
            'dependency': t.columnTypeDependency || 'Dependency',
            'location': t.columnTypeLocation || 'Location',
            'tags': t.columnTypeTags || 'Tags',
            'vote': t.columnTypeVote || 'Vote',
            'hour': t.columnTypeHour || 'Hour',
            'week': t.columnTypeWeek || 'Week',
            'item_id': t.columnTypeItemId || 'Item ID',
            'board_relation': t.columnTypeBoardRelation || 'Board Relation',
            'auto_number': t.columnTypeAutoNumber || 'Auto Number',
            'creation_log': t.columnTypeCreationLog || 'Creation Log',
            'last_updated': t.columnTypeLastUpdated || 'Last Updated',
            'name': t.columnTypeName || 'Name'
          };
          return typeMap[type] || type;
        };
        
        // Create a map of actual column IDs from the board
        const actualColumnIds = new Set(columns.map(col => col.id));
        const actualColumnMap = new Map(columns.map(col => [col.id, col]));
        
        // Fetch subitem columns from the same board
        // Subitems are part of the same board, not a separate board
        console.log('[FieldMappingDialog] ===== STARTING SUBITEM COLUMNS FETCH =====');
        let subitemColumns = [];
        try {
          // Ensure board is initialized
          if (!board.boardId) {
            await board.initialize();
          }
          
          // First, get subitem column IDs from actual subitem data
          // Also try to get subitem board information to fetch columns
          const testQuery = `
            query GetSubitemColumns($boardId: [ID!]!) {
              boards(ids: $boardId) {
                items_page(limit: 10) {
                  items {
                    subitems {
                      id
                      name
                      board {
                        id
                        name
                        columns {
                          id
                          title
                          type
                        }
                      }
                      column_values {
                        id
                        type
                        text
                      }
                    }
                  }
                }
              }
            }
          `;
          console.log('[FieldMappingDialog] Fetching subitem data from main board...');
          const testResponse = await board.query(testQuery, { boardId: [board.boardId] });
          console.log('[FieldMappingDialog] testResponse:', testResponse);
          const testBoards = testResponse?.boards || testResponse?.data?.boards;
          console.log('[FieldMappingDialog] testBoards:', testBoards);
          if (testBoards?.[0]?.items_page?.items) {
            console.log('[FieldMappingDialog] Found items with subitems:', testBoards[0].items_page.items.length);
            const allSubitemColumnValues = [];
            let subitemBoardColumns = null;
            testBoards[0].items_page.items.forEach(item => {
              if (item.subitems) {
                console.log('[FieldMappingDialog] Item has subitems:', item.subitems.length);
                item.subitems.forEach(subitem => {
                  // Try to get subitem board columns if available
                  if (subitem.board && subitem.board.columns && !subitemBoardColumns) {
                    subitemBoardColumns = subitem.board.columns;
                    console.log('[FieldMappingDialog] Found subitem board columns:', subitemBoardColumns.length);
                  }
                  if (subitem.column_values && subitem.column_values.length > 0) {
                    console.log('[FieldMappingDialog] Subitem has column_values:', subitem.column_values.length);
                    allSubitemColumnValues.push(...subitem.column_values);
                  } else {
                    console.warn('[FieldMappingDialog] Subitem has no column_values:', subitem);
                  }
                });
              }
            });
            
            console.log('[FieldMappingDialog] Total subitem column_values collected:', allSubitemColumnValues.length);
            
            // Extract unique column IDs and types
            const subitemColumnIds = new Set();
            allSubitemColumnValues.forEach(col => {
              if (col.id) {
                subitemColumnIds.add(col.id);
              }
            });
            console.log('[FieldMappingDialog] Unique subitem column IDs:', Array.from(subitemColumnIds));
                
                // Subitems are part of the same board, so their columns should be in the main board's column list
                // Try to find subitem column titles from the main board's columns
                if (subitemColumnIds.size > 0) {
                  const columnIdsArray = Array.from(subitemColumnIds);
                  console.log('[FieldMappingDialog] Looking for subitem columns in main board columns:', columnIdsArray);
                  
                  // Subitems are part of the same board, so their columns should be in the main board's column list
                  // Find subitem column titles from the main board's columns
                  const subitemColumnMap = new Map();
                  columnIdsArray.forEach(colId => {
                    // First, try to find in subitem board columns (if available)
                    let foundColumn = null;
                    if (subitemBoardColumns) {
                      foundColumn = subitemBoardColumns.find(c => c.id === colId);
                      if (foundColumn) {
                        console.log('[FieldMappingDialog] Found subitem column in subitem board:', colId, '->', foundColumn.title);
                      }
                    }
                    
                    // If not found in subitem board, try main board columns
                    if (!foundColumn) {
                      foundColumn = columns.find(c => c.id === colId);
                      if (foundColumn) {
                        console.log('[FieldMappingDialog] Found subitem column in main board:', colId, '->', foundColumn.title);
                      }
                    }
                    
                    if (foundColumn) {
                      subitemColumnMap.set(colId, {
                        id: colId,
                        title: foundColumn.title,
                        type: foundColumn.type || 'text'
                      });
                    } else {
                      // Column not found in either board - use generated title
                      const colType = allSubitemColumnValues.find(c => c.id === colId)?.type || 'text';
                      const typeLabel = getColumnTypeLabel(colType);
                      const shortId = colId.replace(/^(numeric_|text_|date_|status_|person_|email_|phone_|link_|file_|checkbox_|rating_|timeline_|dependency_|location_|tags_|vote_|hour_|week_|item_id_|auto_number_|creation_log_|last_updated_|connect_boards_|country_|time_tracking_|integration_|board_relation_|lookup_|formula_|mirror_)/, '');
                      const readableTitle = `${typeLabel} (${shortId.substring(0, 8)}...)`;
                      subitemColumnMap.set(colId, {
                        id: colId,
                        title: readableTitle,
                        type: colType
                      });
                      console.warn('[FieldMappingDialog] Subitem column not found in any board, using generated title:', colId, '->', readableTitle);
                    }
                  });
                  
                  // Note: columns(ids: ...) query is not supported by Monday.com GraphQL API
                  // Since subitems are in the same board, all columns should be in the main board's column list
                  // If a column is not found, we use the column ID as the title (fallback)
                  
                  subitemColumns = Array.from(subitemColumnMap.values());
                  console.log('[FieldMappingDialog] Extracted subitem columns with titles:', subitemColumns.length);
                  console.log('[FieldMappingDialog] Subitem columns:', subitemColumns);
                } else {
                  console.warn('[FieldMappingDialog] No subitem column IDs found in data');
                }
              } else {
                console.warn('[FieldMappingDialog] No items with subitems found');
              }
        } catch (error) {
          console.error('[FieldMappingDialog] ===== ERROR FETCHING SUBITEM COLUMNS =====');
          console.error('[FieldMappingDialog] Error:', error);
          console.error('[FieldMappingDialog] Error message:', error.message);
          console.error('[FieldMappingDialog] Error stack:', error.stack);
          subitemColumns = [];
        }
        console.log('[FieldMappingDialog] ===== FINISHED SUBITEM COLUMNS FETCH =====');
        console.log('[FieldMappingDialog] Final subitemColumns:', subitemColumns);
        console.log('[FieldMappingDialog] Final subitemColumns count:', subitemColumns.length);
        
        // Filter base columns to only include those that exist in the actual board
        // Also include special values like 'manual', 'none', 'name', 'custom'
        // Note: 'subitems' is not included in base columns, but will be added to items field specifically
        const validBaseColumns = baseColumnItems.filter(item => {
          // Always include special values (except 'subitems' which is handled separately)
          if (['manual', 'none', 'name', 'custom'].includes(item.value)) {
            return true;
          }
          // For mapped columns (like 'clientName', 'column1', etc.), check if they exist in actual columns
          // These are mapping keys, not actual column IDs, so we need to check differently
          // Check if the value exists in actual column IDs
          if (actualColumnIds.has(item.value)) {
            return true;
          }
          // Exclude columns that don't exist in the board
          return false;
        });
        
        // Create column items from fetched columns
        const dynamicColumns = columns.map(col => ({
          label: `${col.title} (${getColumnTypeLabel(col.type)})`,
          value: col.id
        }));
        
        // Create column items from subitem columns (for subitem price mapping)
        const subitemLabel = t.subitemLabel || 'Subitem';
        const subitemDynamicColumns = subitemColumns.map(col => ({
          label: `${col.title} (${getColumnTypeLabel(col.type)}) [${subitemLabel}]`,
          value: col.id
        }));
        
        console.log('[FieldMappingDialog] ===== SUBITEM COLUMNS DEBUG =====');
        console.log('[FieldMappingDialog] subitemColumns raw:', subitemColumns);
        console.log('[FieldMappingDialog] subitemColumns count:', subitemColumns.length);
        console.log('[FieldMappingDialog] subitemDynamicColumns:', subitemDynamicColumns);
        console.log('[FieldMappingDialog] subitemDynamicColumns count:', subitemDynamicColumns.length);
        console.log('[FieldMappingDialog] Dynamic columns created:', dynamicColumns.length);
        console.log('[FieldMappingDialog] Mirror columns in dynamic:', dynamicColumns.filter(c => c.label.includes('ミラー')));
        
        // Get existing base column values to avoid duplicates
        const baseColumnValues = new Set(validBaseColumns.map(item => item.value));
        
        // Filter out dynamic columns that already exist in base columns
        const uniqueDynamicColumns = dynamicColumns.filter(col => !baseColumnValues.has(col.value));
        
        // Add subitem columns (they won't conflict with main board columns)
        const allDynamicColumns = [...uniqueDynamicColumns, ...subitemDynamicColumns];
        
        console.log('[FieldMappingDialog] Valid base columns:', validBaseColumns.length);
        console.log('[FieldMappingDialog] Unique dynamic columns (after filtering):', uniqueDynamicColumns.length);
        console.log('[FieldMappingDialog] Final columns count:', validBaseColumns.length + uniqueDynamicColumns.length);
        
        // Combine base columns with unique dynamic columns (including subitem columns)
        const allColumns = [
          ...validBaseColumns,
          ...allDynamicColumns
        ];
        
        // Validate all items before setting state
        const validColumns = allColumns.filter(item => {
          if (!item || !item.value || !item.label) {
            console.error('[FieldMappingDialog] Invalid column item:', item);
            return false;
          }
          return true;
        });
        
        const subitemLabelPattern = `[${t.subitemLabel || 'Subitem'}]`;
        console.log('[FieldMappingDialog] Valid columns count:', validColumns.length);
        console.log('[FieldMappingDialog] First 3 items:', validColumns.slice(0, 3));
        console.log('[FieldMappingDialog] Subitem columns in validColumns:', validColumns.filter(c => c.label && c.label.includes(subitemLabelPattern)).length);
        console.log('[FieldMappingDialog] Subitem columns:', validColumns.filter(c => c.label && c.label.includes(subitemLabelPattern)).map(c => ({ value: c.value, label: c.label })));
        
        // Update items directly (no collection needed when using items prop)
        console.log('[FieldMappingDialog] ===== BEFORE setBoardColumnsItems =====');
        console.log('[FieldMappingDialog] validColumns count:', validColumns.length);
        console.log('[FieldMappingDialog] validColumns with', subitemLabelPattern, ':', validColumns.filter(c => c.label && c.label.includes(subitemLabelPattern)).map(c => ({ value: c.value, label: c.label })));
        setBoardColumnsItems(validColumns);
        console.log('[FieldMappingDialog] Loaded', columns.length, 'columns from board,', uniqueDynamicColumns.length, 'unique dynamic columns added,', subitemDynamicColumns.length, 'subitem columns added');
        console.log('[FieldMappingDialog] ===== AFTER setBoardColumnsItems =====');
      } catch (error) {
        console.error('FieldMappingDialog: Failed to fetch columns:', error);
        // Fallback to base columns only
        const validBaseItems = baseColumnItems.filter(item => item && item.value && item.label);
        console.log('[FieldMappingDialog] Fallback items:', validBaseItems);
        setBoardColumnsItems(validBaseItems);
      } finally {
        setLoadingColumns(false);
      }
    };
    
    fetchColumns();
  }, [isOpen, language]);
  
  // Update base columns when language changes
  useEffect(() => {
    if (isOpen) {
      // Only update if boardColumnsItems is still the initial base items (not yet loaded from board)
      if (boardColumnsItems.length === baseColumnItems.length && 
          boardColumnsItems.every((item, idx) => item.value === baseColumnItems[idx]?.value)) {
        setBoardColumnsItems(baseColumnItems);
      }
    }
  }, [language, isOpen, baseColumnItems, boardColumnsItems]);

  // Track if we've initialized to prevent re-initialization on initialMappings changes
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only reset mappings when dialog opens (not when initialMappings changes)
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }
    
    // Only initialize once when dialog opens
    if (isInitialized) return;
    
    // For testing: always start with default mappings (comment out to restore saved mappings)
    // Uncomment the following line to always start fresh:
    // localStorage.removeItem('invoiceFieldMappings');
    
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
    
    setIsInitialized(true);
  }, [isOpen]); // Only depend on isOpen, not initialMappings
  
  // Debug: Log boardColumnsItems whenever it changes
  useEffect(() => {
    console.log('[FieldMappingDialog] boardColumnsItems changed:', boardColumnsItems);
    console.log('[FieldMappingDialog] boardColumnsItems length:', boardColumnsItems?.length);
    if (boardColumnsItems && boardColumnsItems.length > 0) {
      console.log('[FieldMappingDialog] First item:', boardColumnsItems[0]);
      console.log('[FieldMappingDialog] First item structure:', Object.keys(boardColumnsItems[0] || {}));
    }
  }, [boardColumnsItems]);

  // Debug: Log current mappings and boardColumns
  useEffect(() => {
    if (isOpen) {
      console.log('FieldMappingDialog: Current mappings:', mappings);
      console.log('FieldMappingDialog: Available boardColumnsItems:', boardColumnsItems.map(i => ({ value: i.value, label: i.label })));
    }
  }, [isOpen, mappings, boardColumnsItems]);

  const handleSave = () => {
    console.log('[FieldMappingDialog] ===== handleSave =====');
    console.log('[FieldMappingDialog] Saving mappings:', mappings);
    localStorage.setItem('invoiceFieldMappings', JSON.stringify(mappings));
    onSave(mappings);
    onClose();
  };

  const fieldLabels = {
    invoiceNumber: { ja: '請求書番号', en: 'Invoice Number', es: 'Número de Factura' },
    invoiceDate: { ja: '請求日', en: 'Invoice Date', es: 'Fecha de Factura' },
    dueDate: { ja: '支払期限', en: 'Due Date', es: 'Fecha de Vencimiento' },
    validUntil: { ja: '有効期限', en: 'Valid Until', es: 'Válido Hasta' },
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
    subitemPrice: { ja: '価格カラム', en: 'Price Column', es: 'Columna de Precio' },
    subitemQuantity: { ja: '数量カラム', en: 'Quantity Column', es: 'Columna de Cantidad' }
  };

  const getFieldLabel = (fieldKey) => {
    return fieldLabels[fieldKey]?.[language] || fieldKey;
  };

  const columnExists = (value) => {
    if (!validBoardColumnsItems || !Array.isArray(validBoardColumnsItems)) {
      return false;
    }
    return !!value && validBoardColumnsItems.some(item => item && item.value === value && value !== 'custom');
  };

  const isCustomValue = (value) => value && !columnExists(value);

  const getSelectValue = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    // Use mappingValue if it exists and is not empty, otherwise use defaultValue
    const actual = (mappingValue && mappingValue !== '') ? mappingValue : defaultValue;
    if (!actual || actual === '') return 'custom';
    
    // Special values that should always be recognized (not in validBoardColumnsItems)
    const specialValues = ['manual', 'none', 'name', 'clientName', 'column1', 'column2', 'column3', 'discount', 'taxAmount', 'column11', 'column21', 'subitems', 'custom'];
    if (specialValues.includes(actual)) {
      return actual;
    }
    
    // Check if the value exists in validBoardColumnsItems (use memoized version)
    if (!validBoardColumnsItems || !Array.isArray(validBoardColumnsItems)) {
      console.error('[FieldMappingDialog] validBoardColumnsItems is invalid:', validBoardColumnsItems);
      return 'custom';
    }
    const exists = validBoardColumnsItems.some(item => item && item.value === actual);
    const result = exists ? actual : 'custom';
    console.log(`[FieldMappingDialog] getSelectValue(${fieldKey}):`, { mappingValue, defaultValue, actual, exists, result, validBoardColumnsItemsCount: validBoardColumnsItems.length });
    return result;
  };

  const getDisplayLabel = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    const actual = mappingValue && mappingValue.length > 0 ? mappingValue : defaultValue;
    if (!actual) return '未設定';
    if (actual === 'none') return t.fieldMappingNotRequired || '必要なし (Not Required)';
    if (actual === 'manual') return t.fieldMappingManualInput || '手動入力 (Manual Input)';
    if (isCustomValue(actual)) return actual;
    const column = validBoardColumnsItems.find((i) => i.value === actual);
    return column ? column.label : actual;
  };

  const handleSelectChange = (fieldKey, selected) => {
    console.log('[FieldMappingDialog] handleSelectChange:', fieldKey, selected);
    console.log('[FieldMappingDialog] Current validBoardColumnsItems before update:', validBoardColumnsItems);
    
    setMappings((prev) => {
      let updatedMappings;
      if (selected === 'custom') {
        const current = prev[fieldKey];
        // If current value is a custom value (not in validBoardColumnsItems), keep it, otherwise clear
        // Use a safe check to avoid accessing validBoardColumnsItems during state update
        const isCustom = current && (!validBoardColumnsItems || !Array.isArray(validBoardColumnsItems) || !validBoardColumnsItems.some(item => item && item.value === current));
        updatedMappings = {
          ...prev,
          [fieldKey]: isCustom ? current : ''
        };
      } else {
        console.log('[FieldMappingDialog] Setting mapping:', fieldKey, 'to', selected);
        updatedMappings = { ...prev, [fieldKey]: selected };
      }
      
      // Auto-save after state update (without calling onSave to prevent infinite loop)
      setTimeout(() => {
        try {
          localStorage.setItem('invoiceFieldMappings', JSON.stringify(updatedMappings));
          console.log('[FieldMappingDialog] Auto-saved mappings to localStorage');
        } catch (error) {
          console.error('[FieldMappingDialog] Failed to auto-save:', error);
        }
      }, 50);
      
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
              <HStack gap="2">
                <Settings size={24} />
              <Text>{t.fieldMappingTitle}</Text>
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
                  <Box
                    as="select"
                    value={getSelectValue('invoiceNumber')}
                    onChange={(e) => {
                      console.log('[FieldMappingDialog] invoiceNumber onChange:', e.target.value);
                      handleSelectChange('invoiceNumber', e.target.value);
                    }}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => {
                      if (!item || !item.value) {
                        console.error('[FieldMappingDialog] Invalid item:', item);
                        return null;
                      }
                      return (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                      );
                    })}
                  </Box>
                  {renderCustomInput('invoiceNumber', '例: text_mkwjtrys')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('invoiceNumber')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('invoiceDate')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('invoiceDate')}
                    onChange={(e) => handleSelectChange('invoiceDate', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('invoiceDate', '例: column3')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('invoiceDate')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('dueDate')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('dueDate')}
                    onChange={(e) => handleSelectChange('dueDate', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('dueDate', '例: date4')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('dueDate')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('validUntil')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('validUntil')}
                    onChange={(e) => handleSelectChange('validUntil', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('validUntil', '例: date4')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('validUntil')}
                  </Field.HelperText>
                </Field.Root>
              </Stack>

              <Separator />

              <Stack gap="4">
                <Heading size="sm">{t.fieldMappingBillingInfo}</Heading>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientName')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientName')}
                    onChange={(e) => handleSelectChange('clientName', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('clientName', '例: text_mkwjtrys')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientName')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientDepartment')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientDepartment')}
                    onChange={(e) => handleSelectChange('clientDepartment', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('clientDepartment', '例: text_department')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientDepartment')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientContact')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientContact')}
                    onChange={(e) => handleSelectChange('clientContact', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('clientContact', '例: text_contact')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientContact')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientZip')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientZip')}
                    onChange={(e) => handleSelectChange('clientZip', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Box>
                  {renderCustomInput('clientZip', '例: text_zip')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientZip')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientAddress')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientAddress')}
                    onChange={(e) => handleSelectChange('clientAddress', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => {
                      if (!item || !item.value) {
                        console.error('[FieldMappingDialog] Invalid item:', item);
                        return null;
                      }
                      return (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </Box>
                  {renderCustomInput('clientAddress', '例: text_address')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientAddress')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientPhone')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientPhone')}
                    onChange={(e) => handleSelectChange('clientPhone', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Box>
                  {renderCustomInput('clientPhone', '例: text_phone')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('clientPhone')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('clientEmail')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('clientEmail')}
                    onChange={(e) => handleSelectChange('clientEmail', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => {
                      if (!item || !item.value) {
                        console.error('[FieldMappingDialog] Invalid item:', item);
                        return null;
                      }
                      return (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </Box>
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
                  <Box
                    as="select"
                    value={getSelectValue('discount')}
                    onChange={(e) => handleSelectChange('discount', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('discount', '例: numeric_mkwjxbfn')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('discount')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('taxAmount')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('taxAmount')}
                    onChange={(e) => handleSelectChange('taxAmount', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('taxAmount', '例: numeric_mkwqnby1')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('taxAmount')}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{getFieldLabel('items')}</Field.Label>
                  <Box
                    as="select"
                    value={getSelectValue('items')}
                    onChange={(e) => handleSelectChange('items', e.target.value)}
                    width="100%"
                    px="3"
                    py="2"
                    fontSize="sm"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="bg"
                    _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <option value="">{t.fieldMappingSelectColumn}</option>
                    {/* Add subitems option specifically for items field */}
                    <option key="subitems" value="subitems">
                      {getSubitemsOption().label}
                    </option>
                    {validBoardColumnsItems?.map((item) => (
                      <option key={item.value} value={item.value}>
                            {item.label}
                      </option>
                        ))}
                  </Box>
                  {renderCustomInput('items', '例: subitems')}
                  <Field.HelperText fontSize="xs">
                    {t.fieldMappingCurrent} {getDisplayLabel('items')}
                  </Field.HelperText>
                </Field.Root>

                {getSelectValue('items') === 'subitems' && (
                  <>
                  <Field.Root>
                    <Field.Label>{getFieldLabel('subitemPrice')}</Field.Label>
                    <Box
                      as="select"
                      value={getSelectValue('subitemPrice')}
                      onChange={(e) => handleSelectChange('subitemPrice', e.target.value)}
                      width="100%"
                      px="3"
                      py="2"
                      fontSize="sm"
                      borderWidth="1px"
                      borderRadius="md"
                      bg="bg"
                      _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                    >
                      <option value="">{t.fieldMappingSelectColumn}</option>
                      {/* Show base options first */}
                      {baseColumnItems.filter(item => ['manual', 'none'].includes(item.value)).map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                      {(() => {
                        const subitemLabelPattern = `[${t.subitemLabel || 'Subitem'}]`;
                        const baseOptionValues = ['manual', 'none'];
                        console.log('[FieldMappingDialog] subitemPrice - showing all columns');
                        return validBoardColumnsItems?.map((item) => {
                          if (!item || !item.value) {
                            console.error('[FieldMappingDialog] Invalid item:', item);
                            return null;
                          }
                          // Exclude base options (manual, none) to avoid duplicates
                          if (baseOptionValues.includes(item.value)) {
                            return null;
                          }
                          // Show all columns (both item and subitem columns) for subitemPrice field
                          return (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          );
                        });
                      })()}
                    </Box>
                    {renderCustomInput('subitemPrice', '例: numeric_mkwjthws')}
                    <Field.HelperText fontSize="xs">
                      {t.fieldMappingCurrent} {getDisplayLabel('subitemPrice')}
                    </Field.HelperText>
                  </Field.Root>

                    <Field.Root>
                      <Field.Label>{getFieldLabel('subitemQuantity')}</Field.Label>
                      <Box
                        as="select"
                        value={getSelectValue('subitemQuantity')}
                        onChange={(e) => handleSelectChange('subitemQuantity', e.target.value)}
                        width="100%"
                        px="3"
                        py="2"
                        fontSize="sm"
                        borderWidth="1px"
                        borderRadius="md"
                        bg="bg"
                        _focus={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                      >
                        <option value="">{t.fieldMappingSelectColumn}</option>
                        {/* Show base options first */}
                        {baseColumnItems.filter(item => ['manual', 'none'].includes(item.value)).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                        {(() => {
                          const baseOptionValues = ['manual', 'none'];
                          console.log('[FieldMappingDialog] subitemQuantity - showing all columns');
                          return validBoardColumnsItems?.map((item) => {
                            if (!item || !item.value) {
                              console.error('[FieldMappingDialog] Invalid item:', item);
                              return null;
                            }
                            // Exclude base options (manual, none) to avoid duplicates
                            if (baseOptionValues.includes(item.value)) {
                              return null;
                            }
                            // Show all columns (both item and subitem columns) for subitemQuantity field
                            return (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            );
                          });
                        })()}
                      </Box>
                      {renderCustomInput('subitemQuantity', '例: numeric_mkywyf4v')}
                      <Field.HelperText fontSize="xs">
                        {t.fieldMappingCurrent} {getDisplayLabel('subitemQuantity')}
                      </Field.HelperText>
                    </Field.Root>
                  </>
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

