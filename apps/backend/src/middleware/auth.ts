import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface JWTPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user: JWTPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }
      next();
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}
