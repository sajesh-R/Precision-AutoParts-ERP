const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Inventory Control
router.get('/control', inventoryController.getInventoryControl);

// Inventory Transactions
router.get('/transactions', inventoryController.getAllTransactions);
router.post('/transactions', inventoryController.createTransaction);

// Inventory Optimization
router.get('/optimization', inventoryController.getOptimization);
router.post('/optimization/update', inventoryController.updateOptimization);
router.post('/optimization/analyze', inventoryController.runAnalysis);

// Inventory Valuation
router.get('/valuation', inventoryController.getValuation);
router.post('/valuation/calculate', inventoryController.calculateValuation);

// Traceability
router.get('/traceability', inventoryController.getAllTraceability);
router.post('/traceability', inventoryController.createTraceability);

module.exports = router;
