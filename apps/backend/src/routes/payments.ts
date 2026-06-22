import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { generateInvoicePDF } from '../services/invoiceService';
import { sendInvoiceEmail } from '../services/emailService';
import { logger } from '../utils/logger';

export const paymentRouter = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── Create Order ─────────────────────────────────────────────────────────────
paymentRouter.post('/create-order', authenticate, async (req: Request, res: Response) => {
  const { tournamentId, teamId } = req.body;
  const userId = (req as Request & { user: { userId: string } }).user.userId;

  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    if (tournament.entryFee === 0) {
      return res.status(400).json({ success: false, message: 'This is a free tournament' });
    }

    const platformFee = (tournament.entryFee * tournament.platformFeePercent) / 100;
    const gstAmount = (platformFee * parseFloat(process.env.GST_PERCENT || '18')) / 100;
    const totalAmount = tournament.entryFee + platformFee + gstAmount;
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      notes: {
        tournamentId,
        teamId,
        userId,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        tournamentId,
        amount: tournament.entryFee,
        platformFee,
        gstAmount,
        totalAmount,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
      },
    });

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        paymentId: payment.id,
        breakdown: {
          entryFee: tournament.entryFee,
          platformFee,
          gstAmount,
          total: totalAmount,
        },
      },
    });
  } catch (error) {
    logger.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Verify Payment ───────────────────────────────────────────────────────────
paymentRouter.post('/verify', authenticate, async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId, teamId } = req.body;

  try {
    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'COMPLETED',
      },
      include: { user: true, tournament: true },
    });

    // Generate invoice number
    const invoiceCount = await prisma.payment.count({ where: { status: 'COMPLETED' } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount).padStart(5, '0')}`;

    // Generate PDF invoice
    const invoiceUrl = await generateInvoicePDF({
      invoiceNumber,
      payment,
      user: payment.user,
      tournament: payment.tournament!,
    });

    // Update payment with invoice
    await prisma.payment.update({
      where: { id: paymentId },
      data: { invoiceNumber, invoiceUrl, invoiceGeneratedAt: new Date() },
    });

    // Update tournament registration payment
    await prisma.tournamentRegistration.update({
      where: { tournamentId_teamId: { tournamentId: payment.tournamentId!, teamId } },
      data: { paymentId },
    });

    // Send invoice email
    await sendInvoiceEmail(
      payment.user.email,
      payment.user.displayName,
      invoiceNumber,
      invoiceUrl,
      payment.tournament!.name,
      payment.totalAmount
    );

    logger.info(`Payment verified: ${razorpayPaymentId} | Invoice: ${invoiceNumber}`);
    return res.json({
      success: true,
      message: 'Payment successful! Invoice sent to your email 🎉',
      data: { invoiceNumber, invoiceUrl },
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
paymentRouter.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const { event, payload } = req.body;

  if (event === 'payment.failed') {
    const orderId = payload.payment.entity.order_id;
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: 'FAILED' },
    });
    logger.warn(`Payment failed for order: ${orderId}`);
  }

  return res.json({ success: true });
});

// ─── Get My Payments ──────────────────────────────────────────────────────────
paymentRouter.get('/my', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      include: { tournament: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: payments });
  } catch (error) {
    logger.error('Get payments error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
