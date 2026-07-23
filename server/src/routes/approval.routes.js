const express = require('express');
const { 
  getPendingApprovals, 
  approveRequest, 
  rejectRequest,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig
} = require('../controllers/approval.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/pending', protect, getPendingApprovals);
router.post('/:id/approve', protect, requirePermission('Approvals', 'create'), approveRequest);
router.post('/:id/reject', protect, requirePermission('Approvals', 'create'), rejectRequest);

router.get('/config', protect, getConfigs);
router.post('/config', protect, requirePermission('Approvals', 'create'), createConfig);
router.put('/config/:id', protect, requirePermission('Approvals', 'update'), updateConfig);
router.delete('/config/:id', protect, requirePermission('Approvals', 'delete'), deleteConfig);

module.exports = router;
