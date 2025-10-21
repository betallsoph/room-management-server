const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/room_management';

const buildMongoUri = () => {
	const uri = process.env.MONGO_URI || DEFAULT_URI;

	if (!uri) {
		throw new Error('MONGO_URI is not defined. Please set it in your environment variables.');
	}

	return uri;
};

const connectDB = async () => {
	if (process.env.SKIP_DB === 'true') {
		console.warn('Skipping MongoDB connection because SKIP_DB=true');
		return;
	}

	const mongoUri = buildMongoUri();

	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.error('Failed to connect to MongoDB', error);
		throw error;
	}
};

const disconnectDB = async () => {
	if (mongoose.connection.readyState === 0) {
		return;
	}

	await mongoose.disconnect();
};

module.exports = {
	connectDB,
	disconnectDB
};
