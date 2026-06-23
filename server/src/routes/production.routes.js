const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Production Planning
router.get('/plan', productionController.getAllPlans);
router.post('/plan', productionController.createPlan);
router.put('/plan/:id', productionController.updatePlan);
router.post('/plan/:id/validate', productionController.validateCapacity);

// Work Order Management & Execution
router.get('/wo', productionController.getAllWorkOrders);
router.post('/wo', productionController.createWorkOrder);
router.put('/wo/:id', productionController.updateWorkOrder);

// Material Allocation
router.post('/wo/allocation', productionController.updateMaterialAllocation);

// Production Output
router.get('/output', productionController.getAllOutputs);
router.post('/output', productionController.recordOutput);

module.exports = router;
