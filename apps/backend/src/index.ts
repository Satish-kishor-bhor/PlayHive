import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { tournamentRouter } from './routes/tournaments';
import { teamRouter } from './routes/teams';
import { paymentRouter } from './routes/payments';
import { payoutRouter } from './routes/payouts';
import { resultsRouter } from './routes/results';
import { disputeRouter } from './routes/disputes';
import { notificationRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initSocketHandlers } from './socket/handlers';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
initSocketHandlers(io);

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    service: 'PlayHive API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tournaments', tournamentRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/payouts', payoutRouter);
app.use('/api/v1/results', resultsRouter);
app.use('/api/v1/disputes', disputeRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`🎮 PlayHive API running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🚀 Socket.io ready`);
});

export default app;
