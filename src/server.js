require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/connection');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log('Gracefully shutting down...');
      await disconnectDB().catch((error) => {
        console.error('Error during Mongo disconnect', error);
      });

      server.close(() => {
        console.log('HTTP server closed');
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start the server', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
