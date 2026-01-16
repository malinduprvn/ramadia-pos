const express = require('express');
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/role/:role', userController.getUsersByRole);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;