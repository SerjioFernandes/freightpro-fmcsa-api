import type { AccountType } from '../types/user.types';

/**
 * Permission utility functions for role-based access control
 * Each function checks if a specific account type has permission for an action
 */

/**
 * Check if user can view the Load Board
 * Carriers and Brokers can view loads
 * Shippers cannot view loads
 */
export function canViewLoadBoard(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'carrier' || accountType === 'broker';
}

/**
 * Check if user can post a new load
 * Only Brokers can post loads
 */
export function canPostLoad(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'broker';
}

/**
 * Check if user can book a load
 * Only Carriers can book loads for transport
 */
export function canBookLoad(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'carrier';
}

/**
 * Check if user can create a shipment request
 * Only Shippers can create shipments
 */
export function canCreateShipment(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'shipper';
}

/**
 * Check if user can view shipments
 * Shippers and Brokers can view shipments
 */
export function canViewShipments(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'shipper' || accountType === 'broker';
}

/**
 * Check if user can submit a proposal for a shipment
 * Only Brokers can submit proposals
 */
export function canSubmitProposal(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'broker';
}

/**
 * Check if user can manage (accept/reject) proposals
 * Only Shippers can manage proposals on their shipments
 */
export function canManageProposals(accountType?: AccountType): boolean {
  if (!accountType) return false;
  return accountType === 'shipper';
}

/**
 * Get all allowed account types for a specific permission
 */
export function getAllowedAccountTypes(permission: string): AccountType[] {
  switch (permission) {
    case 'view_load_board':
      return ['carrier', 'broker'];
    case 'post_load':
      return ['broker'];
    case 'book_load':
      return ['carrier'];
    case 'create_shipment':
      return ['shipper'];
    case 'view_shipments':
      return ['shipper', 'broker'];
    case 'submit_proposal':
      return ['broker'];
    case 'manage_proposals':
      return ['shipper'];
    default:
      return [];
  }
}

/**
 * Check if user has any of the required account types
 */
export function hasAccountType(allowedTypes: AccountType[], userAccountType?: AccountType): boolean {
  if (!userAccountType) return false;
  return allowedTypes.includes(userAccountType);
}
