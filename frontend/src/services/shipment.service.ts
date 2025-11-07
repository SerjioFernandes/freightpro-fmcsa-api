import api from './api';
import type { Shipment, ShipmentRequest, ShipmentFormData, ShipmentRequestFormData } from '../types/shipment.types';
// import type { PaginatedResponse } from '../types/api.types';

export interface ShipmentsResponse {
  success: boolean;
  shipments: Shipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ShipmentResponse {
  success: boolean;
  shipment: Shipment;
  message?: string;
}

export interface ShipmentRequestsResponse {
  success: boolean;
  requests: ShipmentRequest[];
}

export interface ShipmentRequestResponse {
  success: boolean;
  request: ShipmentRequest;
  message?: string;
}

export const shipmentService = {
  /**
   * Get all shipments
   * Shippers see only their own, brokers see all open shipments
   */
  async getShipments(page = 1, limit = 20, status?: string): Promise<ShipmentsResponse> {
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }
    const response = await api.get('/shipments', { params });
    return response.data;
  },

  /**
   * Get a single shipment by ID
   */
  async getShipment(id: string): Promise<ShipmentResponse> {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Create a new shipment (shippers only)
   */
  async createShipment(data: ShipmentFormData): Promise<ShipmentResponse> {
    const response = await api.post('/shipments', data);
    return response.data;
  },

  /**
   * Update a shipment (shipper who created it only)
   */
  async updateShipment(id: string, data: Partial<ShipmentFormData>): Promise<ShipmentResponse> {
    const response = await api.put(`/shipments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a shipment (shipper who created it only)
   */
  async deleteShipment(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Get all shipment requests
   * Brokers see their own requests, shippers see requests for their shipments
   */
  async getShipmentRequests(status?: string): Promise<ShipmentRequestsResponse> {
    const params: any = {};
    if (status) {
      params.status = status;
    }
    const response = await api.get('/shipments/requests/all', { params });
    return response.data;
  },

  /**
   * Request access to a shipment (brokers only)
   */
  async requestAccess(data: ShipmentRequestFormData): Promise<ShipmentRequestResponse> {
    // Backend route: POST /api/shipments/:id/request
    // Backend expects shipmentId in body and brokerMessage in body
    const response = await api.post(`/shipments/${data.shipmentId}/request`, {
      shipmentId: data.shipmentId,
      brokerMessage: data.brokerMessage || ''
    });
    return response.data;
  },

  /**
   * Update shipment request status (shippers only)
   * Status can be 'approved' or 'rejected'
   */
  async updateRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    shipperResponse?: string
  ): Promise<ShipmentRequestResponse> {
    const response = await api.put(`/shipments/requests/${requestId}/status`, {
      status,
      shipperResponse
    });
    return response.data;
  },
};

