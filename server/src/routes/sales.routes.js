const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Inquiry Routes
router.get('/inquiry', salesController.getAllInquiries);
router.post('/inquiry', salesController.createInquiry);
router.put('/inquiry/:id', salesController.updateInquiry);

// Quotation Routes
router.get('/quotation', salesController.getAllQuotations);
router.post('/quotation', salesController.createQuotation);
router.put('/quotation/:id/status', salesController.changeQuotationStatus);

// Sales Order Routes
router.get('/order', salesController.getAllOrders);
router.post('/order', salesController.createOrder);
router.put('/order/:id', salesController.updateOrder);
router.put('/order/:id/status', salesController.updateOrderStatus);
router.put('/order/:id/atp', salesController.performATPCheck);
router.put('/order/:id/tracking', salesController.updateTracking);

module.exports = router;
