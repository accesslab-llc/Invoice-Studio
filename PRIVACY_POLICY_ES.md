# InvoiceStudio Política de Privacidad

**Última actualización**: Enero 2026

## 1. Introducción

InvoiceStudio (la "Aplicación") es una aplicación de creación de facturas que se ejecuta en Monday.com. Esta Política de Privacidad explica cómo la Aplicación recopila, utiliza y almacena datos.

## 2. Recopilación y Uso de Datos

### 2.1. Obtención de Datos de Monday.com

La Aplicación utiliza la API GraphQL de Monday.com para leer los siguientes datos:

- Elementos del tablero (ID, nombre, valores de columna)
- Subelementos (ID, nombre, valores de columna)
- Varios datos necesarios para la generación de facturas (nombre del cliente, fecha, monto, etc.)

**Importante**: La Aplicación es **solo de lectura**. No modifica ni elimina datos de Monday.com.

### 2.2. Información de Autenticación

La Aplicación utiliza tokens de corta duración (sessionToken) proporcionados por Monday.com para acceder a la API de Monday.com.

**En entornos de producción, nunca se utilizan tokens API personales.**

## 3. Almacenamiento de Datos

### 3.1. Almacenamiento Local (Navegador)

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

### 3.2. Transmisión de Datos a Servidores

**La Aplicación no tiene nuestros propios servidores y no transmite datos a servidores externos.**

Los siguientes datos nunca se almacenan ni transmiten:

- Tokens de autenticación de Monday.com
- Contenido de facturas
- Información personal (nombres de clientes, información de contacto, etc.)
- Datos del tablero de Monday.com

## 4. Compartir Datos

La Aplicación no comparte datos con terceros. Todo el procesamiento de datos se realiza localmente en el navegador del usuario.

## 5. Eliminación de Datos

### 5.1. Eliminación de Almacenamiento Local

Los usuarios pueden eliminar los datos almacenados limpiando el `localStorage` en la configuración de su navegador.

### 5.2. Datos de Monday.com

La Aplicación no modifica ni elimina datos de Monday.com. Por favor, elimine los datos de Monday.com en Monday.com.

## 6. Seguridad

La Aplicación implementa las siguientes medidas de seguridad:

- **Comunicación HTTPS**: Todas las comunicaciones están cifradas mediante HTTPS
- **Protección de Tokens**: Los tokens de autenticación solo se mantienen en memoria y no se registran
- **Sin Almacenamiento de Información Personal**: La información personal nunca se almacena en servidores

## 7. Servicios de Terceros

La Aplicación utiliza los siguientes servicios de terceros:

- **Monday.com**: Fuente de datos (se aplica la Política de Privacidad de Monday.com)
- **Vercel**: Servicio de alojamiento (solo para entrega de archivos estáticos)

Para obtener información sobre los datos recopilados por estos servicios, consulte la Política de Privacidad de cada servicio.

## 8. Contacto

Si tiene preguntas o solicitudes relacionadas con la privacidad, contáctenos a través de:

- Correo electrónico: [Dirección de correo de soporte a configurar]
- Monday.com Developer Center: [URL de la página de soporte de la aplicación a configurar]

## 9. Cambios en la Política de Privacidad

Esta Política de Privacidad puede ser modificada sin previo aviso. Si hay cambios significativos, le notificaremos a través de la Aplicación o Monday.com Marketplace.

---

**Nota**: Esta Política de Privacidad es la versión en español. También están disponibles versiones en japonés e inglés.

