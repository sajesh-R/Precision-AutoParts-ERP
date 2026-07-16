const express = require('express');
const router = express.Router();
const demandController = require('../controllers/demand.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Forecast Routes
router.get('/forecast', demandController.getAllForecasts);
router.post('/forecast', requirePermission('DemandPlanning', 'create'), demandController.createForecast);
router.put('/forecast/:id', requirePermission('DemandPlanning', 'update'), demandController.updateForecast);

// Historical Analysis Route
router.get('/historical', demandController.getHistoricalAnalysis);

// Consolidation Routes
router.get('/consolidation', demandController.getAllConsolidations);
router.post('/consolidation', requirePermission('DemandPlanning', 'create'), demandController.createConsolidation);
router.put('/consolidation/:id', requirePermission('DemandPlanning', 'update'), demandController.updateConsolidation);
router.post('/consolidation/generate', requirePermission('DemandPlanning', 'create'), demandController.generateConsolidation);

module.exports = router;
