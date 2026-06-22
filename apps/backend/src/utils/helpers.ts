import { prisma } from '../lib/prisma';

export async function generateSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = base;
  let counter = 1;

  while (await prisma.tournament.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function calculateTDS(amount: number): number {
  const TDS_THRESHOLD = parseFloat(process.env.TDS_THRESHOLD || '10000');
  const TDS_PERCENT = parseFloat(process.env.TDS_PERCENT || '30');
  if (amount > TDS_THRESHOLD) {
    return (amount * TDS_PERCENT) / 100;
  }
  return 0;
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;
}
