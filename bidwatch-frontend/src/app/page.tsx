"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Bell, 
  ChevronRight, 
  Filter, 
  FileText, 
  Layers, 
  LayoutDashboard, 
  MapPin, 
  RefreshCcw, 
  Search, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data as per PRD/Reference
const MOCK_BIDS = [
  { id: '1', title: 'Janitorial Services — Main Admin Building', agency: 'City of San Diego', region: 'San Diego', estValue: '$72,000/yr', daysLeft: 12, score: 88, isNew: true, setAside: 'SB' },
  { id: '2', title: 'Custodial Services — Multiple Library Branches', agency: 'County of San Diego', region: 'San Diego', estValue: '$140,000/yr', daysLeft: 4, score: 74, isNew: false, setAside: 'Open' },
  { id: '3', title: 'Office Cleaning & Restroom maintenance', agency: 'LA County Dept. of Public Works', region: 'Los Angeles', estValue: '$210,000', daysLeft: 21, score: 65, isNew: false, setAside: 'SB/DVBE' },
  { id: '4', title: 'Janitorial Services — Transit Operations', agency: 'Sacramento Regional Transit', region: 'Sacramento', estValue: '$95,000/yr', daysLeft: 8, score: 70, isNew: true, setAside: 'DVBE' },
  { id: '5', title: 'Custodial & Porter Services', agency: 'San Diego Unified School District', region: 'San Diego', estValue: '$55,000/yr', daysLeft: 31, score: 91, isNew: true, setAside: 'SB' },
];

const StatCard = ({ label, value, icon: Icon, delta, color }: any) => (
  <div className="glass p-5 rounded-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full bg-${color}-500 blur-2xl group-hover:opacity-20 transition-opacity`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        <Icon size={20} />
      </div>
      {delta && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
          {delta}
        </span>
      )}
    </div>
    <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

export default function Dashboard() {
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-[#0d0f0e] text-neutral-100 p-6 lg:p-10 font-sans selection:bg-emerald-500/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="text-black" fill="currentColor" size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">BidWatch</h1>
          </div>
          <p className="text-neutral-500 text-sm font-medium">CA Janitorial Contract Monitor • AI-Powered</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Scrapers: 28/28
          </div>
          <button className="p-2.5 rounded-xl glass hover:bg-neutral-800 transition-colors">
            <Bell size={20} className="text-neutral-400" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 border border-white/5 flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      <div className="stats-grid mb-10">
        <StatCard label="Active Bids" value="128" icon={Activity} delta="+12%" color="emerald" />
        <StatCard label="New Today" value="14" icon={Zap} delta="+4" color="amber" />
        <StatCard label="Closing Soon" value="8" icon={BarChart3} delta="Critical" color="rose" />
        <StatCard label="Win Probability" value="72%" icon={ShieldCheck} color="blue" />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: Bid Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Opportunities</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">1,248 found</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-xl border border-white/5">
              {['all', 'new', 'closing', 'saved'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeFilter === f ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_BIDS.map((bid) => (
              <motion.div 
                key={bid.id}
                layoutId={bid.id}
                onClick={() => setSelectedBid(bid)}
                className={`p-5 rounded-2xl glass transition-all cursor-pointer group ${selectedBid?.id === bid.id ? 'ring-2 ring-emerald-500/50 bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{bid.agency}</p>
                    <h3 className="text-[15px] font-semibold tracking-tight leading-tight group-hover:text-emerald-400 transition-colors uppercase">{bid.title}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-xs ${bid.score >= 80 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : bid.score >= 70 ? 'border-amber-500/30 text-amber-400' : 'border-neutral-500/30 text-neutral-400'}`}>
                    {bid.score}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin size={14} className="text-neutral-600" />
                    {bid.region}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <BarChart3 size={14} className="text-neutral-600" />
                    {bid.estValue}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <BarChart3 size={14} className="text-neutral-600" />
                    {bid.daysLeft} days left
                  </div>
                  <div className="ml-auto flex gap-2">
                    {bid.isNew && <span className="text-[9px] font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded leading-none">NEW</span>}
                    <span className="text-[9px] font-black bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded leading-none border border-white/5">{bid.setAside}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: AI Panel */}
        <aside className="sticky top-10 space-y-6">
          <div className="glass rounded-3xl overflow-hidden border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Claude AI Intelligence</span>
              </div>
              <LayoutDashboard size={14} className="text-neutral-600" />
            </div>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                {selectedBid ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={selectedBid.id}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 size={16} className="text-emerald-500" />
                        Go/No-Go Analysis
                      </h4>
                      <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                         This is a high-fit opportunity for your business. The scope matches your recent performance with San Diego Unified School District. Competition is expected to be medium.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 mb-2">Pricing Strategy</p>
                        <p className="text-xs text-neutral-400">Target a 12-15% margin. Account for local prevailing wage increases starting July 1.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 mb-2">Key Requirements</p>
                        <ul className="text-xs text-neutral-400 space-y-1.5">
                          <li className="flex gap-2"><span>—</span> Green-certified cleaning products mandatory</li>
                          <li className="flex gap-2"><span>—</span> 24/7 emergency response clause included</li>
                        </ul>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Generate Proposal Draft
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mx-auto">
                      <Layers size={24} className="text-neutral-700" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-400">No Intelligence Selected</p>
                      <p className="text-xs text-neutral-600 px-6">Select an opportunity from the feed to unlock AI-powered bid intelligence and pricing strategies.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <RefreshCcw size={20} className="animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-600">Global Scanner</p>
              <p className="text-xs text-neutral-300">Next update in 2h 14m</p>
            </div>
            <button className="ml-auto text-xs font-semibold text-emerald-500 hover:text-emerald-400">Scan Now</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
