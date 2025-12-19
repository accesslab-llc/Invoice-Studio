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
          content: `ステップ1: データの読み込み
1. Monday.comのボードでInvoiceStudioアプリを開く
2. 「データ読み込み」ボタンをクリック
3. ボードからアイテムが取得されます

ステップ2: アイテムの選択
1. アイテム一覧から請求書を作成したいアイテムを選択
2. 検索機能でアイテムを絞り込むこともできます

ステップ3: 請求書の編集
1. 選択したアイテムの情報が自動で入力されます
2. 必要に応じて情報を編集

ステップ4: ダウンロード
1. 「ダウンロード」タブに移動
2. プレビューで請求書の見た目を確認
3. 「HTMLダウンロード」ボタンをクリック`
        },
        {
          title: 'フィールドマッピング',
          content: `フィールドマッピング機能を使用すると、Monday.comボードのカラムと請求書の項目をマッピングできます。

設定方法:
1. 「フィールドマッピング」ボタンをクリック
2. 各請求書フィールドに対して、Monday.comボードのカラムを選択
3. 「保存」をクリック

マッピング可能なフィールド:
- 基本情報: 請求書番号、請求日
- 請求先情報: 請求先名、部署、担当者、郵便番号、住所、電話番号、メールアドレス
- 金額・明細: 割引、税額、明細（サブアイテム）`
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
- モダン: シンプルで洗練されたデザイン
- クラシック: 伝統的な請求書スタイル
- ミニマル: シンプルで読みやすいデザイン

テンプレートカラーの変更:
1. 「テンプレート色」から色を選択
2. 請求書のヘッダーやアクセントカラーが変更されます

画像の追加:
- 会社ロゴ: 請求書のヘッダーに表示
- 署名/印鑑: 請求書のフッターに表示
- 背景の透かし: 請求書の背景に表示`
        },
        {
          title: 'よくある質問',
          content: `Q: データが取得できない
A: Monday.com Developer Centerでboards:read権限が有効になっているか確認してください。

Q: フィールドマッピングが反映されない
A: フィールドマッピングを保存したか、マッピングしたカラムにデータが存在するか確認してください。

Q: 請求書のレイアウトが崩れる
A: 「1ページに収める」オプションをオフにするか、用紙サイズを変更してください。

Q: 多言語対応について
A: アプリ上部の言語選択から、日本語・英語・スペイン語を切り替えられます。`
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
          content: `Step 1: Load Data
1. Open the InvoiceStudio app in a Monday.com board
2. Click the "Load Data" button
3. Items will be retrieved from the board

Step 2: Select Item
1. Select an item from the item list to create an invoice
2. You can also filter items using the search function

Step 3: Edit Invoice
1. Information from the selected item will be automatically filled in
2. Edit information as needed

Step 4: Download
1. Go to the "Download" tab
2. Preview the invoice appearance
3. Click the "Download HTML" button`
        },
        {
          title: 'Field Mapping',
          content: `The field mapping feature allows you to map Monday.com board columns to invoice fields.

How to Set Up:
1. Click the "Field Mapping" button
2. Select a Monday.com board column for each invoice field
3. Click "Save"

Mappable Fields:
- Basic Information: Invoice Number, Invoice Date
- Billing Information: Client Name, Department, Contact Person, Postal Code, Address, Phone Number, Email Address
- Amount & Line Items: Discount, Tax Amount, Line Items (Subitems)`
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
- Modern: Simple and refined design
- Classic: Traditional invoice style
- Minimal: Simple and readable design

Changing Template Color:
1. Select a color from "Template Color"
2. The invoice header and accent colors will change

Adding Images:
- Company Logo: Displayed in the invoice header
- Signature/Seal: Displayed in the invoice footer
- Background Watermark: Displayed in the invoice background`
        },
        {
          title: 'Frequently Asked Questions',
          content: `Q: Cannot retrieve data
A: Check if the boards:read permission is enabled in Monday.com Developer Center.

Q: Field mapping is not reflected
A: Check if you saved the field mapping and if data exists in the mapped column.

Q: Invoice layout is broken
A: Turn off the "Fit to One Page" option or change the page size.

Q: About multi-language support
A: You can switch between Japanese, English, and Spanish from the language selection at the top of the app.`
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
          content: `Paso 1: Cargar Datos
1. Abra la aplicación InvoiceStudio en un tablero de Monday.com
2. Haga clic en el botón "Cargar Datos"
3. Los artículos se recuperarán del tablero

Paso 2: Seleccionar Artículo
1. Seleccione un artículo de la lista para crear una factura
2. También puede filtrar artículos usando la función de búsqueda

Paso 3: Editar Factura
1. La información del artículo seleccionado se completará automáticamente
2. Edite la información según sea necesario

Paso 4: Descargar
1. Vaya a la pestaña "Descargar"
2. Previsualice la apariencia de la factura
3. Haga clic en el botón "Descargar HTML"`
        },
        {
          title: 'Mapeo de Campos',
          content: `La función de mapeo de campos le permite mapear columnas del tablero de Monday.com a campos de factura.

Cómo Configurar:
1. Haga clic en el botón "Mapeo de Campos"
2. Seleccione una columna del tablero de Monday.com para cada campo de factura
3. Haga clic en "Guardar"

Campos Mapeables:
- Información Básica: Número de Factura, Fecha de Factura
- Información de Facturación: Nombre del Cliente, Departamento, Persona de Contacto, Código Postal, Dirección, Número de Teléfono, Dirección de Correo
- Importe y Artículos: Descuento, Importe del Impuesto, Artículos (Subartículos)`
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
- Moderna: Diseño simple y refinado
- Clásica: Estilo de factura tradicional
- Minimalista: Diseño simple y legible

Cambiar Color de Plantilla:
1. Seleccione un color de "Color de Plantilla"
2. El encabezado de la factura y los colores de acento cambiarán

Agregar Imágenes:
- Logo de Empresa: Mostrado en el encabezado de la factura
- Firma/Sello: Mostrado en el pie de página de la factura
- Marca de Agua de Fondo: Mostrado en el fondo de la factura`
        },
        {
          title: 'Preguntas Frecuentes',
          content: `P: No se pueden recuperar datos
R: Verifique si el permiso boards:read está habilitado en Monday.com Developer Center.

P: El mapeo de campos no se refleja
R: Verifique si guardó el mapeo de campos y si existen datos en la columna mapeada.

P: El diseño de la factura está roto
R: Desactive la opción "Ajustar a Una Página" o cambie el tamaño de la página.

P: Acerca del soporte multiidioma
R: Puede cambiar entre japonés, inglés y español desde la selección de idioma en la parte superior de la aplicación.`
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

