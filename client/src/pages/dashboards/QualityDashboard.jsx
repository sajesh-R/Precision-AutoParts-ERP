import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, TrendingDown, ClipboardList, ShieldAlert } from 'lucide-react';

const QualityDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/quality');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  if (!data) return <div style={{ padding: '20px' }}>Error loading data.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Quality Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of product quality, rejections, and corrective actions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Rejection Rate */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Rejection Rate</span>
            <div style={{ padding: '8px', backgroundColor: '#ef444415', borderRadius: '8px' }}><Target size={20} color="#ef4444" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.rejectionRate.current}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.rejectionRate.trend.includes('-') ? 'var(--accent-success)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <TrendingDown size={16} /> {data.rejectionRate.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Target: {data.rejectionRate.target}</span>
            </div>
          </div>
        </div>

        {/* Defect Trends */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Top Defect Types</span>
            <div style={{ padding: '8px', backgroundColor: '#f59e0b15', borderRadius: '8px' }}><ShieldAlert size={20} color="#f59e0b" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.defectTrends.map((defect, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600 }}>{defect.type}</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-danger)' }}>
                  {defect.count} Issues
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAPA Status */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>CAPA (Corrective Actions) Status</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><ClipboardList size={20} color="#3b82f6" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-danger)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Open Actions</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{data.capaStatus.open}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-warning)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>In Progress</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{data.capaStatus.inProgress}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-success)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Closed Actions</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{data.capaStatus.closed}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;
