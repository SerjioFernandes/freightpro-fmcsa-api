import type { ApiResponse, PaginationParams } from '../types/api.types';
import type { Shipment, ShipmentFormData, ShipmentRequest, ShipmentRequestFormData } from '../types/shipment.types';
import api from './api';

export interface ShipmentListPayload {
  shipments: Shipment[];
  pagination: PaginationParams;
}

export interface ShipmentRequestListPayload {
  requests: ShipmentRequest[];
}

export const shipmentService = {
  /**
   * Get all shipments
   * Shippers see only their own, brokers see all open shipments
   */
  async getShipments(page = 1, limit = 20, status?: string): Promise<ApiResponse<ShipmentListPayload>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) {
      params.status = status;
    }
    const response = await api.get<ApiResponse<ShipmentListPayload>>('/shipments', { params });
    return response.data;
  },

  /**
   * Get a single shipment by ID
   */
  async getShipment(id: string): Promise<ApiResponse<Shipment>> {
    const response = await api.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Create a new shipment (shippers only)
   */
  async createShipment(data: ShipmentFormData): Promise<ApiResponse<Shipment>> {
    const response = await api.post<ApiResponse<Shipment>>('/shipments', data);
    return response.data;
  },

  /**
   * Update a shipment (shipper who created it only)
   */
  async updateShipment(id: string, data: Partial<ShipmentFormData>): Promise<ApiResponse<Shipment>> {
    const response = await api.put<ApiResponse<Shipment>>(`/shipments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a shipment (shipper who created it only)
   */
  async deleteShipment(id: string): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Get all shipment requests
   * Brokers see their own requests, shippers see requests for their shipments
   */
  async getShipmentRequests(status?: string): Promise<ApiResponse<ShipmentRequestListPayload>> {
    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }
    const response = await api.get<ApiResponse<ShipmentRequestListPayload>>('/shipments/requests/all', { params });
    return response.data;
  },

  /**
   * Request access to a shipment (brokers only)
   */
  async requestAccess(data: ShipmentRequestFormData): Promise<ApiResponse<ShipmentRequest>> {
    // Backend route: POST /api/shipments/:id/request
    // Backend expects shipmentId in body and brokerMessage in body
    const response = await api.post<ApiResponse<ShipmentRequest>>(`/shipments/${data.shipmentId}/request`, {
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
  ): Promise<ApiResponse<ShipmentRequest>> {
    const response = await api.put<ApiResponse<ShipmentRequest>>(`/shipments/requests/${requestId}/status`, {
      status,
      shipperResponse
    });
    return response.data;
  },
};

