const express = require('express');
const { getUsers, createUser, updateUserStatus } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
// Example simple authorization: only Super Admin or Admin can manage users
router.use(authorize('Super Admin', 'Admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id/status')
  .put(updateUserStatus);

module.exports = router;
