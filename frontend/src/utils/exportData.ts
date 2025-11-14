import type { Load } from '../types/load.types';
import type { ConversationMessage } from '../types/message.types';
import type { Shipment } from '../types/shipment.types';
import type { InvoicePreview } from '../types/billing.types';

type CsvRow = Record<string, unknown>;

const getParticipantValue = (
  participant: ConversationMessage['sender'],
  field: 'company' | 'email'
): string => {
  if (!participant) return '';
  if (typeof participant === 'string') {
    return field === 'email' ? participant : '';
  }
  return participant[field] ?? '';
};

const getParticipantDisplay = (participant: ConversationMessage['sender']): string => {
  if (!participant) return '';
  if (typeof participant === 'string') return participant;
  return participant.company || participant.email || '';
};

export const arrayToCSV = (data: CsvRow[], headers?: string[]): string => {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create CSV data rows
  const dataRows = data.map((row) => {
    return csvHeaders.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      return stringValue.includes(',') || stringValue.includes('"')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export loads to CSV
 */
export const exportLoadsToCSV = (loads: Load[]): void => {
  const headers = [
    'title',
    'origin',
    'destination',
    'pickupDate',
    'deliveryDate',
    'equipmentType',
    'weight',
    'rate',
    'distance',
    'status',
    'postedBy'
  ];

  const csvData = loads.map((load) => ({
    title: load.title,
    origin: `${load.origin?.city}, ${load.origin?.state}`,
    destination: `${load.destination?.city}, ${load.destination?.state}`,
    pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : '',
    deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : '',
    equipmentType: load.equipmentType,
    weight: load.weight,
    rate: load.rate,
    distance: load.distance || '',
    status: load.status,
    postedBy: load.postedBy?.company || ''
  }));

  const csv = arrayToCSV(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `loads-export-${timestamp}.csv`);
};

/**
 * Export messages to CSV
 */
export const exportMessagesToCSV = (messages: ConversationMessage[]): void => {
  const headers = ['date', 'from', 'to', 'subject', 'message', 'read'];
  
  const csvData = messages.map((msg) => ({
    date: new Date(msg.createdAt).toLocaleString(),
    from: getParticipantValue(msg.sender, 'company') || getParticipantValue(msg.sender, 'email'),
    to: getParticipantValue(msg.receiver, 'company') || getParticipantValue(msg.receiver, 'email'),
    subject: msg.subject,
    message: msg.message,
    read: msg.isRead ? 'Yes' : 'No'
  }));

  const csv = arrayToCSV(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `messages-export-${timestamp}.csv`);
};

/**
 * Export shipments to CSV
 */
export const exportShipmentsToCSV = (shipments: Shipment[]): void => {
  const headers = [
    'shipmentId',
    'title',
    'pickup',
    'delivery',
    'status',
    'createdAt'
  ];

  const csvData = shipments.map((shipment) => ({
    shipmentId: shipment.shipmentId,
    title: shipment.title,
    pickup: `${shipment.pickup?.city}, ${shipment.pickup?.state}`,
    delivery: `${shipment.delivery?.city}, ${shipment.delivery?.state}`,
    status: shipment.status,
    createdAt: new Date(shipment.createdAt).toLocaleDateString()
  }));

  const csv = arrayToCSV(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `shipments-export-${timestamp}.csv`);
};

/**
 * Print current page or specific element
 */
export const printPage = (elementId?: string): void => {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                @media print {
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  } else {
    window.print();
  }
};

/**
 * Format data for print-friendly report
 */
export const formatReportData = (
  data: Load[] | ConversationMessage[] | Shipment[],
  type: 'loads' | 'messages' | 'shipments'
): string => {
  let html = '<table style="width:100%; border-collapse:collapse; margin:20px 0;">';
  
  switch (type) {
    case 'loads':
      html += '<thead><tr style="background:#2563eb; color:white;">';
      html += '<th style="padding:10px; text-align:left;">Title</th>';
      html += '<th style="padding:10px; text-align:left;">Origin</th>';
      html += '<th style="padding:10px; text-align:left;">Destination</th>';
      html += '<th style="padding:10px; text-align:right;">Rate</th>';
      html += '<th style="padding:10px; text-align:left;">Status</th>';
      html += '</tr></thead><tbody>';
      
      (data as Load[]).forEach((load, idx) => {
        const rowColor = idx % 2 === 0 ? '#f9fafb' : 'white';
        html += `<tr style="background:${rowColor};">`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${load.title}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${load.origin?.city}, ${load.origin?.state}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${load.destination?.city}, ${load.destination?.state}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb; text-align:right;">$${load.rate?.toLocaleString()}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${load.status}</td>`;
        html += '</tr>';
      });
      break;
      
    case 'messages':
      html += '<thead><tr style="background:#2563eb; color:white;">';
      html += '<th style="padding:10px; text-align:left;">Date</th>';
      html += '<th style="padding:10px; text-align:left;">From</th>';
      html += '<th style="padding:10px; text-align:left;">Subject</th>';
      html += '<th style="padding:10px; text-align:left;">Read</th>';
      html += '</tr></thead><tbody>';
      
      (data as ConversationMessage[]).forEach((msg, idx) => {
        const rowColor = idx % 2 === 0 ? '#f9fafb' : 'white';
        html += `<tr style="background:${rowColor};">`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${new Date(msg.createdAt).toLocaleString()}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${getParticipantDisplay(msg.sender)}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${msg.subject}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${msg.isRead ? 'Yes' : 'No'}</td>`;
        html += '</tr>';
      });
      break;
      
    case 'shipments':
      html += '<thead><tr style="background:#2563eb; color:white;">';
      html += '<th style="padding:10px; text-align:left;">Shipment ID</th>';
      html += '<th style="padding:10px; text-align:left;">Title</th>';
      html += '<th style="padding:10px; text-align:left;">Pickup</th>';
      html += '<th style="padding:10px; text-align:left;">Delivery</th>';
      html += '<th style="padding:10px; text-align:left;">Status</th>';
      html += '</tr></thead><tbody>';
      
      (data as Shipment[]).forEach((shipment, idx) => {
        const rowColor = idx % 2 === 0 ? '#f9fafb' : 'white';
        html += `<tr style="background:${rowColor};">`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${shipment.shipmentId}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${shipment.title}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${shipment.pickup?.city}, ${shipment.pickup?.state}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${shipment.delivery?.city}, ${shipment.delivery?.state}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${shipment.status}</td>`;
        html += '</tr>';
      });
      break;
  }
  
  html += '</tbody></table>';
  return html;
};

export const exportInvoiceToPDF = (invoice: InvoicePreview): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) {
    return;
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const invoiceHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice Preview - ${invoice.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
          .badge-ready { background: #ecfdf5; color: #047857; }
          .badge-invoiced { background: #eff6ff; color: #1d4ed8; }
          .badge-paid { background: #f0fdf4; color: #166534; }
          h1 { font-size: 28px; margin: 0; }
          h2 { font-size: 20px; margin-top: 0; color: #1d4ed8; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
          th { background: #f9fafb; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; }
          .section { margin-top: 32px; }
          .small { font-size: 12px; color: #6b7280; }
          .notes { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; font-size: 14px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Invoice Preview</h1>
            <p class="small">Generated ${new Date().toLocaleString()}</p>
          </div>
          <div>
            <div class="badge ${invoice.billingStatus === 'ready' ? 'badge-ready' : invoice.billingStatus === 'paid' ? 'badge-paid' : 'badge-invoiced'}">
              ${invoice.billingStatus.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div class="section">
          <h2>${invoice.title}</h2>
          <p>
            Pickup ${new Date(invoice.pickupDate).toLocaleDateString()} • Delivery ${new Date(invoice.deliveryDate).toLocaleDateString()}
            ${typeof invoice.distance === 'number' ? ` • ${invoice.distance.toLocaleString()} miles` : ''}
          </p>
        </div>

        <div class="section">
          <table>
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Rate</th>
                ${
                  typeof invoice.distance === 'number'
                    ? '<th>Quantity</th><th>Amount</th>'
                    : '<th>Amount</th>'
                }
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Line haul (${invoice.rateType === 'per_mile' ? 'Per-mile' : 'Flat rate'})</td>
                <td>${formatCurrency(invoice.agreedRate ?? invoice.rate)}</td>
                ${
                  typeof invoice.distance === 'number'
                    ? `<td>${invoice.distance.toLocaleString()} miles</td><td>${formatCurrency(invoice.totalDue)}</td>`
                    : `<td>${formatCurrency(invoice.totalDue)}</td>`
                }
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Billing Summary</h3>
          <p><strong>Total due:</strong> ${formatCurrency(invoice.totalDue)}</p>
        </div>

        <div class="section">
          <h3>Parties</h3>
          <p><strong>Broker:</strong> ${invoice.broker.company} • ${invoice.broker.email}${invoice.broker.phone ? ` • ${invoice.broker.phone}` : ''}</p>
          ${
            invoice.carrier
              ? `<p><strong>Carrier:</strong> ${invoice.carrier.company} • ${invoice.carrier.email}${invoice.carrier.phone ? ` • ${invoice.carrier.phone}` : ''}</p>`
              : ''
          }
        </div>

        <div class="section">
          <h3>Documents</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoice.documents.length
                  ? invoice.documents
                      .map(
                        (doc) => `
                        <tr>
                          <td>${doc.originalName}</td>
                          <td>${doc.type}</td>
                          <td>${new Date(doc.uploadedAt).toLocaleDateString()}</td>
                          <td>${doc.isVerified ? 'Verified' : 'Pending'}</td>
                        </tr>`
                      )
                      .join('')
                  : '<tr><td colspan="4">No documents linked to this load.</td></tr>'
              }
            </tbody>
          </table>
        </div>

        ${
          invoice.bookingNotes
            ? `<div class="section">
                <h3>Booking Notes</h3>
                <div class="notes">${invoice.bookingNotes}</div>
              </div>`
            : ''
        }
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const escapeHtml = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const exportRecordsToPDF = (title: string, records: Record<string, unknown>[]): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) return;

  if (!records.length) {
    printWindow.document.write('<p style="font-family: Arial, sans-serif; padding: 24px;">No records available.</p>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }

  const headers = Object.keys(records[0]);
  const tableHeader = headers
    .map(
      (header) =>
        `<th style="padding:10px; text-align:left; border-bottom:1px solid #e5e7eb; background:#1f2937; color:#f9fafb; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">${escapeHtml(
          header,
        )}</th>`,
    )
    .join('');

  const tableRows = records
    .map((record, rowIndex) => {
      const rowColor = rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
      const cells = headers
        .map(
          (header) =>
            `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${escapeHtml(
              (record as Record<string, unknown>)[header],
            )}</td>`,
        )
        .join('');
      return `<tr style="background:${rowColor};">${cells}</tr>`;
    })
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1f2937; }
          h1 { font-size: 26px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>
          <thead>
            <tr>
              ${tableHeader}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

