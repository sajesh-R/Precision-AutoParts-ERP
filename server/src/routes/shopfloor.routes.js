const express = require('express');
const router = express.Router();
const shopfloorController = require('../controllers/shopfloor.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Operator Management
router.get('/operator', shopfloorController.getAllOperators);
router.post('/operator', requirePermission('ShopFloor', 'create'), shopfloorController.assignOperator);
router.put('/operator/:id', requirePermission('ShopFloor', 'update'), shopfloorController.updateOperator);

// Machine Utilization
router.get('/machine', shopfloorController.getAllMachines);
router.post('/machine', requirePermission('ShopFloor', 'create'), shopfloorController.allocateMachine);
router.put('/machine/:id', requirePermission('ShopFloor', 'update'), shopfloorController.updateMachine);

// Downtime Management
router.get('/downtime', shopfloorController.getAllDowntimes);
router.post('/downtime', requirePermission('ShopFloor', 'create'), shopfloorController.recordDowntime);
router.put('/downtime/:id', requirePermission('ShopFloor', 'update'), shopfloorController.updateDowntime);

// Scrap Management
router.get('/scrap', shopfloorController.getAllScrap);
router.post('/scrap', requirePermission('ShopFloor', 'create'), shopfloorController.recordScrap);

module.exports = router;
