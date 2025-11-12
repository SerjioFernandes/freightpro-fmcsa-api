import validator from 'validator';

/**
 * Normalizes email addresses consistently across the application.
 * Mirrors express-validator's default normalizeEmail behaviour while
 * providing a fallback for providers that aren't explicitly handled.
 */
export const normalizeEmailAddress = (email: string): string => {
  if (!email || typeof email !== 'string') return '';

  const normalizedRaw = validator.normalizeEmail(email, {
    gmail_remove_dots: true,
    gmail_remove_subaddress: true,
    outlookdotcom_remove_subaddress: true,
    yahoo_remove_subaddress: true,
    icloud_remove_subaddress: true,
  });

  if (typeof normalizedRaw === 'string') {
    return normalizedRaw;
  }

  return email.trim().toLowerCase();
};


