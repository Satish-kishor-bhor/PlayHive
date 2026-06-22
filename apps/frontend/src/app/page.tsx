'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  Trophy, Shield, Zap, Users, IndianRupee, Bell,
  ChevronRight, Star, Target, Award, TrendingUp,
  Clock, CheckCircle, ArrowRight, Gamepad2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { CountUp } from '@/components/ui/CountUp';

// ─── Mock data for demo ───────────────────────────────────────────────────────
const FEATURED_TOURNAMENTS = [
  {
    id: '1',
    slug: 'bgmi-squad-championship-june',
    name: 'BGMI Squad Championship',
    bannerUrl: null,
    format: 'SQUAD',
    map: 'ERANGEL',
    entryFee: 100,
    prizePool: 10000,
    maxTeams: 24,
    currentTeams: 18,
    status: 'REGISTRATION_OPEN',
    matchStartTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { displayName: 'PlayHive Official' },
  },
  {
    id: '2',
    slug: 'solo-ace-challenge',
    name: 'Solo Ace Challenge',
    bannerUrl: null,
    format: 'SOLO',
    map: 'MIRAMAR',
    entryFee: 50,
    prizePool: 5000,
    maxTeams: 40,
    currentTeams: 32,
    status: 'REGISTRATION_OPEN',
    matchStartTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { displayName: 'AceArena' },
  },
  {
    id: '3',
    slug: 'conqueror-cup-season-1',
    name: 'Conqueror Cup Season 1',
    bannerUrl: null,
    format: 'SQUAD',
    map: 'VIKENDI',
    entryFee: 200,
    prizePool: 25000,
    maxTeams: 16,
    currentTeams: 16,
    status: 'REGISTRATION_CLOSED',
    matchStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { displayName: 'PlayHive Official' },
  },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Registered Players', icon: Users },
  { value: 2500, suffix: '+', label: 'Tournaments Hosted', icon: Trophy },
  { value: 1200000, prefix: '₹', suffix: '+', label: 'Prizes Distributed', icon: IndianRupee },
  { value: 99, suffix: '.9%', label: 'Uptime Guaranteed', icon: Shield },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Gamepad2,
    title: 'Create Account & Link BGMI',
    description: 'Sign up in 60 seconds. Link your BGMI UID and verify your tier to unlock all tournaments.',
    color: 'from-brand-orange to-brand-amber',
  },
  {
    step: '02',
    icon: Trophy,
    title: 'Register & Pay Entry',
    description: 'Browse tournaments, register your squad, and pay securely via UPI, card, or wallet. Get GST invoice instantly.',
    color: 'from-brand-amber to-brand-gold',
  },
  {
    step: '03',
    icon: Bell,
    title: 'Get Lobby ID Automatically',
    description: 'Room ID + Password lands in your email 5 minutes before match start. No more waiting in Discord.',
    color: 'from-brand-gold to-yellow-300',
  },
  {
    step: '04',
    icon: IndianRupee,
    title: 'Win & Get Paid',
    description: 'Finish top → prize auto-credited to your wallet. Withdraw via UPI anytime. TDS handled automatically.',
    color: 'from-success to-emerald-400',
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure & Verified',
    description: 'Aadhaar/PAN KYC, anti-smurf protection, and Razorpay payment security. Your money is safe.',
    gradient: 'from-blue-900/40 to-blue-800/20',
    border: 'border-blue-800/40',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Instant Lobby IDs',
    description: 'No more waiting for hours. Room ID auto-sent 5 mins before match via email + WhatsApp.',
    gradient: 'from-brand-orange/20 to-transparent',
    border: 'border-brand-orange/30',
    iconColor: 'text-brand-amber',
  },
  {
    icon: IndianRupee,
    title: 'Automated Payouts',
    description: 'TDS deducted automatically. UPI payouts processed within 24hrs. TDS certificates provided.',
    gradient: 'from-green-900/40 to-transparent',
    border: 'border-green-800/30',
    iconColor: 'text-green-400',
  },
  {
    icon: Target,
    title: 'Anti-Cheat System',
    description: 'Screenshot OCR verification, banned player database, dispute system with admin review.',
    gradient: 'from-red-900/30 to-transparent',
    border: 'border-red-800/30',
    iconColor: 'text-red-400',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Leaderboard',
    description: 'Live scoring during multi-match tournaments. Watch your rank climb in real-time.',
    gradient: 'from-purple-900/30 to-transparent',
    border: 'border-purple-800/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: Award,
    title: 'GST Invoices',
    description: 'Every payment generates a professional GST-compliant PDF invoice. Download anytime.',
    gradient: 'from-yellow-900/30 to-transparent',
    border: 'border-yellow-800/30',
    iconColor: 'text-yellow-400',
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-pattern opacity-40" />
        <div className="absolute inset-0 bg-glow-orange" />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container relative z-10 pt-24 pb-16"
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 badge-orange mb-8 text-sm"
            >
              <Star className="w-3.5 h-3.5" />
              India's #1 BGMI Tournament Platform
              <Star className="w-3.5 h-3.5" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-6xl md:text-8xl font-display font-bold text-white mb-6 leading-none tracking-tight"
            >
              COMPETE.{' '}
              <span className="gradient-text">WIN.</span>
              <br />
              DOMINATE.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join <span className="text-white font-semibold">50,000+ BGMI players</span> competing for real cash prizes.
              Secure payments, instant lobby IDs, automated payouts.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/tournaments" className="btn-primary text-lg px-10 py-4 animate-glow">
                Browse Tournaments
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register" className="btn-secondary text-lg px-10 py-4">
                Create Free Account
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-white/40"
            >
              {['Razorpay Secured', 'GST Invoices', 'Instant UPI Payouts', 'KYC Verified'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent" />
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-brand-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-surface/30" />
        <div className="container relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
                    <stat.icon className="w-5 h-5 text-brand-amber" />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-display font-bold gradient-text">
                  {stat.prefix || ''}<CountUp end={stat.value} />{stat.suffix}
                </p>
                <p className="text-sm text-white/50 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TOURNAMENTS ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-brand-amber font-semibold text-sm uppercase tracking-widest mb-2">Live & Upcoming</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
                Featured <span className="gradient-text">Tournaments</span>
              </h2>
            </div>
            <Link href="/tournaments" className="btn-ghost hidden md:flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_TOURNAMENTS.map((tournament, i) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TournamentCard tournament={tournament} />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8 md:hidden">
            <Link href="/tournaments" className="btn-secondary">
              View All Tournaments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section relative">
        <div className="absolute inset-0 bg-brand-surface/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-amber font-semibold text-sm uppercase tracking-widest mb-2">Simple as Chicken Dinner</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              How <span className="gradient-text">PlayHive</span> Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-brand-orange/40 to-transparent z-0" />
                )}
                <div className="card p-6 text-center relative z-10 group hover:border-brand-orange/40 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-black" />
                  </div>
                  <div className="text-5xl font-display font-black text-brand-border mb-3">{item.step}</div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-amber font-semibold text-sm uppercase tracking-widest mb-2">Built for Players</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-2xl mx-auto">
              We've solved every pain point BGMI tournament players face. Because we're players too.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`relative overflow-hidden rounded-2xl border ${feature.border} p-6 bg-gradient-to-br ${feature.gradient} group cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-surface border border-brand-border mb-4 ${feature.iconColor}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-brand-gradient p-12 text-center"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display font-black text-black mb-4">
                READY TO DROP IN?
              </h2>
              <p className="text-black/70 text-xl mb-8 max-w-2xl mx-auto">
                Join 50,000+ players competing for ₹12 Lakhs+ in prizes every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-black/80 transition-colors"
                >
                  Join Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tournaments"
                  className="inline-flex items-center gap-2 bg-black/20 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-black/30 transition-colors border border-black/30"
                >
                  <Clock className="w-5 h-5" />
                  See Live Tournaments
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
