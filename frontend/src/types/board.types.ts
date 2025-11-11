export interface BoardSearchFilters {
  origin: string;
  destination: string;
  equipmentType: string;
  pickupDate: string;
  minRate?: number;
  maxMiles?: number;
  radiusMiles?: number;
  rateType?: string;
  keywords: string;
  stateShortcut?: string;
}


