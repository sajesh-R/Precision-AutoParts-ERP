const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurement.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Purchase Requisition
router.get('/requisition', procurementController.getAllRequisitions);
router.post('/requisition', procurementController.createRequisition);
router.put('/requisition/:id/status', procurementController.updateRequisitionStatus);

// RFQ
router.get('/rfq', procurementController.getAllRFQs);
router.post('/rfq', procurementController.createRFQ);
router.post('/rfq/:id/quotation', procurementController.addQuotation);
router.put('/rfq/:id/quotation/:quoteId/select', procurementController.selectQuotation);

// Purchase Order
router.get('/po', procurementController.getAllPurchaseOrders);
router.post('/po', procurementController.createPurchaseOrder);
router.put('/po/:id/status', procurementController.updatePOStatus);

// Vendor Performance
router.get('/performance', procurementController.getAllPerformances);
router.post('/performance', procurementController.createPerformance);

module.exports = router;
