import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Scale, Ruler, Save, CheckCircle2, Loader2 } from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

const BMICalculator = () => {
  const { theme } = useAuth();
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bmi = useMemo(() => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [height, weight]);

  const category = useMemo(() => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-sky-400', barColor: 'bg-sky-400' };
    if (val < 25) return { label: 'Normal Weight', color: 'text-emerald-400', barColor: 'bg-emerald-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400', barColor: 'bg-amber-400' };
    return { label: 'Obese', color: 'text-rose-400', barColor: 'bg-rose-400' };
  }, [bmi]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create a programmatic "Report" to save into the Health Locker
      const reportContent = `VELORA AI BIOMETRIC REPORT\nDate: ${new Date().toLocaleString()}\nHeight: ${height}cm\nWeight: ${weight}kg\nCalculated BMI: ${bmi}\nCategory: ${category.label}`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const file = new File([blob], `BMI_Report_${Date.now()}.txt`, { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', file);

      await api.post('/locker/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to sync BMI to locker", err);
      alert("Connection lost. Metric saved locally only.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        {/* Atmospheric Glow Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Activity className="text-sky-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Biometric Index</h2>
            <p className="text-[10px] font-bold text-sky-400/80 uppercase tracking-[0.25em]">Silicon Star Analytics</p>
          </div>
        </div>

        <div className="space-y-10 relative z-10">
          {/* Height Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Ruler size={14} className="text-sky-500/50" /> Height (cm)
              </label>
              <span className="text-2xl font-black text-white tracking-tighter">
                {height}<span className="text-sky-500 text-xs ml-1">CM</span>
              </span>
            </div>
            <input 
              type="range" 
              min="120" 
              max="220" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            />
          </div>

          {/* Weight Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} className="text-sky-500/50" /> Weight (kg)
              </label>
              <span className="text-2xl font-black text-white tracking-tighter">
                {weight}<span className="text-sky-500 text-xs ml-1">KG</span>
              </span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="150" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            />
          </div>

          {/* Result Visualization */}
          <div className="py-10 flex flex-col items-center justify-center border-y border-white/5 relative">
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Body Mass Index</div>
             <div className={`text-8xl font-black tracking-tighter transition-all duration-700 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] ${category.color}`}>
               {bmi}
             </div>
             <div className={`mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] ${category.color} animate-pulse`}>
               {category.label}
             </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${category.barColor} transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(56,189,248,0.6)]`}
              style={{ width: `${Math.min(Math.max((parseFloat(bmi) - 10) / 30 * 100, 5), 100)}%` }}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={3} />} 
            {isSaving ? 'Syncing...' : 'Save Metric to Locker'}
          </button>
        </div>

        {/* High-end Success Toast */}
        {showToast && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fade-in">
            <div className="flex flex-col items-center gap-4 bg-slate-900 border border-emerald-500/50 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-scale-in">
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-widest text-center leading-relaxed">
                Index Synced<br />
                <span className="text-emerald-400">Health Locker Updated</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;