export interface InvoiceDocumentSummary {
  id: string;
  originalName: string;
  type: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface InvoicePreview {
  loadId: string;
  title: string;
  pickupDate: string;
  deliveryDate: string;
  rateType: 'per_mile' | 'flat_rate';
  rate: number;
  agreedRate?: number;
  distance?: number | null;
  totalDue: number;
  billingStatus: 'not_ready' | 'ready' | 'invoiced' | 'paid';
  broker: {
    company: string;
    email: string;
    phone: string;
  };
  carrier?: {
    company: string;
    email: string;
    phone: string;
  };
  documents: InvoiceDocumentSummary[];
  bookingNotes?: string;
}

