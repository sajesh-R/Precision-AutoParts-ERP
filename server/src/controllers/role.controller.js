const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a role
// @route   POST /api/roles
// @access  Private/Admin
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }

    const role = await Role.create({
      name,
      description,
      permissions
    });

    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ success: false, message: 'System roles cannot be modified' });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(400).json({ success: false, message: 'Cannot delete system role' });
    }

    await role.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ success: false, message: 'Cannot edit system role' });

    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
