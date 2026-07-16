const express = require('express');
const router = express.Router();
const engineeringController = require('../controllers/engineering.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

// Apply auth middleware to all engineering routes
router.use(protect);

// BOM Routes
router.get('/bom', engineeringController.getAllBOMs);
router.get('/bom/:id', engineeringController.getBOMById);
router.post('/bom', requirePermission('Engineering', 'create'), engineeringController.createBOM);
router.put('/bom/:id', requirePermission('Engineering', 'update'), engineeringController.updateBOM);
router.post('/bom/:id/revision', requirePermission('Engineering', 'create'), engineeringController.addBOMRevision);
router.put('/bom/:id/version-status', requirePermission('Engineering', 'update'), engineeringController.changeBOMVersionStatus);

// Routing Routes
router.get('/routing', engineeringController.getAllRoutings);
router.get('/routing/:id', engineeringController.getRoutingById);
router.post('/routing', requirePermission('Engineering', 'create'), engineeringController.createRouting);
router.put('/routing/:id', requirePermission('Engineering', 'update'), engineeringController.updateRouting);

// ECM Routes
router.get('/ecm', engineeringController.getAllChanges);
router.post('/ecm', requirePermission('Engineering', 'create'), engineeringController.createChange);
router.put('/ecm/:id/status', requirePermission('Engineering', 'update'), engineeringController.updateChangeStatus);

module.exports = router;
