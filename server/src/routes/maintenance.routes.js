const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Preventive Maintenance
router.get('/preventive', maintenanceController.getAllPreventive);
router.post('/preventive', maintenanceController.createPreventive);
router.put('/preventive/:id', maintenanceController.updatePreventive);

// Breakdown Maintenance
router.get('/breakdown', maintenanceController.getAllBreakdowns);
router.post('/breakdown', maintenanceController.reportBreakdown);
router.put('/breakdown/:id', maintenanceController.updateBreakdown);

// Spare Parts Management
router.get('/sparepart', maintenanceController.getAllSpareParts);
router.get('/sparepart/inventory', maintenanceController.getSparePartInventory);
router.post('/sparepart', maintenanceController.recordSparePartTransaction);

// Analytics
router.get('/analytics', maintenanceController.getAnalytics);

module.exports = router;
