// Utility functions for exporting data to CSV and PDF

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data: any[], headers?: string[]): string => {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create CSV data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
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
export const exportLoadsToCSV = (loads: any[]): void => {
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

  const csvData = loads.map(load => ({
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
export const exportMessagesToCSV = (messages: any[]): void => {
  const headers = ['date', 'from', 'to', 'subject', 'message', 'read'];
  
  const csvData = messages.map(msg => ({
    date: new Date(msg.createdAt).toLocaleString(),
    from: msg.sender?.company || msg.sender?.email || '',
    to: msg.receiver?.company || msg.receiver?.email || '',
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
export const exportShipmentsToCSV = (shipments: any[]): void => {
  const headers = [
    'shipmentId',
    'title',
    'pickup',
    'delivery',
    'status',
    'createdAt'
  ];

  const csvData = shipments.map(shipment => ({
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
export const formatReportData = (data: any[], type: 'loads' | 'messages' | 'shipments'): string => {
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
      
      data.forEach((load, idx) => {
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
      
      data.forEach((msg, idx) => {
        const rowColor = idx % 2 === 0 ? '#f9fafb' : 'white';
        html += `<tr style="background:${rowColor};">`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${new Date(msg.createdAt).toLocaleString()}</td>`;
        html += `<td style="padding:10px; border-bottom:1px solid #e5e7eb;">${msg.sender?.company || msg.sender?.email}</td>`;
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
      
      data.forEach((shipment, idx) => {
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

