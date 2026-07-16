const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/quality.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

router.use(protect);

// Inspections
router.get('/inspection', qualityController.getAllInspections);
router.post('/inspection', requirePermission('Quality', 'create'), qualityController.recordInspection);
router.put('/inspection/:id', requirePermission('Quality', 'update'), qualityController.updateInspection);
router.post('/inspection/:id/release', requirePermission('Quality', 'create'), qualityController.approveProductRelease);

// Parameters
router.get('/parameter', qualityController.getAllParameters);
router.post('/parameter', requirePermission('Quality', 'create'), qualityController.createParameter);
router.post('/parameter/:id/measurement', requirePermission('Quality', 'create'), qualityController.recordMeasurement);

// Non-Conformance (CAPA)
router.get('/ncr', qualityController.getAllNCRs);
router.post('/ncr', requirePermission('Quality', 'create'), qualityController.recordNCR);
router.put('/ncr/:id', requirePermission('Quality', 'update'), qualityController.updateNCR);

// Analytics
router.get('/analytics', qualityController.getAnalytics);

module.exports = router;
