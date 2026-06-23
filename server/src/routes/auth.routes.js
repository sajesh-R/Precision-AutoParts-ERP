const express = require('express');
const { login, logout, getMe, updatePassword, forgotPassword, resetPassword, forceUpdatePassword } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/force-update-password', forceUpdatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
