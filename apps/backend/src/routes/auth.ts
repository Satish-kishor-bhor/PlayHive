import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { authLimiter } from '../middleware/rateLimiter';
import { generateOTP, sendOTPEmail } from '../services/emailService';
import { logger } from '../utils/logger';

export const authRouter = Router();

// ─── Register ───────────────────────────────────────────────────────────────
authRouter.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[0-9])/),
    body('displayName').isLength({ min: 2, max: 50 }),
    body('phone').optional().isMobilePhone('en-IN'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username, password, displayName, phone } = req.body;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName,
          phone: phone || null,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          createdAt: true,
        },
      });

      // Send OTP for email verification
      const otp = generateOTP();
      await prisma.oTPCode.create({
        data: {
          target: email,
          code: otp,
          type: 'EMAIL_VERIFY',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await sendOTPEmail(email, otp, displayName);

      logger.info(`New user registered: ${email}`);
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Check your email to verify your account.',
        user,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── Login ───────────────────────────────────────────────────────────────────
authRouter.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: `Account banned: ${user.banReason || 'Contact support'}`,
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      logger.info(`User logged in: ${email}`);
      return res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          bgmiVerified: user.bgmiVerified,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── Verify Email OTP ─────────────────────────────────────────────────────────
authRouter.post('/verify-email', async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        target: email,
        code: otp,
        type: 'EMAIL_VERIFY',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      }),
      prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      }),
    ]);

    return res.json({ success: true, message: 'Email verified successfully! Welcome to PlayHive 🎮' });
  } catch (error) {
    logger.error('Email verify error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
authRouter.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, userId: decoded.userId },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Rotate refresh token
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: decoded.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
authRouter.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}
