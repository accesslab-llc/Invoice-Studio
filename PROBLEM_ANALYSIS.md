# 言語変更後の操作不能問題 - 根本原因分析と対策履歴

## 問題の症状
- 言語設定を変更した後、テンプレートカラーとフィールドマッピングが操作できなくなる
- MessageBackgroundColorだけは操作できる

## これまでの修正履歴

### 修正1: useMemoでコレクションをメモ化
- **日時**: 最初の修正
- **内容**: `layoutTemplates`と`currencies`を`useMemo`でメモ化
- **結果**: 部分的に改善したが、まだ問題が残る

### 修正2: keyプロパティを追加
- **日時**: 2回目の修正
- **内容**: SelectコンポーネントとInputに`key`プロパティを追加
- **結果**: 改善しなかった

### 修正3: collectionからitemsに変更
- **日時**: 3回目の修正
- **内容**: `createListCollection`の代わりに配列を直接使用
- **結果**: 改善しなかった

### 修正4: validBoardColumnsItemsを使用
- **日時**: 4回目の修正
- **内容**: `getSelectValue`、`getDisplayLabel`、`handleSelectChange`で`validBoardColumnsItems`を使用
- **結果**: 改善しなかった

### 修正5: useEffectの依存配列を修正
- **日時**: 5回目の修正
- **内容**: `useEffect`の依存配列から`formData.templateColors`と`template`を削除
- **結果**: 改善しなかった

### 修正6: styleプロパティを削除
- **日時**: 6回目の修正
- **内容**: テンプレートカラーのInputから`style`プロパティを削除
- **結果**: 改善しなかった

### 修正7: FieldMappingDialogのuseEffect依存配列にinitialMappingsを追加（根本原因の修正）
- **日時**: 7回目の修正
- **内容**: `useEffect`の依存配列に`initialMappings`を追加し、Selectコンポーネントに`key`プロパティを追加
- **根本原因**: `mappings`ステートが言語変更時に更新されない
- **結果**: 改善しなかった（`isInitialized`フラグが原因で早期リターンしていた）

### 修正8: 言語変更時にmappingsを更新するuseEffectを追加
- **日時**: 8回目の修正
- **内容**: 言語変更時に`mappings`を更新する別の`useEffect`を追加し、デバッグログを強化
- **根本原因**: `isInitialized`フラグが`true`のままだと、`useEffect`で早期リターンしてしまい、言語変更時に`mappings`が更新されない
- **対策**: 言語変更時に`mappings`を更新する別の`useEffect`を追加
- **結果**: 未確認（テスト待ち）

## ログ分析（最新）

### 言語変更時のログ
```
[App] Language change: ['en']
[DEBUG] Language changed to: en
[FieldMappingDialog] validBoardColumnsItems: {total: 12, subitemCount: 0, subitemItems: Array(0)}
[FieldMappingDialog] boardColumnsItems changed: (12) [{…}, {…}, ...]
[FieldMappingDialog] First item: {label: 'Manual Input', value: 'manual'}
```

### 観察事項
1. 言語変更時に`validBoardColumnsItems`は正しく更新されている（'手動入力' → 'Manual Input'）
2. `boardColumnsItems`も正しく更新されている
3. しかし、実際には操作できない

## 根本原因（特定済み）

### 原因: FieldMappingDialogのmappingsステートが言語変更時に更新されない
- **問題**: `FieldMappingDialog`の`mappings`ステートは`useEffect`で`initialMappings`から初期化されているが、依存配列に`initialMappings`が含まれていない（`isOpen`のみ）
- **結果**: 言語変更時に`initialMappings`が更新されても、`mappings`ステートが更新されない
- **影響**: `getSelectValue`が古い`mappings`を参照し、Selectコンポーネントが正しく動作しない

### 仮説2: Selectコンポーネントが再レンダリングされていない
- **問題**: ネイティブの`<select>`（`Box as="select"`）が言語変更時に再レンダリングされていない
- **確認方法**: `key`プロパティを追加して強制的に再マウントする

### 仮説3: イベントハンドラーが古いクロージャを参照している
- **問題**: `handleSelectChange`が古い`validBoardColumnsItems`を参照している
- **確認方法**: `useCallback`でメモ化するか、依存配列を確認する

### 仮説4: Dialogが開いている状態で言語変更すると問題が発生する
- **問題**: フィールドマッピングダイアログが開いている状態で言語を変更すると、内部状態が正しく更新されない
- **確認方法**: ダイアログを閉じてから言語を変更してみる

## 次の対策

### 対策1: FieldMappingDialogのmappingsステートを言語変更時に更新
```javascript
useEffect(() => {
  if (isOpen && initialMappings) {
    setMappings(initialMappings);
  }
}, [isOpen, initialMappings, language]);
```

### 対策2: Selectコンポーネントにkeyプロパティを追加
```javascript
<Box
  as="select"
  key={`select-${fieldKey}-${language}`}
  value={getSelectValue(fieldKey)}
  onChange={(e) => handleSelectChange(fieldKey, e.target.value)}
  // ...
>
```

### 対策3: handleSelectChangeをuseCallbackでメモ化
```javascript
const handleSelectChange = useCallback((fieldKey, selected) => {
  // ...
}, [validBoardColumnsItems]);
```

## 重要な学び

1. **同じ修正を繰り返さない**: ログをしっかり確認してから修正する
2. **根本原因を特定する**: 表面的な修正ではなく、なぜ動作しないのかを理解する
3. **段階的にテストする**: 1つの修正ごとにテストして、効果を確認する
4. **ログを活用する**: コンソールログで実際の動作を確認する

