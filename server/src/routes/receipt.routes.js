const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Goods Receipt Note (GRN)
router.get('/grn', receiptController.getAllGRNs);
router.post('/grn', receiptController.createGRN);

// Quality Inspection
router.get('/inspection', receiptController.getAllInspections);
router.put('/inspection/:id', receiptController.updateInspection);

// Inventory Posting
router.get('/inventory', receiptController.getAllInventoryStocks);
router.post('/inventory/post', receiptController.postToInventory);

module.exports = router;
