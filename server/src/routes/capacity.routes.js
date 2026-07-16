const express = require('express');
const router = express.Router();
const capacityController = require('../controllers/capacity.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Machine Capacity Routes
router.get('/machine', capacityController.getAllMachineCapacities);
router.post('/machine', requirePermission('CapacityPlanning', 'create'), capacityController.createMachineCapacity);
router.put('/machine/:id', requirePermission('CapacityPlanning', 'update'), capacityController.updateMachineCapacity);

// Labor Capacity Routes
router.get('/labor', capacityController.getAllLaborCapacities);
router.post('/labor', requirePermission('CapacityPlanning', 'create'), capacityController.createLaborCapacity);
router.put('/labor/:id', requirePermission('CapacityPlanning', 'update'), capacityController.updateLaborCapacity);

// Production Schedule Routes
router.get('/schedule', capacityController.getAllSchedules);
router.post('/schedule', requirePermission('CapacityPlanning', 'create'), capacityController.createSchedule);
router.put('/schedule/:id', requirePermission('CapacityPlanning', 'update'), capacityController.updateSchedule);

module.exports = router;
