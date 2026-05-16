import React from 'react';
import Spline from '@splinetool/react-spline';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Home() {
  const { googleLogin } = useAuth();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent">
      {/* Spline in the background */}
      <div className="absolute inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/BDlxkDgfN5-eiTfM/scene.splinecode" 
        />
      </div>
      
      {/* Button explicitly on top with high z-index */}
      <button 
        onClick={() => googleLogin()} 
        style={{ 
          position: 'absolute', 
          left: '386px', 
          top: '634px', 
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
        className="google-login-btn group hover:scale-105 active:scale-95 transition-all w-64 flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-2xl"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}
