import { Router } from 'express';
import {
  getAllPenghuni,
  getPenghuniById,
  createPenghuni,
  updatePenghuni,
  deletePenghuni,
} from '../controllers/penghuniController.js';

const router = Router();

router.get('/', getAllPenghuni);
router.get('/:id', getPenghuniById);
router.post('/', createPenghuni);
router.put('/:id', updatePenghuni);
router.delete('/:id', deletePenghuni);

export default router;

