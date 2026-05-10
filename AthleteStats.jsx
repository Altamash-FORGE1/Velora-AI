import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Zap, Moon, Heart, TrendingUp, Award } from 'lucide-react';
import './AthleteStats.css';

const AthleteStats = () => {
  const navigate = useNavigate();

  const biometricData = [
    { label: 'VO2 Max', value: '64.2', unit: 'ml/kg/min', status: 'ELITE', color: 'sky' },
    { label: 'Resting HR', value: '42', unit: 'bpm', status: 'OPTIMAL', color: 'emerald' },
    { label: 'Recovery', value: '92', unit: '%', status: 'READY', color: 'indigo' },
    { label: 'Sleep Score', value: '88', unit: '/100', status: 'GOOD', color: 'violet' },
  ];

  return (
    <div className="athlete-stats-page">
      {/* Header */}
      <header className="stats-header flex justify-between items-center mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Biometric Telemetry</h1>
            <p className="text-sky-400 text-xs font-bold tracking-[0.3em]">ATHLETE MODE : ACTIVE SENSOR LINK</p>
          </div>
        </div>
        <div className="live-indicator px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]" />
          <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase">Live Link</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {biometricData.map((stat, i) => (
            <div key={i} className="stats-card bento-tile holographic p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{stat.label}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20`}>
                  {stat.status}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">{stat.value}</span>
                <span className="text-sm font-bold text-sky-400 mb-2 uppercase">{stat.unit}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full mt-6 overflow-hidden">
                <div className={`h-full bg-${stat.color}-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]`} style={{ width: '75%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Performance Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="stats-card bento-tile holographic p-8 bg-gradient-to-br from-indigo-600/20 to-sky-600/20">
            <h3 className="text-xs font-black text-white tracking-[0.2em] mb-6 uppercase flex items-center gap-2">
              <TrendingUp size={16} className="text-sky-400" /> Training Load
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Readiness</span>
                <span className="text-emerald-400 font-bold">Optimal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">7-Day Strain</span>
                <span className="text-white font-bold">14,200</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your cardiovascular recovery is 12% faster than last week. Recommend high-intensity interval training (HIIT) today.
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card bento-tile holographic p-8">
            <h3 className="text-xs font-black text-white tracking-[0.2em] mb-6 uppercase flex items-center gap-2">
              <Award size={16} className="text-amber-400" /> Milestones
            </h3>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Zap size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Power PB</p>
                <p className="text-[10px] text-slate-500 uppercase">Reached yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Detailed Chart Placeholder */}
        <div className="lg:col-span-3 stats-card bento-tile holographic p-8 min-h-[300px] flex flex-col justify-center items-center text-center">
          <div className="p-6 bg-sky-500/10 rounded-full mb-4">
            <Activity size={48} className="text-sky-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Heart Rate Variability (HRV)</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Detailed waveform analysis and trend mapping. Data is synchronized via the Velora 8K Sensor Link.
          </p>
          <div className="mt-8 flex gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-2 bg-sky-500/20 rounded-full" style={{ height: `${20 + Math.random() * 60}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteStats;