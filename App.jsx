import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './Layout';
import Home from './Home';
import SymptomsAnalyser from './SymptomsAnalyser';
import HealthLocker from './HealthLocker';
import DoctorFinder from './DoctorFinder';
import BMICalculator from './BMICalculator';
import Login from './Login';
import LandingPage from './LandingPage';

const AppRoutes = () => {
  const { user, token, isLoading } = useAuth();

  // Public landing page for the root path if not authenticated
  if (!token && !user && window.location.pathname === '/') {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }
  // Prevent flickering/redirects while the app is checking localStorage
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)] text-sky-400">
        <Loader2 className="animate-spin opacity-20" size={40} />
      </div>
    );
  }

  // If the user is not authenticated, only allow access to the login page
  if (!token || !user) {
    return ( // This block handles unauthenticated users trying to access other routes
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="animate-page-enter h-full w-full">
      <Routes>
        <Route path="/" element={<Layout />}> {/* This is the base for authenticated routes */}
          <Route index element={<Navigate to="/home" replace />} /> {/* Redirect root to home if authenticated */}
          <Route path="login" element={<Navigate to="/" replace />} />
          <Route path="triage" element={<SymptomsAnalyser />} />
          <Route path="locker" element={<HealthLocker />} />
          <Route path="map" element={<DoctorFinder />} />
          <Route path="bmi" element={<BMICalculator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ 
        v7_relativeSplatPath: true,
        v7_startTransition: true 
      }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;