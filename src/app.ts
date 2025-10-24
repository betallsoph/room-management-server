import express from 'express';
import buildingsRouter from './routes/admin/buildings';
import blocksRouter from './routes/admin/blocks';
import roomsRouter from './routes/admin/rooms';
import tenantsRouter from './routes/admin/tenants';
import invoicesRouter from './routes/admin/invoices';
import clientAuthRouter from './routes/client/auth';
import clientProfileRouter from './routes/client/profile';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/admin/buildings', buildingsRouter);
  app.use('/api/admin/blocks', blocksRouter);
  app.use('/api/admin/rooms', roomsRouter);
  app.use('/api/admin/tenants', tenantsRouter);
  app.use('/api/admin/invoices', invoicesRouter);

  app.use('/api/client/auth', clientAuthRouter);
  app.use('/api/client/profile', clientProfileRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
