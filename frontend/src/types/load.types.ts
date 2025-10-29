export type LoadStatus = 'available' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';
export type Country = 'US' | 'CA';

export interface Location {
  city: string;
  state: string;
  zip: string;
  country: Country;
}

export interface Load {
  _id: string;
  title: string;
  description: string;
  origin: Location;
  destination: Location;
  pickupDate: string | Date;
  deliveryDate: string | Date;
  equipmentType: string;
  weight: number;
  rate: number;
  rateType: 'per_mile' | 'flat_rate';
  distance?: number;
  status: LoadStatus;
  shipmentId?: string;
  unlinked: boolean;
  postedBy: {
    _id: string;
    company: string;
    email: string;
    accountType: string;
  };
  bookedBy?: {
    _id: string;
    company: string;
    email: string;
  };
  isInterstate: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LoadFormData {
  title: string;
  description: string;
  origin: Location;
  destination: Location;
  pickupDate: string;
  deliveryDate: string;
  equipmentType: string;
  weight: number;
  rate: number;
  rateType: 'per_mile' | 'flat_rate';
  distance?: number;
  shipmentId?: string;
}




