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
    
    if (!validateEIN(ein)) {
      res.status(400).json({
        error: 'Invalid EIN format. Use format: 12-3456789'
      });
      return;
    }
  }
  
  // Remove EIN from shippers
  if (accountType === 'shipper') {
    delete req.body.ein;
    delete req.body.einCanon;
    delete req.body.einDisplay;
  }
  
  next();
}




