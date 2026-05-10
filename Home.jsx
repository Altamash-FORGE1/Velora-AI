import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutGrid, ChevronRight, Activity, ShieldCheck, FileText, ExternalLink, Ruler } from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';
import './Home.css';

const Home = () => {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [score, setScore] = useState(0);
  const [lastSummary, setLastSummary] = useState("No recent activity found. Start a chat to see your summary here.");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/locker');
        const recordList = res?.data?.data?.records || [];
        setRecords(recordList.slice(0, 2));

        // Calculate Health Score based on actual usage
        const chatCount = parseInt(localStorage.getItem('velora_chat_count') || '0');
        // Logic: Base 60 + Locker records (up to 20 pts) + Chat sessions
        const calculatedScore = Math.min(60 + (recordList.length * 5) + (chatCount * 2), 100);
        setScore(calculatedScore);

        // Fetch last chat summary
        const savedSummary = localStorage.getItem('velora_last_summary');
        if (savedSummary) setLastSummary(savedSummary);
      } catch (err) {
        console.error("Health Score sync failed", err);
        setScore(0); // Default score on failure
      }
    };
    fetchStats();
  }, []);

  const tileClass = `bento-tile backdrop-blur-md border p-8 group cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl rounded-3xl ${
    theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-slate-50/50 border-slate-200'
  }`;

  return (
    <div className="bento-container">
      {/* Hero Tile */}
      <div className={`${tileClass} hero-tile col-span-2`} onClick={() => navigate('/triage')}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Welcome, <span className="text-sky-400">{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <div className="health-score-badge mt-6 bg-sky-500/10 border border-sky-400/20 px-4 py-2 rounded-full inline-flex items-center gap-2">
              <Activity size={18} className="text-sky-400" />
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Health Score: {score}</span>
            </div>
          </div>
          <ShieldCheck size={48} className="text-sky-400/30" />
        </div>
        <button className="mt-10 flex items-center gap-2 bg-sky-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-sky-600 shadow-xl shadow-sky-500/20">
          Start Symptom Analysis <ChevronRight size={18} />
        </button>
      </div>

      {/* Triage Tile */}
      <div className={tileClass} onClick={() => navigate('/triage')}>
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-sky-600 mb-4">
          <MessageSquare size={18} className="text-sky-400" /> Last Chat Summary
        </h3>
        <p className={`text-sm font-medium leading-relaxed mb-8 line-clamp-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
          {lastSummary}
        </p>
        <button className={`w-full py-4 border-2 rounded-2xl text-sm font-bold transition-colors ${theme === 'dark' ? 'border-sky-500/20 text-sky-400' : 'border-sky-200 text-sky-600'}`}>
          Quick Check-in
        </button>
      </div>

      {/* Locker Tile */}
      <div className={tileClass} onClick={() => navigate('/locker')}>
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-sky-600 mb-4">
          <LayoutGrid size={18} /> Recent Records
        </h3>
        <div className="space-y-4">
          {records.length > 0 ? records.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-side)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <FileText size={20} className={file.type?.includes('pdf') ? "text-red-400" : "text-sky-400"} />
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)] truncate max-w-[150px]">{file.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Uploaded: {file.last_modified}</div>
                </div>
              </div>
              <ExternalLink size={14} className="text-[var(--text-muted)]" />
            </div>
          )) : (
            <div className="text-center py-6 text-slate-500 text-xs font-medium">
              No records found.
            </div>
          )}
        </div>
      </div>

      {/* BMI Tile */}
      <div className={tileClass} onClick={() => navigate('/bmi')}>
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-sky-600 mb-4">
          <Ruler size={18} className="text-sky-400" /> Biometric Index
        </h3>
        <p className={`text-sm font-medium leading-relaxed mb-8 line-clamp-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
          Monitor your Body Mass Index and health metrics with Silicon Star precision analytics.
        </p>
        <button className={`w-full py-4 border-2 rounded-2xl text-sm font-bold transition-colors ${theme === 'dark' ? 'border-sky-500/20 text-sky-400' : 'border-sky-200 text-sky-600'}`}>
          Open Calculator
        </button>
      </div>
    </div>
  );
};

export default Home;