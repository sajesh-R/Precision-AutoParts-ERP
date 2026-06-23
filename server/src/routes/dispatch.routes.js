const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatch.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Dispatch Planning
router.route('/planning')
  .get(dispatchController.getAllPlans)
  .post(dispatchController.createPlan);
router.route('/planning/:id')
  .put(dispatchController.updatePlan);

// Dispatch Execution
router.route('/execution')
  .get(dispatchController.getAllExecutions)
  .post(dispatchController.recordExecution); // acts as upsert

// Delivery Tracking
router.route('/tracking')
  .get(dispatchController.getAllTrackings);
router.route('/tracking/:id')
  .put(dispatchController.updateTracking);
router.route('/tracking/:id/confirm')
  .put(dispatchController.confirmDelivery);

module.exports = router;
