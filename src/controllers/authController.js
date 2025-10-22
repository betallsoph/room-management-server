const User = require('../models/user');
const { generateToken } = require('../middlewares/auth');

const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Kiểm tra input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email, password are required' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Tạo người dùng mới
    const newUser = await User.create({
      fullName,
      email,
      password,
      role: role || 'tenant'
    });

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Tìm user và lấy password (vì mặc định không select)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
  me
};
