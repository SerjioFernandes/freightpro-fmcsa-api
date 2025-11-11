export type DocumentType =
  | 'BOL'
  | 'POD'
  | 'INSURANCE'
  | 'LICENSE'
  | 'CARRIER_AUTHORITY'
  | 'W9'
  | 'OTHER';

export interface DocumentRecord {
  _id: string;
  userId: string;
  loadId?: string;
  shipmentId?: string;
  type: DocumentType;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  expiresAt?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}



