"use client";

import React, { useState, useEffect } from 'react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bids`);
      const data = await res.json();
      setBids(data);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/scrape`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        await fetchBids();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (selectedBid) {
      const fetchAnalysis = async () => {
        try {
          const res = await fetch(`${API_URL}/api/bids/${selectedBid.id}/analysis`);
          const data = await res.json();
          setAnalysis(data);
        } catch (err) {
          console.error('Failed to fetch analysis:', err);
        }
      };
      fetchAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [selectedBid]);

  const filteredBids = bids.filter(bid => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') {
      const isNew = bid.created_at && (new Date().getTime() - new Date(bid.created_at).getTime() < 86400000);
      return isNew;
    }
    return true;
  });

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
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${syncing ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'}`}
          >
            <RefreshCcw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Run Scan'}
          </button>
          
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
        <StatCard label="Active Bids" value={bids.length.toString()} icon={Activity} delta="+12%" color="emerald" />
        <StatCard label="New Today" value={bids.filter(b => b.created_at && (new Date().getTime() - new Date(b.created_at).getTime() < 86400000)).length.toString()} icon={Zap} delta="+4" color="amber" />
        <StatCard label="Database Status" value="Online" icon={ShieldCheck} color="blue" />
        <StatCard label="Region" value="California" icon={MapPin} color="emerald" />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: Bid Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Opportunities</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">{filteredBids.length} found</span>
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

          {loading ? (
            <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">Loading opportunities...</div>
          ) : (
            <div className="space-y-3">
              {filteredBids.map((bid) => (
                <motion.div 
                  key={bid.id}
                  layoutId={bid.id}
                  onClick={() => setSelectedBid(bid)}
                  className={`p-5 rounded-2xl glass transition-all cursor-pointer group ${selectedBid?.id === bid.id ? 'ring-2 ring-emerald-500/50 bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{bid.agency}</p>
                      <h3 className="text-[15px] font-semibold tracking-tight leading-tight group-hover:text-emerald-400 transition-colors uppercase">{bid.title}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin size={14} className="text-neutral-600" />
                      {bid.region}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <BarChart3 size={14} className="text-neutral-600" />
                      {bid.est_value || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Activity size={14} className="text-neutral-600" />
                      Portal: {bid.portal}
                    </div>
                    {bid.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Zap size={14} className="text-neutral-600" />
                        Due: {new Date(bid.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="ml-auto flex gap-2">
                       {bid.created_at && (new Date().getTime() - new Date(bid.created_at).getTime() < 86400000) && <span className="text-[9px] font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded leading-none">NEW</span>}
                      <span className="text-[9px] font-black bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded leading-none border border-white/5 font-mono">{bid.set_aside || 'OPEN'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredBids.length === 0 && (
                <div className="py-20 text-center text-neutral-600 text-sm">No opportunities found. Run a scan to sync data.</div>
              )}
            </div>
          )}
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
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <BarChart3 size={16} className="text-emerald-500" />
                          Go/No-Go Analysis
                        </h4>
                        {analysis && (
                          <div className={`text-xs font-bold px-2 py-0.5 rounded ${analysis.score >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
                            Score: {analysis.score}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                         {analysis ? analysis.analysis : 'Analyzing bid data...'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 mb-2">Agency Insight</p>
                        <p className="text-xs text-neutral-400">{selectedBid.agency}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-neutral-600 mb-2">Portal Source</p>
                        <p className="text-xs text-neutral-400">{selectedBid.portal} (NAICS: {selectedBid.naics || 'N/A'})</p>
                      </div>
                    </div>

                    <a 
                      href={selectedBid.portal_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                      <FileText size={18} />
                      View Original Solicitation
                    </a>
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
              <p className="text-xs text-neutral-300">Synchronization Active</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
