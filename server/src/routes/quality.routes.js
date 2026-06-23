const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/quality.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Inspections
router.get('/inspection', qualityController.getAllInspections);
router.post('/inspection', qualityController.recordInspection);
router.put('/inspection/:id', qualityController.updateInspection);
router.post('/inspection/:id/release', qualityController.approveProductRelease);

// Parameters
router.get('/parameter', qualityController.getAllParameters);
router.post('/parameter', qualityController.createParameter);
router.post('/parameter/:id/measurement', qualityController.recordMeasurement);

// Non-Conformance (CAPA)
router.get('/ncr', qualityController.getAllNCRs);
router.post('/ncr', qualityController.recordNCR);
router.put('/ncr/:id', qualityController.updateNCR);

// Analytics
router.get('/analytics', qualityController.getAnalytics);

module.exports = router;
