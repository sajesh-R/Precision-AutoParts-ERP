const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// AR
router.route('/ar')
  .get(financeController.getARInvoices)
  .post(financeController.createARInvoice);
router.route('/ar/:id/payment')
  .post(financeController.addARPayment);

// AP
router.route('/ap')
  .get(financeController.getAPBills)
  .post(financeController.createAPBill);
router.route('/ap/:id/payment')
  .post(financeController.addAPPayment);

// Ledger
router.route('/ledger')
  .get(financeController.getLedgers)
  .post(financeController.createLedgerEntry);
router.route('/ledger/:id/post')
  .put(financeController.postLedgerEntry);

// Tax
router.route('/tax')
  .get(financeController.getTaxes)
  .post(financeController.createTax);
router.route('/tax/:id')
  .put(financeController.updateTax);

// Statements & Costing
router.route('/statements')
  .get(financeController.getStatements);
router.route('/costing')
  .get(financeController.getCosting);

module.exports = router;
