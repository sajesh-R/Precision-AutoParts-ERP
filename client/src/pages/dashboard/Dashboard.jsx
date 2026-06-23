import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Building2, Shield, Activity, TrendingUp, Key, AlertTriangle, Database, Server, Clock, UserPlus, ClipboardCheck } from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats');
        setDashboardData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
      setLoading(false);
    };
    fetchDashboardStats();
  }, []);

  const cards = [
    { title: 'Total Users', value: dashboardData?.counts?.users ?? '-', icon: <Users size={20} />, trend: '+', color: 'var(--accent-primary)' },
    { title: 'Active Plants', value: dashboardData?.counts?.plants ?? '-', icon: <Building2 size={20} />, trend: '+', color: 'var(--accent-success)' },
    { title: 'Security Roles', value: dashboardData?.counts?.roles ?? '-', icon: <Shield size={20} />, trend: '-', color: 'var(--accent-warning)' },
    { title: 'Pending Approvals', value: dashboardData?.counts?.pendingApprovals ?? '-', icon: <ClipboardCheck size={20} />, trend: 'Action', color: '#8b5cf6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Welcome back, {user?.firstName || 'Admin'}. Here is your system snapshot.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                {card.title}
              </div>
              <div style={{ color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {loading ? '...' : card.value}
              </div>
              {!loading && (
                <div style={{ fontSize: '12px', color: 'var(--accent-success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px', paddingBottom: '2px' }}>
                  <TrendingUp size={12} /> {card.trend}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', flex: 1, minHeight: '380px' }}>
        
        {/* Left Column (Quick Actions & Approvals) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Actions */}
          <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '14px', fontWeight: 600 }}>
              Quick Configuration Actions
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Add New User', icon: <UserPlus size={16}/>, path: '/users' },
                { label: 'Configure Roles', icon: <Shield size={16}/>, path: '/roles' },
                { label: 'Setup Plants', icon: <Building2 size={16}/>, path: '/company' }
              ].map((action, i) => (
                <div key={i} onClick={() => navigate(action.path)} style={{ 
                  border: '1px solid var(--border-color)', 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <div style={{ color: 'var(--accent-primary)' }}>{action.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{action.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* System Health */}
        <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '14px', fontWeight: 600 }}>
            System Health
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '4px' }}>
                <Server size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>API Server</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Online (99.9% Uptime)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '4px' }}>
                <Database size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>Database Cluster</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Connected (14ms ping)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>Last Backup</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString()} at 02:00 AM</div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
