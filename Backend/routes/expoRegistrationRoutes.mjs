import express from 'express';
import {
  registerForExpo,
  getRegistrationsByExpo,
  updateRegistrationStatus,
} from '../controllers/expoRegistrationController.mjs';

const router = express.Router();

router.post('/', registerForExpo);                 // Register
router.get('/expo/:expoId', getRegistrationsByExpo); // Admin view
router.put('/:id/status', updateRegistrationStatus); // Approve/Reject

export default router;
