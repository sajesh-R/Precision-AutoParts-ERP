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
router.post('/:id/approve', requirePermission('Approvals', 'create'), protect, approveRequest);
router.post('/:id/reject', requirePermission('Approvals', 'create'), protect, rejectRequest);

router.get('/config', protect, getConfigs);
router.post('/config', requirePermission('Approvals', 'create'), protect, createConfig);
router.put('/config/:id', requirePermission('Approvals', 'update'), protect, updateConfig);
router.delete('/config/:id', requirePermission('Approvals', 'delete'), protect, deleteConfig);

module.exports = router;
