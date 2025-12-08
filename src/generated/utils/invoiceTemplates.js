import { translations } from './translations';

export const generateInvoiceHTML = (data, lang, template, pageSize = 'a4', fitToOnePage = true, customColor = null) => {
  const t = translations[lang];
  const itemCount = data.items?.length || 0;
  const styles = getTemplateStyles(template, itemCount, pageSize, fitToOnePage, customColor);
  
  const getCurrencySymbol = (currency) => {
    const symbols = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', CNY: '¥' };
    return symbols[currency] || '¥';
  };
  const currencySymbol = getCurrencySymbol(data.currency);
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t.invoice} - ${data.invoiceNumber}</title>
  <style>${styles}</style>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</head>
<body>
  ${data.watermarkImage ? `<div class="watermark"><img src="${data.watermarkImage}" alt="Watermark" /></div>` : ''}
  <div class="invoice">
    <div class="header">
      ${data.companyLogo ? `<div class="logo"><img src="${data.companyLogo}" alt="Company Logo" /></div>` : ''}
      <h1>${t.invoice}</h1>
      <div class="invoice-info">
        <p><strong>${t.invoiceNumber}:</strong> ${data.invoiceNumber}</p>
        <p><strong>${t.invoiceDate}:</strong> ${data.invoiceDate}</p>
        ${data.dueDate ? `<p><strong>${t.dueDate}:</strong> ${data.dueDate}</p>` : ''}
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>${t.billingTo}</h3>
        <p><strong>${data.clientName}</strong></p>
        ${data.clientDepartment ? `<p>${data.clientDepartment}</p>` : ''}
        ${data.clientContact ? `<p>${data.clientContact} ${t.sama}</p>` : ''}
        ${data.clientZip ? `<p>${data.clientZip}</p>` : ''}
        ${data.clientAddress ? `<p>${data.clientAddress}</p>` : ''}
        ${data.clientPhone ? `<p>${data.clientPhone}</p>` : ''}
        ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
      </div>
      <div class="party">
        <h3>${t.billingFrom}</h3>
        <div class="party-with-signature">
          <div class="party-info">
            <p><strong>${data.companyName}</strong></p>
            ${data.companyRep ? `<p>${data.companyRep}</p>` : ''}
            ${data.companyZip ? `<p>${data.companyZip}</p>` : ''}
            ${data.companyAddress ? `<p>${data.companyAddress}</p>` : ''}
            ${data.companyPhone ? `<p>${data.companyPhone}</p>` : ''}
            ${data.companyFax ? `<p>${data.companyFax}</p>` : ''}
            ${data.companyEmail ? `<p>${data.companyEmail}</p>` : ''}
            ${data.companyRegNumber ? `<p style="font-size: 11px;">${t.registrationNumber}: ${data.companyRegNumber}</p>` : ''}
          </div>
          ${data.signatureImage ? `<img src="${data.signatureImage}" alt="Signature" class="signature" />` : ''}
        </div>
      </div>
    </div>

    <div class="invoice-message">
      <p>${t.invoiceMessage}</p>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>${t.description}</th>
          <th>${t.quantity}</th>
          <th>${t.unitPrice}</th>
          <th>${t.amount}</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${currencySymbol}${item.price.toLocaleString()}</td>
            <td>${currencySymbol}${(item.quantity * item.price).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>${t.subtotal}:</span><span>${currencySymbol}${data.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>${t.discount}:</span><span>-${currencySymbol}${data.discount.toLocaleString()}</span></div>
      <div class="total-row"><span>${t.tax} (${data.taxRate}%):</span><span>${currencySymbol}${data.taxAmount.toLocaleString()}</span></div>
      <div class="total-row final"><span>${t.total}:</span><span>${currencySymbol}${data.total.toLocaleString()}</span></div>
    </div>

    ${data.bankName ? `
    <div class="payment-info">
      <h4>${t.paymentInfo}</h4>
      <p>${t.bankName}: ${data.bankName}</p>
      <p>${t.accountType}: ${data.accountType} ${t.accountNumber}: ${data.accountNumber}</p>
      <p>${t.accountHolder}: ${data.accountHolder}</p>
    </div>` : ''}

    ${data.notes ? `<div class="notes"><h4>${t.notes}</h4><p style="white-space: pre-wrap;">${data.notes}</p></div>` : ''}
  </div>
</body>
</html>`;
};

const getTemplateStyles = (template, itemCount = 0, pageSize = 'a4', fitToOnePage = true, customColor = null) => {
  // Get template color
  const getTemplateColor = () => {
    if (customColor) return customColor;
    if (template === 'modern') return '#2563eb';
    if (template === 'classic') return '#1a1a1a';
    return '#666666';
  };
  const primaryColor = getTemplateColor();

  // Dynamic sizing based on item count and fit-to-page setting
  const getFontScale = () => {
    if (!fitToOnePage) return 1.0;
    if (itemCount <= 3) return 0.92;
    if (itemCount <= 5) return 0.82;
    if (itemCount <= 8) return 0.72;
    if (itemCount <= 12) return 0.62;
    if (itemCount <= 16) return 0.52;
    return 0.45;
  };

  const getPaddingScale = () => {
    if (!fitToOnePage) return 1.0;
    if (itemCount <= 3) return 0.85;
    if (itemCount <= 5) return 0.70;
    if (itemCount <= 8) return 0.55;
    if (itemCount <= 12) return 0.42;
    if (itemCount <= 16) return 0.32;
    return 0.25;
  };

  const scale = getFontScale();
  const paddingScale = getPaddingScale();
  
  // Page size settings
  const pageSizeCSS = pageSize === 'letter' ? 'letter' : 'A4';
  const pageWidth = pageSize === 'letter' ? '8.5in' : '210mm';
  const pageHeight = pageSize === 'letter' ? '11in' : '297mm';
  
  const base = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: ${pageSizeCSS}; margin: ${fitToOnePage ? '10mm' : '15mm'}; }
    @media print {
      body { margin: 0; padding: 0; }
      .invoice { page-break-after: avoid; }
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.1;
      z-index: -1;
      pointer-events: none;
    }
    .watermark img {
      max-width: ${fitToOnePage ? '350px' : '500px'};
      max-height: ${fitToOnePage ? '350px' : '500px'};
      width: auto;
      height: auto;
    }
    .logo {
      text-align: center;
      margin-bottom: ${fitToOnePage ? Math.max(5, 12 * paddingScale) : 15}px;
    }
    .logo img {
      max-width: ${fitToOnePage ? '200px' : '300px'};
      max-height: ${fitToOnePage ? '50px' : '80px'};
      height: auto;
    }
    .party-with-signature {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: ${fitToOnePage ? '6px' : '10px'};
    }
    .party-info {
      flex: 1;
    }
    .signature {
      max-width: ${fitToOnePage ? (itemCount > 10 ? 60 : 75) : 120}px;
      max-height: ${fitToOnePage ? (itemCount > 10 ? 30 : 40) : 70}px;
      height: auto;
      flex-shrink: 0;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: ${14 * scale}px;
      padding: ${fitToOnePage ? Math.max(10, 20 * paddingScale) : 30}px;
      color: #333;
      line-height: ${fitToOnePage ? 1.2 : 1.4};
    }
    .invoice {
      max-width: ${pageWidth};
      ${fitToOnePage ? `height: ${pageHeight}; overflow: hidden;` : ''}
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .header {
      text-align: center;
      margin-bottom: ${fitToOnePage ? Math.max(8, 18 * paddingScale) : 25}px;
      padding-bottom: ${fitToOnePage ? Math.max(5, 10 * paddingScale) : 15}px;
    }
    .header h1 {
      font-size: ${28 * scale}px;
      margin-bottom: ${fitToOnePage ? Math.max(4, 8 * paddingScale) : 10}px;
      line-height: 1.1;
    }
    .invoice-info {
      margin-top: ${fitToOnePage ? Math.max(4, 8 * paddingScale) : 12}px;
      font-size: ${12 * scale}px;
      line-height: 1.3;
    }
    .invoice-info p {
      margin: ${fitToOnePage ? Math.max(1, 2 * paddingScale) : 3}px 0;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: ${fitToOnePage ? Math.max(10, 18 * paddingScale) : 25}px;
      font-size: ${12 * scale}px;
    }
    .party {
      flex: 1;
      line-height: 1.35;
    }
    .party h3 {
      margin-bottom: ${fitToOnePage ? Math.max(3, 6 * paddingScale) : 8}px;
      font-size: ${14 * scale}px;
    }
    .party p {
      margin: ${fitToOnePage ? Math.max(1, 1.5 * paddingScale) : 2}px 0;
    }
    .invoice-message {
      margin: ${fitToOnePage ? Math.max(5, 8 * paddingScale) : 12}px 0;
      padding: ${fitToOnePage ? Math.max(4, 7 * paddingScale) : 10}px;
      background: #f8f9fa;
      border-left: ${fitToOnePage ? '2px' : '3px'} solid #2563eb;
      font-weight: 500;
      font-size: ${12 * scale}px;
    }
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: ${fitToOnePage ? Math.max(8, 14 * paddingScale) : 20}px;
      font-size: ${12 * scale}px;
    }
    table.items th, table.items td {
      padding: ${fitToOnePage ? Math.max(2, 5 * paddingScale) : 8}px ${fitToOnePage ? Math.max(2, 4 * paddingScale) : 6}px;
      text-align: left;
      line-height: 1.2;
    }
    table.items th {
      font-size: ${11 * scale}px;
      font-weight: 600;
    }
    table.items thead { background: #f5f5f5; }
    table.items tbody tr:nth-child(even) { background: #fafafa; }
    .totals {
      margin-left: auto;
      width: ${fitToOnePage ? '220px' : '280px'};
      font-size: ${13 * scale}px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: ${fitToOnePage ? Math.max(2, 4 * paddingScale) : 6}px 0;
    }
    .total-row.final {
      font-weight: bold;
      font-size: ${16 * scale}px;
      border-top: 2px solid #333;
      padding-top: ${fitToOnePage ? Math.max(4, 6 * paddingScale) : 10}px;
      margin-top: ${fitToOnePage ? Math.max(2, 4 * paddingScale) : 6}px;
    }
    .payment-info {
      margin-top: ${fitToOnePage ? Math.max(6, 12 * paddingScale) : 20}px;
      padding: ${fitToOnePage ? Math.max(6, 10 * paddingScale) : 15}px;
      background: #f0f7ff;
      border: 1px solid #2563eb;
      border-radius: ${fitToOnePage ? '3px' : '6px'};
      font-size: ${11 * scale}px;
    }
    .payment-info h4 {
      margin-bottom: ${fitToOnePage ? Math.max(3, 5 * paddingScale) : 8}px;
      color: #2563eb;
      font-size: ${13 * scale}px;
    }
    .payment-info p {
      margin: ${fitToOnePage ? Math.max(1, 2 * paddingScale) : 3}px 0;
    }
    .notes {
      margin-top: ${fitToOnePage ? Math.max(6, 10 * paddingScale) : 15}px;
      padding: ${fitToOnePage ? Math.max(6, 10 * paddingScale) : 15}px;
      background: #fff9e6;
      border-left: ${fitToOnePage ? '2px' : '3px'} solid #f59e0b;
      font-size: ${11 * scale}px;
    }
    .notes h4 {
      margin-bottom: ${fitToOnePage ? Math.max(3, 5 * paddingScale) : 8}px;
      font-size: ${13 * scale}px;
    }
  `;

  if (template === 'modern') {
    return base + `
      .header h1 { color: ${primaryColor}; font-size: 2.5em; }
      .header { border-bottom: 2px solid ${primaryColor}; }
      table.items { border: 2px solid ${primaryColor}; }
      table.items thead { background: ${primaryColor}; color: white; }
      .invoice-message { border-left-color: ${primaryColor}; }
      .payment-info { border-color: ${primaryColor}; }
      .payment-info h4 { color: ${primaryColor}; }
    `;
  } else if (template === 'classic') {
    return base + `
      .header { border-bottom: 3px double ${primaryColor}; }
      .header h1 { font-family: 'Times New Roman', serif; font-size: 2em; color: ${primaryColor}; }
      table.items { border: 1px solid ${primaryColor}; }
      table.items thead { border-bottom: 2px solid ${primaryColor}; }
      .invoice-message { border-left-color: ${primaryColor}; }
    `;
  } else {
    return base + `
      .header h1 { font-weight: 300; font-size: 2em; color: ${primaryColor}; }
      .header { border-bottom: 1px solid ${primaryColor}; }
      table.items { border-top: 1px solid ${primaryColor}; border-bottom: 1px solid ${primaryColor}; }
      table.items thead { background: white; border-bottom: 2px solid ${primaryColor}; }
      .invoice-message { border-left-color: ${primaryColor}; }
    `;
  }
};
