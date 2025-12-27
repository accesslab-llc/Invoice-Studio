# PDF出力時の文字コード対応分析

## 現在のアプリケーションの文字コード設定

### HTML生成時の設定
- **エンコーディング**: UTF-8
- **指定方法**: `<meta charset="UTF-8">` をHTMLヘッダーに含める
- **JavaScript文字列**: UTF-8（JavaScriptは内部的にUTF-16だが、文字列リテラルはUTF-8として扱われる）
- **Blob生成**: `new Blob([html], { type: 'text/html' })` - エンコーディングの明示的な指定なし（デフォルトでUTF-8）

### 現在の実装
```javascript
const html = generateInvoiceHTML(exportData, language, template, pageSize, fitToOnePage, formData.templateColors[template]);
const blob = new Blob([html], { type: 'text/html' });
```

**問題点**: Blob生成時にエンコーディングを明示的に指定していないが、HTML内の`<meta charset="UTF-8">`によりUTF-8として扱われる。

---

## 主要なJavaScript PDFライブラリの文字コード対応

### 1. jsPDF
- **デフォルト文字コード**: Latin-1（ISO-8859-1）
- **日本語対応**: ❌ デフォルトでは非対応
- **UTF-8対応**: ⚠️ 日本語フォントを追加する必要がある
- **必要な設定**:
  - 日本語フォント（例：NotoSansJP、IPAexフォント）をbase64エンコードして追加
  - フォント追加後はUTF-8で日本語を扱える
- **文字化けリスク**: 🔴 高（フォント未設定の場合）
- **実装の複雑さ**: 🔴 高（フォントファイルの準備と埋め込みが必要）

**例**:
```javascript
import { jsPDF } from 'jspdf';
import { font } from './fonts/NotoSansJP-base64'; // フォントファイルをbase64エンコード

const doc = new jsPDF();
doc.addFileToVFS('NotoSansJP.ttf', font);
doc.addFont('NotoSansJP.ttf', 'NotoSansJP', 'normal');
doc.setFont('NotoSansJP');
doc.text('請求書', 10, 10); // UTF-8文字列を正しく表示
```

---

### 2. pdfmake
- **デフォルト文字コード**: UTF-8
- **日本語対応**: ✅ 良好（フォント設定後）
- **UTF-8対応**: ✅ ネイティブサポート
- **必要な設定**:
  - 日本語フォント（例：NotoSansJP）をbase64エンコードして設定
  - フォント設定後はUTF-8で日本語を扱える
- **文字化けリスク**: 🟡 中（フォント設定が必要）
- **実装の複雑さ**: 🟡 中（フォントファイルの準備と設定が必要）

**例**:
```javascript
import pdfMake from 'pdfmake/build/pdfmake';
import { font } from './fonts/NotoSansJP-base64';

pdfMake.fonts = {
  NotoSansJP: {
    normal: font,
    bold: font,
    italics: font,
    bolditalics: font
  }
};

const docDefinition = {
  content: [
    { text: '請求書', font: 'NotoSansJP' } // UTF-8文字列を正しく表示
  ],
  defaultStyle: {
    font: 'NotoSansJP'
  }
};

pdfMake.createPdf(docDefinition).download('invoice.pdf');
```

---

### 3. html2pdf.js
- **デフォルト文字コード**: ブラウザのレンダリングエンジンに依存（通常UTF-8）
- **日本語対応**: ✅ 優秀（HTMLが正しく表示されればPDFも正しく表示）
- **UTF-8対応**: ✅ 完全対応（HTMLの`<meta charset="UTF-8">`をそのまま使用）
- **必要な設定**: なし（HTMLの文字コード設定をそのまま使用）
- **文字化けリスク**: 🟢 低（HTMLが正しく表示されれば問題なし）
- **実装の複雑さ**: 🟢 低（既存のHTML生成コードをそのまま使用可能）

**例**:
```javascript
import html2pdf from 'html2pdf.js';

const html = generateInvoiceHTML(exportData, language, template, pageSize, fitToOnePage, formData.templateColors[template]);
// HTMLには既に <meta charset="UTF-8"> が含まれている

const opt = {
  margin: [10, 10, 10, 10],
  filename: `invoice-${formData.invoiceNumber}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: pageSize, orientation: 'portrait' }
};

html2pdf().set(opt).from(html).save();
```

**注意**: html2pdf.jsは内部的にhtml2canvasとjsPDFを使用するが、HTMLを画像としてキャプチャしてからPDFに変換するため、文字コードの問題が発生しにくい。

---

### 4. @react-pdf/renderer
- **デフォルト文字コード**: UTF-8
- **日本語対応**: ✅ 良好（フォント設定後）
- **UTF-8対応**: ✅ ネイティブサポート
- **必要な設定**:
  - 日本語フォント（例：NotoSansJP）を登録
  - ReactコンポーネントからPDF生成する必要がある（現在のHTML生成方式とは異なる）
- **文字化けリスク**: 🟡 中（フォント設定が必要）
- **実装の複雑さ**: 🔴 高（既存のHTML生成コードをReactコンポーネントに書き換える必要がある）

---

## 推奨される解決策

### 最推奨: html2pdf.js

**理由**:
1. ✅ **文字化けリスクが最も低い**: HTMLをそのまま使用するため、既存の`<meta charset="UTF-8">`設定がそのまま有効
2. ✅ **実装が簡単**: 既存の`generateInvoiceHTML`関数をそのまま使用可能
3. ✅ **UTF-8完全対応**: HTMLの文字コード設定をそのまま使用
4. ✅ **フォント設定不要**: ブラウザのレンダリングエンジンを使用するため、フォントの埋め込みが不要
5. ✅ **スタイルの互換性**: 既存のCSSスタイルをそのまま使用可能

**注意点**:
- HTMLを画像としてキャプチャしてからPDFに変換するため、ファイルサイズが大きくなる可能性がある
- レンダリングに時間がかかる可能性がある

---

### 次点: pdfmake

**理由**:
1. ✅ **UTF-8ネイティブサポート**: デフォルトでUTF-8を使用
2. ✅ **日本語対応が良好**: フォント設定後は日本語を正しく表示
3. ⚠️ **フォント設定が必要**: 日本語フォントをbase64エンコードして設定する必要がある
4. ⚠️ **HTMLから変換が必要**: 既存のHTML生成コードをpdfmakeのドキュメント定義に変換する必要がある

---

## 文字化けの原因分析

### 前回の失敗の可能性

1. **エンコーディングの不一致**:
   - アプリ: UTF-8
   - PDFライブラリ: Latin-1（jsPDFの場合）または未設定
   - → 文字化け発生

2. **フォント未設定**:
   - 日本語フォントが埋め込まれていない
   - → 日本語文字が表示されない、または文字化け

3. **Blob生成時のエンコーディング未指定**:
   - 現在の実装では`new Blob([html], { type: 'text/html' })`を使用
   - エンコーディングを明示的に指定していない
   - → ブラウザによっては文字化けの可能性

---

## 推奨される実装方針

### html2pdf.jsを使用する場合

1. **パッケージのインストール**:
```bash
npm install html2pdf.js
```

2. **Blob生成時のエンコーディング明示**（オプション、推奨）:
```javascript
const blob = new Blob([html], { 
  type: 'text/html;charset=utf-8' 
});
```

3. **PDF生成**:
```javascript
import html2pdf from 'html2pdf.js';

const downloadPDF = async () => {
  const html = generateInvoiceHTML(exportData, language, template, pageSize, fitToOnePage, formData.templateColors[template]);
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `invoice-${formData.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: pageSize === 'a4' ? 'a4' : 'letter', 
      orientation: 'portrait' 
    }
  };

  await html2pdf().set(opt).from(html).save();
};
```

---

## まとめ

| ライブラリ | UTF-8対応 | 日本語対応 | 実装の簡単さ | 文字化けリスク | 推奨度 |
|-----------|----------|----------|------------|--------------|--------|
| html2pdf.js | ✅ 完全 | ✅ 優秀 | 🟢 簡単 | 🟢 低 | ⭐⭐⭐⭐⭐ |
| pdfmake | ✅ 完全 | ✅ 良好 | 🟡 中 | 🟡 中 | ⭐⭐⭐⭐ |
| jsPDF | ⚠️ 要設定 | ⚠️ 要設定 | 🔴 複雑 | 🔴 高 | ⭐⭐ |
| @react-pdf/renderer | ✅ 完全 | ✅ 良好 | 🔴 複雑 | 🟡 中 | ⭐⭐⭐ |

**結論**: html2pdf.jsを使用することで、既存のUTF-8 HTML生成コードをそのまま活用でき、文字化けのリスクを最小限に抑えられます。

