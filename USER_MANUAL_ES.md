# InvoiceStudio - Manual de Usuario

**Última actualización**: 2024

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Uso Básico](#uso-básico)
3. [Mapeo de Campos](#mapeo-de-campos)
4. [Gestión de Plantillas](#gestión-de-plantillas)
5. [Personalización de Facturas](#personalización-de-facturas)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

InvoiceStudio es una aplicación que permite crear facturas fácilmente a partir de datos de tableros de Monday.com.

### Permisos Necesarios

Por favor, habilite los siguientes permisos en Monday.com Developer Center:
- `boards:read` - Lectura de datos del tablero

### Idiomas Soportados

- Japonés
- Inglés
- Español

---

## Uso Básico

### Paso 1: Iniciar Aplicación y Cargar Datos

1. Abra la aplicación InvoiceStudio en un tablero de Monday.com
2. La aplicación obtendrá automáticamente los elementos del tablero
3. Si los datos no se muestran, por favor recargue la página

**Nota**: El botón "Cargar Datos" ha sido eliminado. Para recargar los datos, por favor recargue la página.

### Paso 2: Seleccionar Elemento

1. Seleccione el elemento para el que desea crear una factura desde la lista de elementos (seleccione usando la casilla de verificación)
2. Puede filtrar elementos por nombre de elemento o nombre de grupo usando la función de búsqueda
3. Puede filtrar elementos por grupo usando el filtro de grupo
4. Haga clic en el botón "Crear Factura" para proceder a la pantalla de edición

### Paso 3: Editar Factura

1. La información del elemento seleccionado se completará automáticamente
2. Haga clic en el botón **Mapeo de Campos** para configurar las asignaciones entre las columnas del tablero de Monday.com y los campos de factura (recomendado para la configuración inicial)
3. Edite la siguiente información según sea necesario:
   - Información básica (número de factura, fecha de factura, fecha de vencimiento, etc.)
   - Información del emisor (nombre de la empresa, representante, dirección, información de contacto, etc.)
   - Información de facturación (nombre de la empresa, departamento, persona de contacto, dirección, información de contacto, etc.)
   - Artículos de línea (nombre del artículo, cantidad, precio unitario, etc.) - obtenidos automáticamente de subelementos
   - Información de pago (nombre del banco, información de cuenta, etc.)
   - Notas
   - Configuración de imágenes (logo de la empresa, firma/sello, marca de agua de fondo)

### Paso 4: Descargar

#### Descargar como HTML

1. Navegue a la pestaña "Descargar"
2. Previsualice la apariencia de la factura
3. Haga clic en el botón "Descargar HTML"
4. Se descargará un archivo HTML

#### Guardar como PDF

1. Descargue un archivo HTML usando el botón "Descargar HTML"
2. Abra el archivo HTML descargado en un navegador
3. Seleccione "Imprimir" desde el menú del navegador (Windows: Ctrl+P / Mac: Cmd+P)
4. En el diálogo de impresión, cambie "Destino" o "Guardar en" a "Guardar como PDF"
5. Haga clic en "Guardar" o "Guardar como PDF"
6. Se guardará un archivo PDF

**Nota**: El procedimiento puede variar según el navegador. Puede guardar como PDF en todos los navegadores principales, incluidos Chrome, Firefox, Safari y Edge.

---

## Mapeo de Campos

La función de mapeo de campos permite mapear columnas del tablero de Monday.com a campos de factura.

### Configurar Mapeo de Campos

1. Haga clic en el botón "Mapeo de Campos" en la pantalla de edición de factura
2. Seleccione una columna del tablero de Monday.com para cada campo de factura
3. También puede mapear el precio y la cantidad de subelementos
4. Haga clic en "Guardar" para guardar las asignaciones y recargar automáticamente los datos del elemento seleccionado

### Campos Mapeables

- **Información Básica**
  - Número de Factura
  - Fecha de Factura

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

### Uso de IDs de Columna Personalizados

Cuando use columnas personalizadas de un tablero de Monday.com:
1. Seleccione "ID de Columna Personalizada (Entrada Directa)" en el mapeo de campos
2. Ingrese el ID de columna directamente (ejemplo: `text_mkwjtrys`)

---

## Gestión de Plantillas

La función de plantilla permite guardar y reutilizar información del emisor e información de pago.

### Crear una Plantilla

1. Haga clic en el botón "Gestión de Plantillas"
2. Haga clic en "Nuevo"
3. Ingrese un nombre de plantilla
4. Ingrese información del emisor e información de pago
5. Haga clic en "Guardar"

### Aplicar una Plantilla

1. En la pantalla de edición de factura, seleccione una plantilla guardada desde "Aplicar Plantilla"
2. La información de la plantilla (información del emisor e información de pago) se completará automáticamente

### Editar/Eliminar Plantillas

1. Haga clic en el botón "Gestión de Plantillas"
2. Seleccione la plantilla que desea editar
3. Edite la información y haga clic en "Guardar"
4. Haga clic en el botón "Eliminar" para eliminar

---

## Personalización de Facturas

### Selección de Plantilla

- **Moderno**: Diseño simple y refinado
- **Clásico**: Estilo de factura tradicional
- **Minimalista**: Diseño simple y legible

### Cambiar Color de Plantilla

1. Seleccione un color desde "Color de Plantilla"
2. El encabezado de la factura y los colores de acento cambiarán

### Agregar Imágenes

- **Logo de la Empresa**: Se muestra en el encabezado de la factura
- **Firma/Sello**: Se muestra en el pie de página de la factura
- **Marca de Agua de Fondo**: Se muestra en el fondo de la factura

### Mostrar/Ocultar Secciones

Puede alternar la visualización de cada sección (emisor, facturación, información de pago, notas, configuración de imágenes).

---

## Preguntas Frecuentes

### P: No se pueden recuperar datos

**R:** Por favor, verifique lo siguiente:
1. ¿Está habilitado el permiso `boards:read` en Monday.com Developer Center?
2. ¿Existen elementos en el tablero?
3. Intente recargar la página (los datos se cargan automáticamente)
4. Verifique errores en la consola del navegador (F12)

### P: El mapeo de campos no se refleja

**R:** Por favor, verifique lo siguiente:
1. ¿Guardó el mapeo de campos?
2. ¿La columna mapeada contiene datos?
3. ¿El ID de columna personalizado es correcto?

### P: No se pueden recuperar datos de tipos de columna específicos

**R:** Debido a las especificaciones de la API de Monday.com, no se pueden recuperar datos de los siguientes tipos de columna:

- **Columna de Fórmula**: Las columnas de fórmula muestran resultados de cálculo, por lo que no se pueden recuperar datos directamente de la API de Monday.com. Si desea recuperar valores de columnas de fórmula, por favor mapee las columnas que son la fuente de la fórmula.

- **Columna Espejo con Columna de Fórmula como Fuente de Datos**: Tampoco se pueden recuperar datos de columnas espejo que hacen referencia a columnas de fórmula. Debido a las limitaciones de las columnas de fórmula, no se pueden recuperar valores de las columnas espejo.

- **Columna de Conexión (Conexión de Tablero)**: Las columnas de conexión (tipo `board_relation`) no pueden recuperar los nombres (títulos) de los elementos conectados. Esta es una limitación de la API de Monday.com. Cuando use columnas de conexión, por favor establezca los valores manualmente.

### P: El diseño de la factura está roto

**R:** Por favor, verifique lo siguiente:
1. Desactive la opción "Ajustar a Una Página"
2. Cambie el tamaño del papel (A4, Letter, etc.)
3. Ajuste los tamaños de las imágenes

### P: Las plantillas no se guardan

**R:** Por favor, verifique lo siguiente:
1. ¿Se ingresó el nombre de la plantilla?
2. ¿Está habilitado el almacenamiento local del navegador?
3. ¿No está usando modo privado (modo incógnito)?

### P: Sobre el soporte multilingüe

**R:** Puede cambiar entre japonés, inglés y español desde la selección de idioma en la parte superior de la aplicación. Todos los elementos de la interfaz de usuario y las plantillas de factura se mostrarán en el idioma seleccionado.

---

## Soporte

Si su problema no se resuelve, por favor contacte al servicio de soporte de Monday.com Developer Center.

---

**Última actualización**: 2024

