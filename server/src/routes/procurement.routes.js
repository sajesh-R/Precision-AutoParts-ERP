const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurement.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Purchase Requisition
router.get('/requisition', procurementController.getAllRequisitions);
router.post('/requisition', requirePermission('Procurement', 'create'), procurementController.createRequisition);
router.put('/requisition/:id/status', requirePermission('Procurement', 'update'), procurementController.updateRequisitionStatus);

// RFQ
router.get('/rfq', procurementController.getAllRFQs);
router.post('/rfq', requirePermission('Procurement', 'create'), procurementController.createRFQ);
router.post('/rfq/:id/quotation', requirePermission('Procurement', 'create'), procurementController.addQuotation);
router.put('/rfq/:id/quotation/:quoteId/select', requirePermission('Procurement', 'update'), procurementController.selectQuotation);

// Purchase Order
router.get('/po', procurementController.getAllPurchaseOrders);
router.post('/po', requirePermission('Procurement', 'create'), procurementController.createPurchaseOrder);
router.put('/po/:id/status', requirePermission('Procurement', 'update'), procurementController.updatePOStatus);

// Vendor Performance
router.get('/performance', procurementController.getAllPerformances);
router.post('/performance', requirePermission('Procurement', 'create'), procurementController.createPerformance);

module.exports = router;
