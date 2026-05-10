import React, { useEffect, useState, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, MapPin, MessageSquare, LogOut, HeartPulse, Home, Sun, Moon, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthContext';

const GalaxyStyles = () => (
  <style>{`
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes shooting-star {
      0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 0; }
      5% { opacity: 1; }
      15% { transform: translateX(-600px) translateY(600px) rotate(-45deg); opacity: 0; }
      100% { transform: translateX(-600px) translateY(600px) rotate(-45deg); opacity: 0; }
    }
    .nebula {
      filter: blur(80px);
      border-radius: 50%;
      position: absolute;
      z-index: 0;
      pointer-events: none;
    }
    .shooting-star {
      position: absolute;
      width: 2px;
      height: 80px;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 1), transparent);
      opacity: 0;
      z-index: 1;
    }
  `}</style>
);

const ThemeBackground = ({ theme, mousePos }) => {
  const stars = useMemo(() => [...Array(150)].map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3
  })), []);

  const shootingStars = useMemo(() => [...Array(3)].map((_, i) => ({
    id: i,
    top: Math.random() * 40,
    right: -10 + Math.random() * 20,
    delay: Math.random() * 20,
    duration: 4 + Math.random() * 2
  })), []);

  const activeConnections = useMemo(() => {
    if (theme !== 'dark') return [];
    const connections = [];
    const mouseX = (mousePos.x / window.innerWidth) * 100;
    const mouseY = (mousePos.y / window.innerHeight) * 100;
    const proximity = 15;

    const nearbyStars = stars.filter(s => 
      Math.abs(s.left - mouseX) < proximity && Math.abs(s.top - mouseY) < proximity
    );

    for (let i = 0; i < nearbyStars.length; i++) {
      const s1 = nearbyStars[i];
      const dMouse = Math.sqrt(Math.pow(s1.left - mouseX, 2) + Math.pow(s1.top - mouseY, 2));
      if (dMouse < proximity) {
        for (let j = i + 1; j < nearbyStars.length; j++) {
          const s2 = nearbyStars[j];
          const dist = Math.sqrt(Math.pow(s1.left - s2.left, 2) + Math.pow(s1.top - s2.top, 2));
          if (dist < 8) {
            connections.push({ x1: s1.left, y1: s1.top, x2: s2.left, y2: s2.top, alpha: (1 - dMouse / proximity) * (1 - dist / 8) });
          }
        }
      }
    }
    return connections;
  }, [stars, mousePos, theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-[#FDFBF7]'}`} />
      {theme === 'dark' && (
        <div className="absolute inset-0">
          <div className="nebula w-[600px] h-[600px] bg-sky-500/10 -top-20 -left-20" />
          <div className="nebula w-[500px] h-[500px] bg-indigo-500/10 bottom-20 right-20" />
          <div className="nebula w-[400px] h-[400px] bg-purple-500/10 top-1/2 left-1/3" />
          <svg className="absolute inset-0 w-full h-full">
            {activeConnections.map((line, i) => (
              <line key={i} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" style={{ opacity: line.alpha }} />
            ))}
          </svg>
          {stars.map(star => (
            <div key={star.id} className="absolute bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" style={{ top: `${star.top}%`, left: `${star.left}%`, width: `${star.size}px`, height: `${star.size}px`, animation: `twinkle ${star.duration}s infinite ease-in-out`, animationDelay: `${star.delay}s` }} />
          ))}
          {shootingStars.map(s => (
            <div key={s.id} className="shooting-star" style={{ top: `${s.top}%`, right: `${s.right}%`, animation: `shooting-star ${s.duration}s infinite linear`, animationDelay: `${s.delay}s` }} />
          ))}
        </div>
      )}
    </div>
  );
};

const QuantumStyles = () => (
  <style>{`
    @keyframes sidebar-slide {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes sidebar-shimmer {
      0% { transform: translateY(-100%) skewY(-30deg); opacity: 0; }
      50% { opacity: 0.15; }
      100% { transform: translateY(200%) skewY(-30deg); opacity: 0; }
    }
    @keyframes cascade-entry {
      0% { opacity: 0; transform: translateX(-20px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes neon-pulse {
      0%, 100% { box-shadow: 0 0 15px 2px rgba(34, 211, 238, 0.25); border-color: rgba(34, 211, 238, 0.4); }
      50% { box-shadow: 0 0 30px 6px rgba(34, 211, 238, 0.5); border-color: rgba(34, 211, 238, 0.6); }
    }
    .sidebar-shimmer-effect {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.15), transparent);
      animation: sidebar-shimmer 12s infinite linear;
      pointer-events: none;
      z-index: -1;
    }
    .nav-item-entry { 
      animation: cascade-entry 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards; 
    }
    @keyframes tooltip-appear {
      from { opacity: 0; transform: translateX(-10px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    .nav-tooltip {
      animation: tooltip-appear 0.2s ease-out forwards;
    }
    .sidebar-transition {
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
);

const Layout = () => {
  const { logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'AI Chat', path: '/triage', icon: <MessageSquare size={20} /> },
    { name: 'Medical Locker', path: '/locker', icon: <LayoutGrid size={20} /> },
    { name: 'Find Care', path: '/map', icon: <MapPin size={20} /> },
    { name: 'BMI Tracker', path: '/bmi', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden relative">
      <QuantumStyles />
      <GalaxyStyles />
      <ThemeBackground theme={theme} mousePos={mousePos} />

      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} sidebar-transition border-r flex flex-col z-20 relative overflow-visible animate-[sidebar-slide_1s_ease-out]
        ${theme === 'dark' 
          ? 'bg-slate-950/40 backdrop-blur-lg border-white/10 border-l border-cyan-400/30' 
          : 'bg-white/50 backdrop-blur-md border-slate-200'}`}
      >
        {/* Animated Shimmer */}
        <div className="sidebar-shimmer-effect" />

        {/* Floating Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-cyan-500 text-white rounded-full p-1 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.4)] z-50 hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <HeartPulse className="text-sky-400 shrink-0" size={32} />
          {!isCollapsed && (
            <span className={`text-2xl font-black tracking-tighter whitespace-nowrap animate-fade-in-up ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Velora AI
            </span>
          )}
        </div>
        
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-1`}>
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              style={{ animationDelay: `${index * 150}ms` }}
              className={`nav-item-entry opacity-0 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group relative
                hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/50
                ${location.pathname === item.path
                  ? `bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-[neon-pulse_3s_infinite]`
                  : theme === 'dark' ? 'text-slate-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-900/5'
                }`}
            >
              <div className={`transition-colors shrink-0 duration-500 ${location.pathname === item.path ? 'text-cyan-400' : 'group-hover:text-cyan-400 text-slate-400'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`font-semibold whitespace-nowrap animate-fade-in-up transition-colors duration-500 ${location.pathname === item.path ? 'text-cyan-400' : ''}`}>
                  {item.name}
                </span>
              )}

              {/* Silicon Star Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 hidden group-hover:flex items-center bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-lg pointer-events-none z-50 shadow-[0_0_20px_rgba(56,189,248,0.2)] nav-tooltip">
                <div className="absolute -left-1 w-2 h-2 bg-slate-900 border-l border-t border-sky-500/30 rotate-45" />
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  {isCollapsed ? item.name : `Explore ${item.name}`}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        <div className={`p-4 border-t space-y-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-3 rounded-xl transition-all duration-500 hover:bg-cyan-500/5 group ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <div className={`transition-transform shrink-0 duration-500 group-hover:rotate-12 ${theme === 'light' ? 'animate-pulse text-amber-500' : ''}`}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            {!isCollapsed && <span className="font-semibold whitespace-nowrap animate-fade-in-up">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
          <button
            onClick={logout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-3 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all duration-500 group`}
          >
            <LogOut size={20} className="transition-transform shrink-0 duration-500 group-hover:-translate-x-1" />
            {!isCollapsed && <span className="font-semibold whitespace-nowrap animate-fade-in-up">Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;