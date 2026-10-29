import { Router } from 'express';
import {
  getAllKamar,
  getKamarById,
  createKamar,
  updateKamar,
  deleteKamar,
} from '../controllers/kamarController.js';

const router = Router();

router.get('/', getAllKamar);
router.get('/:id', getKamarById);
router.post('/', createKamar);
router.put('/:id', updateKamar);
router.delete('/:id', deleteKamar);

export default router;

