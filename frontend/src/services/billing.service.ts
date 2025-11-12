import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { InvoicePreview } from '../types/billing.types';

export const billingService = {
  async getReadyInvoices(): Promise<ApiResponse<InvoicePreview[]>> {
    const response = await api.get<ApiResponse<InvoicePreview[]>>('/billing/invoices/ready');
    return response.data;
  },

  async previewInvoice(loadId: string): Promise<ApiResponse<InvoicePreview>> {
    const response = await api.get<ApiResponse<InvoicePreview>>(`/billing/invoices/load/${loadId}/preview`);
    return response.data;
  },
};

