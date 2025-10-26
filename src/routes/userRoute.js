const express = require('express');
const {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getProfile,
	updateProfile,
	changePassword
} = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Profile routes MUST come before /:id routes (more specific routes first)
router.get('/profile/me', authenticateToken, getProfile);
router.put('/profile/me', authenticateToken, updateProfile);
router.post('/profile/change-password', authenticateToken, changePassword);

// General user routes
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
