import express from 'express';
import {
  getAllExhibitors,
  getExhibitorById,
  createExhibitor,
  updateExhibitor
} from '../controllers/exhibitorController.mjs';

const router = express.Router();

router.get('/', getAllExhibitors);
router.get('/:id', getExhibitorById);
router.post('/', createExhibitor);
router.put('/:id', updateExhibitor);

export default router;
