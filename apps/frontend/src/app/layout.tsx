import type { Metadata } from 'next';
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PlayHive — India\'s #1 BGMI Tournament Platform',
  description:
    'Register for BGMI tournaments, compete with the best players across India, win real cash prizes. Secure payments, instant lobby IDs, automated prize distribution.',
  keywords: ['BGMI tournament', 'BGMI India', 'BGMI cash tournament', 'BGMI esports', 'PlayHive', 'battlegrounds mobile india tournament'],
  openGraph: {
    title: 'PlayHive — BGMI Tournament Platform',
    description: 'Compete. Win. Dominate. India\'s most trusted BGMI tournament platform.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayHive — BGMI Tournament Platform',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable} font-sans bg-brand-dark text-white antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
