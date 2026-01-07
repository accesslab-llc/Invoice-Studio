# 言語変更後の操作不能問題 - デバッグチェックリスト

## 問題の症状
- 言語設定を変更した後、テンプレートカラーとフィールドマッピングが操作できなくなる
- テンプレートカラーのInputで、視覚的に見えている場所と実際にクリックできる場所がずれている
- Notes Background ColorのInputが操作できない
- Create Invoiceボタンも押せない
- MessageBackgroundColorのInputだけは正常に動作する

## 確認すべきポイント

### 1. ブラウザのコンソールでエラー確認
**確認方法:**
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブを開く
3. 言語を変更する
4. テンプレートカラーやフィールドマッピングを操作しようとする
5. **エラーメッセージが出ていないか確認**

**確認すべきエラー:**
- `Cannot read property 'xxx' of undefined`
- `TypeError: xxx is not a function`
- `a.options is not iterable`
- その他のJavaScriptエラー

### 2. イベントハンドラーが呼ばれているか確認
**確認方法:**
1. コンソールで以下のログを確認：
   - `[App] Language change:` - 言語変更時に出力されるか
   - `[FieldMappingDialog] handleSelectChange:` - フィールドマッピングで選択変更時に出力されるか
   - テンプレートカラーの`onChange`内に`console.log`を追加して確認

**確認すべきこと:**
- 言語変更時に`setLanguage`が呼ばれているか
- Selectの`onValueChange`が呼ばれているか
- Inputの`onChange`が呼ばれているか

### 3. 状態が正しく更新されているか確認
**確認方法:**
1. React DevToolsをインストール（Chrome拡張機能）
2. コンポーネントツリーで`App`コンポーネントを選択
3. `language`ステートの値を確認
4. `formData.templateColors`の値を確認
5. `fieldMappings`の値を確認

**確認すべきこと:**
- 言語変更時に`language`ステートが更新されているか
- `formData`がリセットされていないか
- `fieldMappings`がリセットされていないか

### 4. コンポーネントが再レンダリングされているか確認
**確認方法:**
1. `App.jsx`の`App`コンポーネント内に以下を追加：
```javascript
useEffect(() => {
  console.log('[App] Component rendered, language:', language);
}, [language]);
```

2. `FieldMappingDialog.jsx`の`FieldMappingDialog`コンポーネント内に以下を追加：
```javascript
useEffect(() => {
  console.log('[FieldMappingDialog] Component rendered, language:', language);
}, [language]);
```

**確認すべきこと:**
- 言語変更時にコンポーネントが再レンダリングされているか
- 再レンダリング時に必要な値が更新されているか

### 5. Selectコンポーネントの内部状態確認
**確認方法:**
1. `App.jsx`のテンプレートSelectに以下を追加：
```javascript
<Select.Root 
  items={layoutTemplateItems} 
  value={[template]}
  onValueChange={({ value }) => {
    console.log('[App] Template Select onValueChange:', value);
    console.log('[App] layoutTemplateItems:', layoutTemplateItems);
    console.log('[App] Current template:', template);
    if (value && value.length > 0) {
      setTemplate(value[0]);
    }
  }}
  // ...
>
```

2. フィールドマッピングのSelectにも同様のログを追加

**確認すべきこと:**
- `onValueChange`が呼ばれているか
- `value`プロパティが正しい値を持っているか
- `items`プロパティが正しく更新されているか

### 6. 言語変更時の具体的な動作確認
**確認方法:**
1. 言語変更前の状態を記録：
   - テンプレートカラーの値
   - フィールドマッピングの選択値
   - `formData`の状態

2. 言語を変更

3. 言語変更後の状態を確認：
   - テンプレートカラーの値が保持されているか
   - フィールドマッピングの選択値が保持されているか
   - `formData`がリセットされていないか

### 7. テンプレートカラーのInput確認
**確認方法:**
1. `App.jsx`のテンプレートカラーInputに以下を追加：
```javascript
<Input
  type="color"
  value={formData.templateColors?.[template] || (template === 'modern' ? '#2563eb' : template === 'classic' ? '#1a1a1a' : '#666666')}
  onChange={(e) => {
    console.log('[App] Template color onChange:', e.target.value);
    console.log('[App] Current formData.templateColors:', formData.templateColors);
    console.log('[App] Current template:', template);
    const newColor = e.target.value;
    setFormData(prev => {
      console.log('[App] setFormData prev:', prev);
      const updated = {
        ...prev,
        templateColors: {
          modern: '#2563eb',
          classic: '#1a1a1a',
          minimal: '#666666',
          ...(prev.templateColors || {}),
          [template]: newColor
        }
      };
      console.log('[App] setFormData updated:', updated);
      return updated;
    });
  }}
  // ...
/>
```

**確認すべきこと:**
- `onChange`が呼ばれているか
- `setFormData`が呼ばれているか
- 状態が正しく更新されているか

### 8. フィールドマッピングのSelect確認
**確認方法:**
1. `FieldMappingDialog.jsx`のSelectに以下を追加：
```javascript
<Box
  as="select"
  value={getSelectValue('clientName')}
  onChange={(e) => {
    console.log('[FieldMappingDialog] Select onChange:', e.target.value);
    console.log('[FieldMappingDialog] Current mappings:', mappings);
    console.log('[FieldMappingDialog] Current validBoardColumnsItems:', validBoardColumnsItems);
    handleSelectChange('clientName', e.target.value);
  }}
  // ...
>
```

**確認すべきこと:**
- `onChange`が呼ばれているか
- `getSelectValue`が正しい値を返しているか
- `handleSelectChange`が呼ばれているか
- `setMappings`が呼ばれているか

## デバッグ手順

1. **まず、ブラウザのコンソールでエラーを確認**
   - エラーが出ている場合は、そのエラーメッセージを記録

2. **言語変更前の状態を記録**
   - テンプレートカラーの値を記録
   - フィールドマッピングの選択値を記録

3. **言語を変更**

4. **言語変更後の状態を確認**
   - コンソールログを確認
   - React DevToolsで状態を確認

5. **操作を試みる**
   - テンプレートカラーを変更しようとする
   - フィールドマッピングを変更しようとする

6. **操作時のログを確認**
   - `onChange`が呼ばれているか
   - 状態が更新されているか
   - エラーが出ていないか

## 最新の修正内容（2024年）

### 修正9: z-indexとpositionの調整による視覚的位置ずれの修正
- **日時**: 2024年（修正9）
- **内容**: 
  - テンプレートカラーのInputに`position: relative`、`zIndex: 2`、`display: block`を追加
  - Notes Background ColorのInputにも同様の設定を追加
  - HStackにも`position: relative`と`zIndex: 1`を追加
  - これにより、Selectの`Positioner`が開いている状態でもInputが正しくクリックできるようになる
- **根本原因**: Selectの`Positioner`が開いている状態でInputの上に重なっている可能性
- **結果**: 部分的に改善したが、まだ問題が残る

### 修正10: Selectコンポーネントのcollectionプロパティ使用による選択値表示の修正
- **日時**: 2024年（修正10）
- **内容**: 
  - `layoutTemplateItems`と`currencyItems`を`createListCollection`で作成するように変更
  - `Select.Root`で`items`プロパティの代わりに`collection`プロパティを使用
  - `Select.Content`内で`layoutTemplateItems.items`と`currencyItems.items`を使用
  - これにより、`Select.ValueText`が正しく表示されるようになる
- **根本原因**: `items`プロパティを使用していたため、`Select.ValueText`が選択値を正しく表示できなかった
- **参考**: `languages`は既に`createListCollection`で作成されており、正常に動作していた
- **結果**: 成功（テンプレートと通貨の選択値が正しく表示されるようになった）

### 修正11: MessageBackgroundColorと同じシンプルな実装に統一
- **日時**: 2024年（修正11）
- **内容**: 
  - テンプレートカラーとNotes Background ColorのInputを、MessageBackgroundColorと同じシンプルな実装に統一
  - `position: relative`、`zIndex`、`display: block`、`style`プロパティをすべて削除
  - HStackからも`position: relative`と`zIndex`を削除
  - デバッグログ（`onClick`、`onFocus`、`console.log`）を削除
  - `key`プロパティは残す（言語変更時の再マウントのため）
- **根本原因**: 修正9で追加した`position: relative`と`zIndex`が、かえって問題を引き起こしていた
- **参考**: MessageBackgroundColorは正常に動作しており、シンプルな実装だった
- **結果**: 部分的に改善したが、まだ問題が残る（テンプレートカラーはずれて押せる、備考背景色は押せない、Create Invoiceボタンも押せない）

### 修正12: Selectコンポーネントにkeyプロパティを追加してPositionerを確実に閉じる
- **日時**: 2024年（修正12）
- **内容**: 
  - 言語変更時にSelectコンポーネントが再マウントされるように、すべての`Select.Root`に`key`プロパティを追加
  - `language-select-${language}`、`template-select-${language}-${template}`、`currency-select-${language}`を追加
  - これにより、言語変更時にSelectコンポーネントが再マウントされ、Positionerが確実に閉じる
- **根本原因**: 言語変更時にSelectのPositionerが閉じた後も何かが残っているか、またはSelectのPositionerが閉じる前に次の操作をしようとすると、何かがブロックされる可能性
- **参考**: `key`プロパティを使うことで、コンポーネントが再マウントされ、内部状態がリセットされる
- **結果**: テスト待ち

### 視覚的位置ずれの問題について
- **症状**: テンプレートカラーのInputで、視覚的に見えている場所と実際にクリックできる場所がずれている
- **原因の仮説**: 
  1. `position: relative`と`zIndex`を追加したことで、かえって問題が発生した
  2. `type="color"`のInputの内部構造がブラウザによって異なる
  3. Chakra UIのInputコンポーネントのラッパーがクリック可能領域をずらしている
- **対策（修正11で実施）**: 
  - MessageBackgroundColorと同じシンプルな実装に統一
  - `position: relative`、`zIndex`、`display: block`、`style`をすべて削除
  - これにより、正常に動作するMessageBackgroundColorと同じ動作になる

## 報告すべき情報

以下の情報を提供してください：

1. **ブラウザのコンソールエラー**（あれば）
2. **言語変更前の状態**（テンプレートカラー、フィールドマッピングの値）
3. **言語変更後の状態**（同じ値が保持されているか）
4. **操作時のログ**（`onChange`が呼ばれているか、状態が更新されているか）
5. **再現手順**（どの言語からどの言語に変更したか、どの操作ができないか）
6. **視覚的位置ずれの詳細**（どのInputでずれが発生しているか、ずれの方向と距離）

