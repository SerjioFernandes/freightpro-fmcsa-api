import api from './api';

export interface DocumentData {
  type: string;
  loadId?: string;
  shipmentId?: string;
  file: File;
}

export const documentService = {
  async uploadDocument(formData: FormData): Promise<any> {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async listDocuments(params?: { type?: string; loadId?: string; shipmentId?: string }): Promise<any> {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  async getDocument(id: string): Promise<any> {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<any> {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  async linkToLoad(documentId: string, loadId: string): Promise<any> {
    const response = await api.put(`/documents/${documentId}/link-load`, { loadId });
    return response.data;
  },

  async linkToShipment(documentId: string, shipmentId: string): Promise<any> {
    const response = await api.put(`/documents/${documentId}/link-shipment`, { shipmentId });
    return response.data;
  }
};

