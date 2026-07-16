const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Inventory Control
router.get('/control', inventoryController.getInventoryControl);

// Inventory Transactions
router.get('/transactions', inventoryController.getAllTransactions);
router.post('/transactions', requirePermission('Inventory', 'create'), inventoryController.createTransaction);

// Inventory Optimization
router.get('/optimization', inventoryController.getOptimization);
router.post('/optimization/update', requirePermission('Inventory', 'create'), inventoryController.updateOptimization);
router.post('/optimization/analyze', requirePermission('Inventory', 'create'), inventoryController.runAnalysis);

// Inventory Valuation
router.get('/valuation', inventoryController.getValuation);
router.post('/valuation/calculate', requirePermission('Inventory', 'create'), inventoryController.calculateValuation);

// Traceability
router.get('/traceability', inventoryController.getAllTraceability);
router.post('/traceability', requirePermission('Inventory', 'create'), inventoryController.createTraceability);

module.exports = router;
