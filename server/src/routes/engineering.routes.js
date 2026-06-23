const express = require('express');
const router = express.Router();
const engineeringController = require('../controllers/engineering.controller');
const { protect } = require('../middlewares/auth.middleware');

// Apply auth middleware to all engineering routes
router.use(protect);

// BOM Routes
router.get('/bom', engineeringController.getAllBOMs);
router.get('/bom/:id', engineeringController.getBOMById);
router.post('/bom', engineeringController.createBOM);
router.put('/bom/:id', engineeringController.updateBOM);
router.post('/bom/:id/revision', engineeringController.addBOMRevision);
router.put('/bom/:id/version-status', engineeringController.changeBOMVersionStatus);

// Routing Routes
router.get('/routing', engineeringController.getAllRoutings);
router.get('/routing/:id', engineeringController.getRoutingById);
router.post('/routing', engineeringController.createRouting);
router.put('/routing/:id', engineeringController.updateRouting);

// ECM Routes
router.get('/ecm', engineeringController.getAllChanges);
router.post('/ecm', engineeringController.createChange);
router.put('/ecm/:id/status', engineeringController.updateChangeStatus);

module.exports = router;
