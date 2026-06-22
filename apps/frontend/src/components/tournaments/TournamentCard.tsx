'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, IndianRupee, Clock, MapPin, Trophy, Lock } from 'lucide-react';

interface Tournament {
  id: string;
  slug: string;
  name: string;
  bannerUrl: string | null;
  format: string;
  map: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  currentTeams: number;
  status: string;
  matchStartTime: string;
  organizer: { displayName: string };
}

const FORMAT_LABELS: Record<string, string> = {
  SOLO: '🎯 Solo',
  DUO: '👥 Duo',
  SQUAD: '⚔️ Squad',
};

const MAP_COLORS: Record<string, string> = {
  ERANGEL: 'bg-green-900/30 text-green-400',
  MIRAMAR: 'bg-yellow-900/30 text-yellow-400',
  SANHOK: 'bg-emerald-900/30 text-emerald-400',
  VIKENDI: 'bg-blue-900/30 text-blue-400',
  NUSA: 'bg-orange-900/30 text-orange-400',
  RONDO: 'bg-purple-900/30 text-purple-400',
  LIVIK: 'bg-red-900/30 text-red-400',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse: boolean }> = {
  REGISTRATION_OPEN: { label: 'Registering', color: 'text-success', pulse: true },
  REGISTRATION_CLOSED: { label: 'Full', color: 'text-danger', pulse: false },
  ONGOING: { label: 'LIVE', color: 'text-brand-amber', pulse: true },
  COMPLETED: { label: 'Ended', color: 'text-white/40', pulse: false },
  DRAFT: { label: 'Draft', color: 'text-white/30', pulse: false },
};

function TimeUntil({ date }: { date: string }) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return <span className="text-white/40">Started</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return <span>{days}d {hours}h</span>;
  if (hours > 0) return <span className="text-brand-amber">{hours}h {mins}m</span>;
  return <span className="text-danger animate-pulse">{mins}m</span>;
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const statusCfg = STATUS_CONFIG[tournament.status] || STATUS_CONFIG.DRAFT;
  const fillPercent = (tournament.currentTeams / tournament.maxTeams) * 100;
  const isFull = tournament.currentTeams >= tournament.maxTeams;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/tournaments/${tournament.slug}`}>
        <div className="card group cursor-pointer overflow-hidden h-full">
          {/* Banner */}
          <div className="relative h-40 bg-gradient-to-br from-brand-card to-brand-surface overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-hero-pattern opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent" />

            {/* Prize Pool Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-brand-gold/30 rounded-xl px-3 py-1.5">
              <Trophy className="w-3.5 h-3.5 text-brand-gold" />
              <span className="text-brand-gold font-bold text-sm">₹{(tournament.prizePool / 1000).toFixed(0)}K</span>
            </div>

            {/* Status */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
              {statusCfg.pulse && (
                <span className={`w-2 h-2 rounded-full ${tournament.status === 'ONGOING' ? 'bg-brand-amber' : 'bg-success'} animate-pulse`} />
              )}
              <span className={`text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>

            {/* Format */}
            <div className="absolute bottom-3 left-3">
              <span className="badge-orange text-xs">{FORMAT_LABELS[tournament.format]}</span>
            </div>

            {/* Map */}
            <div className="absolute bottom-3 right-3">
              <span className={`badge text-xs ${MAP_COLORS[tournament.map] || 'badge-orange'}`}>
                <MapPin className="w-3 h-3" />
                {tournament.map}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-display font-bold text-white text-lg leading-tight mb-1 group-hover:text-brand-amber transition-colors line-clamp-1">
              {tournament.name}
            </h3>
            <p className="text-xs text-white/40 mb-4">by {tournament.organizer.displayName}</p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-0.5">
                  <IndianRupee className="w-3 h-3" />
                  Entry
                </div>
                <p className="font-bold text-white text-sm">
                  {tournament.entryFee === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    `₹${tournament.entryFee}`
                  )}
                </p>
              </div>
              <div className="text-center border-x border-brand-border">
                <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-0.5">
                  <Users className="w-3 h-3" />
                  Teams
                </div>
                <p className="font-bold text-white text-sm">
                  {tournament.currentTeams}/{tournament.maxTeams}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-0.5">
                  <Clock className="w-3 h-3" />
                  Starts
                </div>
                <p className="font-bold text-white text-sm">
                  <TimeUntil date={tournament.matchStartTime} />
                </p>
              </div>
            </div>

            {/* Fill progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>Slots</span>
                <span>{Math.round(fillPercent)}% filled</span>
              </div>
              <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    fillPercent >= 90 ? 'bg-danger' :
                    fillPercent >= 70 ? 'bg-warning' : 'bg-brand-gradient'
                  }`}
                />
              </div>
            </div>

            {/* CTA */}
            <button
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isFull || tournament.status === 'COMPLETED'
                  ? 'bg-brand-surface text-white/30 cursor-not-allowed'
                  : 'btn-primary justify-center'
              }`}
              disabled={isFull || tournament.status === 'COMPLETED'}
            >
              {isFull ? (
                <><Lock className="w-4 h-4 mr-1.5 inline" /> Full</>
              ) : tournament.status === 'COMPLETED' ? (
                'Ended'
              ) : (
                tournament.entryFee === 0 ? 'Join Free' : `Register ₹${tournament.entryFee}`
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
