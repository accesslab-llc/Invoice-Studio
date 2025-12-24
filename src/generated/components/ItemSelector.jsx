import { useState, useMemo } from 'react';
import {
  Table,
  Stack,
  HStack,
  VStack,
  Text,
  Badge,
  Input,
  Checkbox,
  EmptyState,
  Box
} from '@chakra-ui/react';
import { Search, FileText } from 'lucide-react';
import { translations } from '../utils/translations';

const ItemSelector = ({ items, selectedItemId, onSelectItem, language, fieldMappings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language];

  // フィールドマッピングに基づいて表示するカラムを決定
  const hasClientName = fieldMappings?.clientName && fieldMappings.clientName !== 'manual';
  const hasInvoiceDate = fieldMappings?.invoiceDate && fieldMappings.invoiceDate !== 'manual';

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(
      (item) => {
        const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const clientMatch = hasClientName && item.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || clientMatch;
      }
    );
  }, [items, searchTerm, hasClientName]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // 請求日の値を取得（フィールドマッピングに基づく）
  const getInvoiceDate = (item) => {
    if (!hasInvoiceDate) return null;
    const dateMapping = fieldMappings.invoiceDate;
    // マッピングキーまたはカラムIDから値を取得
    return item[dateMapping] || item.invoiceDate || null;
  };

  // 請求先名の値を取得（フィールドマッピングに基づく）
  const getClientName = (item) => {
    if (!hasClientName) return null;
    const clientMapping = fieldMappings.clientName;
    // マッピングキーまたはカラムIDから値を取得
    return item[clientMapping] || item.clientName || null;
  };

  if (items.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FileText size={48} />
          </EmptyState.Indicator>
          <EmptyState.Title>{t.noItems}</EmptyState.Title>
          <EmptyState.Description>{t.noItemsDescription}</EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <Stack gap="4">
      <HStack>
        <Box position="relative" flex="1" maxW="400px">
          <Input
            placeholder={t.searchItems}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pl="10"
          />
          <Box position="absolute" left="3" top="50%" transform="translateY(-50%)">
            <Search size={16} />
          </Box>
        </Box>
        <Text color="fg.muted">
          {filteredItems.length} {t.itemsFound}
        </Text>
      </HStack>

      <Table.ScrollArea borderWidth="1px" rounded="md" maxH="500px">
        <Table.Root size="sm" variant="outline">
          <Table.Header position="sticky" top="0" bg="bg" zIndex="1">
            <Table.Row>
              <Table.ColumnHeader w="6"></Table.ColumnHeader>
              <Table.ColumnHeader minW="200px">{t.itemName}</Table.ColumnHeader>
              {hasClientName && (
                <Table.ColumnHeader minW="150px">{t.clientName}</Table.ColumnHeader>
              )}
              {hasInvoiceDate && (
                <Table.ColumnHeader minW="120px">{t.date}</Table.ColumnHeader>
              )}
              <Table.ColumnHeader minW="100px">{t.subitems}</Table.ColumnHeader>
              <Table.ColumnHeader minW="100px">{t.status}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredItems.map((item) => (
              <Table.Row
                key={item.id}
                data-selected={selectedItemId === item.id ? '' : undefined}
                onClick={() => onSelectItem(item.id)}
                cursor="pointer"
                _hover={{ bg: 'bg.subtle' }}
              >
                <Table.Cell>
                  <Checkbox.Root
                    checked={selectedItemId === item.id}
                    onCheckedChange={() => onSelectItem(item.id)}
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{item.name}</Text>
                </Table.Cell>
                {hasClientName && (
                  <Table.Cell>
                    <Text>{getClientName(item) || '-'}</Text>
                  </Table.Cell>
                )}
                {hasInvoiceDate && (
                  <Table.Cell>
                    <Text>{formatDate(getInvoiceDate(item))}</Text>
                  </Table.Cell>
                )}
                <Table.Cell>
                  <Badge colorPalette="blue" variant="subtle" size="sm">
                    {item.subitems?.length || 0} {t.items}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {item.subitems?.length > 0 ? (
                    <Badge colorPalette="green" variant="subtle" size="sm">
                      {t.ready}
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" variant="subtle" size="sm">
                      {t.noSubitems}
                    </Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {filteredItems.length === 0 && searchTerm && (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Search size={48} />
            </EmptyState.Indicator>
            <EmptyState.Title>{t.noSearchResults}</EmptyState.Title>
            <EmptyState.Description>{t.noSearchResultsDescription}</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      )}
    </Stack>
  );
};

export default ItemSelector;

