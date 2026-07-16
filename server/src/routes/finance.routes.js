const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// AR
router.route('/ar')
  .get(financeController.getARInvoices)
  .post(requirePermission('Finance', 'create'), financeController.createARInvoice);
router.route('/ar/:id/payment')
  .post(requirePermission('Finance', 'create'), financeController.addARPayment);

// AP
router.route('/ap')
  .get(financeController.getAPBills)
  .post(requirePermission('Finance', 'create'), financeController.createAPBill);
router.route('/ap/:id/payment')
  .post(requirePermission('Finance', 'create'), financeController.addAPPayment);

// Ledger
router.route('/ledger')
  .get(financeController.getLedgers)
  .post(requirePermission('Finance', 'create'), financeController.createLedgerEntry);
router.route('/ledger/:id/post')
  .put(requirePermission('Finance', 'update'), financeController.postLedgerEntry);

// Tax
router.route('/tax/report')
  .get(financeController.generateTaxReport);
router.route('/tax')
  .get(financeController.getTaxes)
  .post(requirePermission('Finance', 'create'), financeController.createTax);
router.route('/tax/:id')
  .put(requirePermission('Finance', 'update'), financeController.updateTax);

// Statements & Costing
router.route('/statements')
  .get(financeController.getStatements);
router.route('/costing')
  .get(financeController.getCosting);

module.exports = router;
