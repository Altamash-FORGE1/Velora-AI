import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { HeartPulse, AlertCircle } from 'lucide-react';
import './Login.css';

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

const LoginBackground = ({ theme, stars, shootingStars, mousePos }) => {
  const activeConnections = useMemo(() => {
    if (theme !== 'dark') return [];
    const connections = [];
    const mouseX = (mousePos.x / window.innerWidth) * 100;
    const mouseY = (mousePos.y / window.innerHeight) * 100;
    const proximity = 15;

    const nearbyStars = stars.filter(s => 
      Math.abs(s.leftNum - mouseX) < proximity && Math.abs(s.topNum - mouseY) < proximity
    );

    for (let i = 0; i < nearbyStars.length; i++) {
      const s1 = nearbyStars[i];
      const dMouse = Math.sqrt(Math.pow(s1.leftNum - mouseX, 2) + Math.pow(s1.topNum - mouseY, 2));
      if (dMouse < proximity) {
        for (let j = i + 1; j < nearbyStars.length; j++) {
          const s2 = nearbyStars[j];
          const dist = Math.sqrt(Math.pow(s1.leftNum - s2.leftNum, 2) + Math.pow(s1.topNum - s2.topNum, 2));
          if (dist < 8) {
            connections.push({ x1: s1.leftNum, y1: s1.topNum, x2: s2.leftNum, y2: s2.topNum, alpha: (1 - dMouse / proximity) * (1 - dist / 8) });
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
          {/* Nebula Clouds */}
          <div className="nebula w-[600px] h-[600px] bg-sky-500/10 -top-20 -left-20" />
          <div className="nebula w-[500px] h-[500px] bg-indigo-500/10 bottom-20 right-20" />
          <div className="nebula w-[400px] h-[400px] bg-purple-500/10 top-1/2 left-1/3" />
          
          <svg className="absolute inset-0 w-full h-full">
            {activeConnections.map((line, i) => (
              <line key={i} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" style={{ opacity: line.alpha }} />
            ))}
          </svg>

          {/* Twinkling Stars */}
          {stars.map(star => (
            <div 
              key={star.id} 
              className="absolute bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `twinkle ${star.duration}s infinite ease-in-out`,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}

          {/* Shooting Stars */}
          {shootingStars.map(s => (
            <div 
              key={s.id}
              className="shooting-star"
              style={{
                top: s.top,
                right: s.right,
                animation: `shooting-star ${s.duration}s infinite linear`,
                animationDelay: `${s.delay}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Login = () => {
  const { googleLogin, authError, theme } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const stars = useMemo(() => [...Array(150)].map((_, i) => {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    return {
      id: i,
      topNum: top,
      leftNum: left,
      top: `${top}%`,
      left: `${left}%`,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3
    };
  }), []);

  const shootingStars = useMemo(() => [...Array(3)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 40}%`,
    right: `${-10 + Math.random() * 20}%`,
    delay: Math.random() * 20,
    duration: 4 + Math.random() * 2
  })), []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <GalaxyStyles />
      <LoginBackground theme={theme} stars={stars} shootingStars={shootingStars} mousePos={mousePos} />
      
      <div className={`p-12 rounded-3xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-sky-400/20 z-10 max-w-md w-full animate-page-enter ${
        theme === 'dark' 
          ? 'bg-white/10 border-white/20' 
          : 'bg-slate-50/50 border-slate-200'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-sky-500/10 rounded-2xl">
            <HeartPulse size={48} className="text-sky-500" />
          </div>
          
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Velora AI
          </h1>
          
          <p className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-sky-400' : 'text-slate-800'}`}>
            Your Secure Health Companion
          </p>
          
          <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Access your encrypted medical records, chat with clinical-grade AI, and discover local care facilities instantly.
          </p>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm w-full">
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}

          <button onClick={() => googleLogin()} className="google-login-btn group hover:scale-105 active:scale-95 transition-all w-full">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span className="font-bold tracking-wide">Sign in with Google</span>
          </button>

          <div className="mt-12 pt-8 border-t border-slate-500/10 w-full text-[10px] text-slate-400 leading-tight">
            Velora AI provides informational triage and is not a substitute for professional medical advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;