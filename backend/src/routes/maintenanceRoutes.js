import { Router } from 'express';
import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js';

const router = Router();

router.get('/', getAllMaintenance);
router.get('/:id', getMaintenanceById);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', deleteMaintenance);

export default router;

