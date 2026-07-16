const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Inquiry Routes
router.get('/inquiry', salesController.getAllInquiries);
router.post('/inquiry', requirePermission('Sales', 'create'), salesController.createInquiry);
router.put('/inquiry/:id', requirePermission('Sales', 'update'), salesController.updateInquiry);

// Quotation Routes
router.get('/quotation', salesController.getAllQuotations);
router.post('/quotation', requirePermission('Sales', 'create'), salesController.createQuotation);
router.put('/quotation/:id/status', requirePermission('Sales', 'update'), salesController.changeQuotationStatus);

// Sales Order Routes
router.get('/order', salesController.getAllOrders);
router.post('/order', requirePermission('Sales', 'create'), salesController.createOrder);
router.put('/order/:id', requirePermission('Sales', 'update'), salesController.updateOrder);
router.put('/order/:id/status', requirePermission('Sales', 'update'), salesController.updateOrderStatus);
router.put('/order/:id/atp', requirePermission('Sales', 'update'), salesController.performATPCheck);
router.put('/order/:id/tracking', requirePermission('Sales', 'update'), salesController.updateTracking);

module.exports = router;
