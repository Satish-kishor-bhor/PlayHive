'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy, Wallet, Bell, Settings, User, Target,
  TrendingUp, IndianRupee, Clock, CheckCircle,
  ChevronRight, Plus, Star, Shield, Gamepad2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

// Mock dashboard data
const MOCK_USER = {
  displayName: 'Dynamo Gaming',
  username: 'dynamo_bgmi',
  bgmiUid: '51234567890',
  bgmiTier: 'CROWN',
  bgmiVerified: true,
  kycStatus: 'APPROVED',
  walletBalance: 2450,
  totalEarnings: 18500,
  tournamentsPlayed: 47,
  wins: 8,
};

const MOCK_REGISTRATIONS = [
  { id: '1', tournament: { name: 'BGMI Squad Championship', slug: 'bgmi-squad-championship-june', status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 2 * 86400000).toISOString(), prizePool: 10000 }, status: 'REGISTERED' },
  { id: '2', tournament: { name: 'Solo Ace Challenge', slug: 'solo-ace-challenge', status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 5 * 86400000).toISOString(), prizePool: 5000 }, status: 'REGISTERED' },
];

const MOCK_RECENT_PAYMENTS = [
  { id: '1', invoiceNumber: 'INV-2026-00142', tournament: 'BGMI Squad Championship', amount: 118, date: '2026-06-20', status: 'COMPLETED' },
  { id: '2', invoiceNumber: 'INV-2026-00118', tournament: 'Solo Ace Challenge', amount: 59, date: '2026-06-18', status: 'COMPLETED' },
];

const TIER_COLORS: Record<string, string> = {
  CONQUEROR: 'text-red-400', ACE: 'text-purple-400', CROWN: 'text-yellow-400',
  DIAMOND: 'text-cyan-400', PLATINUM: 'text-teal-400', GOLD: 'text-amber-400',
  SILVER: 'text-slate-300', BRONZE: 'text-orange-400',
};

const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: TrendingUp, active: true },
  { label: 'My Tournaments', href: '/dashboard/tournaments', icon: Trophy },
  { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { label: 'Payments', href: '/dashboard/payments', icon: IndianRupee },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'payments'>('overview');
  const winRate = MOCK_USER.tournamentsPlayed > 0
    ? ((MOCK_USER.wins / MOCK_USER.tournamentsPlayed) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-brand-surface border-r border-brand-border pt-8 px-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-black font-black text-lg">
              {MOCK_USER.displayName[0]}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{MOCK_USER.displayName}</p>
              <p className={`text-xs font-medium ${TIER_COLORS[MOCK_USER.bgmiTier]}`}>
                {MOCK_USER.bgmiTier} TIER
              </p>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-brand-gradient rounded-xl p-4 mb-6">
            <p className="text-black/60 text-xs mb-1 font-medium">Wallet Balance</p>
            <p className="text-black text-2xl font-black">₹{MOCK_USER.walletBalance.toLocaleString('en-IN')}</p>
            <Link href="/dashboard/wallet" className="text-black/60 text-xs hover:text-black transition-colors flex items-center gap-1 mt-1">
              Withdraw <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  link.active
                    ? 'bg-brand-orange/15 text-brand-amber border border-brand-orange/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* KYC Status */}
          <div className="mt-auto pb-6">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              MOCK_USER.kycStatus === 'APPROVED'
                ? 'bg-success/10 border border-success/20 text-success'
                : 'bg-warning/10 border border-warning/20 text-warning'
            }`}>
              <Shield className="w-4 h-4 flex-shrink-0" />
              KYC {MOCK_USER.kycStatus === 'APPROVED' ? 'Verified ✓' : 'Pending — Complete now'}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-bold text-white">
                Welcome back, <span className="gradient-text">{MOCK_USER.displayName.split(' ')[0]}</span> 👋
              </motion.h1>
              <p className="text-white/40 text-sm mt-1">Here's what's happening in your arena</p>
            </div>
            <Link href="/tournaments" className="btn-primary text-sm px-5 py-2.5 hidden md:flex">
              <Plus className="w-4 h-4" /> Join Tournament
            </Link>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Earnings', value: `₹${MOCK_USER.totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10 border-success/20' },
              { label: 'Tournaments', value: MOCK_USER.tournamentsPlayed, icon: Trophy, color: 'text-brand-amber', bg: 'bg-brand-orange/10 border-brand-orange/20' },
              { label: 'Wins', value: MOCK_USER.wins, icon: Star, color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/20' },
              { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-info', bg: 'bg-info/10 border-info/20' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`card p-4 border ${stat.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-white/40">{stat.label}</span>
                </div>
                <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* BGMI Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20">
                  <Gamepad2 className="w-6 h-6 text-brand-amber" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">BGMI Profile</h3>
                  <p className="text-white/40 text-sm">UID: {MOCK_USER.bgmiUid}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge text-xs ${TIER_COLORS[MOCK_USER.bgmiTier]} bg-yellow-900/20 border border-yellow-800/30`}>
                  {MOCK_USER.bgmiTier}
                </span>
                {MOCK_USER.bgmiVerified && (
                  <div className="flex items-center gap-1.5 badge-green text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-brand-surface/50 p-1 rounded-xl border border-brand-border w-fit">
            {(['overview', 'registrations', 'payments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-brand-orange text-black'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' || activeTab === 'registrations' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-display font-bold text-white text-lg">My Registered Tournaments</h3>
              {MOCK_REGISTRATIONS.map((reg) => (
                <div key={reg.id} className="card p-4 flex items-center justify-between group hover:border-brand-orange/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-brand-orange/10">
                      <Trophy className="w-5 h-5 text-brand-amber" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm group-hover:text-brand-amber transition-colors">
                        {reg.tournament.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reg.tournament.matchStartTime).toLocaleDateString('en-IN')}
                        </span>
                        <span className="text-xs text-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {reg.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-gold font-bold text-sm">₹{reg.tournament.prizePool.toLocaleString('en-IN')}</p>
                    <p className="text-white/30 text-xs">Prize Pool</p>
                  </div>
                </div>
              ))}
              <Link href="/tournaments" className="flex items-center justify-center gap-2 card p-4 border-dashed text-white/30 hover:text-brand-amber hover:border-brand-orange/30 transition-all text-sm">
                <Plus className="w-4 h-4" /> Find more tournaments
              </Link>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-display font-bold text-white text-lg">Recent Payments & Invoices</h3>
              {MOCK_RECENT_PAYMENTS.map((payment) => (
                <div key={payment.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">{payment.tournament}</p>
                    <p className="text-xs text-white/40 mt-0.5">{payment.invoiceNumber} • {payment.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-success font-bold">₹{payment.amount}</span>
                    <button className="badge-orange text-xs cursor-pointer hover:bg-brand-orange/30 transition-colors">
                      <Target className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
