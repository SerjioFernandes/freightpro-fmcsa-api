import { Request, Response, NextFunction } from 'express';
import { 
  validateEIN, 
  validateMCNumber, 
  validateUSDOTNumber 
} from '../utils/validators.js';

export function validateAuthority(req: Request, res: Response, next: NextFunction): void {
  const { accountType, mcNumber, usdotNumber } = req.body;
  
  if (accountType === 'broker' || accountType === 'carrier') {
    if (!mcNumber && !usdotNumber) {
      res.status(400).json({
        error: 'MC number or USDOT number is required for brokers and carriers'
      });
      return;
    }
    
    if (mcNumber && !validateMCNumber(mcNumber)) {
      res.status(400).json({
        error: 'Invalid MC number format. Use MC-123456 or 123456'
      });
      return;
    }
    
    if (usdotNumber && !validateUSDOTNumber(usdotNumber)) {
      res.status(400).json({
        error: 'Invalid USDOT number format. Use 6-8 digits'
      });
      return;
    }
  }
  
  next();
}

export function validateEINRequired(req: Request, res: Response, next: NextFunction): void {
  const { accountType, ein } = req.body;
  
  if (accountType === 'broker' || accountType === 'carrier') {
    if (!ein) {
      res.status(400).json({
        error: 'EIN is required for brokers and carriers'
      });
      return;
    }
    
    // Trim whitespace before validation
    const trimmedEIN = (ein || '').trim();
    const digitsOnly = trimmedEIN.replace(/[^0-9]/g, '');

    let formattedEIN = trimmedEIN;
    if (digitsOnly.length === 9) {
      formattedEIN = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
    }

    if (!validateEIN(formattedEIN)) {
      res.status(400).json({
        error: `Invalid EIN format. Use format: 12-3456789 (received: "${trimmedEIN}")`
      });
      return;
    }
    
    // Update the body with trimmed value
    req.body.ein = formattedEIN;
  }
  
  // Remove EIN from shippers
  if (accountType === 'shipper') {
    delete req.body.ein;
    delete req.body.einCanon;
    delete req.body.einDisplay;
    delete req.body.usdotNumber;
    delete req.body.mcNumber;
  }
  
  next();
}




