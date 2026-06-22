'use client';

import Link from 'next/link';
import { Trophy, Twitter, Youtube, Instagram, MessageCircle } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Create Tournament', href: '/organizer/create' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Dispute Policy', href: '/disputes' },
    { label: 'Anti-Cheat Rules', href: '/rules' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: 'https://twitter.com/playhive', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com/playhive', label: 'YouTube' },
  { icon: Instagram, href: 'https://instagram.com/playhive', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://discord.gg/playhive', label: 'Discord' },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-brand-gradient">
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-display font-black text-white">
                PLAY<span className="gradient-text">HIVE</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
              India's most trusted BGMI tournament platform. Compete for real cash prizes with secure payments and instant payouts.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-brand-card border border-brand-border text-white/40 hover:text-brand-amber hover:border-brand-orange/40 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 text-center md:text-left">
            © 2026 PlayHive Technologies Pvt. Ltd. All rights reserved.
            <span className="mx-2">·</span>
            GST Reg: 27XXXXX1234X1ZX
            <span className="mx-2">·</span>
            CIN: U92490MH2026PTC000001
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>🔒 Razorpay Secured</span>
            <span>·</span>
            <span>🇮🇳 Made in India</span>
            <span>·</span>
            <span>18+ only for cash tournaments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
