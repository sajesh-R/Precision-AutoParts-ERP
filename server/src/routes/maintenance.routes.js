const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Preventive Maintenance
router.get('/preventive', maintenanceController.getAllPreventive);
router.post('/preventive', requirePermission('Maintenance', 'create'), maintenanceController.createPreventive);
router.put('/preventive/:id', requirePermission('Maintenance', 'update'), maintenanceController.updatePreventive);

// Breakdown Maintenance
router.get('/breakdown', maintenanceController.getAllBreakdowns);
router.post('/breakdown', requirePermission('Maintenance', 'create'), maintenanceController.reportBreakdown);
router.put('/breakdown/:id', requirePermission('Maintenance', 'update'), maintenanceController.updateBreakdown);

// Spare Parts Management
router.get('/sparepart', maintenanceController.getAllSpareParts);
router.get('/sparepart/inventory', maintenanceController.getSparePartInventory);
router.post('/sparepart', requirePermission('Maintenance', 'create'), maintenanceController.recordSparePartTransaction);

// Analytics
router.get('/analytics', maintenanceController.getAnalytics);

module.exports = router;
