import mongoose, { Schema, Model } from 'mongoose';

export interface ISavedSearch {
  userId: mongoose.Types.ObjectId;
  name: string;
  filters: {
    equipment: string[];
    priceMin?: number;
    priceMax?: number;
    originState?: string;
    destinationState?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    radius?: number;
  };
  alertEnabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  lastAlertSent?: Date;
  createdAt: Date;
}

const savedSearchSchema = new Schema<ISavedSearch>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  filters: {
    equipment: [{ type: String }],
    priceMin: { type: Number },
    priceMax: { type: Number },
    originState: { type: String },
    destinationState: { type: String },
    dateRange: {
      from: { type: Date },
      to: { type: Date }
    },
    radius: { type: Number }
  },
  alertEnabled: { type: Boolean, default: true },
  frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' },
  lastAlertSent: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
savedSearchSchema.index({ userId: 1, createdAt: -1 });
savedSearchSchema.index({ alertEnabled: 1, frequency: 1, lastAlertSent: 1 });

export const SavedSearch: Model<ISavedSearch> = mongoose.model<ISavedSearch>('SavedSearch', savedSearchSchema);

