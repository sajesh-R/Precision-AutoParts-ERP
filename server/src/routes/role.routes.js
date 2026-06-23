const express = require('express');
const { getRoles, createRole, deleteRole, updateRole } = require('../controllers/role.controller');
const { protect, authorize, requirePermission } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin', 'Admin'));

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .put(requirePermission('Roles', 'update'), updateRole)
  .delete(requirePermission('Roles', 'delete'), deleteRole);

module.exports = router;
