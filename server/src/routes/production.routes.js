const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Production Planning
router.get('/plan', productionController.getAllPlans);
router.post('/plan', requirePermission('Production', 'create'), productionController.createPlan);
router.put('/plan/:id', requirePermission('Production', 'update'), productionController.updatePlan);
router.post('/plan/:id/validate', requirePermission('Production', 'create'), productionController.validateCapacity);

// Work Order Management & Execution
router.get('/wo', productionController.getAllWorkOrders);
router.post('/wo', requirePermission('Production', 'create'), productionController.createWorkOrder);
router.put('/wo/:id', requirePermission('Production', 'update'), productionController.updateWorkOrder);

// Material Allocation
router.post('/wo/allocation', requirePermission('Production', 'create'), productionController.updateMaterialAllocation);

// Production Output
router.get('/output', productionController.getAllOutputs);
router.post('/output', requirePermission('Production', 'create'), productionController.recordOutput);

module.exports = router;
