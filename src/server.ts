import http from 'http';
import dotenv from 'dotenv';
import createApp from './app';
import { connectDatabase } from './config/database';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

export const startServer = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`room-server listening on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exitCode = 1;
  });
}
