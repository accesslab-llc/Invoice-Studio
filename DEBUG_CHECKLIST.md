# 言語変更後の操作不能問題 - デバッグチェックリスト

## 問題の症状
- 言語設定を変更した後、テンプレートカラーとフィールドマッピングが操作できなくなる
- テンプレートカラーのInputで、視覚的に見えている場所と実際にクリックできる場所がずれている
- Notes Background ColorのInputが操作できない
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
- **日時**: 最新の修正
- **内容**: 
  - テンプレートカラーのInputに`position: relative`、`zIndex: 2`、`display: block`を追加
  - Notes Background ColorのInputにも同様の設定を追加
  - HStackにも`position: relative`と`zIndex: 1`を追加
  - これにより、Selectの`Positioner`が開いている状態でもInputが正しくクリックできるようになる
- **根本原因**: Selectの`Positioner`が開いている状態でInputの上に重なっている可能性
- **結果**: テスト待ち

### 視覚的位置ずれの問題について
- **症状**: テンプレートカラーのInputで、視覚的に見えている場所と実際にクリックできる場所がずれている
- **原因の仮説**: 
  1. Selectの`Positioner`が開いている状態でInputの上に重なっている
  2. `type="color"`のInputの内部構造がブラウザによって異なる
  3. Chakra UIのInputコンポーネントのラッパーがクリック可能領域をずらしている
- **対策**: 
  - `position: relative`と`zIndex`を設定して、Inputが他の要素の上に表示されるようにする
  - `display: block`を設定して、クリック可能領域を正しく配置する

## 報告すべき情報

以下の情報を提供してください：

1. **ブラウザのコンソールエラー**（あれば）
2. **言語変更前の状態**（テンプレートカラー、フィールドマッピングの値）
3. **言語変更後の状態**（同じ値が保持されているか）
4. **操作時のログ**（`onChange`が呼ばれているか、状態が更新されているか）
5. **再現手順**（どの言語からどの言語に変更したか、どの操作ができないか）
6. **視覚的位置ずれの詳細**（どのInputでずれが発生しているか、ずれの方向と距離）

