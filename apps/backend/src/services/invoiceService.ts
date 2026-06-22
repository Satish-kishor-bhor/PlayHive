import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface InvoiceData {
  invoiceNumber: string;
  payment: {
    id: string;
    amount: number;
    platformFee: number;
    gstAmount: number;
    totalAmount: number;
    razorpayPaymentId: string | null;
    createdAt: Date;
  };
  user: {
    displayName: string;
    email: string;
    panNumber: string | null;
  };
  tournament: {
    name: string;
    matchStartTime: Date;
  };
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const { invoiceNumber, payment, user, tournament } = data;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `${invoiceNumber}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', 'invoices', fileName);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const ORANGE = '#FF6B00';
      const DARK = '#1a1a1a';
      const GRAY = '#666666';
      const WHITE = '#FFFFFF';

      // ── Background
      doc.rect(0, 0, 595, 842).fill('#0a0a0f');

      // ── Header Band
      doc.rect(0, 0, 595, 140).fill(ORANGE);
      doc.fontSize(36).fillColor(DARK).font('Helvetica-Bold').text('PLAYHIVE', 50, 45);
      doc.fontSize(11).fillColor(DARK).font('Helvetica').text('India\'s #1 BGMI Tournament Platform', 50, 88);
      doc.fontSize(11).fillColor(DARK).text('www.playhive.gg  |  support@playhive.gg', 50, 104);

      // INVOICE label on right
      doc.fontSize(28).fillColor(DARK).font('Helvetica-Bold').text('INVOICE', 380, 50, { width: 165, align: 'right' });
      doc.fontSize(11).fillColor(DARK).font('Helvetica').text(invoiceNumber, 380, 88, { width: 165, align: 'right' });
      doc.fontSize(10).fillColor(DARK).text(new Date(payment.createdAt).toLocaleDateString('en-IN'), 380, 104, { width: 165, align: 'right' });

      // ── Billed To
      doc.fontSize(10).fillColor(GRAY).font('Helvetica').text('BILLED TO', 50, 170);
      doc.fontSize(14).fillColor(WHITE).font('Helvetica-Bold').text(user.displayName, 50, 188);
      doc.fontSize(11).fillColor(GRAY).font('Helvetica').text(user.email, 50, 208);
      if (user.panNumber) {
        doc.text(`PAN: ${user.panNumber}`, 50, 224);
      }

      // ── Payment For
      doc.fontSize(10).fillColor(GRAY).text('PAYMENT FOR', 350, 170);
      doc.fontSize(13).fillColor(WHITE).font('Helvetica-Bold').text(tournament.name, 350, 188, { width: 195 });
      doc.fontSize(10).fillColor(GRAY).font('Helvetica').text(
        `Match: ${new Date(tournament.matchStartTime).toLocaleDateString('en-IN')}`,
        350, 216
      );

      // ── Divider
      doc.moveTo(50, 270).lineTo(545, 270).strokeColor(ORANGE).lineWidth(2).stroke();

      // ── Table Header
      doc.rect(50, 280, 495, 34).fill('#1a1a28');
      doc.fontSize(10).fillColor(ORANGE).font('Helvetica-Bold');
      doc.text('DESCRIPTION', 65, 292);
      doc.text('AMOUNT', 500, 292, { width: 80, align: 'right' });

      // ── Line Items
      let y = 330;
      const lineItems = [
        { label: `Tournament Entry Fee — ${tournament.name}`, amount: payment.amount },
        { label: `Platform Service Fee`, amount: payment.platformFee },
        { label: `GST (18%) on Platform Fee`, amount: payment.gstAmount },
      ];

      lineItems.forEach((item, i) => {
        if (i % 2 === 0) doc.rect(50, y - 6, 495, 28).fill('#0f0f1a');
        doc.fontSize(11).fillColor(WHITE).font('Helvetica').text(item.label, 65, y);
        doc.fillColor(WHITE).text(`₹${item.amount.toFixed(2)}`, 400, y, { width: 145, align: 'right' });
        y += 34;
      });

      // ── Total
      doc.moveTo(50, y + 8).lineTo(545, y + 8).strokeColor('#2a2a3a').lineWidth(1).stroke();
      doc.rect(380, y + 16, 165, 40).fill(ORANGE);
      doc.fontSize(11).fillColor(DARK).font('Helvetica').text('TOTAL PAID', 390, y + 24);
      doc.fontSize(16).fillColor(DARK).font('Helvetica-Bold')
        .text(`₹${payment.totalAmount.toFixed(2)}`, 390, y + 38, { width: 145, align: 'right' });

      // ── Payment Details
      y += 80;
      doc.fontSize(10).fillColor(GRAY).font('Helvetica').text('PAYMENT DETAILS', 50, y);
      y += 16;
      doc.fontSize(10).fillColor(WHITE);
      doc.text(`Transaction ID: ${payment.razorpayPaymentId || 'N/A'}`, 50, y);
      doc.text(`Payment Method: Razorpay (UPI/Card/Wallet)`, 50, y + 16);
      doc.text(`Currency: INR (Indian Rupees)`, 50, y + 32);

      // ── TDS Notice
      y += 70;
      doc.rect(50, y, 495, 52).fill('#1a1a28').strokeColor('#f44336').lineWidth(1).stroke();
      doc.fontSize(9).fillColor('#f44336').font('Helvetica-Bold').text('TDS NOTICE (India):', 65, y + 10);
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
        .text('TDS @ 30% will be deducted from prize winnings above ₹10,000 as per Section 115BB of Income Tax Act, India.', 65, y + 24, { width: 460 });

      // ── Footer
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
        .text('This is a computer-generated invoice and does not require a signature.', 50, 780, { align: 'center', width: 495 });
      doc.text('PlayHive | GST Reg: XX-XXXXX-X | CIN: UXXXXXXXXXXXXXXX', 50, 796, { align: 'center', width: 495 });

      doc.end();

      stream.on('finish', () => {
        logger.info(`Invoice generated: ${filePath}`);
        resolve(`/invoices/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}
