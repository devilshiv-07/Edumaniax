import express from 'express';
const router = express.Router();

import { updatePerformance } from '../controllers/Performance/performanceController.js';
import { getUserPerformance } from '../controllers/Performance/performanceController.js';

router.post('/update', updatePerformance);
router.get('/:userId', getUserPerformance);


export default router;
