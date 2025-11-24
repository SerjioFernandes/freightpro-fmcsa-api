/**
 * Type definitions for MongoDB query filters
 */

import { Types } from 'mongoose';

/**
 * Document filter interface
 */
export interface DocumentFilter {
  userId: Types.ObjectId | string;
  type?: string;
  loadId?: string | Types.ObjectId;
  shipmentId?: string | Types.ObjectId;
  tags?: string | { $in: string[] };
}

/**
 * Load query filter interface
 */
export interface LoadQueryFilter {
  status: string;
  isInterstate?: boolean;
  equipmentType?: string | { $in: string[] };
  origin?: {
    city?: string | { $regex: string; $options: string };
    state?: string;
  };
  destination?: {
    city?: string | { $regex: string; $options: string };
    state?: string;
  };
  rate?: {
    $gte?: number;
    $lte?: number;
  };
  postedBy?: Types.ObjectId | string;
  bookedBy?: Types.ObjectId | string;
}

/**
 * Saved search filter interface
 */
export interface SavedSearchFilter {
  equipment?: string[];
  origin?: {
    city?: string;
    state?: string;
  };
  destination?: {
    city?: string;
    state?: string;
  };
  rateMin?: number;
  rateMax?: number;
}

/**
 * Notification filter interface
 */
export interface NotificationFilter {
  userId?: Types.ObjectId | string;
  isRead?: boolean;
  type?: string;
  isImportant?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

/**
 * Shipment query filter interface
 */
export interface ShipmentQueryFilter {
  postedBy?: Types.ObjectId | string;
  shipperId?: Types.ObjectId | string;
  brokerId?: Types.ObjectId | string;
  status?: string | { $in: string[] };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

