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
  Box,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { Search, FileText } from 'lucide-react';
import { translations } from '../utils/translations';

const ItemSelector = ({ items, selectedItemId, onSelectItem, language, variant = 'invoice' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const t = translations[language];

  // ユニークなグループのリストを取得
  const groups = useMemo(() => {
    const groupMap = new Map();
    items.forEach(item => {
      if (item.group?.id && item.group?.title) {
        if (!groupMap.has(item.group.id)) {
          groupMap.set(item.group.id, {
            id: item.group.id,
            title: item.group.title
          });
        }
      }
    });
    return Array.from(groupMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [items]);

  // グループ選択用のコレクション
  const groupCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: t.allGroups || 'すべてのグループ', value: '' },
        ...groups.map(group => ({
          label: group.title,
          value: group.id
        }))
      ]
    });
  }, [groups, t.allGroups]);

  // フィルタリング（検索とグループの両方に対応）
  const filteredItems = useMemo(() => {
    let filtered = items;

    // グループでフィルタリング
    if (selectedGroupId) {
      filtered = filtered.filter(item => item.group?.id === selectedGroupId);
    }

    // 検索でフィルタリング
    if (searchTerm.trim()) {
      filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.group?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    }

    return filtered;
  }, [items, searchTerm, selectedGroupId]);

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
      <HStack gap="3" wrap="wrap">
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
        <Select.Root
          collection={groupCollection}
          value={selectedGroupId ? [selectedGroupId] : ['']}
          onValueChange={({ value }) => setSelectedGroupId(value[0] || '')}
          size="sm"
          width="200px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder={t.filterByGroup || 'グループでフィルター'} />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Content>
              {groupCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
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
              <Table.ColumnHeader minW="150px">{t.groupName}</Table.ColumnHeader>
              <Table.ColumnHeader minW="100px">{t.subitems}</Table.ColumnHeader>
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
                <Table.Cell>
                  <Text color="fg.muted">{item.group?.title || '-'}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={variant === 'cpq' ? 'green' : 'blue'} variant="subtle" size="sm">
                    {item.subitems?.length || 0} {t.items}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {filteredItems.length === 0 && (searchTerm || selectedGroupId) && (
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

