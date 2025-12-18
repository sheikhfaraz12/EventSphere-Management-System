import express from 'express';
import {
  createExpo,
  getExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  addBooth,
  updateBooth,
  deleteBooth,
  getMyExpos
} from '../controllers/expocontroller.mjs';
import { auth } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Public routes
router.get('/', getExpos);
router.get('/:id', getExpoById);

// Protected routes
router.use(auth);
router.get('/my', getMyExpos);
router.post('/', createExpo);
router.put('/:id', updateExpo);
router.delete('/:id', deleteExpo);

// Booth management
router.post('/:id/booths', addBooth);
router.put('/:id/booths/:boothId', updateBooth);
router.delete('/:id/booths/:boothId', deleteBooth);

export default router;