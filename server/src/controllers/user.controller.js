const { handleError } = require('../utils/errorHandler');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role', 'name').populate('plantId branchId');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roleId, plantId, branchId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: roleId,
      plantId,
      branchId,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Active', 'Inactive', 'Suspended', 'Locked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    handleError(res, error);
  }
};
