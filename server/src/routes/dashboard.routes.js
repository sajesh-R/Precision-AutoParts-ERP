const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/stats', dashboardController.getSystemStats);
router.get('/ceo', dashboardController.getCEODashboard);
router.get('/sales', dashboardController.getSalesDashboard);
router.get('/procurement', dashboardController.getProcurementDashboard);
router.get('/inventory', dashboardController.getInventoryDashboard);
router.get('/production', dashboardController.getProductionDashboard);
router.get('/quality', dashboardController.getQualityDashboard);
router.get('/maintenance', dashboardController.getMaintenanceDashboard);

module.exports = router;
