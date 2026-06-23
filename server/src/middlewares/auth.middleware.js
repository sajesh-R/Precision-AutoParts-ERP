const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id).populate('role');
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
    }

    // Check status
    if (currentUser.status !== 'Active') {
      return res.status(403).json({ success: false, message: `User account is ${currentUser.status.toLowerCase()}` });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role.name) && req.user.role.name !== 'Super Admin') {
      return res.status(403).json({ success: false, message: `User role ${req.user.role.name} is not authorized to access this route` });
    }
    next();
  };
};

const requirePermission = (moduleName, action) => {
  return (req, res, next) => {
    // Super Admin overrides all
    if (req.user.role.name === 'Super Admin') return next();

    const perms = req.user.role.permissions;
    const hasAccess = perms.some(p => 
      (p.module === moduleName || p.module === 'All') && 
      (p.actions.includes(action) || p.actions.includes('manage'))
    );

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: `Permission denied for ${action} on ${moduleName}` });
    }
    next();
  };
};

module.exports = { protect, authorize, requirePermission };
