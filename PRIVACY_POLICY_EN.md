# InvoiceStudio Privacy Policy

**Last Updated**: January 2026

## 1. Introduction

InvoiceStudio (the "App") is an invoice creation application that runs on Monday.com. This Privacy Policy explains how the App collects, uses, and stores data.

## 2. Data Collection and Use

### 2.1. Data Retrieval from Monday.com

The App uses Monday.com's GraphQL API to read the following data:

- Board items (ID, name, column values)
- Subitems (ID, name, column values)
- Various data necessary for invoice generation (client name, date, amount, etc.)

**Important**: The App is **read-only**. It does not modify or delete Monday.com data.

### 2.2. Authentication Information

The App uses short-lived tokens (sessionToken) provided by Monday.com to access Monday.com's API.

**In production environments, personal API tokens are never used.**

## 3. Data Storage

### 3.1. Local Storage (Browser)

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

### 3.2. Data Transmission to Servers

**The App does not have our own servers and does not transmit data to external servers.**

The following data is never stored or transmitted:

- Monday.com authentication tokens
- Invoice content
- Personal information (client names, contact information, etc.)
- Monday.com board data

## 4. Data Sharing

The App does not share data with third parties. All data processing is performed locally in the user's browser.

## 5. Data Deletion

### 5.1. Local Storage Deletion

Users can delete stored data by clearing `localStorage` in their browser settings.

### 5.2. Monday.com Data

The App does not modify or delete Monday.com data. Please delete Monday.com data on Monday.com.

## 6. Security

The App implements the following security measures:

- **HTTPS Communication**: All communications are encrypted via HTTPS
- **Token Protection**: Authentication tokens are only kept in memory and are not logged
- **No Personal Information Storage**: Personal information is never stored on servers

## 7. Third-Party Services

The App uses the following third-party services:

- **Monday.com**: Source of data (Monday.com's Privacy Policy applies)
- **Vercel**: Hosting service (only for static file delivery)

For information about data collected by these services, please refer to each service's Privacy Policy.

## 8. Contact

If you have any questions or requests regarding privacy, please contact us through:

- Email: [Support email address to be set]
- Monday.com Developer Center: [App support page URL to be set]

## 9. Privacy Policy Changes

This Privacy Policy may be changed without notice. If there are significant changes, we will notify you through the App or Monday.com Marketplace.

---

**Note**: This Privacy Policy is the English version. Japanese (PRIVACY_POLICY.md) and Spanish (PRIVACY_POLICY_ES.md) versions are also available.

