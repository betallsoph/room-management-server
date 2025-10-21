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

		const updatedUser = await User.findByIdAndUpdate(id, req.body, {
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

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser
};
