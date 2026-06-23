const express = require('express');
const router = express.Router();
const demandController = require('../controllers/demand.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Forecast Routes
router.get('/forecast', demandController.getAllForecasts);
router.post('/forecast', demandController.createForecast);
router.put('/forecast/:id', demandController.updateForecast);

// Historical Analysis Route
router.get('/historical', demandController.getHistoricalAnalysis);

// Consolidation Routes
router.get('/consolidation', demandController.getAllConsolidations);
router.post('/consolidation', demandController.createConsolidation);
router.put('/consolidation/:id', demandController.updateConsolidation);
router.post('/consolidation/generate', demandController.generateConsolidation);

module.exports = router;
