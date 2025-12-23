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
  const [boardColumnsItems, setBoardColumnsItems] = useState(baseColumnItems);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const t = translations[language] || translations.ja;
  const board = new BoardSDK();
  
  // Use items prop directly instead of collection to avoid a.options is not iterable error
  // This is a different approach from App.jsx, but necessary for dynamic data
  const validBoardColumnsItems = useMemo(() => {
    const filtered = boardColumnsItems.filter(item => item && item.value && item.label);
    const subitemCount = filtered.filter(item => item.label && item.label.includes('[サブアイテム]')).length;
    console.log('[FieldMappingDialog] validBoardColumnsItems:', {
      total: filtered.length,
      subitemCount: subitemCount,
      subitemItems: filtered.filter(item => item.label && item.label.includes('[サブアイテム]')).map(item => ({ value: item.value, label: item.label }))
    });
    return filtered;
  }, [boardColumnsItems]);

  // Note: We don't use key prop to force remount like App.jsx
  // The collection object is stabilized with useMemo, so Select components should handle updates correctly

  // Fetch board columns dynamically when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    
    // TEST: Clear localStorage when dialog opens
    // Remove this block after testing
    try {
      localStorage.removeItem('invoiceFieldMappings');
      console.log('[FieldMappingDialog] Cleared localStorage for testing');
    } catch (e) {
      console.error('[FieldMappingDialog] Failed to clear localStorage:', e);
    }
    
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
            'numbers': '数値',
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
        
        // Fetch subitem columns from subitem board
        // Use the subitem board ID to fetch column information with titles
        console.log('[FieldMappingDialog] ===== STARTING SUBITEM COLUMNS FETCH =====');
        let subitemColumns = [];
        try {
          // Ensure board is initialized
          if (!board.boardId) {
            await board.initialize();
          }
          
          // Get subitem board ID from BoardSDK
          const subitemBoardId = board.subitemBoardId || '18144719619';
          console.log('[FieldMappingDialog] subitemBoardId:', subitemBoardId);
          console.log('[FieldMappingDialog] board.boardId:', board.boardId);
          
          // Fetch subitem board columns with titles
          const subitemBoardQuery = `
            query GetSubitemBoardColumns($subitemBoardId: [ID!]!) {
              boards(ids: $subitemBoardId) {
                columns {
                  id
                  title
                  type
                }
              }
            }
          `;
          
          console.log('[FieldMappingDialog] About to query subitem board...');
          const subitemBoardResponse = await board.query(subitemBoardQuery, { subitemBoardId: [subitemBoardId] });
          console.log('[FieldMappingDialog] subitemBoardResponse:', subitemBoardResponse);
          const subitemBoards = subitemBoardResponse?.boards || subitemBoardResponse?.data?.boards;
          console.log('[FieldMappingDialog] subitemBoards:', subitemBoards);
          console.log('[FieldMappingDialog] subitemBoards?.[0]?.columns:', subitemBoards?.[0]?.columns);
          
          if (subitemBoards?.[0]?.columns) {
            subitemColumns = subitemBoards[0].columns.map(col => ({
              id: col.id,
              title: col.title,
              type: col.type || 'text'
            }));
            console.log('[FieldMappingDialog] Fetched subitem board columns:', subitemColumns.length);
            console.log('[FieldMappingDialog] Subitem columns:', subitemColumns);
          } else {
            console.warn('[FieldMappingDialog] No subitem board columns found, trying fallback...');
            // Fallback: try to get column IDs from actual subitem data, then fetch titles from subitem board
            try {
              // Fetch all subitem columns (don't specify column IDs to get all)
              const testQuery = `
                query GetSubitemColumns($boardId: [ID!]!) {
                  boards(ids: $boardId) {
                    items_page(limit: 10) {
                      items {
                        subitems {
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
                testBoards[0].items_page.items.forEach(item => {
                  if (item.subitems) {
                    console.log('[FieldMappingDialog] Item has subitems:', item.subitems.length);
                    item.subitems.forEach(subitem => {
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
                
                // Try to fetch column titles from subitem board using column IDs
                if (subitemColumnIds.size > 0) {
                  const columnIdsArray = Array.from(subitemColumnIds);
                  const columnTitlesQuery = `
                    query GetSubitemColumnTitles($subitemBoardId: [ID!]!) {
                      boards(ids: $subitemBoardId) {
                        columns {
                          id
                          title
                          type
                        }
                      }
                    }
                  `;
                  try {
                    const titlesResponse = await board.query(columnTitlesQuery, { subitemBoardId: [subitemBoardId] });
                    const titlesBoards = titlesResponse?.boards || titlesResponse?.data?.boards;
                    if (titlesBoards?.[0]?.columns) {
                      const subitemBoardColumns = titlesBoards[0].columns;
                      const subitemColumnMap = new Map();
                      columnIdsArray.forEach(colId => {
                        const subitemBoardColumn = subitemBoardColumns.find(c => c.id === colId);
                        if (subitemBoardColumn) {
                          subitemColumnMap.set(colId, {
                            id: colId,
                            title: subitemBoardColumn.title,
                            type: subitemBoardColumn.type || 'text'
                          });
                        } else {
                          // Check if it's a mirror column in the main board
                          const mainBoardColumn = columns.find(c => c.id === colId);
                          if (mainBoardColumn) {
                            subitemColumnMap.set(colId, {
                              id: colId,
                              title: mainBoardColumn.title,
                              type: mainBoardColumn.type
                            });
                          } else {
                            // Last resort: use column ID as title
                            const colType = allSubitemColumnValues.find(c => c.id === colId)?.type || 'text';
                            subitemColumnMap.set(colId, {
                              id: colId,
                              title: colId,
                              type: colType
                            });
                          }
                        }
                      });
                      subitemColumns = Array.from(subitemColumnMap.values());
                      console.log('[FieldMappingDialog] Fallback: extracted subitem columns with titles:', subitemColumns.length);
                      console.log('[FieldMappingDialog] Fallback: subitem columns:', subitemColumns);
                    } else {
                      console.warn('[FieldMappingDialog] No columns found in subitem board response');
                      // Try to get titles from main board mirror columns
                      // Mirror columns have settings that link to subitem board columns
                      const subitemColumnMap = new Map();
                      columnIdsArray.forEach(colId => {
                        // First, check if it's a direct match in main board columns
                        let mainBoardColumn = columns.find(c => c.id === colId);
                        
                        // If not found, check mirror columns that might link to this subitem column
                        if (!mainBoardColumn) {
                          mainBoardColumn = columns.find(c => {
                            // Check if this is a mirror column that links to the subitem board
                            if (c.type === 'mirror' || c.type === 'mirror__') {
                              // Mirror columns have settings that contain linked_board_id
                              // We need to check if this mirror column's settings link to the subitem board
                              // For now, we'll check all mirror columns and see if any match
                              return true; // We'll check all mirror columns
                            }
                            return false;
                          });
                        }
                        
                        // If still not found, try to find a mirror column that might be linked to this subitem column
                        // by checking if any mirror column's settings contain this column ID
                        if (!mainBoardColumn) {
                          // Try to find mirror columns and check their settings
                          const mirrorColumns = columns.filter(c => c.type === 'mirror' || c.type === 'mirror__');
                          for (const mirrorCol of mirrorColumns) {
                            // We can't easily check settings without additional API calls
                            // So we'll use a heuristic: if the mirror column title matches common patterns
                            // For now, we'll just use the first mirror column as a fallback
                            // This is not perfect, but better than using column ID
                          }
                        }
                        
                        if (mainBoardColumn) {
                          subitemColumnMap.set(colId, {
                            id: colId,
                            title: mainBoardColumn.title,
                            type: mainBoardColumn.type || 'text'
                          });
                          console.log('[FieldMappingDialog] Found mirror column in main board:', colId, '->', mainBoardColumn.title);
                        } else {
                          // Try to infer title from column ID pattern or use a generic name
                          // For numeric columns, we can try to infer from the column ID
                          const colType = allSubitemColumnValues.find(c => c.id === colId)?.type || 'text';
                          // Use a more user-friendly title based on column type
                          let inferredTitle = colId;
                          if (colType === 'numbers' || colType === 'numeric') {
                            // Try to find if there's a similar column in the main board
                            const similarColumn = columns.find(c => 
                              c.type === 'numeric' || c.type === 'numbers'
                            );
                            if (similarColumn) {
                              inferredTitle = `${similarColumn.title} (サブアイテム)`;
                            } else {
                              inferredTitle = `数値カラム (${colId.slice(-8)})`;
                            }
                          } else {
                            inferredTitle = `カラム (${colId.slice(-8)})`;
                          }
                          
                          subitemColumnMap.set(colId, {
                            id: colId,
                            title: inferredTitle,
                            type: colType
                          });
                          console.warn('[FieldMappingDialog] No mirror column found, using inferred title:', colId, '->', inferredTitle);
                        }
                      });
                      subitemColumns = Array.from(subitemColumnMap.values());
                      console.log('[FieldMappingDialog] Fallback: using mirror columns from main board:', subitemColumns.length);
                      console.log('[FieldMappingDialog] Fallback: subitem columns:', subitemColumns);
                    }
                  } catch (titlesError) {
                    console.error('[FieldMappingDialog] Failed to fetch subitem column titles:', titlesError);
                    // Try to get titles from main board mirror columns
                    const subitemColumnMap = new Map();
                    columnIdsArray.forEach(colId => {
                      // Check if it's a mirror column in the main board
                      const mainBoardColumn = columns.find(c => c.id === colId);
                      if (mainBoardColumn) {
                        subitemColumnMap.set(colId, {
                          id: colId,
                          title: mainBoardColumn.title,
                          type: mainBoardColumn.type || 'text'
                        });
                        console.log('[FieldMappingDialog] Found mirror column in main board (error case):', colId, '->', mainBoardColumn.title);
                      } else {
                        // Last resort: use column ID as title
                        const colType = allSubitemColumnValues.find(c => c.id === colId)?.type || 'text';
                        subitemColumnMap.set(colId, {
                          id: colId,
                          title: colId,
                          type: colType
                        });
                        console.warn('[FieldMappingDialog] No mirror column found (error case), using ID as title:', colId);
                      }
                    });
                    subitemColumns = Array.from(subitemColumnMap.values());
                    console.log('[FieldMappingDialog] Fallback: using mirror columns from main board (error case):', subitemColumns.length);
                    console.log('[FieldMappingDialog] Fallback: subitem columns (error case):', subitemColumns);
                  }
                } else {
                  console.warn('[FieldMappingDialog] No subitem column IDs found in data');
                }
              } else {
                console.warn('[FieldMappingDialog] No items with subitems found');
              }
            } catch (fallbackError) {
              console.error('[FieldMappingDialog] Fallback also failed:', fallbackError);
              console.error('[FieldMappingDialog] Fallback error details:', {
                message: fallbackError.message,
                stack: fallbackError.stack
              });
              subitemColumns = [];
            }
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
        // Also include special values like 'manual', 'name', 'subitems', 'custom'
        const validBaseColumns = baseColumnItems.filter(item => {
          // Always include special values
          if (['manual', 'name', 'subitems', 'custom'].includes(item.value)) {
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
        const subitemDynamicColumns = subitemColumns.map(col => ({
          label: `${col.title} (${getColumnTypeLabel(col.type)}) [サブアイテム]`,
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
        
        console.log('[FieldMappingDialog] Valid columns count:', validColumns.length);
        console.log('[FieldMappingDialog] First 3 items:', validColumns.slice(0, 3));
        console.log('[FieldMappingDialog] Subitem columns in validColumns:', validColumns.filter(c => c.label && c.label.includes('[サブアイテム]')).length);
        console.log('[FieldMappingDialog] Subitem columns:', validColumns.filter(c => c.label && c.label.includes('[サブアイテム]')).map(c => ({ value: c.value, label: c.label })));
        
        // Update items directly (no collection needed when using items prop)
        console.log('[FieldMappingDialog] ===== BEFORE setBoardColumnsItems =====');
        console.log('[FieldMappingDialog] validColumns count:', validColumns.length);
        console.log('[FieldMappingDialog] validColumns with [サブアイテム]:', validColumns.filter(c => c.label && c.label.includes('[サブアイテム]')).map(c => ({ value: c.value, label: c.label })));
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
  }, [isOpen]);

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

  const columnExists = (value) => {
    if (!boardColumnsItems || !Array.isArray(boardColumnsItems)) {
      return false;
    }
    return !!value && boardColumnsItems.some(item => item && item.value === value && value !== 'custom');
  };

  const isCustomValue = (value) => value && !columnExists(value);

  const getSelectValue = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    // Use mappingValue if it exists and is not empty, otherwise use defaultValue
    const actual = (mappingValue && mappingValue !== '') ? mappingValue : defaultValue;
    if (!actual || actual === '') return 'custom';
    // Check if the value exists in boardColumnsItems
    if (!boardColumnsItems || !Array.isArray(boardColumnsItems)) {
      console.error('[FieldMappingDialog] boardColumnsItems is invalid:', boardColumnsItems);
      return 'custom';
    }
    const exists = boardColumnsItems.some(item => item && item.value === actual);
    const result = exists ? actual : 'custom';
    console.log(`[FieldMappingDialog] getSelectValue(${fieldKey}):`, { mappingValue, defaultValue, actual, exists, result, boardColumnsItemsCount: boardColumnsItems.length });
    return result;
  };

  const getDisplayLabel = (fieldKey) => {
    const mappingValue = mappings[fieldKey];
    const defaultValue = defaultMappings[fieldKey];
    const actual = mappingValue && mappingValue.length > 0 ? mappingValue : defaultValue;
    if (!actual) return '未設定';
    if (isCustomValue(actual)) return actual;
    const column = boardColumnsItems.find((i) => i.value === actual);
    return column ? column.label : actual;
  };

  const handleSelectChange = (fieldKey, selected) => {
    console.log('[FieldMappingDialog] handleSelectChange:', fieldKey, selected);
    console.log('[FieldMappingDialog] Current boardColumnsItems before update:', boardColumnsItems);
    
    setMappings((prev) => {
      let updatedMappings;
      if (selected === 'custom') {
        const current = prev[fieldKey];
        // If current value is a custom value (not in boardColumnsItems), keep it, otherwise clear
        // Use a safe check to avoid accessing boardColumnsItems during state update
        const isCustom = current && (!boardColumnsItems || !Array.isArray(boardColumnsItems) || !boardColumnsItems.some(item => item && item.value === current));
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
                      {(() => {
                        console.log('[FieldMappingDialog] ===== subitemPrice Select Render =====');
                        console.log('[FieldMappingDialog] validBoardColumnsItems:', validBoardColumnsItems);
                        console.log('[FieldMappingDialog] validBoardColumnsItems count:', validBoardColumnsItems?.length);
                        const subitemItems = validBoardColumnsItems?.filter(item => item.label && item.label.includes('[サブアイテム]'));
                        console.log('[FieldMappingDialog] subitemItems in Select:', subitemItems);
                        console.log('[FieldMappingDialog] subitemItems count:', subitemItems?.length);
                        return validBoardColumnsItems?.map((item) => {
                          if (!item || !item.value) {
                            console.error('[FieldMappingDialog] Invalid item:', item);
                            return null;
                          }
                          // Only show subitem columns for subitemPrice field
                          const isSubitemColumn = item.label && item.label.includes('[サブアイテム]');
                          if (!isSubitemColumn) {
                            return null; // Don't show non-subitem columns
                          }
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

