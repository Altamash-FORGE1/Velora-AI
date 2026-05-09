import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutGrid, MapPin, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Symptom Triage',
      desc: 'Analyze new symptoms with AI',
      path: '/triage',
      icon: <MessageSquare size={24} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Medical Locker',
      desc: 'Access your secure records',
      path: '/locker',
      icon: <LayoutGrid size={24} />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Find Care',
      desc: 'Locate nearby medical centers',
      path: '/map',
      icon: <MapPin size={24} />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Friend'}!
        </h1>
        <p className="text-gray-500 mt-2">How can Velora assist you today?</p>
      </header>

      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <div key={action.path} className="action-card" onClick={() => navigate(action.path)}>
            <div className={`action-icon ${action.color}`}>
              {action.icon}
            </div>
            <div className="action-info">
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
            <ChevronRight className="text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;