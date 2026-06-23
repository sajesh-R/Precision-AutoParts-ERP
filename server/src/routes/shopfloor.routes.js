const express = require('express');
const router = express.Router();
const shopfloorController = require('../controllers/shopfloor.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Operator Management
router.get('/operator', shopfloorController.getAllOperators);
router.post('/operator', shopfloorController.assignOperator);
router.put('/operator/:id', shopfloorController.updateOperator);

// Machine Utilization
router.get('/machine', shopfloorController.getAllMachines);
router.post('/machine', shopfloorController.allocateMachine);
router.put('/machine/:id', shopfloorController.updateMachine);

// Downtime Management
router.get('/downtime', shopfloorController.getAllDowntimes);
router.post('/downtime', shopfloorController.recordDowntime);
router.put('/downtime/:id', shopfloorController.updateDowntime);

// Scrap Management
router.get('/scrap', shopfloorController.getAllScrap);
router.post('/scrap', shopfloorController.recordScrap);

module.exports = router;
