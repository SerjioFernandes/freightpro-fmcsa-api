import { Router } from 'express';
import * as supportController from '../controllers/support.controller.js';

const router = Router();

router.post('/chat', supportController.chat);

export default router;

