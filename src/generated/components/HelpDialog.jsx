import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Stack,
  Heading,
  Text,
  Field,
  CloseButton,
  Card,
  HStack,
  Separator,
  Box
} from '@chakra-ui/react';
import { HelpCircle } from 'lucide-react';
import { translations } from '../utils/translations';

const HelpDialog = ({ isOpen, onClose, language }) => {
  const t = translations[language] || translations.ja;

  const manualContent = {
    ja: {
      title: 'InvoiceStudio - ユーザーマニュアル',
      sections: [
        {
          title: 'はじめに',
          content: `InvoiceStudioは、Monday.comのボードデータから請求書を簡単に作成できるアプリケーションです。

必要な権限:
- boards:read - ボードデータの読み取り

対応言語:
- 日本語
- 英語
- スペイン語`
        },
        {
          title: '基本的な使い方',
          content: `ステップ1: アプリの起動とデータの読み込み
1. Monday.comのボードでInvoiceStudioアプリを開く
2. アプリが自動的にボードからアイテムを取得します
3. データが表示されない場合は、ページをリロードしてください

ステップ2: アイテムの選択
1. アイテム一覧から請求書を作成したいアイテムを選択（チェックボックスで選択）
2. 検索機能でアイテム名やグループ名で絞り込むことができます
3. グループフィルターで特定のグループのアイテムのみを表示できます
4. 「請求書作成」ボタンをクリックして編集画面に進みます

ステップ3: 請求書の編集
1. 選択したアイテムの情報が自動で入力されます
2. **フィールドマッピング**ボタンから、Monday.comボードのカラムと請求書フィールドのマッピングを設定できます（初回のみ推奨）
3. 必要に応じて以下の情報を編集：
   - 基本情報（請求書番号、請求日、支払期限/有効期限など）
   - 発行元情報（会社名、代表者、住所、連絡先など）
   - 請求先情報（会社名、部署、担当者、住所、連絡先など）
   - 明細（品名、数量、単価など）- サブアイテムから自動取得
   - 振込先情報（銀行名、口座情報など）- 請求書のみ
   - 納期・提供時期 - 見積書のみ
   - 備考/見積条件
   - 画像設定（会社ロゴ、署名/印鑑、背景透かし）

**重要**: 空欄の項目（発行元情報、請求先情報、振込先情報、備考など）は自動的に非表示になり、PDFやプレビューでは空行を作らずに詰めて表示されます。入力しなかった項目は表示されないため、不要な空欄が残ることはありません。例えば、発行元情報の一部の項目（電話番号やFAXなど）を入力しなかった場合、それらの項目は表示されず、入力した項目だけが詰めて表示されます。

ステップ4: ダウンロード

PDF形式でダウンロード:
1. 「ダウンロード」タブに移動
2. プレビューで請求書の見た目を確認
3. 「PDFダウンロード」ボタンをクリック
4. PDFファイルがダウンロードされます

**注意**: PDF生成には数秒かかる場合があります。日本語、英語、スペイン語など、すべての言語で正しく表示されます。`
        },
        {
          title: 'フィールドマッピング',
          content: `フィールドマッピング機能を使用すると、Monday.comボードのカラムと請求書の項目をマッピングできます。

設定方法:
1. 「フィールドマッピング」ボタンをクリック
2. 各請求書フィールドに対して、Monday.comボードのカラムを選択
3. 「保存」をクリック

マッピング可能なフィールド:
- 基本情報: 請求書番号、請求日、支払期限（請求書の場合）、有効期限（見積書の場合）
- 請求先情報: 請求先名、部署、担当者、郵便番号、住所、電話番号、メールアドレス
- 金額・明細: 割引、税額、明細（サブアイテム）、サブアイテム価格、サブアイテム数量`
        },
        {
          title: 'テンプレート管理',
          content: `テンプレート機能を使用すると、発行元情報や振込先情報を保存して再利用できます。

テンプレートの作成:
1. 「テンプレート管理」ボタンをクリック
2. 「新規作成」をクリック
3. テンプレート名を入力
4. 発行元情報・振込先情報を入力
5. 「保存」をクリック

テンプレートの適用:
1. 「テンプレート管理」ボタンをクリック
2. 「テンプレートを適用」から保存済みテンプレートを選択
3. テンプレートの情報が自動で入力されます`
        },
        {
          title: '請求書のカスタマイズ',
          content: `テンプレートの選択:
- モダン: シンプルで洗練されたデザイン。納期・提供時期、振込先情報、備考などのセクションに色付きの背景を使用
- クラシック: 伝統的な請求書スタイル。白背景で左側にアクセントラインを使用したシンプルなデザイン
- ミニマル: シンプルで読みやすいデザイン。最小限の装飾で情報を整理

テンプレートカラーの変更:
1. 「テンプレート色」から色を選択
2. 請求書のヘッダーやアクセントカラーが変更されます

画像の追加:
- 会社ロゴ: 請求書のヘッダーに表示
- 署名/印鑑: 請求書のフッターに表示
- 背景の透かし: 請求書の背景に表示

見積書の機能:
見積書を作成する場合、以下の追加機能が利用できます：
- 有効期限: 見積書の有効期限を設定（フィールドマッピング対応）
- 納期・提供時期: 納期または作業期間を選択して入力（見積書のみ）
- 見積条件: 備考セクションのタイトルを「見積条件」などに変更可能（見積書のみ）

セクションの表示/非表示:
各セクション（発行元、請求先、振込先情報、備考、画像設定）の表示/非表示を切り替えられます。

**注意**: セクションを非表示にした場合、そのセクションの内容はPDFやプレビューに表示されません。また、空欄の項目は自動的に非表示になるため、入力しなかった項目は表示されません。`
        },
        {
          title: 'よくある質問',
          content: `Q: データが取得できない
A: Monday.com Developer Centerでboards:read権限が有効になっているか確認してください。

Q: フィールドマッピングが反映されない
A: フィールドマッピングを保存したか、マッピングしたカラムにデータが存在するか確認してください。

Q: 特定のカラムタイプからデータが取得できない
A: Monday.comのAPI仕様により、以下のカラムタイプからはデータを取得できません：

- 数式カラム: 数式カラムは計算結果を表示するため、Monday.comのAPIから直接データを取得することはできません。数式カラムの値を取得したい場合は、数式の元となるカラムをマッピングしてください。

- 数式カラムをデータ元としたミラーカラム: 数式カラムを参照するミラーカラムからもデータを取得することはできません。数式カラムの制限により、ミラーカラムでも値が取得できません。

- 接続カラム（ボード接続）: 接続カラム（board_relationタイプ）からは、接続されたアイテムの名前（タイトル）を取得することはできません。これはMonday.comのAPIの制限によるものです。接続カラムを使用する場合は、手動入力で値を設定してください。

Q: 請求書のレイアウトが崩れる
A: 「1ページに収める」オプションをオフにするか、用紙サイズを変更してください。

Q: テンプレートが保存されない
A: テンプレート名が入力されているか、ブラウザのローカルストレージが有効か確認してください。

Q: 多言語対応について
A: アプリ上部の言語選択から、日本語・英語・スペイン語を切り替えられます。すべてのUI要素と請求書テンプレートが選択した言語で表示されます。`
        }
      ]
    },
    en: {
      title: 'InvoiceStudio - User Manual',
      sections: [
        {
          title: 'Introduction',
          content: `InvoiceStudio is an application that makes it easy to create invoices from Monday.com board data.

Required Permissions:
- boards:read - Read board data

Supported Languages:
- Japanese
- English
- Spanish`
        },
        {
          title: 'Basic Usage',
          content: `Step 1: Launch App and Load Data
1. Open the InvoiceStudio app in a Monday.com board
2. The app automatically retrieves items from the board
3. If data is not displayed, please reload the page

Step 2: Select Item
1. Select an item from the item list to create an invoice (select with checkbox)
2. You can filter items by item name or group name using the search function
3. You can display items from specific groups using the group filter
4. Click the "Create Invoice" button to proceed to the edit screen

Step 3: Edit Invoice
1. Information from the selected item will be automatically filled in
2. Click the **Field Mapping** button to set up mappings between Monday.com board columns and invoice fields (recommended for first-time setup)
3. Edit the following information as needed:
   - Basic information (invoice number, invoice date, due date/valid until, etc.)
   - Issuer information (company name, representative, address, contact information, etc.)
   - Billing information (company name, department, contact person, address, contact information, etc.)
   - Line items (item name, quantity, unit price, etc.) - automatically retrieved from subitems
   - Payment information (bank name, account information, etc.) - invoices only
   - Delivery period - estimates only
   - Notes/Estimate conditions
   - Image settings (company logo, signature/seal, background watermark)

**Important**: Empty fields (issuer information, billing information, payment information, notes, etc.) are automatically hidden, and in PDFs and previews, they are displayed without leaving blank lines. Fields that are not filled in will not be displayed, so there will be no unnecessary blank spaces. For example, if you do not fill in some fields of the issuer information (such as phone number or FAX), those fields will not be displayed, and only the filled-in fields will be displayed without gaps.

Step 4: Download

Download as PDF:
1. Go to the "Download" tab
2. Preview the invoice appearance
3. Click the "Download PDF" button
4. The PDF file will be downloaded

**Note**: PDF generation may take a few seconds. All languages including Japanese, English, and Spanish will be displayed correctly.`
        },
        {
          title: 'Field Mapping',
          content: `The field mapping feature allows you to map Monday.com board columns to invoice fields.

How to Set Up:
1. Click the "Field Mapping" button
2. Select a Monday.com board column for each invoice field
3. Click "Save"

Mappable Fields:
- Basic Information: Invoice Number, Invoice Date, Due Date (for invoices), Valid Until (for estimates)
- Billing Information: Client Name, Department, Contact Person, Postal Code, Address, Phone Number, Email Address
- Amount & Line Items: Discount, Tax Amount, Line Items (Subitems), Subitem Price, Subitem Quantity`
        },
        {
          title: 'Template Management',
          content: `The template feature allows you to save and reuse issuer and payment information.

Creating a Template:
1. Click the "Manage Templates" button
2. Click "New Template"
3. Enter a template name
4. Enter issuer and payment information
5. Click "Save"

Applying a Template:
1. Click the "Manage Templates" button
2. Select a saved template from "Apply Template"
3. Template information will be automatically filled in`
        },
        {
          title: 'Invoice Customization',
          content: `Template Selection:
- Modern: Simple and refined design. Uses colored backgrounds for sections such as delivery period, payment information, notes, etc.
- Classic: Traditional invoice style. White background with accent lines on the left for a simple design
- Minimal: Simple and readable design. Minimal decoration to organize information

Changing Template Color:
1. Select a color from "Template Color"
2. The invoice header and accent colors will change

Adding Images:
- Company Logo: Displayed in the invoice header
- Signature/Seal: Displayed in the invoice footer
- Background Watermark: Displayed in the invoice background

Estimate Features:
When creating an estimate, the following additional features are available:
- Valid Until: Set the expiration date of the estimate (compatible with field mapping)
- Delivery Period: Select and enter deadline or work period (estimates only)
- Estimate Conditions: Change the title of the notes section to "Estimate Conditions", etc. (estimates only)

Show/Hide Sections:
You can toggle the display of each section (issuer, billing, payment information, notes, image settings).

**Note**: If you hide a section, its content will not be displayed in the PDF or preview. Also, empty fields are automatically hidden, so fields that are not filled in will not be displayed.`
        },
        {
          title: 'Frequently Asked Questions',
          content: `Q: Cannot retrieve data
A: Check if the boards:read permission is enabled in Monday.com Developer Center.

Q: Field mapping is not reflected
A: Check if you saved the field mapping and if data exists in the mapped column.

Q: Cannot retrieve data from specific column types
A: Due to Monday.com API specifications, data cannot be retrieved from the following column types:

- Formula Column: Formula columns display calculation results, so data cannot be directly retrieved from Monday.com API. If you want to retrieve formula column values, please map the columns that are the source of the formula.

- Mirror Column with Formula Column as Data Source: Data cannot be retrieved from mirror columns that reference formula columns either. Due to formula column limitations, values cannot be retrieved from mirror columns.

- Connection Column (Board Connection): Connection columns (board_relation type) cannot retrieve the names (titles) of connected items. This is a limitation of Monday.com API. When using connection columns, please set values manually.

Q: Invoice layout is broken
A: Turn off the "Fit to One Page" option or change the page size.

Q: Templates are not saved
A: Check if the template name is entered and if browser local storage is enabled.

Q: About multi-language support
A: You can switch between Japanese, English, and Spanish from the language selection at the top of the app. All UI elements and invoice templates will be displayed in the selected language.`
        }
      ]
    },
    es: {
      title: 'InvoiceStudio - Manual de Usuario',
      sections: [
        {
          title: 'Introducción',
          content: `InvoiceStudio es una aplicación que facilita la creación de facturas desde los datos del tablero de Monday.com.

Permisos Requeridos:
- boards:read - Leer datos del tablero

Idiomas Soportados:
- Japonés
- Inglés
- Español`
        },
        {
          title: 'Uso Básico',
          content: `Paso 1: Iniciar Aplicación y Cargar Datos
1. Abra la aplicación InvoiceStudio en un tablero de Monday.com
2. La aplicación recupera automáticamente los artículos del tablero
3. Si los datos no se muestran, recargue la página

Paso 2: Seleccionar Artículo
1. Seleccione un artículo de la lista para crear una factura (seleccione con casilla de verificación)
2. Puede filtrar artículos por nombre de artículo o nombre de grupo usando la función de búsqueda
3. Puede mostrar artículos de grupos específicos usando el filtro de grupo
4. Haga clic en el botón "Crear Factura" para proceder a la pantalla de edición

Paso 3: Editar Factura
1. La información del artículo seleccionado se completará automáticamente
2. Haga clic en el botón **Mapeo de Campos** para configurar las asignaciones entre las columnas del tablero de Monday.com y los campos de factura (recomendado para la configuración inicial)
3. Edite la siguiente información según sea necesario:
   - Información básica (número de factura, fecha de factura, fecha de vencimiento/válido hasta, etc.)
   - Información del emisor (nombre de la empresa, representante, dirección, información de contacto, etc.)
   - Información de facturación (nombre de la empresa, departamento, persona de contacto, dirección, información de contacto, etc.)
   - Artículos de línea (nombre del artículo, cantidad, precio unitario, etc.) - obtenidos automáticamente de subelementos
   - Información de pago (nombre del banco, información de cuenta, etc.) - solo para facturas
   - Período de entrega - solo para presupuestos
   - Notas/Condiciones del presupuesto
   - Configuración de imágenes (logo de la empresa, firma/sello, marca de agua de fondo)

**Importante**: Los campos vacíos (información del emisor, información de facturación, información de pago, notas, etc.) se ocultan automáticamente, y en el PDF y la vista previa se muestran sin dejar líneas vacías. Los campos que no se completen no se mostrarán, por lo que no quedarán espacios vacíos innecesarios. Por ejemplo, si no completa algunos campos de la información del emisor (como número de teléfono o FAX), esos campos no se mostrarán y solo se mostrarán los campos completados, sin espacios vacíos entre ellos.

Paso 4: Descargar

Descargar como PDF:
1. Vaya a la pestaña "Descargar"
2. Previsualice la apariencia de la factura
3. Haga clic en el botón "Descargar PDF"
4. El archivo PDF se descargará

**Nota**: La generación de PDF puede tardar unos segundos. Todos los idiomas, incluidos japonés, inglés y español, se mostrarán correctamente.`
        },
        {
          title: 'Mapeo de Campos',
          content: `La función de mapeo de campos le permite mapear columnas del tablero de Monday.com a campos de factura.

Cómo Configurar:
1. Haga clic en el botón "Mapeo de Campos"
2. Seleccione una columna del tablero de Monday.com para cada campo de factura
3. Haga clic en "Guardar"

Campos Mapeables:
- Información Básica: Número de Factura, Fecha de Factura, Fecha de Vencimiento (para facturas), Válido Hasta (para presupuestos)
- Información de Facturación: Nombre del Cliente, Departamento, Persona de Contacto, Código Postal, Dirección, Número de Teléfono, Dirección de Correo
- Importe y Artículos: Descuento, Importe del Impuesto, Artículos (Subartículos), Precio de Subartículo, Cantidad de Subartículo`
        },
        {
          title: 'Gestión de Plantillas',
          content: `La función de plantilla le permite guardar y reutilizar información del emisor y pago.

Crear una Plantilla:
1. Haga clic en el botón "Gestionar plantillas"
2. Haga clic en "Nueva plantilla"
3. Ingrese un nombre de plantilla
4. Ingrese información del emisor y pago
5. Haga clic en "Guardar"

Aplicar una Plantilla:
1. Haga clic en el botón "Gestionar plantillas"
2. Seleccione una plantilla guardada de "Aplicar plantilla"
3. La información de la plantilla se completará automáticamente`
        },
        {
          title: 'Personalización de Facturas',
          content: `Selección de Plantilla:
- Moderna: Diseño simple y refinado. Utiliza fondos de color para secciones como período de entrega, información de pago, notas, etc.
- Clásica: Estilo de factura tradicional. Fondo blanco con líneas de acento en el lado izquierdo para un diseño simple
- Minimalista: Diseño simple y legible. Decoración mínima para organizar la información

Cambiar Color de Plantilla:
1. Seleccione un color de "Color de Plantilla"
2. El encabezado de la factura y los colores de acento cambiarán

Agregar Imágenes:
- Logo de Empresa: Mostrado en el encabezado de la factura
- Firma/Sello: Mostrado en el pie de página de la factura
- Marca de Agua de Fondo: Mostrado en el fondo de la factura

Funciones de Presupuesto:
Al crear un presupuesto, están disponibles las siguientes funciones adicionales:
- Válido hasta: Establecer la fecha de vencimiento del presupuesto (compatible con mapeo de campos)
- Período de entrega: Seleccionar y ingresar fecha límite o período de trabajo (solo para presupuestos)
- Condiciones del presupuesto: Cambiar el título de la sección de notas a "Condiciones del presupuesto", etc. (solo para presupuestos)

Mostrar/Ocultar Secciones:
Puede alternar la visualización de cada sección (emisor, facturación, información de pago, notas, configuración de imágenes).

**Nota**: Si oculta una sección, su contenido no se mostrará en el PDF ni en la vista previa. Además, los campos vacíos se ocultan automáticamente, por lo que los campos que no se completen no se mostrarán.`
        },
        {
          title: 'Preguntas Frecuentes',
          content: `P: No se pueden recuperar datos
R: Verifique si el permiso boards:read está habilitado en Monday.com Developer Center.

P: El mapeo de campos no se refleja
R: Verifique si guardó el mapeo de campos y si existen datos en la columna mapeada.

P: No se pueden recuperar datos de tipos de columna específicos
R: Debido a las especificaciones de la API de Monday.com, no se pueden recuperar datos de los siguientes tipos de columna:

- Columna de Fórmula: Las columnas de fórmula muestran resultados de cálculo, por lo que no se pueden recuperar datos directamente de la API de Monday.com. Si desea recuperar valores de columnas de fórmula, por favor mapee las columnas que son la fuente de la fórmula.

- Columna Espejo con Columna de Fórmula como Fuente de Datos: Tampoco se pueden recuperar datos de columnas espejo que hacen referencia a columnas de fórmula. Debido a las limitaciones de las columnas de fórmula, no se pueden recuperar valores de las columnas espejo.

- Columna de Conexión (Conexión de Tablero): Las columnas de conexión (tipo board_relation) no pueden recuperar los nombres (títulos) de los elementos conectados. Esta es una limitación de la API de Monday.com. Cuando use columnas de conexión, por favor establezca los valores manualmente.

P: El diseño de la factura está roto
R: Desactive la opción "Ajustar a Una Página" o cambie el tamaño de la página.

P: Las plantillas no se guardan
R: Verifique si se ingresó el nombre de la plantilla y si el almacenamiento local del navegador está habilitado.

P: Acerca del soporte multiidioma
R: Puede cambiar entre japonés, inglés y español desde la selección de idioma en la parte superior de la aplicación. Todos los elementos de la interfaz de usuario y las plantillas de factura se mostrarán en el idioma seleccionado.`
        }
      ]
    }
  };

  const content = manualContent[language] || manualContent.ja;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxH="90vh">
          <Dialog.Header>
            <Dialog.Title>
              <HStack gap="2">
                <HelpCircle size={24} />
                <Text>{t.helpTitle}</Text>
              </HStack>
            </Dialog.Title>
            <Dialog.Description>{content.title}</Dialog.Description>
          </Dialog.Header>

          <Dialog.Body overflowY="auto">
            <Stack gap="6">
              {content.sections.map((section, index) => (
                <Box key={index}>
                  <Heading size="md" mb="3" color="blue.600">
                    {section.title}
                  </Heading>
                  <Card.Root>
                    <Card.Body>
                      <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.8">
                        {section.content}
                      </Text>
                    </Card.Body>
                  </Card.Root>
                  {index < content.sections.length - 1 && <Separator mt="4" />}
                </Box>
              ))}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="blue" onClick={onClose}>
                {t.close}
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>

          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default HelpDialog;

