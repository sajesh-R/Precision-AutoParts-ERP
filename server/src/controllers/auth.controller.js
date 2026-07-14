const User = require('../models/User');
const { LoginHistory } = require('../models/Audit');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('role');
    
    console.log('Login attempt for:', email);
    console.log('User found in DB:', !!user);

    if (!user) {
      await LoginHistory.create({ email, status: 'Failed', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('User status:', user.status);

    // Check lock status
    if (user.status === 'Locked' || (user.lockUntil && user.lockUntil > Date.now())) {
      await LoginHistory.create({ userId: user._id, email, status: 'Failed', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      return res.status(403).json({ success: false, message: 'Account is locked. Please contact administrator.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.status = 'Locked';
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      await LoginHistory.create({ userId: user._id, email, status: 'Failed', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = Date.now();
    await user.save();
    
    await LoginHistory.create({ userId: user._id, email, status: 'Success', ipAddress: req.ip, userAgent: req.headers['user-agent'] });

    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
    const isPasswordExpired = user.passwordChangedAt && (Date.now() - new Date(user.passwordChangedAt).getTime() > NINETY_DAYS);

    if (isPasswordExpired || !user.passwordChangedAt) {
      const tempToken = jwt.sign({ tempId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
      return res.status(200).json({
        success: true,
        requirePasswordChange: true,
        tempToken,
        email: user.email
      });
    }



    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name,
        permissions: user.role?.permissions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    await LoginHistory.create({ userId: req.user.id, email: req.user.email, status: 'Logout', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Password is incorrect' });
    }

    user.password = req.body.newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real application, send this token via email using nodemailer/SendGrid.
    // As per the implementation plan, we log it to the console for this phase.
    console.log(`[EMAIL SIMULATION] Password reset token for ${user.email}: ${resetToken}`);

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc    Force update password for expired passwords
// @route   POST /api/auth/force-update-password
// @access  Public
exports.forceUpdatePassword = async (req, res) => {
  try {
    const { tempToken, currentPassword, newPassword } = req.body;

    if (!tempToken || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }

    const user = await User.findById(decoded.tempId).select('+password').populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name,
        permissions: user.role?.permissions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
