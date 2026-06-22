import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const BASE_STYLES = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0a0a0f;
  color: #ffffff;
`;

function emailWrapper(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | PlayHive</title>
</head>
<body style="${BASE_STYLES} margin:0; padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#12121a; border-radius:16px; overflow:hidden; border:1px solid #2a2a3a;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b00 0%, #ff9500 50%, #ffd700 100%); padding:30px; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:900; color:#0a0a0f; letter-spacing:-1px;">
                🎮 PLAY<span style="color:#0a0a0f;">HIVE</span>
              </h1>
              <p style="margin:5px 0 0; color:#0a0a0f; opacity:0.8; font-size:13px;">India's #1 BGMI Tournament Platform</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d14; padding:24px 36px; text-align:center; border-top:1px solid #2a2a3a;">
              <p style="margin:0; color:#666; font-size:12px;">© 2026 PlayHive. All rights reserved.</p>
              <p style="margin:8px 0 0; color:#444; font-size:11px;">
                You're receiving this because you registered on PlayHive.
                <a href="#" style="color:#ff6b00; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── OTP Email ────────────────────────────────────────────────────────────────
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
  const content = `
    <h2 style="color:#ff9500; margin:0 0 8px; font-size:24px;">Verify Your Email 🔐</h2>
    <p style="color:#aaa; margin:0 0 28px;">Hey <strong style="color:#fff;">${name}</strong>, welcome to the arena!</p>
    <p style="color:#ccc; margin:0 0 24px;">Your email verification code is:</p>
    <div style="background:#1a1a28; border:2px solid #ff6b00; border-radius:12px; padding:24px; text-align:center; margin:0 0 28px;">
      <span style="font-size:42px; font-weight:900; letter-spacing:12px; color:#ff9500;">${otp}</span>
    </div>
    <p style="color:#888; font-size:13px; margin:0;">This code expires in <strong style="color:#fff;">24 hours</strong>. Do not share it with anyone.</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'PlayHive'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `${otp} — Your PlayHive Verification Code`,
    html: emailWrapper(content, 'Verify Your Email'),
  });

  logger.info(`OTP email sent to ${email}`);
}

// ─── Tournament Confirmation Email ────────────────────────────────────────────
export async function sendTournamentConfirmationEmail(
  email: string,
  name: string,
  tournamentName: string,
  matchStart: Date
): Promise<void> {
  const matchDate = new Date(matchStart).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const content = `
    <h2 style="color:#ff9500; margin:0 0 8px; font-size:24px;">You're In! 🏆</h2>
    <p style="color:#aaa; margin:0 0 28px;">Hey <strong style="color:#fff;">${name}</strong>, your registration is confirmed!</p>
    <div style="background:#1a1a28; border-left:4px solid #ff6b00; border-radius:8px; padding:20px 24px; margin:0 0 28px;">
      <h3 style="color:#ffd700; margin:0 0 12px; font-size:18px;">${tournamentName}</h3>
      <p style="margin:4px 0; color:#aaa; font-size:14px;">📅 <strong style="color:#fff;">${matchDate}</strong></p>
    </div>
    <p style="color:#ccc; margin:0 0 16px;">The Lobby ID and Password will be emailed to you <strong style="color:#ff9500;">5 minutes before the match</strong> starts.</p>
    <div style="background:#1a1a28; border-radius:8px; padding:16px; margin:0 0 24px;">
      <p style="margin:0; color:#888; font-size:13px;">⚠️ <strong style="color:#ffd700;">Important:</strong> Make sure your BGMI username matches your profile. Mismatches = disqualification.</p>
    </div>
    <a href="${process.env.FRONTEND_URL}/tournaments" style="display:inline-block; background:linear-gradient(135deg,#ff6b00,#ff9500); color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:700; font-size:15px;">View Tournament →</a>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `✅ Registered for ${tournamentName} — PlayHive`,
    html: emailWrapper(content, 'Registration Confirmed'),
  });

  logger.info(`Confirmation email sent to ${email} for ${tournamentName}`);
}

// ─── Lobby ID Email ───────────────────────────────────────────────────────────
export async function sendLobbyEmail(
  email: string,
  name: string,
  tournamentName: string,
  lobbyId: string,
  lobbyPassword: string,
  matchStart: Date
): Promise<void> {
  const matchDate = new Date(matchStart).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const content = `
    <h2 style="color:#ffd700; margin:0 0 8px; font-size:24px;">🎮 Match Starting Soon!</h2>
    <p style="color:#aaa; margin:0 0 28px;">Hey <strong style="color:#fff;">${name}</strong>! Your lobby is ready for <strong style="color:#ff9500;">${tournamentName}</strong></p>

    <div style="background:linear-gradient(135deg,#1a1a28,#12121a); border:2px solid #ffd700; border-radius:12px; padding:28px; margin:0 0 28px; text-align:center;">
      <p style="color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">ROOM ID</p>
      <p style="font-size:36px; font-weight:900; color:#ffd700; margin:0 0 20px; letter-spacing:4px;">${lobbyId}</p>
      <p style="color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">PASSWORD</p>
      <p style="font-size:28px; font-weight:700; color:#ff9500; margin:0; letter-spacing:3px;">${lobbyPassword}</p>
    </div>

    <div style="background:#1a1a28; border-radius:8px; padding:16px; margin:0 0 24px;">
      <p style="margin:0 0 8px; color:#888; font-size:13px;">⏰ Match Time: <strong style="color:#fff;">${matchDate}</strong></p>
      <p style="margin:0; color:#f44; font-size:13px; font-weight:600;">⚠️ Missing check-in = automatic disqualification. Join NOW!</p>
    </div>

    <p style="color:#666; font-size:12px; margin:0;">This lobby ID is private. Do NOT share on social media. Sharing = ban.</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🎮 LOBBY READY: ${tournamentName} — Room ${lobbyId}`,
    html: emailWrapper(content, 'Lobby ID Ready'),
  });

  logger.info(`Lobby email sent to ${email}: Room ${lobbyId}`);
}

// ─── Invoice Email ────────────────────────────────────────────────────────────
export async function sendInvoiceEmail(
  email: string,
  name: string,
  invoiceNumber: string,
  invoiceUrl: string,
  tournamentName: string,
  amount: number
): Promise<void> {
  const content = `
    <h2 style="color:#ff9500; margin:0 0 8px; font-size:24px;">Payment Confirmed 🧾</h2>
    <p style="color:#aaa; margin:0 0 28px;">Hey <strong style="color:#fff;">${name}</strong>, your payment was successful!</p>

    <div style="background:#1a1a28; border-radius:12px; padding:24px; margin:0 0 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888; font-size:13px; padding:6px 0;">Invoice Number</td>
          <td style="text-align:right; color:#ffd700; font-weight:700;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="color:#888; font-size:13px; padding:6px 0;">Tournament</td>
          <td style="text-align:right; color:#fff;">${tournamentName}</td>
        </tr>
        <tr>
          <td style="color:#888; font-size:13px; padding:6px 0; border-top:1px solid #2a2a3a; padding-top:12px;">Total Paid</td>
          <td style="text-align:right; color:#4caf50; font-weight:900; font-size:20px; border-top:1px solid #2a2a3a; padding-top:12px;">₹${amount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <a href="${invoiceUrl}" style="display:inline-block; background:linear-gradient(135deg,#ff6b00,#ff9500); color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:700; font-size:15px; margin-right:12px;">Download Invoice →</a>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🧾 Invoice ${invoiceNumber} — PlayHive`,
    html: emailWrapper(content, 'Payment Invoice'),
  });
}

// ─── Prize Won Email ──────────────────────────────────────────────────────────
export async function sendPrizeEmail(
  email: string,
  name: string,
  tournamentName: string,
  rank: number,
  prizeAmount: number,
  netAmount: number,
  tdsAmount: number
): Promise<void> {
  const content = `
    <h2 style="color:#ffd700; margin:0 0 8px; font-size:24px;">You Won! 🏆 Chicken Dinner!</h2>
    <p style="color:#aaa; margin:0 0 28px;">GG <strong style="color:#fff;">${name}</strong>! You finished <strong style="color:#ffd700;">#${rank}</strong> in <strong style="color:#ff9500;">${tournamentName}</strong></p>

    <div style="background:linear-gradient(135deg,#1a1a10,#1a1a28); border:2px solid #ffd700; border-radius:12px; padding:24px; margin:0 0 28px; text-align:center;">
      <p style="color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Prize Amount</p>
      <p style="font-size:48px; font-weight:900; color:#4caf50; margin:0;">₹${prizeAmount.toFixed(0)}</p>
    </div>

    <div style="background:#1a1a28; border-radius:8px; padding:16px; margin:0 0 24px;">
      <p style="margin:0 0 6px; color:#888; font-size:12px;">TDS Deducted (30%): <strong style="color:#f44;">-₹${tdsAmount.toFixed(2)}</strong></p>
      <p style="margin:0; color:#888; font-size:12px;">Net Amount Credited: <strong style="color:#4caf50;">₹${netAmount.toFixed(2)}</strong></p>
    </div>

    <p style="color:#ccc; font-size:13px;">Amount will be credited to your PlayHive wallet within <strong style="color:#fff;">24 hours</strong>. You can withdraw to your UPI/bank account.</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🏆 You Won ₹${prizeAmount}! — ${tournamentName}`,
    html: emailWrapper(content, 'Prize Won'),
  });
}
