import mongoose from 'mongoose';

let isConnected = false;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(mongoUri);

  isConnected = true;

  return connection;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
