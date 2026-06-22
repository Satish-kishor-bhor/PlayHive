import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export function initSocketHandlers(io: SocketServer): void {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);

    // Join tournament room for real-time updates
    socket.on('tournament:join', (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`);
      logger.debug(`User ${socket.data.userId} joined tournament room: ${tournamentId}`);
    });

    socket.on('tournament:leave', (tournamentId: string) => {
      socket.leave(`tournament:${tournamentId}`);
    });

    // Check-in event
    socket.on('checkin', (data: { tournamentId: string; teamId: string }) => {
      io.to(`tournament:${data.tournamentId}`).emit('checkin:update', {
        teamId: data.teamId,
        userId: socket.data.userId,
        checkedInAt: new Date(),
      });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
}
