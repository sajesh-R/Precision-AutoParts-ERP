const { handleError } = require('../utils/errorHandler');
const { ApprovalRequest, ApprovalConfig } = require('../models/Approval');
const User = require('../models/User');

// @desc    Get pending approvals for the current user
// @route   GET /api/approvals/pending
// @access  Private
exports.getPendingApprovals = async (req, res) => {
  try {
    const userRole = req.user.role._id;
    const userId = req.user._id;

    // A user can approve if they have the required role, OR if they are a delegate for someone who has the required role.
    // Let's find all users who have delegated to this user.
    const delegators = await User.find({ delegatedTo: userId }).select('_id role');
    const roleIdsToCheck = [userRole];
    delegators.forEach(d => roleIdsToCheck.push(d.role));

    // Find all ApprovalRequests where the CURRENT step requires one of these roles, and the status is 'Pending'
    const requests = await ApprovalRequest.find({ status: 'Pending' })
      .populate('requestedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Filter to only those where the current level matches the user's role (or their delegator's role)
    const actionableRequests = requests.filter(req => {
      const currentStep = req.requiredLevels.find(l => l.level === req.currentLevel);
      if (!currentStep || currentStep.status !== 'Pending') return false;
      return roleIdsToCheck.some(roleId => roleId.equals(currentStep.roleId));
    });

    res.status(200).json({ success: true, count: actionableRequests.length, data: actionableRequests });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Approve a request step
// @route   POST /api/approvals/:id/approve
// @access  Private
exports.approveRequest = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }
    if (approval.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Approval request is already ${approval.status}` });
    }

    const currentStep = approval.requiredLevels.find(l => l.level === approval.currentLevel);
    if (!currentStep) {
      return res.status(400).json({ success: false, message: 'Invalid approval state' });
    }

    // Validate the approving user has the correct role for this step
    const userRoleId = req.user.role._id.toString();
    const requiredRoleId = currentStep.roleId ? currentStep.roleId.toString() : null;
    if (requiredRoleId && userRoleId !== requiredRoleId && req.user.role.name !== 'Super Admin') {
      // Check delegation
      const User = require('../models/User');
      const delegators = await User.find({ delegatedTo: req.user._id }).select('role');
      const delegatedRoleIds = delegators.map(d => d.role.toString());
      if (!delegatedRoleIds.includes(requiredRoleId)) {
        return res.status(403).json({ success: false, message: 'You do not have the required role to approve this step' });
      }
    }

    // Mark current step as approved
    currentStep.status = 'Approved';
    currentStep.actionedBy = req.user._id;
    currentStep.actionedAt = Date.now();
    currentStep.comments = req.body?.comments || '';

    // Check if there are more levels
    const nextStep = approval.requiredLevels.find(l => l.level === approval.currentLevel + 1);
    if (nextStep) {
      approval.currentLevel += 1;
      await approval.save();
      return res.status(200).json({ success: true, message: 'Level approved. Moving to next level.', data: approval });
    }

    // All levels approved! Commit the payload to the actual module.
    approval.status = 'Approved';
    await approval.save();

    // Dynamically insert the record
    const mongoose = require('mongoose');
    const Model = mongoose.models[approval.module];
    if (Model) {
      // In a real system we would handle 'update' and 'delete' too. Assuming 'create' for this phase.
      if (approval.action === 'create') {
        await Model.create(approval.payload);
      }
    }

    res.status(200).json({ success: true, message: 'Final approval granted. Record created.', data: approval });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Reject a request
// @route   POST /api/approvals/:id/reject
// @access  Private
exports.rejectRequest = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }
    if (approval.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Approval request is already ${approval.status}` });
    }

    const currentStep = approval.requiredLevels.find(l => l.level === approval.currentLevel);
    if (currentStep) {
      currentStep.status = 'Rejected';
      currentStep.actionedBy = req.user._id;
      currentStep.actionedAt = Date.now();
      currentStep.comments = req.body?.comments || '';
    }

    approval.status = 'Rejected';
    await approval.save();

    res.status(200).json({ success: true, message: 'Request rejected.', data: approval });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all approval configurations
// @route   GET /api/approvals/config
// @access  Private/Admin
exports.getConfigs = async (req, res) => {
  try {
    const configs = await ApprovalConfig.find().populate('levels.roleId', 'name description');
    res.status(200).json({ success: true, count: configs.length, data: configs });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create an approval configuration
// @route   POST /api/approvals/config
// @access  Private/Admin
exports.createConfig = async (req, res) => {
  try {
    const existing = await ApprovalConfig.findOne({ module: req.body.module, action: req.body.action });
    if (existing) {
      return res.status(400).json({ success: false, message: `An approval rule for ${req.body.module} (${req.body.action}) already exists.` });
    }

    // Check if any of the roles in this new config are already assigned to another config
    if (req.body.levels && req.body.levels.length > 0) {
      const selectedRoles = req.body.levels.map(l => l.roleId);
      const existingConfigsWithRoles = await ApprovalConfig.find({ 'levels.roleId': { $in: selectedRoles } });
      if (existingConfigsWithRoles.length > 0) {
        return res.status(400).json({ success: false, message: 'One or more selected roles are already assigned to an approval rule. A role can only be assigned to one approval rule in the system.' });
      }
    }

    const config = await ApprovalConfig.create(req.body);
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update an approval configuration
// @route   PUT /api/approvals/config/:id
// @access  Private/Admin
exports.updateConfig = async (req, res) => {
  try {
    if (req.body.module && req.body.action) {
      const existing = await ApprovalConfig.findOne({ module: req.body.module, action: req.body.action, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `An approval rule for ${req.body.module} (${req.body.action}) already exists.` });
      }
    }

    // Check if any of the roles in this config are already assigned to another config
    if (req.body.levels && req.body.levels.length > 0) {
      const selectedRoles = req.body.levels.map(l => l.roleId);
      const existingConfigsWithRoles = await ApprovalConfig.find({ 
        _id: { $ne: req.params.id },
        'levels.roleId': { $in: selectedRoles } 
      });
      if (existingConfigsWithRoles.length > 0) {
        return res.status(400).json({ success: false, message: 'One or more selected roles are already assigned to another approval rule. A role can only be assigned to one approval rule in the system.' });
      }
    }

    const config = await ApprovalConfig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete an approval configuration
// @route   DELETE /api/approvals/config/:id
// @access  Private/Admin
exports.deleteConfig = async (req, res) => {
  try {
    const config = await ApprovalConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    await config.deleteOne();
    res.status(200).json({ success: true, message: 'Configuration deleted' });
  } catch (error) {
    handleError(res, error);
  }
};
