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
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Settings,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Constants for UI
const PORTALS = [
  { name: 'Cal eProcure', region: 'Statewide', status: 'active' },
  { name: 'SAM.gov', region: 'Federal', status: 'active' },
  { name: 'BidNet Direct CA', region: 'Statewide', status: 'active' },
  { name: 'LA County', region: 'Los Angeles', status: 'active' },
  { name: 'City of LA (PlanetBids)', region: 'Los Angeles', status: 'active' },
  { name: 'LAUSD', region: 'Los Angeles', status: 'active' },
  { name: 'City of SF', region: 'Bay Area', status: 'active' },
  { name: 'City of San Jose', region: 'Bay Area', status: 'active' },
  { name: 'City of Oakland', region: 'Bay Area', status: 'active' },
  { name: 'Alameda County', region: 'Bay Area', status: 'active' },
  { name: 'BART', region: 'Bay Area', status: 'active' },
  { name: 'City of San Diego', region: 'San Diego', status: 'active' },
  { name: 'County of San Diego', region: 'San Diego', status: 'active' },
  { name: 'SD Airport Authority', region: 'San Diego', status: 'active' },
];

const StatCard = ({ label, value, subtext, active }: any) => (
  <div className={`stat-card relative overflow-hidden ${active ? 'ring-1 ring-[#BAFF7F]/30' : ''}`}>
    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold tracking-tight mb-2">{value}</p>
    <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
      {subtext.startsWith('↑') ? (
        <span className="text-[#BAFF7F]">{subtext}</span>
      ) : subtext}
    </p>
  </div>
);

const BidCard = ({ bid, isSelected, onClick, analysis }: any) => {
  const score = analysis?.score || Math.floor(Math.random() * 40) + 50; // Use actual or mock
  const scoreClass = score >= 80 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low';
  
  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`bid-item cursor-pointer group relative ${isSelected ? 'bg-white/[0.04]' : ''}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{bid.agency}</p>
          <h3 className="text-sm font-bold text-white mb-3 group-hover:text-[#BAFF7F] transition-colors">{bid.title}</h3>
          
          <div className="flex flex-wrap items-center gap-2">
             {bid.is_new !== false && <span className="bg-[#BAFF7F]/10 text-[#BAFF7F] text-[9px] font-black px-1.5 py-0.5 rounded leading-none border border-[#BAFF7F]/20">NEW</span>}
             <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded leading-none border border-blue-500/20 uppercase">Open</span>
             {score >= 80 && <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-black px-1.5 py-0.5 rounded leading-none border border-yellow-500/20">High fit</span>}
             <span className="bg-neutral-800 text-neutral-400 text-[9px] font-black px-1.5 py-0.5 rounded leading-none border border-white/5">{bid.region || 'CA'}</span>
             <span className="text-[10px] text-neutral-500 ml-1">
               {bid.deadline ? `${Math.ceil((new Date(bid.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left` : 'No deadline'}
             </span>
             <span className="text-[10px] text-neutral-500 ml-1">•</span>
             <span className="text-[10px] text-neutral-500 ml-1">{bid.est_value || '$N/A'}</span>
          </div>
        </div>
        
        <div className={`score-circle ${scoreClass}`}>
          {score}
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
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

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API_URL}/api/scrape`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        await fetchBids();
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
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
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'NEW') {
       // Check if created within last 48 hours
       const isRecent = bid.created_at && (new Date().getTime() - new Date(bid.created_at).getTime() < 172800000);
       return isRecent;
    }
    if (activeFilter === 'CLOSING SOON') {
      if (!bid.deadline) return false;
      const daysLeft = Math.ceil((new Date(bid.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    }
    if (activeFilter === 'SAN DIEGO') return bid.region?.toLowerCase().includes('san diego') || bid.agency?.toLowerCase().includes('san diego');
    if (activeFilter === 'LOS ANGELES') return bid.region?.toLowerCase().includes('los angeles') || bid.agency?.toLowerCase().includes('los angeles');
    if (activeFilter === 'NORCAL') return bid.region?.toLowerCase().includes('bay area') || bid.region?.toLowerCase().includes('sacramento');
    return true;
  });

  return (
    <div className="relative min-h-screen">
      <div className="grid-background" />
      
      <div className="max-w-[1440px] mx-auto p-6 lg:p-12">
        {/* Header */}
        <header className="flex justify-between items-start mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#BAFF7F] rounded-lg flex items-center justify-center">
              <BarChart3 className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">BidWatch</h1>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">CA Janitorial Contract Monitor • AI-Powered</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-500 uppercase flex items-center justify-end gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF7F]" />
              Last scan: {scanning ? 'Just now' : '28m ago'}
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Active Bids" value={bids.length || '0'} subtext={`across 28 portals`} />
          <StatCard label="New Today" value="4" subtext="↑ posted this week" />
          <StatCard label="Closing Soon" value="2" subtext="≤ 5 days left" />
          <StatCard label="Portals Monitored" value="28" subtext="CA statewide" active />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          
          {/* Feed Content */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Contract opportunities</h2>
              <span className="text-[10px] font-bold text-neutral-500 uppercase border border-white/10 px-2 py-1 rounded-full">{filteredBids.length} results</span>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'NEW', 'CLOSING SOON', 'HIGH SCORE', 'SAN DIEGO', 'LOS ANGELES', 'NORCAL'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap
                    ${activeFilter === filter ? 'bg-[#BAFF7F] text-black border-[#BAFF7F]' : 'text-neutral-500 border-white/10 hover:border-white/20'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Bid List */}
            <div className="bg-[#111111]/40 border border-white/5 rounded-xl overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-neutral-500 animate-pulse">
                  <RefreshCcw className="animate-spin mb-4" size={24} />
                  <p className="text-xs uppercase font-bold tracking-widest">Loading Contracts...</p>
                </div>
              ) : bids.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredBids.map(bid => (
                    <BidCard 
                      key={bid.id} 
                      bid={bid} 
                      isSelected={selectedBid?.id === bid.id}
                      onClick={() => setSelectedBid(bid)}
                      analysis={selectedBid?.id === bid.id ? analysis : null}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-neutral-600 px-12 text-center">
                   <p className="text-sm italic mb-6">Run a scan to discover live janitorial contracts →</p>
                </div>
              )}

              {/* Scan Button at bottom of feed */}
              <div className="p-4 border-t border-white/5 bg-[#111111]">
                <button 
                  onClick={handleScan}
                  disabled={scanning}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all
                    ${scanning 
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                      : 'bg-[#BAFF7F] text-black hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(182,255,144,0.1)]'}`}
                >
                  <RefreshCcw size={16} className={scanning ? 'animate-spin' : ''} />
                  {scanning ? 'SCANNING PORTALS...' : 'SCAN ALL PORTALS NOW'}
                </button>
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            
            {/* AI Analysis Panel */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#BAFF7F] animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Claude AI analysis</h3>
              </div>
              <div className="p-6 min-h-[160px]">
                {selectedBid ? (
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                      {analysis?.analysis || "Analyzing opportunity details and scope of work..."}
                    </p>
                    <a 
                      href={selectedBid.portal_url} 
                      target="_blank"
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-[#BAFF7F] hover:underline"
                    >
                      VIEW FULL SOLICITATION <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {scanning 
                      ? "Scanning 28 portals for new janitorial contracts..." 
                      : "Scan complete. Select any contract above to get AI-powered bid analysis, go/no-go recommendation, and strategy tips."}
                  </p>
                )}
              </div>
            </div>

            {/* Monitored Portals */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
               <div className="p-5 border-b border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Monitored portals</h3>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <div className="space-y-3">
                  {PORTALS.map((portal, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#BAFF7F] group-hover:animate-ping" />
                        <span className="text-[11px] font-medium text-neutral-300">{portal.name}</span>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter">{portal.region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
               <div className="p-5 border-b border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Alert settings</h3>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { label: 'New bid alerts', active: true },
                  { label: '48hr deadline warnings', active: true },
                  { label: 'AI score ≥ 70 only', active: false },
                  { label: 'SB/DVBE set-asides only', active: false },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{setting.label}</span>
                    <button className={`w-9 h-5 rounded-full relative transition-colors ${setting.active ? 'bg-[#BAFF7F]' : 'bg-neutral-800'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${setting.active ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}

                <div className="pt-2">
                   <div className="relative">
                    <input 
                      type="text" 
                      placeholder="your@email.com — alert destination" 
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[11px] font-mono text-neutral-300 focus:outline-none focus:border-[#BAFF7F]/50 transition-colors"
                    />
                  </div>
                  <button className="w-full mt-3 py-3 bg-[#BAFF7F] text-black text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-[#BAFF7F]/90 transition-colors">
                    Save Alert Preferences
                  </button>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
