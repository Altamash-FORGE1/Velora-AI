import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Layout from './Layout';
import Home from './Home';
import SymptomsAnalyser from './SymptomsAnalyser';
import HealthLocker from './HealthLocker';
import DoctorMap from './DoctorMap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="triage" element={<SymptomsAnalyser />} />
            <Route path="locker" element={<HealthLocker />} />
            <Route path="map" element={<DoctorMap />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;