# InvoiceStudio - User Manual

**Last Updated**: 2024

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)
3. [Field Mapping](#field-mapping)
4. [Template Management](#template-management)
5. [Invoice Customization](#invoice-customization)
6. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

InvoiceStudio is an application that makes it easy to create invoices from Monday.com board data.

### Required Permissions

Please enable the following permissions in Monday.com Developer Center:
- `boards:read` - Read board data

### Supported Languages

- Japanese
- English
- Spanish

---

## Basic Usage

### Step 1: Launch App and Load Data

1. Open the InvoiceStudio app in a Monday.com board
2. The app will automatically fetch items from the board
3. If data is not displayed, please reload the page

**Note**: The "Load Data" button has been removed. To reload data, please reload the page.

### Step 2: Select Item

1. Select the item you want to create an invoice for from the item list (select using checkbox)
2. You can filter items by item name or group name using the search function
3. You can filter items by group using the group filter
4. Click the "Create Invoice" button to proceed to the edit screen

### Step 3: Edit Invoice

1. Information from the selected item will be automatically filled in
2. Click the **Field Mapping** button to configure mappings between Monday.com board columns and invoice fields (recommended for first-time setup)
3. Edit the following information as needed:
   - Basic information (invoice number, invoice date, due date, etc.)
   - Issuer information (company name, representative, address, contact information, etc.)
   - Billing information (company name, department, contact person, address, contact information, etc.)
   - Line items (item name, quantity, unit price, etc.) - automatically retrieved from subitems
   - Payment information (bank name, account information, etc.)
   - Notes
   - Image settings (company logo, signature/seal, background watermark)

### Step 4: Download

#### Download as HTML

1. Navigate to the "Download" tab
2. Preview the invoice appearance
3. Click the "HTML Download" button
4. An HTML file will be downloaded

#### Save as PDF

1. Download an HTML file using the "HTML Download" button
2. Open the downloaded HTML file in a browser
3. Select "Print" from the browser menu (Windows: Ctrl+P / Mac: Cmd+P)
4. In the print dialog, change "Destination" or "Save to" to "Save as PDF"
5. Click "Save" or "Save as PDF"
6. A PDF file will be saved

**Note**: The procedure may vary depending on the browser. You can save as PDF in all major browsers including Chrome, Firefox, Safari, and Edge.

---

## Field Mapping

The field mapping feature allows you to map Monday.com board columns to invoice fields.

### Setting Field Mapping

1. Click the "Field Mapping" button in the invoice edit screen
2. Select a Monday.com board column for each invoice field
3. You can also map subitem price and quantity
4. Click "Save" to save the mappings and automatically reload the selected item's data

### Mappable Fields

- **Basic Information**
  - Invoice Number
  - Invoice Date

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

### Using Custom Column IDs

When using custom columns from a Monday.com board:
1. Select "Custom Column ID (Direct Input)" in field mapping
2. Enter the column ID directly (e.g., `text_mkwjtrys`)

---

## Template Management

The template feature allows you to save and reuse issuer information and payment information.

### Creating a Template

1. Click the "Template Management" button
2. Click "New"
3. Enter a template name
4. Enter issuer information and payment information
5. Click "Save"

### Applying a Template

1. In the invoice edit screen, select a saved template from "Apply Template"
2. Template information (issuer information and payment information) will be automatically filled in

### Editing/Deleting Templates

1. Click the "Template Management" button
2. Select the template you want to edit
3. Edit the information and click "Save"
4. Click the "Delete" button to delete

---

## Invoice Customization

### Template Selection

- **Modern**: Simple and refined design
- **Classic**: Traditional invoice style
- **Minimal**: Simple and readable design

### Changing Template Color

1. Select a color from "Template Color"
2. The invoice header and accent colors will change

### Adding Images

- **Company Logo**: Displayed in the invoice header
- **Signature/Seal**: Displayed in the invoice footer
- **Background Watermark**: Displayed in the invoice background

### Showing/Hiding Sections

You can toggle the display of each section (issuer, billing, payment information, notes, image settings).

---

## Frequently Asked Questions

### Q: Cannot retrieve data

**A:** Please check the following:
1. Is the `boards:read` permission enabled in Monday.com Developer Center?
2. Do items exist in the board?
3. Try reloading the page (data is automatically loaded)
4. Check for errors in the browser console (F12)

### Q: Field mapping is not reflected

**A:** Please check the following:
1. Did you save the field mapping?
2. Does the mapped column contain data?
3. Is the custom column ID correct?

### Q: Cannot retrieve data from specific column types

**A:** Due to Monday.com API specifications, data cannot be retrieved from the following column types:

- **Formula Column**: Formula columns display calculation results, so data cannot be directly retrieved from Monday.com API. If you want to retrieve formula column values, please map the columns that are the source of the formula.

- **Mirror Column with Formula Column as Data Source**: Data cannot be retrieved from mirror columns that reference formula columns either. Due to formula column limitations, values cannot be retrieved from mirror columns.

- **Connection Column (Board Connection)**: Connection columns (`board_relation` type) cannot retrieve the names (titles) of connected items. This is a limitation of Monday.com API. When using connection columns, please set values manually.

### Q: Invoice layout is broken

**A:** Please check the following:
1. Turn off the "Fit to One Page" option
2. Change the paper size (A4, Letter, etc.)
3. Adjust image sizes

### Q: Templates are not saved

**A:** Please check the following:
1. Is the template name entered?
2. Is browser local storage enabled?
3. Are you not using private mode (incognito mode)?

### Q: About multilingual support

**A:** You can switch between Japanese, English, and Spanish from the language selection at the top of the app. All UI elements and invoice templates will be displayed in the selected language.

---

## Support

If your problem is not resolved, please contact the Monday.com Developer Center support desk.

---

**Last Updated**: 2024

