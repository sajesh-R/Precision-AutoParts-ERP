const express = require('express');
const router = express.Router();
const capacityController = require('../controllers/capacity.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Machine Capacity Routes
router.get('/machine', capacityController.getAllMachineCapacities);
router.post('/machine', capacityController.createMachineCapacity);
router.put('/machine/:id', capacityController.updateMachineCapacity);

// Labor Capacity Routes
router.get('/labor', capacityController.getAllLaborCapacities);
router.post('/labor', capacityController.createLaborCapacity);
router.put('/labor/:id', capacityController.updateLaborCapacity);

// Production Schedule Routes
router.get('/schedule', capacityController.getAllSchedules);
router.post('/schedule', capacityController.createSchedule);
router.put('/schedule/:id', capacityController.updateSchedule);

module.exports = router;
