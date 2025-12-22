# Selectコンポーネントエラー分析と対処履歴

## 問題の流れ

### 1. 最初の問題: ミラーカラムが選択肢に出てこない
- **原因**: カラムが静的に定義されており、動的に取得されていない
- **対処**: `BoardSDK.js`に`fetchColumns()`メソッドを追加し、動的にカラムを取得するように変更
- **結果**: カラムは取得できるようになったが、新しいエラーが発生

### 2. 次の問題: `a.options is not iterable`エラー
- **原因**: `createListCollection`で作成した`collection`オブジェクトの`options`プロパティが`{items: Array}`という構造で、Chakra UIの内部処理で反復できない
- **対処**: `collection`プロパティを削除し、`items`プロパティを直接使用。`Select.Item`に`value`プロパティを直接使用
- **結果**: 新しいエラーが発生

### 3. 次の問題: `[zag-js] No value found for item undefined`エラー
- **原因**: `items`プロパティを使用する場合、`Select.Item`に`item`プロパティが必要だが、`value`のみを渡していた
- **対処**: `collection`プロパティを復元し、`Select.Item`に`item={item}`プロパティを使用
- **結果**: 再び`a.options is not iterable`エラーが発生

### 4. 再発: `a.options is not iterable`エラー
- **原因**: `collection`オブジェクトが`boardColumnsItems`の変更時に再作成され、その際に`options`プロパティの構造が正しくない
- **対処**: 再び`collection`を削除して`items`を直接使用
- **結果**: 再び`[zag-js] No value found for item undefined`エラーが発生

## 根本原因の分析

### `App.jsx`との比較
- `App.jsx`では`collection={languages}`を使用し、正常に動作している
- `languages`は`useMemo`で作成され、静的なデータ
- `FieldMappingDialog.jsx`では`boardColumnsItems`が動的に変更される

### 問題の本質
1. **`collection`プロパティを使用する場合**:
   - `createListCollection({ items: [...] })`で作成
   - `Select.Item`に`item={item}`を渡す必要がある
   - しかし、`collection.options`が`{items: Array}`という構造で、Chakra UIの内部処理で反復できない

2. **`items`プロパティを使用する場合**:
   - 配列を直接渡す
   - `Select.Item`に`value`プロパティを直接使用
   - しかし、`[zag-js] No value found for item undefined`エラーが発生

### 仮説
- Chakra UI v3の`Select`コンポーネントは、`items`プロパティを使用する場合でも、内部的に`collection`オブジェクトを期待している可能性がある
- または、`items`プロパティを使用する場合、`Select.Item`に`item`プロパティを渡す必要があるが、その`item`オブジェクトが正しく取得できていない

## 次の対処方針

### オプション1: `collection`を使用し、`useMemo`で安定化
- `boardColumns`を`useMemo`で作成し、`boardColumnsItems`が変更されたときのみ再作成
- `Select.Item`に`item={item}`を渡す
- ただし、`a.options is not iterable`エラーが再発する可能性がある

### オプション2: `items`を使用し、`Select.Item`に`item`プロパティを渡す
- `items={boardColumnsItems}`を使用
- `Select.Item`に`item={item}`と`value={item.value}`の両方を渡す
- これがChakra UI v3の正しい使用方法かもしれない

### オプション3: `collection`を使用し、`options`プロパティを正しく設定
- `createListCollection`の代わりに、手動で`collection`オブジェクトを作成
- `options`プロパティを正しい形式で設定

### 推奨: オプション1を採用（App.jsxと同じ方法）
`App.jsx`では`createListCollection`で作成した`collection`を直接使用して正常に動作している。`FieldMappingDialog.jsx`でも同じ方法を使用し、`useMemo`で安定化する。

## 最終的な解決策

### 原因（再発）
- `key`プロパティで強制的に再マウントしている
- `onChange`イベント時に`syncSelectElement`が呼ばれ、古い`collection`オブジェクトの`options`を参照しようとする
- `collection.options`が`{items: Array}`という構造で、反復できない
- `a.options is not iterable`エラーが発生

### 根本原因
- `App.jsx`では`key`プロパティを使用していない
- `key`プロパティで再マウントすると、内部状態がリセットされ、`onChange`時に古い`collection`を参照する可能性がある

### 解決策
- `createListCollection`で`collection`オブジェクトを明示的に作成
- `collection`プロパティを使用（`items`プロパティは使用しない）
- `Select.Item`に`item={item}`を渡す（`value`プロパティは不要）
- `useMemo`で`collection`を安定化し、`boardColumnsItems`が変更されたときのみ再作成
- **`key`プロパティを削除**（`App.jsx`と同じように）

### 実装
```jsx
const boardColumns = useMemo(() => {
  const validItems = boardColumnsItems.filter(item => item && item.value && item.label);
  return createListCollection({ items: validItems });
}, [boardColumnsItems]);

<Select.Root collection={boardColumns} value={[...]}>
  <Select.Content>
    {boardColumns?.items?.map((item) => (
      <Select.Item key={item.value} item={item}>
        {item.label}
      </Select.Item>
    ))}
  </Select.Content>
</Select.Root>
```

**重要**: `Select.Root`に`key`プロパティを付けない（`App.jsx`と同じ）

