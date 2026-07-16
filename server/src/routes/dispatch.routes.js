const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatch.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Dispatch Planning
router.route('/planning')
  .get(dispatchController.getAllPlans)
  .post(requirePermission('Dispatch', 'create'), dispatchController.createPlan);
router.route('/planning/:id')
  .put(requirePermission('Dispatch', 'update'), dispatchController.updatePlan);

// Dispatch Execution
router.route('/execution')
  .get(dispatchController.getAllExecutions)
  .post(requirePermission('Dispatch', 'create'), dispatchController.recordExecution); // acts as upsert

// Delivery Tracking
router.route('/tracking')
  .get(dispatchController.getAllTrackings);
router.route('/tracking/:id')
  .put(requirePermission('Dispatch', 'update'), dispatchController.updateTracking);
router.route('/tracking/:id/confirm')
  .put(requirePermission('Dispatch', 'update'), dispatchController.confirmDelivery);

module.exports = router;
