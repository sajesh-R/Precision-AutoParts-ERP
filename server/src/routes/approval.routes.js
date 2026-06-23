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
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/pending', protect, getPendingApprovals);
router.post('/:id/approve', protect, approveRequest);
router.post('/:id/reject', protect, rejectRequest);

router.get('/config', protect, getConfigs);
router.post('/config', protect, createConfig);
router.put('/config/:id', protect, updateConfig);
router.delete('/config/:id', protect, deleteConfig);

module.exports = router;
