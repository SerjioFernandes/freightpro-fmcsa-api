import { Router } from 'express';
import { emailService } from '../services/email.service.js';

const router = Router();

router.get('/email-status', async (_req, res) => {
  try {
    const isConfigured = emailService.isConfigured();
    const canConnect = isConfigured ? await emailService.testConnection() : false;
    
    res.json({
      configured: isConfigured,
      connected: canConnect,
      provider: 'Gmail SMTP'
    });
  } catch (error: any) {
    res.status(500).json({
      configured: emailService.isConfigured(),
      connected: false,
      provider: 'Gmail SMTP',
      error: error.message
    });
  }
});

export default router;
