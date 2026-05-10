import React from 'react';
import { Activity, Zap, Layers } from 'lucide-react';
import './AthleteScaleView.css';

const AthleteScaleView = ({ onClick, className = "" }) => {
  const tileClass = "bento-tile holographic p-10 group cursor-pointer hover:-translate-y-3 hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 ease-out";

  return (
    <div className={`${tileClass} athlete-scale-view ${className}`} onClick={onClick}>
      {/* Top Interface: Mode Indicator */}
      <div className="flex justify-between items-start mb-12">
        <div className="athlete-badge">
          <div className="pulse-dot"></div>
          <span className="text-[10px] font-black tracking-[0.3em] text-sky-400">ATHLETE MODE ACTIVE</span>
        </div>
        <Zap className="text-sky-400/50 group-hover:text-sky-400 transition-colors" size={20} />
      </div>

      {/* Central Telemetry Display */}
      <div className="relative py-8">
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="label">MUSCLE DENSITY</span>
            <div className="flex items-end gap-2">
              <span className="value">42.8</span>
              <span className="unit">%</span>
            </div>
            <div className="neon-progress mt-2">
              <div className="fill shadow-[0_0_15px_rgba(56,189,248,0.6)]" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="telemetry-item mt-6">
            <span className="label text-rose-400/70">BODY FAT</span>
            <div className="flex items-end gap-2">
              <span className="value">11.2</span>
              <span className="unit">%</span>
            </div>
            <div className="neon-progress mt-2 bg-rose-500/10">
              <div className="fill bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" style={{ width: '22%' }}></div>
            </div>
          </div>
        </div>

        {/* Holographic 3D Placeholder/Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-60 transition-all duration-700 hologram-container">
          <Layers size={120} strokeWidth={0.5} className="text-sky-400 rotate-12 animate-hologram" />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
        <Activity className="text-sky-500" size={16} />
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Telemetry focus: Sharp / 8K Sensor Link</span>
      </div>
    </div>
  );
};

export default AthleteScaleView;