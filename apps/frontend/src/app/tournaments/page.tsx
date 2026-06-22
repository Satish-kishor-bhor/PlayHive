'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trophy, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TournamentCard } from '@/components/tournaments/TournamentCard';

// Mock data for UI preview
const MOCK_TOURNAMENTS = [
  { id: '1', slug: 'bgmi-squad-championship-june', name: 'BGMI Squad Championship', bannerUrl: null, format: 'SQUAD', map: 'ERANGEL', entryFee: 100, prizePool: 10000, maxTeams: 24, currentTeams: 18, status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 2 * 86400000).toISOString(), organizer: { displayName: 'PlayHive Official' } },
  { id: '2', slug: 'solo-ace-challenge', name: 'Solo Ace Challenge', bannerUrl: null, format: 'SOLO', map: 'MIRAMAR', entryFee: 50, prizePool: 5000, maxTeams: 40, currentTeams: 32, status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 5 * 86400000).toISOString(), organizer: { displayName: 'AceArena' } },
  { id: '3', slug: 'conqueror-cup-s1', name: 'Conqueror Cup Season 1', bannerUrl: null, format: 'SQUAD', map: 'VIKENDI', entryFee: 200, prizePool: 25000, maxTeams: 16, currentTeams: 16, status: 'REGISTRATION_CLOSED', matchStartTime: new Date(Date.now() + 86400000).toISOString(), organizer: { displayName: 'PlayHive Official' } },
  { id: '4', slug: 'free-for-all-friday', name: 'Free For All Friday', bannerUrl: null, format: 'SOLO', map: 'SANHOK', entryFee: 0, prizePool: 2000, maxTeams: 60, currentTeams: 44, status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 3 * 86400000).toISOString(), organizer: { displayName: 'CommunityHub' } },
  { id: '5', slug: 'duo-storm-series', name: 'Duo Storm Series', bannerUrl: null, format: 'DUO', map: 'NUSA', entryFee: 80, prizePool: 8000, maxTeams: 32, currentTeams: 20, status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 4 * 86400000).toISOString(), organizer: { displayName: 'StormGG' } },
  { id: '6', slug: 'squad-rondo-rumble', name: 'Rondo Rumble', bannerUrl: null, format: 'SQUAD', map: 'RONDO', entryFee: 150, prizePool: 15000, maxTeams: 20, currentTeams: 8, status: 'REGISTRATION_OPEN', matchStartTime: new Date(Date.now() + 7 * 86400000).toISOString(), organizer: { displayName: 'PlayHive Official' } },
];

const FORMATS = ['All', 'SOLO', 'DUO', 'SQUAD'];
const MAPS = ['All', 'ERANGEL', 'MIRAMAR', 'SANHOK', 'VIKENDI', 'NUSA', 'RONDO'];
const STATUSES = ['All', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED'];

export default function TournamentsPage() {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('All');
  const [map, setMap] = useState('All');
  const [status, setStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_TOURNAMENTS.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (format !== 'All' && t.format !== format) return false;
    if (map !== 'All' && t.map !== map) return false;
    if (status !== 'All' && t.status !== status) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-8 border-b border-brand-border/50 relative">
        <div className="absolute inset-0 bg-glow-orange opacity-50" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 badge-orange mb-4 w-fit">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{filtered.length} Tournaments</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
              Find Your <span className="gradient-text">Tournament</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl">
              Browse live and upcoming BGMI tournaments. Filter by format, map, and entry fee.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tournaments..."
                className="input pl-12 w-full"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${showFilters ? 'border-brand-orange text-brand-amber' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </motion.div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Format */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
                    <Filter className="w-3.5 h-3.5 inline mr-1" /> Format
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          format === f
                            ? 'bg-brand-orange text-black'
                            : 'bg-brand-surface border border-brand-border text-white/60 hover:border-brand-orange/40'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Map</label>
                  <div className="flex flex-wrap gap-2">
                    {MAPS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMap(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          map === m
                            ? 'bg-brand-amber text-black'
                            : 'bg-brand-surface border border-brand-border text-white/60 hover:border-brand-orange/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          status === s
                            ? 'bg-success text-black'
                            : 'bg-brand-surface border border-brand-border text-white/60 hover:border-success/40'
                        }`}
                      >
                        {s === 'REGISTRATION_OPEN' ? 'Open' : s === 'All' ? 'All' : s === 'ONGOING' ? 'Live' : 'Ended'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white/30 mb-2">No tournaments found</h3>
              <p className="text-white/20 text-sm">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tournament, i) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <TournamentCard tournament={tournament} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
