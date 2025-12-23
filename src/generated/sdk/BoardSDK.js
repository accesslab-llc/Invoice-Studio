/**
 * BoardSDK - Board-specific SDK for Monday.com board
 * 
 * This SDK integrates with Monday App SDK to dynamically fetch board data
 * and provides a convenient interface for invoice generation.
 */

import mondaySdk from 'monday-sdk-js';

class BoardSDK {
  constructor(boardId = null) {
    this.monday = mondaySdk();
    this.boardId = boardId;
    
    // Column ID mappings (can be customized via field mappings)
    this.columnMappings = {
      column1: 'person',
      column2: 'status',
      column3: 'date4',
      subtotal: 'lookup_mkwjr750',
      tax: 'formula_mkwj1bwv',
      discount: 'numeric_mkwjxbfn',
      total: 'formula_mkwjbvnf',
      clientName: 'text_mkwjtrys',
      taxAmount: 'numeric_mkwqnby1',
      column11: 'numeric_mkwq31hb',
      column12: 'formula_mkwq6dca',
      column21: 'numeric_mkwqndq6'
    };
    
    // Subitem Board ID
    this.subitemBoardId = '18144719619';
  }

  /**
   * Initialize with Monday context (boardId from context or env)
   */
  async initialize() {
    // First, try to get from environment variable (for local development)
    const envBoardId =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONDAY_BOARD_ID) ||
      (typeof process !== 'undefined' && process.env?.VITE_MONDAY_BOARD_ID);

    if (envBoardId) {
      console.log('[BoardSDK] Using board ID from environment variable:', envBoardId);
      this.boardId = envBoardId;
      return;
    }

    // Second, try to get from Monday context (when running in Monday.com)
    try {
      const context = await this.monday.get('context');
      console.log('[BoardSDK] Context response:', context);
      
      const boardId = context?.data?.boardId || context?.boardId;
      if (boardId) {
        console.log('[BoardSDK] Using board ID from context:', boardId);
        this.boardId = boardId;
        return;
      } else {
        console.warn('[BoardSDK] No board ID found in context:', context);
      }
    } catch (error) {
      console.warn('[BoardSDK] Could not get board ID from context:', error);
    }
    
    // Fallback to default board ID
    if (!this.boardId) {
      console.log('[BoardSDK] Using fallback board ID:', '18144711310');
      this.boardId = '18144711310';
    }
  }

  /**
   * Get authentication token from Monday or from env when running locally
   * 
   * Environment-aware token retrieval:
   * - DEV: env token → sessionToken → monday.get('token')
   * - PROD: sessionToken → monday.get('token') → throw Error
   */
  async getToken() {
    const isDev = import.meta.env.DEV === true;
    const isProd = import.meta.env.PROD === true;
    
    console.log('[BoardSDK] getToken() called', { isDev, isProd });

    // Development environment: allow env token
    if (isDev) {
      const envToken =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONDAY_API_TOKEN) ||
        (typeof process !== 'undefined' && process.env?.VITE_MONDAY_API_TOKEN);

      if (envToken) {
        const tokenStr = String(envToken).trim();
        if (tokenStr && tokenStr.length > 0) {
          console.log('[BoardSDK] Using DEV env token');
          return tokenStr;
        }
        console.error('[BoardSDK] Environment token is empty or invalid');
      }
    }

    // Production environment: never use env token
    if (isProd) {
      const envToken =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONDAY_API_TOKEN) ||
        (typeof process !== 'undefined' && process.env?.VITE_MONDAY_API_TOKEN);
      if (envToken) {
        console.error('[BoardSDK] PROD environment: Personal API token detected but should not be used');
        throw new Error('認証エラー: 本番環境では個人APIトークンを使用できません。Monday.comからアプリを開き直してください。');
      }
    }

    // Try to get token from URL parameters (Monday.com passes sessionToken in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');
    if (sessionToken) {
      console.log('[BoardSDK] Using sessionToken from URL');
      return sessionToken;
    }

    // Try to get token from Monday SDK
    console.log('[BoardSDK] Attempting to get token from Monday SDK...');
    try {
      const tokenPromise = this.monday.get('token');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token request timeout')), 2000)
      );
      const tokenResponse = await Promise.race([tokenPromise, timeoutPromise]);
      
      // Monday SDK may return token in different formats
      // Check various possible structures
      let token = null;
      
      if (typeof tokenResponse === 'string') {
        token = tokenResponse;
      } else if (tokenResponse?.token) {
        token = tokenResponse.token;
      } else if (tokenResponse?.data) {
        // If data is a string, use it directly
        if (typeof tokenResponse.data === 'string') {
          token = tokenResponse.data;
        } else if (tokenResponse.data?.token) {
          token = tokenResponse.data.token;
        }
      } else if (tokenResponse && typeof tokenResponse === 'object') {
        // Try to find any string property that looks like a token
        for (const key in tokenResponse) {
          const value = tokenResponse[key];
          if (typeof value === 'string' && value.length > 20) {
            token = value;
            break;
          }
        }
      }
      
      // Ensure token is a string
      if (token) {
        token = String(token).trim();
        if (token && token.length > 0 && token !== '[object Object]') {
          console.log('[BoardSDK] Using token from monday.get("token")');
          return token;
        }
      }
      
      // No valid token found
      console.error('[BoardSDK] No valid token found in response');
      throw new Error('認証に失敗しました。Monday.comからアプリを開き直してください。');
    } catch (error) {
      // If it's already our custom error, re-throw it
      if (error.message && (
        error.message.includes('認証') ||
        error.message.includes('本番環境')
      )) {
        console.error('[BoardSDK] Failed to obtain token');
        throw error;
      }
      
      // Otherwise, wrap the error
      console.error('[BoardSDK] Failed to obtain token');
      if (isProd) {
        throw new Error('認証に失敗しました。Monday.comからアプリを開き直してください。');
      }
      
      // In development, also throw but with different message
      throw new Error('認証トークンの取得に失敗しました。環境変数またはMonday.comからアプリを開き直してください。');
    }
  }

  /**
   * Execute GraphQL query
   */
  async query(query, variables = {}) {
    try {
      console.log('[BoardSDK] Executing GraphQL query using Monday SDK api() method...');
      
      // Check if monday object exists
      if (!this.monday) {
        console.error('[BoardSDK] Monday SDK object is not initialized');
        throw new Error('Monday SDK is not initialized. Please check Monday SDK setup.');
      }
      
      // Check if monday.api() method exists
      if (typeof this.monday.api !== 'function') {
        console.error('[BoardSDK] monday.api() method is not available');
        console.error('[BoardSDK] Available methods:', Object.keys(this.monday));
        throw new Error('Monday SDK api() method is not available. Please check Monday SDK initialization and API permissions in Monday.com Developer Center.');
      }
      
      // Check if we're running in Monday.com context
      try {
        const context = await this.monday.get('context');
        console.log('[BoardSDK] Monday context:', context);
      } catch (contextError) {
        console.warn('[BoardSDK] Could not get Monday context:', contextError);
      }
      
      // Note: monday.api() automatically handles token retrieval internally
      // We skip manual token retrieval to avoid blocking the API call
      
      // Use Monday SDK's api() method which handles CORS and authentication automatically
      // The api() method signature: api(query, { variables })
      console.log('[BoardSDK] Calling monday.api() with query and variables...');
      console.log('[BoardSDK] Query length:', query.length);
      console.log('[BoardSDK] Variables:', JSON.stringify(variables));
      console.log('[BoardSDK] monday.api type:', typeof this.monday.api);
      
      try {
        console.log('[BoardSDK] About to call monday.api()...');
        const result = await this.monday.api(query, { variables });
        console.log('[BoardSDK] monday.api() call completed');
      console.log('[BoardSDK] API response received:', result);
        console.log('[BoardSDK] API response type:', typeof result);
      
          // Check if result is undefined or null
        if (result === undefined || result === null) {
          console.error('[BoardSDK] API returned undefined or null');
          console.error('[BoardSDK] This usually means:');
          console.error('[BoardSDK] 1. API permissions are not set correctly in Monday.com Developer Center');
          console.error('[BoardSDK] 2. Required scopes: boards:read, items:read, subitems:read');
          console.error('[BoardSDK] 3. The app may not be properly authenticated');
          throw new Error('Monday.com API returned undefined. Please check API permissions in Monday.com Developer Center (boards:read, items:read, subitems:read).');
        }
      
      if (result.errors) {
        console.error('[BoardSDK] GraphQL errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'GraphQL error');
      }

      if (!result.data) {
        console.error('[BoardSDK] No data in response:', result);
        throw new Error('No data returned from API');
      }

        console.log('[BoardSDK] Returning data:', result.data);
      return result.data;
      } catch (apiError) {
        console.error('[BoardSDK] Error in monday.api() call:', apiError);
        console.error('[BoardSDK] API error message:', apiError.message);
        console.error('[BoardSDK] API error stack:', apiError.stack);
        throw apiError;
      }
    } catch (error) {
      console.error('[BoardSDK] GraphQL query failed:', error);
      console.error('[BoardSDK] Error message:', error.message);
      console.error('[BoardSDK] Error stack:', error.stack);
      console.error('[BoardSDK] Query:', query.substring(0, 200) + '...');
      console.error('[BoardSDK] Variables:', variables);
      
      throw error;
    }
  }

  /**
   * Fetch board items with columns and subitems
   */
  async fetchItems(options = {}) {
    const {
      columns = [],
      subItems = [],
      limit = 50,
      cursor = null
    } = options;

    if (!this.boardId) {
      await this.initialize();
    }

    // Build column IDs to fetch
    // If columns is null, fetch all columns (don't specify columnIds in query)
    // If columns is empty array, use default columnMappings
    // If columns has values, use those
    const columnIds = columns === null 
      ? null // null means fetch all columns
      : columns.length > 0 
      ? columns.map(col => this.columnMappings[col] || col)
      : Object.values(this.columnMappings);
    
    // If subItems is null, fetch all subitem columns (don't specify subItemColumnIds in query)
    // If subItems is empty array, don't fetch any subitem columns
    // If subItems has values, use those
    const subItemColumnIds = subItems === null
      ? null // null means fetch all subitem columns
      : subItems.length > 0
      ? subItems.map(col => this.columnMappings[col] || col)
      : [];

    // Build GraphQL query - items_page uses cursor-based pagination, not page numbers
    // Use different queries based on whether cursor is provided and whether subItemColumnIds are specified
    // If subItemColumnIds is null, fetch all subitem columns (no ids parameter)
    // If subItemColumnIds is empty array, don't fetch any subitem columns (no ids parameter)
    // If subItemColumnIds has values, fetch specific columns (ids parameter)
    const hasSubItemColumns = subItemColumnIds !== null && subItemColumnIds.length > 0;
    const fetchAllSubItemColumns = subItemColumnIds === null;
    const subItemColumnArgs = hasSubItemColumns ? '(ids: $subItemColumnIds)' : '';
    const subItemColumnVar = hasSubItemColumns ? ', $subItemColumnIds: [String!]' : '';
    
    const query = cursor
      ? `
        query GetBoardItems($boardId: [ID!]!, $limit: Int, $cursor: String!, $columnIds: [String!]${subItemColumnVar}) {
          boards(ids: $boardId) {
            items_page(limit: $limit, cursor: $cursor) {
              cursor
              items {
                id
                name
                column_values(ids: $columnIds) {
                  id
                  text
                  value
                  type
                  ... on BoardRelationValue {
                    linked_item_ids
                    linked_items {
                      id
                      name
                    }
                  }
                  ... on LookupValue {
                    linked_item_ids
                    linked_items {
                      id
                      name
                    }
                  }
                }
                subitems {
                  id
                  name
                  column_values${subItemColumnArgs} {
                    id
                    text
                    value
                    type
                    ... on BoardRelationValue {
                      linked_item_ids
                      linked_items {
                        id
                        name
                      }
                    }
                    ... on LookupValue {
                      linked_item_ids
                      linked_items {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
      : `
        query GetBoardItems($boardId: [ID!]!, $limit: Int, $columnIds: [String!]${subItemColumnVar}) {
          boards(ids: $boardId) {
            items_page(limit: $limit) {
              cursor
              items {
                id
                name
                column_values(ids: $columnIds) {
                  id
                  text
                  value
                  type
                  ... on BoardRelationValue {
                    linked_item_ids
                    linked_items {
                      id
                      name
                    }
                  }
                  ... on LookupValue {
                    linked_item_ids
                    linked_items {
                      id
                      name
                    }
                  }
                }
                subitems {
                  id
                  name
                  column_values${subItemColumnArgs} {
                    id
                    text
                    value
                    type
                    ... on BoardRelationValue {
                      linked_item_ids
                      linked_items {
                        id
                        name
                      }
                    }
                    ... on LookupValue {
                      linked_item_ids
                      linked_items {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

    try {
      const variables = {
        boardId: [this.boardId],
        limit,
        columnIds: columnIds === null ? null : (columnIds.length > 0 ? columnIds : null)
      };
      
      if (cursor) {
        variables.cursor = cursor;
      }
      
      if (hasSubItemColumns) {
        variables.subItemColumnIds = subItemColumnIds;
      }

      const data = await this.query(query, variables);

      const itemsPage = data?.boards?.[0]?.items_page;
      const items = itemsPage?.items || [];
      const nextCursor = itemsPage?.cursor || null;
      
      // Debug: Log raw subitems data
      if (items.length > 0 && items[0].subitems) {
        console.log('Raw subitems data:', JSON.stringify(items[0].subitems, null, 2));
        console.log('Subitem column IDs requested:', subItemColumnIds);
      }
      
      // Transform items to match expected format
      const transformedItems = items.map(item => this.transformItem(item));
      
      // Debug: Log transformed subitems
      if (transformedItems.length > 0 && transformedItems[0].subitems) {
        console.log('Transformed subitems:', JSON.stringify(transformedItems[0].subitems, null, 2));
      }
      
      return {
        items: transformedItems,
        hasNextPage: !!nextCursor && items.length === limit,
        cursor: nextCursor
      };
    } catch (error) {
      console.error('Failed to fetch items:', error);
      throw error;
    }
  }

  /**
   * Transform Monday API item to app format
   */
  transformItem(item) {
    const transformed = {
      id: item.id,
      name: item.name,
      subitems: item.subitems?.map(sub => this.transformSubItem(sub)) || []
    };

    // Map column values
    item.column_values?.forEach(col => {
      // Find mapping key (e.g., 'clientName', 'discount', 'taxAmount') for this column ID
      const mappingKey = Object.keys(this.columnMappings).find(
        k => this.columnMappings[k] === col.id
      );
      
      // Use mapping key if found, otherwise use column ID directly
      const key = mappingKey || col.id;
      
      // Parse value based on type
      // Use the same simple approach as transformSubItem - col.text for most types
      let value = col.text;
      if (col.type === 'numeric' || col.type === 'numbers') {
        try {
          const parsed = JSON.parse(col.value);
          value = parsed?.number || parsed || 0;
        } catch {
          value = parseFloat(col.text) || 0;
        }
      } else if (col.type === 'date') {
        try {
          const parsed = JSON.parse(col.value);
          value = parsed?.date || col.text;
        } catch {
          value = col.text;
        }
      } else if (col.type === 'text') {
        value = col.text || '';
      } else if (col.type === 'mirror' || col.type === 'mirror__') {
        // Mirror column: use text value which contains the displayed value
        value = col.text || '';
      } else {
        // For all other types (lookup, board_relation, status, person, etc.), use text value
        // This is the same approach as transformSubItem - simple and works
        value = col.text || '';
      }

      // Store value with both mapping key and column ID for flexibility
      transformed[key] = value;
      // Also store with column ID directly for direct access
      if (mappingKey && col.id !== key) {
        transformed[col.id] = value;
      }
    });

    return transformed;
  }

  /**
   * Transform subitem
   */
  transformSubItem(subitem) {
    const transformed = {
      id: subitem.id,
      name: subitem.name
    };


    // Debug: Log subitem column values
    if (subitem.column_values && subitem.column_values.length > 0) {
      console.log('Subitem column_values:', subitem.column_values.map(c => ({ id: c.id, text: c.text, type: c.type })));
    } else {
      console.warn('Subitem has no column_values:', subitem);
    }

    subitem.column_values?.forEach(col => {
      // Try to find the mapping key (e.g., 'subitemQuantity', 'subitemPrice') for this column ID
      const mappingKey = Object.keys(this.columnMappings).find(
        k => this.columnMappings[k] === col.id
      );
      
      // Use mapping key if found, otherwise use column ID directly
      const key = mappingKey || col.id;
      
      let value = col.text || '';
      
      // Parse value based on type
      if (col.type === 'numeric' || col.type === 'numbers') {
        try {
          if (col.value) {
            const parsed = JSON.parse(col.value);
            value = parsed?.number || parsed || 0;
          } else {
            value = parseFloat(col.text) || 0;
          }
        } catch {
          value = parseFloat(col.text) || 0;
        }
      } else if (col.type === 'people') {
        // People type: value contains JSON with personsAndTeams array
        try {
          if (col.value) {
            const parsed = JSON.parse(col.value);
            if (parsed?.personsAndTeams && parsed.personsAndTeams.length > 0) {
              // Extract person names
              value = parsed.personsAndTeams
                .map(p => p.name || p.title || '')
                .filter(Boolean)
                .join(', ');
            } else {
              value = col.text || '';
            }
          } else {
            value = col.text || '';
          }
        } catch {
          value = col.text || '';
        }
      } else if (col.type === 'date') {
        try {
          if (col.value) {
            const parsed = JSON.parse(col.value);
            value = parsed?.date || col.text || '';
          } else {
            value = col.text || '';
          }
        } catch {
          value = col.text || '';
        }
      } else if (col.type === 'text') {
        value = col.text || '';
      } else {
        // For other types, try to use text, fallback to empty string
        value = col.text || '';
      }

      // Store value with both mapping key and column ID for flexibility
      transformed[key] = value;
      // Also store with column ID directly for direct access
      if (mappingKey && col.id !== key) {
        transformed[col.id] = value;
      }
    });

    return transformed;
  }

  /**
   * Fetch board columns dynamically
   */
  async fetchColumns() {
    if (!this.boardId) {
      await this.initialize();
    }

    try {
      const query = `
        query GetBoardColumns($boardId: [ID!]!) {
          boards(ids: $boardId) {
            columns {
              id
              title
              type
            }
          }
        }
      `;

      const variables = {
        boardId: [this.boardId]
      };

      const response = await this.query(query, variables);
      
      // query() method returns response.data, so response is already the data part
      // Check both response.boards (if query returns data) and response.data.boards (if query returns full response)
      const boards = response?.boards || response?.data?.boards;
      
      if (boards?.[0]?.columns) {
        const columns = boards[0].columns;
        console.log('[BoardSDK] Fetched columns:', columns.length);
        console.log('[BoardSDK] Column types:', columns.map(c => ({ id: c.id, title: c.title, type: c.type })));
        // Log mirror columns specifically
        const mirrorColumns = columns.filter(c => c.type === 'mirror' || c.type === 'mirror__');
        if (mirrorColumns.length > 0) {
          console.log('[BoardSDK] Found mirror columns:', mirrorColumns.length, mirrorColumns.map(c => ({ id: c.id, title: c.title })));
        } else {
          console.log('[BoardSDK] No mirror columns found in board');
        }
        return columns;
      }
      
      console.warn('[BoardSDK] No columns found in response');
      console.warn('[BoardSDK] Response structure:', response);
      return [];
    } catch (error) {
      console.error('[BoardSDK] Failed to fetch columns:', error);
      return [];
    }
  }

  /**
   * Fluent API for building queries (backward compatibility)
   */
  items() {
    return {
      withColumns: (columns) => ({
        withSubItems: (subItems) => ({
          withPagination: (pagination) => ({
            execute: async () => {
              return await this.fetchItems({
                columns,
                subItems,
                limit: pagination?.limit || 50,
                cursor: pagination?.cursor || null
              });
            }
          })
        })
      })
    };
  }
}

export default BoardSDK;

