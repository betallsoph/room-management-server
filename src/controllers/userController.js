const mongoose = require('mongoose');
const User = require('../models/user');

const parsePagination = ({ page = 1, limit = 20 }) => {
	const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
	const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

	return { skip: (parsedPage - 1) * parsedLimit, limit: parsedLimit, page: parsedPage };
};

const sendNotFound = (res, message = 'Resource not found') => res.status(404).json({ message });

const sendServerError = (res, error) => {
	console.error(error);
	return res.status(500).json({ message: 'Internal server error' });
};

const getUsers = async (req, res) => {
	try {
		const { skip, limit, page } = parsePagination(req.query);

		const [users, total] = await Promise.all([
			User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
			User.countDocuments()
		]);

		return res.json({
			data: users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		return sendServerError(res, error);
	}
};

const getUserById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user id' });
		}

		const user = await User.findById(id);

		if (!user) {
			return sendNotFound(res, 'User not found');
		}

		return res.json(user);
	} catch (error) {
		return sendServerError(res, error);
	}
};

const createUser = async (req, res) => {
	try {
		const payload = req.body;

		const user = await User.create(payload);

		return res.status(201).json(user);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		return sendServerError(res, error);
	}
};

const updateUser = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user id' });
		}

		// Only allow updating safe fields (prevent role/password injection)
		const { fullName, phone, address, dateOfBirth, avatar } = req.body;
		
		const updateData = {};
		if (fullName) updateData.fullName = fullName;
		if (phone) updateData.phone = phone;
		if (address !== undefined) updateData.address = address;
		if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
		if (avatar) updateData.avatar = avatar;

		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true
		});

		if (!updatedUser) {
			return sendNotFound(res, 'User not found');
		}

		return res.json(updatedUser);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		return sendServerError(res, error);
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user id' });
		}

		const deleted = await User.findByIdAndDelete(id);

		if (!deleted) {
			return sendNotFound(res, 'User not found');
		}

		return res.status(204).send();
	} catch (error) {
		return sendServerError(res, error);
	}
};

// Get current user profile
const getProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		
		const user = await User.findById(userId).select('-password');
		
		if (!user) {
			return sendNotFound(res, 'User not found');
		}
		
		return res.json(user);
	} catch (error) {
		return sendServerError(res, error);
	}
};

// Update current user profile
const updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const { fullName, phone, address, dateOfBirth, avatar } = req.body;
		
		const updateData = {};
		if (fullName) updateData.fullName = fullName;
		if (phone) updateData.phone = phone;
		if (address !== undefined) updateData.address = address;
		if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
		if (avatar) updateData.avatar = avatar;
		
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			updateData,
			{ new: true, runValidators: true }
		).select('-password');
		
		if (!updatedUser) {
			return sendNotFound(res, 'User not found');
		}
		
		return res.json({
			message: 'Cập nhật thông tin thành công',
			user: updatedUser
		});
	} catch (error) {
		return sendServerError(res, error);
	}
};

// Change password
const changePassword = async (req, res) => {
	try {
		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;
		
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ 
				message: 'Vui lòng nhập đầy đủ thông tin' 
			});
		}
		
	if (newPassword.length < 6) {
		return res.status(400).json({ 
			message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
		});
	}
	
	// Need to explicitly select password field for comparison
	const user = await User.findById(userId).select('+password');
	
	if (!user) {
		return sendNotFound(res, 'User not found');
	}
	
	// Debug: Check if password was loaded
	if (!user.password) {
		console.error('Password field not loaded for user:', userId);
		return res.status(500).json({ 
			message: 'Không thể xác thực mật khẩu. Vui lòng liên hệ admin.' 
		});
	}
	
	// Verify current password
	const isMatch = await user.comparePassword(currentPassword);
		
		if (!isMatch) {
			return res.status(401).json({ 
				message: 'Mật khẩu hiện tại không đúng' 
			});
		}
		
		// Update password
		user.password = newPassword;
		await user.save();
		
		return res.json({
			message: 'Đổi mật khẩu thành công'
		});
	} catch (error) {
		return sendServerError(res, error);
	}
};

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getProfile,
	updateProfile,
	changePassword
};
