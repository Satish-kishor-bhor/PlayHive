'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Menu, X, Bell, Wallet, ChevronDown, User, Settings, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const NAV_LINKS = [
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'Community', href: '/community' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-dark/95 backdrop-blur-xl border-b border-brand-border/50 shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-brand-gradient group-hover:shadow-orange-glow transition-all duration-300">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-display font-black text-white">
              PLAY<span className="gradient-text">HIVE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-brand-amber bg-brand-orange/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Wallet */}
                <Link href="/dashboard/wallet" className="flex items-center gap-2 btn-ghost text-sm">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">₹{user.walletBalance?.toFixed(0) || '0'}</span>
                </Link>

                {/* Notifications */}
                <button className="btn-ghost relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 btn-ghost"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-black font-bold text-sm">
                      {user.displayName?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 card py-2 shadow-card"
                      >
                        <div className="px-4 py-3 border-b border-brand-border">
                          <p className="font-semibold text-white text-sm">{user.displayName}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        {user.role === 'ORGANIZER' || user.role === 'ADMIN' ? (
                          <Link href="/organizer/create" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-amber hover:bg-brand-orange/10 transition-colors">
                            <Plus className="w-4 h-4" /> Create Tournament
                          </Link>
                        ) : null}
                        <div className="border-t border-brand-border mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-5 py-2.5">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden btn-ghost"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-surface border-t border-brand-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-brand-amber bg-brand-orange/10'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-brand-border mt-2 pt-2 flex flex-col gap-2">
                {user ? (
                  <button onClick={logout} className="btn-secondary w-full justify-center text-sm">
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm" onClick={() => setIsMobileOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="btn-primary w-full justify-center text-sm" onClick={() => setIsMobileOpen(false)}>
                      Join Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
