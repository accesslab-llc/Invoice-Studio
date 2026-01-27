# InvoiceStudio - User Manual

**Last Updated**: January 2026

---

## English

### Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)
3. [Field Mapping](#field-mapping)
4. [Template Management](#template-management)
5. [Invoice Customization](#invoice-customization)
6. [Frequently Asked Questions](#frequently-asked-questions)

---

### Introduction

InvoiceStudio is an application that makes it easy to create invoices and estimates from Monday.com board data.

#### Required Permissions

Please enable the following permissions in Monday.com Developer Center:
- `boards:read` - Read board data

#### Supported Languages

- Japanese
- English
- Spanish

---

### Basic Usage

#### Step 1: Launch App and Load Data

1. Open the InvoiceStudio app in a Monday.com board
2. The app will automatically fetch items from the board
3. If data is not displayed, please reload the page

**Note**: Data is automatically loaded when the app is opened. To reload data, please reload the page.

#### Step 2: Select Item

1. Select the item you want to create an invoice/estimate for from the item list (select using checkbox)
2. You can filter items by item name or group name using the search function
3. You can filter items by group using the group filter
4. Click the "Create Invoice" button to proceed to the edit screen

#### Step 3: Edit Invoice/Estimate

1. **Document Type Selection**: Choose between "Invoice" and "Estimate" using the toggle buttons at the top
2. Information from the selected item will be automatically filled in
3. Click the **Field Mapping** button to configure mappings between Monday.com board columns and invoice fields (recommended for first-time setup)
4. Edit the following information as needed:
   - Basic information (invoice/estimate number, invoice/estimate date, due date/valid until, etc.)
   - Issuer information (company name, representative, address, contact information, etc.)
   - Billing information (company name, department, contact person, address, contact information, etc.)
   - Line items (item name, quantity, unit price, etc.) - automatically retrieved from subitems
   - Payment information (bank name, account information, etc.) - Invoice only
   - Delivery period - Estimate only
   - Invoice/Estimate message
   - Notes/Estimate conditions
   - Image settings (company logo, signature/seal, background watermark)

**Important**: Empty fields (issuer information, billing information, payment information, notes, etc.) are automatically hidden, and in the PDF and preview, they are displayed without leaving empty lines. Fields that are not filled in will not be displayed, so there will be no unnecessary empty spaces. For example, if you do not fill in some fields of the issuer information (such as phone number or FAX), those fields will not be displayed, and only the filled fields will be shown, without empty spaces between them.

#### Step 4: Download

##### Download as PDF

1. Navigate to the "Download" tab
2. Preview the invoice/estimate appearance
3. Click the "Download PDF" button
4. A PDF file will be downloaded

**Note**: PDF generation may take a few seconds. All languages (Japanese, English, Spanish, etc.) will be displayed correctly.

---

### Field Mapping

The field mapping feature allows you to map Monday.com board columns to invoice/estimate fields.

#### Setting Field Mapping

1. Click the "Field Mapping" button in the invoice edit screen
2. Select a Monday.com board column for each invoice field
3. You can also map subitem price and quantity
4. Click "Save" to save the mappings and automatically reload the selected item's data

#### Mappable Fields

- **Basic Information**
  - Invoice/Estimate Number
  - Invoice/Estimate Date
  - Due Date (for invoices)
  - Valid Until (for estimates)

- **Billing Information**
  - Billing Name
  - Department
  - Contact Person
  - Postal Code
  - Address
  - Phone Number
  - Email Address

- **Amount & Line Items**
  - Discount
  - Tax Amount
  - Line Items (Subitems)
  - Subitem Price
  - Subitem Quantity

#### Using Custom Column IDs

When using custom columns from a Monday.com board:
1. Select "Custom Column ID (Direct Input)" in field mapping
2. Enter the column ID directly (e.g., `text_mkwjtrys`)

---

### Template Management

The template feature allows you to save and reuse issuer information and payment information.

#### Creating a Template

1. Click the "Template Management" button
2. Click "New"
3. A default template name will be automatically generated (e.g., "Template1", "Template2", etc.) based on the current language and number of existing templates
4. Enter issuer information and payment information
5. Click "Save"

#### Applying a Template

1. In the invoice edit screen, select a saved template from "Apply Template"
2. Template information (issuer information and payment information) will be automatically filled in
3. **Note**: When applying a template, existing data (bank information, items, calculated totals, etc.) will be preserved and merged with the template data

#### Editing/Deleting Templates

1. Click the "Template Management" button
2. Select the template you want to edit
3. Edit the information and click "Save"
4. Click the "Delete" button to delete

---

### Invoice Customization

#### Document Type Selection

- **Invoice**: Standard invoice creation
- **Estimate**: Estimate/quote creation
  - Different fields from invoices (valid until, delivery period, estimate conditions, etc.)
  - Display items automatically switch between invoice and estimate

#### Template Selection

- **Modern**: Simple and refined design. Uses colored backgrounds for sections such as delivery period, payment information, notes, etc.
- **Classic**: Traditional invoice style. White background with accent lines on the left side for a simple design
- **Minimal**: Simple and readable design. Minimal decoration to organize information

#### Estimate Features

When creating an estimate, the following additional features are available:

- **Valid Until**: Set the expiration date of the estimate (field mapping supported)
- **Delivery Period**: Enter delivery deadline or work period (estimate only)
- **Estimate Message**: Custom message field for estimates
- **Estimate Conditions**: The notes section title can be changed to "Estimate Conditions", etc. (estimate only)

#### Changing Template Color

1. Select a color from "Template Color"
2. The invoice header and accent colors will change

#### Background Colors

- **Message Background Color**: Background color for invoice/estimate message section
- **Notes Background Color**: Background color for notes section

#### Adding Images

- **Company Logo**: Displayed in the invoice header
- **Signature/Seal**: Displayed in the invoice footer
- **Background Watermark**: Displayed in the invoice background

#### Showing/Hiding Sections

You can toggle the display of each section (issuer, billing, payment information, notes, invoice/estimate message, image settings).

**Note**: If you hide a section, its content will not be displayed in the PDF or preview. Additionally, empty fields are automatically hidden, so fields that are not filled in will not be displayed.

#### Page Settings

- **Page Size**: Select A4 or Letter
- **Fit to One Page**: Automatically adjust font size and padding to fit all content on one page

---

### Frequently Asked Questions

#### Q: Cannot retrieve data

**A:** Please check the following:
1. Is the `boards:read` permission enabled in Monday.com Developer Center?
2. Do items exist in the board?
3. Try reloading the page (data is automatically loaded)
4. Check for errors in the browser console (F12)

#### Q: Field mapping is not reflected

**A:** Please check the following:
1. Did you save the field mapping?
2. Does the mapped column contain data?
3. Is the custom column ID correct?

#### Q: Cannot retrieve data from specific column types

**A:** Due to Monday.com API specifications, data cannot be retrieved from the following column types:

- **Formula Column**: Formula columns display calculation results, so data cannot be directly retrieved from Monday.com API. If you want to retrieve formula column values, please map the columns that are the source of the formula.

- **Mirror Column with Formula Column as Data Source**: Data cannot be retrieved from mirror columns that reference formula columns either. Due to formula column limitations, values cannot be retrieved from mirror columns.

- **Connection Column (Board Connection)**: Connection columns (`board_relation` type) cannot retrieve the names (titles) of connected items. This is a limitation of Monday.com API. When using connection columns, please set values manually.

#### Q: Invoice layout is broken

**A:** Please check the following:
1. Turn off the "Fit to One Page" option
2. Change the paper size (A4, Letter, etc.)
3. Adjust image sizes

#### Q: Templates are not saved

**A:** Please check the following:
1. Is the template name entered?
2. Is browser local storage enabled?
3. Are you not using private mode (incognito mode)?

#### Q: About multilingual support

**A:** You can switch between Japanese, English, and Spanish from the language selection at the top of the app. All UI elements and invoice templates will be displayed in the selected language.

#### Q: Date input fields show Japanese characters even when language is set to English

**A:** The date input fields use the browser's native date picker, which displays according to the browser/OS language settings, not the app's language setting. This is expected behavior - English-speaking users will see English placeholders, and Japanese-speaking users will see Japanese placeholders.

---

### Support

If your problem is not resolved, please contact the Monday.com Developer Center support desk.

---

## 日本語

### 目次

1. [はじめに](#はじめに)
2. [基本的な使い方](#基本的な使い方)
3. [フィールドマッピング](#フィールドマッピング)
4. [テンプレート管理](#テンプレート管理)
5. [請求書のカスタマイズ](#請求書のカスタマイズ)
6. [よくある質問](#よくある質問)

---

### はじめに

InvoiceStudioは、Monday.comのボードデータから請求書・見積書を簡単に作成できるアプリケーションです。

#### 必要な権限

Monday.com Developer Centerで以下の権限を有効化してください：
- `boards:read` - ボードデータの読み取り

#### 対応言語

- 日本語
- 英語
- スペイン語

---

### 基本的な使い方

#### ステップ1: アプリの起動とデータの読み込み

1. Monday.comのボードでInvoiceStudioアプリを開く
2. アプリが自動的にボードからアイテムを取得します
3. データが表示されない場合は、ページをリロードしてください

**注意**: データはアプリを開いたときに自動的に読み込まれます。データを再読み込みする場合は、ページをリロードしてください。

#### ステップ2: アイテムの選択

1. アイテム一覧から請求書・見積書を作成したいアイテムを選択（チェックボックスで選択）
2. 検索機能でアイテム名やグループ名で絞り込むことができます
3. グループフィルターで特定のグループのアイテムのみを表示できます
4. 「請求書作成」ボタンをクリックして編集画面に進みます

#### ステップ3: 請求書・見積書の編集

1. **ドキュメントタイプの選択**: 画面上部のトグルボタンで「請求書」と「見積書」を切り替えます
2. 選択したアイテムの情報が自動で入力されます
3. **フィールドマッピング**ボタンから、Monday.comボードのカラムと請求書フィールドのマッピングを設定できます（初回のみ推奨）
4. 必要に応じて以下の情報を編集：
   - 基本情報（請求書番号/見積書番号、請求日/見積日、支払期限/有効期限など）
   - 発行元情報（会社名、代表者、住所、連絡先など）
   - 請求先情報（会社名、部署、担当者、住所、連絡先など）
   - 明細（品名、数量、単価など）- サブアイテムから自動取得
   - 振込先情報（銀行名、口座情報など）- 請求書のみ
   - 納期・提供時期 - 見積書のみ
   - 請求書メッセージ/見積書メッセージ
   - 備考/見積条件
   - 画像設定（会社ロゴ、署名/印鑑、背景透かし）

**重要**: 空欄の項目（発行元情報、請求先情報、振込先情報、備考など）は自動的に非表示になり、PDFやプレビューでは空行を作らずに詰めて表示されます。入力しなかった項目は表示されないため、不要な空欄が残ることはありません。例えば、発行元情報の一部の項目（電話番号やFAXなど）を入力しなかった場合、それらの項目は表示されず、入力した項目だけが詰めて表示されます。

#### ステップ4: ダウンロード

##### PDF形式でダウンロード

1. 「ダウンロード」タブに移動
2. プレビューで請求書・見積書の見た目を確認
3. 「PDFダウンロード」ボタンをクリック
4. PDFファイルがダウンロードされます

**注意**: PDF生成には数秒かかる場合があります。日本語、英語、スペイン語など、すべての言語で正しく表示されます。

---

### フィールドマッピング

フィールドマッピング機能を使用すると、Monday.comボードのカラムと請求書・見積書の項目をマッピングできます。

#### フィールドマッピングの設定

1. 請求書編集画面で「フィールドマッピング」ボタンをクリック
2. 各請求書フィールドに対して、Monday.comボードのカラムを選択
3. サブアイテムの価格と数量もマッピングできます
4. 「保存」をクリックすると、マッピングが保存され、選択中のアイテムのデータが自動的に再読み込みされます

#### マッピング可能なフィールド

- **基本情報**
  - 請求書番号/見積書番号
  - 請求日/見積日
  - 支払期限（請求書の場合）
  - 有効期限（見積書の場合）

- **請求先情報**
  - 請求先名
  - 部署
  - 担当者
  - 郵便番号
  - 住所
  - 電話番号
  - メールアドレス

- **金額・明細**
  - 割引
  - 税額
  - 明細（サブアイテム）
  - サブアイテム価格
  - サブアイテム数量

#### カスタムカラムIDの使用

Monday.comボードのカスタムカラムを使用する場合：
1. フィールドマッピングで「カスタム列 ID (直接入力)」を選択
2. カラムIDを直接入力（例: `text_mkwjtrys`）

---

### テンプレート管理

テンプレート機能を使用すると、発行元情報や振込先情報を保存して再利用できます。

#### テンプレートの作成

1. 「テンプレート管理」ボタンをクリック
2. 「新規作成」をクリック
3. テンプレート名は、現在の言語と既存のテンプレート数に基づいて自動生成されます（例: 「テンプレート1」「テンプレート2」など）
4. 発行元情報・振込先情報を入力
5. 「保存」をクリック

#### テンプレートの適用

1. 請求書編集画面で「テンプレートを適用」から保存済みテンプレートを選択
2. テンプレートの情報（発行元情報と振込先情報）が自動で入力されます
3. **注意**: テンプレートを適用する際、既存のデータ（銀行情報、明細、計算された合計など）は保持され、テンプレートデータとマージされます

#### テンプレートの編集・削除

1. 「テンプレート管理」ボタンをクリック
2. 編集したいテンプレートを選択
3. 情報を編集して「保存」をクリック
4. 削除する場合は「削除」ボタンをクリック

---

### 請求書のカスタマイズ

#### ドキュメントタイプの選択

- **請求書**: 標準的な請求書の作成
- **見積書**: 見積書の作成
  - 請求書とは異なる項目（有効期限、納期・提供時期、見積条件など）
  - 請求書と見積書で表示項目が自動的に切り替わる

#### テンプレートの選択

- **モダン**: シンプルで洗練されたデザイン。納期・提供時期、振込先情報、備考などのセクションに色付きの背景を使用
- **クラシック**: 伝統的な請求書スタイル。白背景で左側にアクセントラインを使用したシンプルなデザイン
- **ミニマル**: シンプルで読みやすいデザイン。最小限の装飾で情報を整理

#### 見積書の機能

見積書を作成する場合、以下の追加機能が利用できます：

- **有効期限**: 見積書の有効期限を設定（フィールドマッピング対応）
- **納期・提供時期**: 納期または作業期間を入力（見積書のみ）
- **見積書メッセージ**: 見積書用のカスタムメッセージフィールド
- **見積条件**: 備考セクションのタイトルを「見積条件」などに変更可能（見積書のみ）

#### テンプレートカラーの変更

1. 「テンプレート色」から色を選択
2. 請求書のヘッダーやアクセントカラーが変更されます

#### 背景色の設定

- **メッセージ背景色**: 請求書/見積書メッセージセクションの背景色
- **備考背景色**: 備考セクションの背景色

#### 画像の追加

- **会社ロゴ**: 請求書のヘッダーに表示
- **署名/印鑑**: 請求書のフッターに表示
- **背景の透かし**: 請求書の背景に表示

#### セクションの表示/非表示

各セクション（発行元、請求先、振込先情報、備考、請求書/見積書メッセージ、画像設定）の表示/非表示を切り替えられます。

**注意**: セクションを非表示にした場合、そのセクションの内容はPDFやプレビューに表示されません。また、空欄の項目は自動的に非表示になるため、入力しなかった項目は表示されません。

#### ページ設定

- **用紙サイズ**: A4またはLetterを選択
- **1ページに収める**: フォントサイズとパディングを自動調整して、すべてのコンテンツを1ページに収めます

---

### よくある質問

#### Q: データが取得できない

**A:** 以下を確認してください：
1. Monday.com Developer Centerで`boards:read`権限が有効になっているか
2. ボードにアイテムが存在するか
3. ページをリロードしてみてください（データは自動的に読み込まれます）
4. ブラウザのコンソール（F12）でエラーを確認

#### Q: フィールドマッピングが反映されない

**A:** 以下を確認してください：
1. フィールドマッピングを保存したか
2. マッピングしたカラムにデータが存在するか
3. カスタムカラムIDが正しいか

#### Q: 特定のカラムタイプからデータが取得できない

**A:** Monday.comのAPI仕様により、以下のカラムタイプからはデータを取得できません：

- **数式カラム**: 数式カラムは計算結果を表示するため、Monday.comのAPIから直接データを取得することはできません。数式カラムの値を取得したい場合は、数式の元となるカラムをマッピングしてください。

- **数式カラムをデータ元としたミラーカラム**: 数式カラムを参照するミラーカラムからもデータを取得することはできません。数式カラムの制限により、ミラーカラムでも値が取得できません。

- **接続カラム（ボード接続）**: 接続カラム（`board_relation`タイプ）からは、接続されたアイテムの名前（タイトル）を取得することはできません。これはMonday.comのAPIの制限によるものです。接続カラムを使用する場合は、手動入力で値を設定してください。

#### Q: 請求書のレイアウトが崩れる

**A:** 以下を確認してください：
1. 「1ページに収める」オプションをオフにする
2. 用紙サイズを変更する（A4、Letterなど）
3. 画像のサイズを調整する

#### Q: テンプレートが保存されない

**A:** 以下を確認してください：
1. テンプレート名が入力されているか
2. ブラウザのローカルストレージが有効か
3. プライベートモード（シークレットモード）を使用していないか

#### Q: 多言語対応について

**A:** アプリ上部の言語選択から、日本語・英語・スペイン語を切り替えられます。すべてのUI要素と請求書テンプレートが選択した言語で表示されます。

#### Q: 日付入力フィールドが言語設定に関わらず日本語で表示される

**A:** 日付入力フィールドはブラウザのネイティブ日付ピッカーを使用しており、アプリの言語設定ではなく、ブラウザ/OSの言語設定に従って表示されます。これは正常な動作です。英語圏のユーザーには英語のプレースホルダーが表示され、日本語圏のユーザーには日本語のプレースホルダーが表示されます。

---

### サポート

問題が解決しない場合は、Monday.com Developer Centerのサポート窓口にお問い合わせください。

---

## Español

### Tabla de Contenidos

1. [Introducción](#introducción)
2. [Uso Básico](#uso-básico)
3. [Mapeo de Campos](#mapeo-de-campos)
4. [Gestión de Plantillas](#gestión-de-plantillas)
5. [Personalización de Facturas](#personalización-de-facturas)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

### Introducción

InvoiceStudio es una aplicación que permite crear facturas y presupuestos fácilmente a partir de datos de tableros de Monday.com.

#### Permisos Necesarios

Por favor, habilite los siguientes permisos en Monday.com Developer Center:
- `boards:read` - Lectura de datos del tablero

#### Idiomas Soportados

- Japonés
- Inglés
- Español

---

### Uso Básico

#### Paso 1: Iniciar Aplicación y Cargar Datos

1. Abra la aplicación InvoiceStudio en un tablero de Monday.com
2. La aplicación obtendrá automáticamente los elementos del tablero
3. Si los datos no se muestran, por favor recargue la página

**Nota**: Los datos se cargan automáticamente cuando se abre la aplicación. Para recargar los datos, por favor recargue la página.

#### Paso 2: Seleccionar Elemento

1. Seleccione el elemento para el que desea crear una factura/presupuesto desde la lista de elementos (seleccione usando la casilla de verificación)
2. Puede filtrar elementos por nombre de elemento o nombre de grupo usando la función de búsqueda
3. Puede filtrar elementos por grupo usando el filtro de grupo
4. Haga clic en el botón "Crear Factura" para proceder a la pantalla de edición

#### Paso 3: Editar Factura/Presupuesto

1. **Selección de Tipo de Documento**: Elija entre "Factura" y "Presupuesto" usando los botones de alternancia en la parte superior
2. La información del elemento seleccionado se completará automáticamente
3. Haga clic en el botón **Mapeo de Campos** para configurar las asignaciones entre las columnas del tablero de Monday.com y los campos de factura (recomendado para la configuración inicial)
4. Edite la siguiente información según sea necesario:
   - Información básica (número de factura/presupuesto, fecha de factura/presupuesto, fecha de vencimiento/válido hasta, etc.)
   - Información del emisor (nombre de la empresa, representante, dirección, información de contacto, etc.)
   - Información de facturación (nombre de la empresa, departamento, persona de contacto, dirección, información de contacto, etc.)
   - Artículos de línea (nombre del artículo, cantidad, precio unitario, etc.) - obtenidos automáticamente de subelementos
   - Información de pago (nombre del banco, información de cuenta, etc.) - solo para facturas
   - Período de entrega - solo para presupuestos
   - Mensaje de factura/presupuesto
   - Notas/Condiciones del presupuesto
   - Configuración de imágenes (logo de la empresa, firma/sello, marca de agua de fondo)

**Importante**: Los campos vacíos (información del emisor, información de facturación, información de pago, notas, etc.) se ocultan automáticamente, y en el PDF y la vista previa se muestran sin dejar líneas vacías. Los campos que no se completen no se mostrarán, por lo que no quedarán espacios vacíos innecesarios. Por ejemplo, si no completa algunos campos de la información del emisor (como número de teléfono o FAX), esos campos no se mostrarán y solo se mostrarán los campos completados, sin espacios vacíos entre ellos.

#### Paso 4: Descargar

##### Descargar como PDF

1. Navegue a la pestaña "Descargar"
2. Previsualice la apariencia de la factura/presupuesto
3. Haga clic en el botón "Descargar PDF"
4. Se descargará un archivo PDF

**Nota**: La generación de PDF puede tardar unos segundos. Todos los idiomas (japonés, inglés, español, etc.) se mostrarán correctamente.

---

### Mapeo de Campos

La función de mapeo de campos permite mapear columnas del tablero de Monday.com a campos de factura/presupuesto.

#### Configurar Mapeo de Campos

1. Haga clic en el botón "Mapeo de Campos" en la pantalla de edición de factura
2. Seleccione una columna del tablero de Monday.com para cada campo de factura
3. También puede mapear el precio y la cantidad de subelementos
4. Haga clic en "Guardar" para guardar las asignaciones y recargar automáticamente los datos del elemento seleccionado

#### Campos Mapeables

- **Información Básica**
  - Número de Factura/Presupuesto
  - Fecha de Factura/Presupuesto
  - Fecha de Vencimiento (para facturas)
  - Válido Hasta (para presupuestos)

- **Información de Facturación**
  - Nombre de Facturación
  - Departamento
  - Persona de Contacto
  - Código Postal
  - Dirección
  - Número de Teléfono
  - Dirección de Correo Electrónico

- **Importe y Artículos de Línea**
  - Descuento
  - Importe de Impuesto
  - Artículos de Línea (Subelementos)
  - Precio de Subelemento
  - Cantidad de Subelemento

#### Uso de IDs de Columna Personalizados

Cuando use columnas personalizadas de un tablero de Monday.com:
1. Seleccione "ID de Columna Personalizada (Entrada Directa)" en el mapeo de campos
2. Ingrese el ID de columna directamente (ejemplo: `text_mkwjtrys`)

---

### Gestión de Plantillas

La función de plantilla permite guardar y reutilizar información del emisor e información de pago.

#### Crear una Plantilla

1. Haga clic en el botón "Gestión de Plantillas"
2. Haga clic en "Nuevo"
3. El nombre de la plantilla se generará automáticamente (por ejemplo, "Plantilla1", "Plantilla2", etc.) basado en el idioma actual y el número de plantillas existentes
4. Ingrese información del emisor e información de pago
5. Haga clic en "Guardar"

#### Aplicar una Plantilla

1. En la pantalla de edición de factura, seleccione una plantilla guardada desde "Aplicar Plantilla"
2. La información de la plantilla (información del emisor e información de pago) se completará automáticamente
3. **Nota**: Al aplicar una plantilla, los datos existentes (información bancaria, artículos, totales calculados, etc.) se conservarán y se fusionarán con los datos de la plantilla

#### Editar/Eliminar Plantillas

1. Haga clic en el botón "Gestión de Plantillas"
2. Seleccione la plantilla que desea editar
3. Edite la información y haga clic en "Guardar"
4. Haga clic en el botón "Eliminar" para eliminar

---

### Personalización de Facturas

#### Selección de Tipo de Documento

- **Factura**: Creación de factura estándar
- **Presupuesto**: Creación de presupuesto/cotización
  - Campos diferentes de las facturas (válido hasta, período de entrega, condiciones del presupuesto, etc.)
  - Los elementos de visualización cambian automáticamente entre factura y presupuesto

#### Selección de Plantilla

- **Moderno**: Diseño simple y refinado. Utiliza fondos de color para secciones como período de entrega, información de pago, notas, etc.
- **Clásico**: Estilo de factura tradicional. Fondo blanco con líneas de acento en el lado izquierdo para un diseño simple
- **Minimalista**: Diseño simple y legible. Decoración mínima para organizar la información

#### Funciones de Presupuesto

Al crear un presupuesto, están disponibles las siguientes funciones adicionales:

- **Válido hasta**: Establecer la fecha de vencimiento del presupuesto (compatible con mapeo de campos)
- **Período de entrega**: Ingresar fecha límite o período de trabajo (solo para presupuestos)
- **Mensaje de presupuesto**: Campo de mensaje personalizado para presupuestos
- **Condiciones del presupuesto**: El título de la sección de notas se puede cambiar a "Condiciones del presupuesto", etc. (solo para presupuestos)

#### Cambiar Color de Plantilla

1. Seleccione un color desde "Color de Plantilla"
2. El encabezado de la factura y los colores de acento cambiarán

#### Colores de Fondo

- **Color de Fondo del Mensaje**: Color de fondo para la sección de mensaje de factura/presupuesto
- **Color de Fondo de Notas**: Color de fondo para la sección de notas

#### Agregar Imágenes

- **Logo de la Empresa**: Se muestra en el encabezado de la factura
- **Firma/Sello**: Se muestra en el pie de página de la factura
- **Marca de Agua de Fondo**: Se muestra en el fondo de la factura

#### Mostrar/Ocultar Secciones

Puede alternar la visualización de cada sección (emisor, facturación, información de pago, notas, mensaje de factura/presupuesto, configuración de imágenes).

**Nota**: Si oculta una sección, su contenido no se mostrará en el PDF ni en la vista previa. Además, los campos vacíos se ocultan automáticamente, por lo que los campos que no se completen no se mostrarán.

#### Configuración de Página

- **Tamaño de Página**: Seleccione A4 o Letter
- **Ajustar a Una Página**: Ajusta automáticamente el tamaño de fuente y el relleno para que todo el contenido quepa en una página

---

### Preguntas Frecuentes

#### P: No se pueden recuperar datos

**R:** Por favor, verifique lo siguiente:
1. ¿Está habilitado el permiso `boards:read` en Monday.com Developer Center?
2. ¿Existen elementos en el tablero?
3. Intente recargar la página (los datos se cargan automáticamente)
4. Verifique errores en la consola del navegador (F12)

#### P: El mapeo de campos no se refleja

**R:** Por favor, verifique lo siguiente:
1. ¿Guardó el mapeo de campos?
2. ¿La columna mapeada contiene datos?
3. ¿El ID de columna personalizado es correcto?

#### P: No se pueden recuperar datos de tipos de columna específicos

**R:** Debido a las especificaciones de la API de Monday.com, no se pueden recuperar datos de los siguientes tipos de columna:

- **Columna de Fórmula**: Las columnas de fórmula muestran resultados de cálculo, por lo que no se pueden recuperar datos directamente de la API de Monday.com. Si desea recuperar valores de columnas de fórmula, por favor mapee las columnas que son la fuente de la fórmula.

- **Columna Espejo con Columna de Fórmula como Fuente de Datos**: Tampoco se pueden recuperar datos de columnas espejo que hacen referencia a columnas de fórmula. Debido a las limitaciones de las columnas de fórmula, no se pueden recuperar valores de las columnas espejo.

- **Columna de Conexión (Conexión de Tablero)**: Las columnas de conexión (tipo `board_relation`) no pueden recuperar los nombres (títulos) de los elementos conectados. Esta es una limitación de la API de Monday.com. Cuando use columnas de conexión, por favor establezca los valores manualmente.

#### P: El diseño de la factura está roto

**R:** Por favor, verifique lo siguiente:
1. Desactive la opción "Ajustar a Una Página"
2. Cambie el tamaño del papel (A4, Letter, etc.)
3. Ajuste los tamaños de las imágenes

#### P: Las plantillas no se guardan

**R:** Por favor, verifique lo siguiente:
1. ¿Se ingresó el nombre de la plantilla?
2. ¿Está habilitado el almacenamiento local del navegador?
3. ¿No está usando modo privado (modo incógnito)?

#### P: Sobre el soporte multilingüe

**R:** Puede cambiar entre japonés, inglés y español desde la selección de idioma en la parte superior de la aplicación. Todos los elementos de la interfaz de usuario y las plantillas de factura se mostrarán en el idioma seleccionado.

#### P: Los campos de entrada de fecha muestran caracteres japoneses incluso cuando el idioma está configurado en inglés

**R:** Los campos de entrada de fecha utilizan el selector de fecha nativo del navegador, que se muestra según la configuración de idioma del navegador/OS, no la configuración de idioma de la aplicación. Este es el comportamiento esperado: los usuarios de habla inglesa verán marcadores de posición en inglés, y los usuarios de habla japonesa verán marcadores de posición en japonés.

---

### Soporte

Si su problema no se resuelve, por favor contacte al servicio de soporte de Monday.com Developer Center.

---