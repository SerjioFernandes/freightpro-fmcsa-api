// Validation Patterns
export const VALIDATION_PATTERNS = {
  EIN: /^\d{2}-\d{7}$/,
  MC_NUMBER: /^(MC-)?\d{6,7}$/i,
  USDOT_NUMBER: /^\d{6,8}$/,
  PHONE: /^\+?1?\s*\(?\d{3}\)?[\s\.\-]?\d{3}[\s\.\-]?\d{4}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  US_ZIP: /^\d{5}(-\d{4})?$/,
  CA_POSTAL: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
};

// US States
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Canadian Provinces
export const CA_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};




