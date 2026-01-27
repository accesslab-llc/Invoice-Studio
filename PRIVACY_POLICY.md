# InvoiceStudio Privacy Policy

**Last Updated**: January 2026

---

## English

### 1. Introduction

InvoiceStudio (the "App") is an invoice creation application that runs on Monday.com. This Privacy Policy explains how the App collects, uses, and stores data.

### 2. Data Collection and Use

#### 2.1. Data Retrieval from Monday.com

The App uses Monday.com's GraphQL API to read the following data:

- Board items (ID, name, column values)
- Subitems (ID, name, column values)
- Various data necessary for invoice generation (client name, date, amount, etc.)

**Important**: The App is **read-only**. It does not modify or delete Monday.com data.

#### 2.2. Authentication Information

The App uses short-lived tokens (sessionToken) provided by Monday.com to access Monday.com's API.

**In production environments, personal API tokens are never used.**

### 3. Data Storage

#### 3.1. Local Storage (Browser)

The App stores only the following data in the user's browser `localStorage`:

- **Field Mapping Settings** (`invoiceFieldMappings`)
  - Mapping settings between Monday.com board columns and invoice items
- **Template Information** (`invoiceTemplates`)
  - All invoice fields (basic information, issuer information, billing information, line items, amounts, etc.)
  - Company information (company name, address, phone number, etc.)
  - Bank account information (bank name, account number, account holder, etc.)
  - Field mapping settings (mapping between Monday.com board columns and invoice items)
  - Image data (company logo, signature/seal, background watermark) ※Saved in Base64 format
  - Image settings (size, position, opacity, etc.)
  - Template color settings
  - Currency settings
  - All other invoice settings

This data is stored only in the user's browser and is not sent to our servers.

#### 3.2. Data Transmission to Servers

**The App does not have our own servers and does not transmit data to external servers.**

The following data is never stored or transmitted:

- Monday.com authentication tokens
- Invoice content
- Personal information (client names, contact information, etc.)
- Monday.com board data

### 4. Data Sharing

The App does not share data with third parties. All data processing is performed locally in the user's browser.

### 5. Data Deletion

#### 5.1. Local Storage Deletion

Users can delete stored data by clearing `localStorage` in their browser settings.

#### 5.2. Monday.com Data

The App does not modify or delete Monday.com data. Please delete Monday.com data on Monday.com.

### 6. Security

The App implements the following security measures:

- **HTTPS Communication**: All communications are encrypted via HTTPS
- **Token Protection**: Authentication tokens are only kept in memory and are not logged
- **No Personal Information Storage**: Personal information is never stored on servers

### 7. Third-Party Services

The App uses the following third-party services:

- **Monday.com**: Source of data (Monday.com's Privacy Policy applies)
- **Vercel**: Hosting service (only for static file delivery)

For information about data collected by these services, please refer to each service's Privacy Policy.

### 8. Contact

If you have any questions or requests regarding privacy, please contact us through:

- Email: [Support email address to be set]
- Monday.com Developer Center: [App support page URL to be set]

### 9. Privacy Policy Changes

This Privacy Policy may be changed without notice. If there are significant changes, we will notify you through the App or Monday.com Marketplace.

---

## 日本語

### 1. はじめに

InvoiceStudio（以下「本アプリ」）は、Monday.com上で動作する請求書作成アプリケーションです。本プライバシーポリシーは、本アプリがどのようにデータを収集、使用、保存するかについて説明します。

### 2. データの収集と使用

#### 2.1. Monday.comからのデータ取得

本アプリは、Monday.comのGraphQL APIを使用して、以下のデータを読み取ります：

- ボードアイテム（ID、名前、カラム値）
- サブアイテム（ID、名前、カラム値）
- 請求書生成に必要な各種データ（クライアント名、日付、金額等）

**重要**: 本アプリは**読み取り専用**です。Monday.comのデータを変更・削除することはありません。

#### 2.2. 認証情報

本アプリは、Monday.comから提供される短命トークン（sessionToken）を使用してMonday.com APIにアクセスします。

**本番環境では、個人のAPIトークンは一切使用しません。**

### 3. データの保存

#### 3.1. ローカルストレージ（ブラウザ）

本アプリは、ユーザーのブラウザの`localStorage`に以下のデータのみを保存します：

- **フィールドマッピング設定** (`invoiceFieldMappings`)
  - Monday.comのボードカラムと請求書項目のマッピング設定
- **テンプレート情報** (`invoiceTemplates`)
  - 請求書の全項目（基本情報、発行元情報、請求先情報、明細、金額等）
  - 会社情報（会社名、住所、電話番号等）
  - 銀行口座情報（銀行名、口座番号、口座名義等）
  - フィールドマッピング設定（Monday.comボードカラムと請求書項目のマッピング）
  - 画像データ（会社ロゴ、署名/印鑑、背景透かし）※Base64形式で保存
  - 画像設定（サイズ、位置、透明度等）
  - テンプレートカラー設定
  - 通貨設定
  - その他すべての請求書設定

これらのデータは、ユーザーのブラウザにのみ保存され、当社のサーバーには送信されません。

#### 3.2. サーバーへのデータ送信

**本アプリは、当社のサーバーを持たず、データを外部サーバーに送信することはありません。**

以下のデータは一切保存・送信されません：

- Monday.comの認証トークン
- 請求書の内容
- 個人情報（クライアント名、連絡先等）
- Monday.comのボードデータ

### 4. データの共有

本アプリは、データを第三者と共有することはありません。すべてのデータ処理は、ユーザーのブラウザ上でローカルに実行されます。

### 5. データの削除

#### 5.1. ローカルストレージの削除

ユーザーは、ブラウザの設定から`localStorage`をクリアすることで、保存されたデータを削除できます。

#### 5.2. Monday.comのデータ

本アプリはMonday.comのデータを変更・削除しません。Monday.comのデータの削除は、Monday.com上で行ってください。

### 6. セキュリティ

本アプリは、以下のセキュリティ対策を実施しています：

- **HTTPS通信**: すべての通信はHTTPSで暗号化されています
- **トークンの保護**: 認証トークンはメモリ上でのみ保持され、ログに出力されません
- **個人情報の非保存**: 個人情報をサーバーに保存することはありません

### 7. 第三者サービス

本アプリは、以下の第三者サービスを使用しています：

- **Monday.com**: データの取得元（Monday.comのプライバシーポリシーが適用されます）
- **Vercel**: ホスティングサービス（静的ファイルの配信のみ）

これらのサービスが収集するデータについては、各サービスのプライバシーポリシーを参照してください。

### 8. お問い合わせ

プライバシーに関するご質問やご要望がございましたら、以下の方法でお問い合わせください：

- メール: [サポートメールアドレスを設定]
- Monday.com Developer Center: [アプリのサポートページURLを設定]

### 9. プライバシーポリシーの変更

本プライバシーポリシーは、予告なく変更される場合があります。重要な変更がある場合は、本アプリまたはMonday.comマーケットプレイス上で通知いたします。

---

## Español

### 1. Introducción

InvoiceStudio (la "Aplicación") es una aplicación de creación de facturas que se ejecuta en Monday.com. Esta Política de Privacidad explica cómo la Aplicación recopila, utiliza y almacena datos.

### 2. Recopilación y Uso de Datos

#### 2.1. Obtención de Datos de Monday.com

La Aplicación utiliza la API GraphQL de Monday.com para leer los siguientes datos:

- Elementos del tablero (ID, nombre, valores de columna)
- Subelementos (ID, nombre, valores de columna)
- Varios datos necesarios para la generación de facturas (nombre del cliente, fecha, monto, etc.)

**Importante**: La Aplicación es **solo de lectura**. No modifica ni elimina datos de Monday.com.

#### 2.2. Información de Autenticación

La Aplicación utiliza tokens de corta duración (sessionToken) proporcionados por Monday.com para acceder a la API de Monday.com.

**En entornos de producción, nunca se utilizan tokens API personales.**

### 3. Almacenamiento de Datos

#### 3.1. Almacenamiento Local (Navegador)

La Aplicación almacena solo los siguientes datos en el `localStorage` del navegador del usuario:

- **Configuración de Mapeo de Campos** (`invoiceFieldMappings`)
  - Configuración de mapeo entre columnas del tablero de Monday.com e ítems de factura
- **Información de Plantilla** (`invoiceTemplates`)
  - Todos los campos de la factura (información básica, información del emisor, información de facturación, artículos de línea, montos, etc.)
  - Información de la empresa (nombre de la empresa, dirección, número de teléfono, etc.)
  - Información de cuenta bancaria (nombre del banco, número de cuenta, titular de la cuenta, etc.)
  - Configuración de mapeo de campos (mapeo entre columnas del tablero de Monday.com e ítems de factura)
  - Datos de imagen (logo de la empresa, firma/sello, marca de agua de fondo) ※Guardado en formato Base64
  - Configuración de imagen (tamaño, posición, opacidad, etc.)
  - Configuración de color de plantilla
  - Configuración de moneda
  - Todas las demás configuraciones de factura

Estos datos se almacenan solo en el navegador del usuario y no se envían a nuestros servidores.

#### 3.2. Transmisión de Datos a Servidores

**La Aplicación no tiene nuestros propios servidores y no transmite datos a servidores externos.**

Los siguientes datos nunca se almacenan ni transmiten:

- Tokens de autenticación de Monday.com
- Contenido de facturas
- Información personal (nombres de clientes, información de contacto, etc.)
- Datos del tablero de Monday.com

### 4. Compartir Datos

La Aplicación no comparte datos con terceros. Todo el procesamiento de datos se realiza localmente en el navegador del usuario.

### 5. Eliminación de Datos

#### 5.1. Eliminación de Almacenamiento Local

Los usuarios pueden eliminar los datos almacenados limpiando el `localStorage` en la configuración de su navegador.

#### 5.2. Datos de Monday.com

La Aplicación no modifica ni elimina datos de Monday.com. Por favor, elimine los datos de Monday.com en Monday.com.

### 6. Seguridad

La Aplicación implementa las siguientes medidas de seguridad:

- **Comunicación HTTPS**: Todas las comunicaciones están cifradas mediante HTTPS
- **Protección de Tokens**: Los tokens de autenticación solo se mantienen en memoria y no se registran
- **Sin Almacenamiento de Información Personal**: La información personal nunca se almacena en servidores

### 7. Servicios de Terceros

La Aplicación utiliza los siguientes servicios de terceros:

- **Monday.com**: Fuente de datos (se aplica la Política de Privacidad de Monday.com)
- **Vercel**: Servicio de alojamiento (solo para entrega de archivos estáticos)

Para obtener información sobre los datos recopilados por estos servicios, consulte la Política de Privacidad de cada servicio.

### 8. Contacto

Si tiene preguntas o solicitudes relacionadas con la privacidad, contáctenos a través de:

- Correo electrónico: [Dirección de correo de soporte a configurar]
- Monday.com Developer Center: [URL de la página de soporte de la aplicación a configurar]

### 9. Cambios en la Política de Privacidad

Esta Política de Privacidad puede ser modificada sin previo aviso. Si hay cambios significativos, le notificaremos a través de la Aplicación o Monday.com Marketplace.

---