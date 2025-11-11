import type { ApiResponse } from '../types/api.types';
import type { DocumentRecord, DocumentType } from '../types/document.types';
import api from './api';

export interface DocumentData {
  type: DocumentType;
  loadId?: string;
  shipmentId?: string;
  file: File;
}

export interface DocumentListParams {
  type?: DocumentType;
  loadId?: string;
  shipmentId?: string;
}

export const documentService = {
  async uploadDocument(formData: FormData): Promise<ApiResponse<DocumentRecord>> {
    const response = await api.post<ApiResponse<DocumentRecord>>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async listDocuments(params?: DocumentListParams): Promise<ApiResponse<DocumentRecord[]>> {
    const response = await api.get<ApiResponse<DocumentRecord[]>>('/documents', { params });
    return response.data;
  },

  async getDocument(id: string): Promise<ApiResponse<DocumentRecord>> {
    const response = await api.get<ApiResponse<DocumentRecord>>(`/documents/${id}`);
    return response.data;
  },

  async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get<Blob>(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>(`/documents/${id}`);
    return response.data;
  },

  async linkToLoad(documentId: string, loadId: string): Promise<ApiResponse<DocumentRecord>> {
    const response = await api.put<ApiResponse<DocumentRecord>>(`/documents/${documentId}/link-load`, { loadId });
    return response.data;
  },

  async linkToShipment(documentId: string, shipmentId: string): Promise<ApiResponse<DocumentRecord>> {
    const response = await api.put<ApiResponse<DocumentRecord>>(`/documents/${documentId}/link-shipment`, { shipmentId });
    return response.data;
  }
};
