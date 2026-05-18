import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './lib/error-handler.js';
import cartRouter from './routes/cart.js';
import checkoutRouter from './routes/checkout.js';
import aiRouter from './routes/ai.js';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('tiny'));

  app.use('/v1/cart', cartRouter);
  app.use('/v1/checkout', checkoutRouter);
  app.use('/v1/ai', aiRouter);

  app.use(errorHandler);

  return app;
}
