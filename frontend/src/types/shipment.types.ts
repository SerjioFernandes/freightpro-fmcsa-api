export type ShipmentStatus = 'open' | 'closed';
export type ShipmentRequestStatus = 'pending' | 'approved' | 'rejected';
export type Country = 'US' | 'CA';

export interface Location {
  city: string;
  state: string;
  zip: string;
  country?: Country;
}

export interface Shipment {
  _id: string;
  shipmentId: string;
  title: string;
  description: string;
  pickup: Location;
  delivery: Location;
  status: ShipmentStatus;
  postedBy: {
    _id: string;
    company: string;
    email: string;
    accountType: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ShipmentRequest {
  _id: string;
  shipmentId: {
    _id: string;
    shipmentId: string;
    title: string;
    pickup: Location;
    delivery: Location;
    status: ShipmentStatus;
  };
  brokerId: {
    _id: string;
    company: string;
    email: string;
    accountType: string;
    usdotNumber?: string;
    mcNumber?: string;
  };
  shipperId: {
    _id: string;
    company: string;
    email: string;
    accountType: string;
  };
  brokerMessage: string;
  status: ShipmentRequestStatus;
  requestedAt: string | Date;
  respondedAt?: string | Date;
  shipperResponse?: string;
}

export interface ShipmentFormData {
  title: string;
  description: string;
  pickup: Location;
  delivery: Location;
  status?: ShipmentStatus;
}

export interface ShipmentRequestFormData {
  shipmentId: string;
  brokerMessage?: string;
}

