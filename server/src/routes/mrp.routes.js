const express = require('express');
const router = express.Router();
const mrpController = require('../controllers/mrp.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// MRP Run execution
router.get('/run', mrpController.getAllMrpRuns);
router.post('/run/execute', mrpController.executeMrpRun);

// MRP Data Retrieval
router.get('/requirements', mrpController.getRequirements);
router.get('/shortages', mrpController.getShortages);
router.get('/recommendations', mrpController.getRecommendations);

// Update Recommendation Status (e.g. Convert to PO/WO)
router.put('/recommendations/:id/status', mrpController.updateRecommendationStatus);

module.exports = router;
