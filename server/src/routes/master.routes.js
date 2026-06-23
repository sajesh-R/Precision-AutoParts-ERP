const express = require('express');
const { getAll, create, update, remove } = require('../controllers/master.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // Ensure all master data routes are protected

// Dynamic generic routes
router.get('/:model', getAll);
router.post('/:model', create);
router.put('/:model/:id', update);
router.delete('/:model/:id', remove);

module.exports = router;
