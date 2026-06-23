import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, ShieldAlert, Award } from 'lucide-react';

const QualityAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/quality/analytics');
      setData(res.data.data);
    } catch (err) { console.error('Analytics fetch error', err); }
    setLoading(false);
  };

  if (loading || !data) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Compiling Quality Analytics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Quality Analytics Dashboard</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>High-level insights into Defect Trends, Rejections, and Vendor Performance</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#3b82f615', borderRadius: '8px' }}>
                <BarChart3 size={20} color="#3b82f6" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Inspections</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.totalInspections}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Across Incoming, In-Process, and Final stages</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#ef444415', borderRadius: '8px' }}>
                <PieChart size={20} color="#ef4444" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Rejection Rate</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: data.rejectionRate > 10 ? '#ef4444' : 'var(--text-primary)' }}>{data.rejectionRate}%</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Percentage of inspections resulting in Failure</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f59e0b15', borderRadius: '8px' }}>
                <ShieldAlert size={20} color="#f59e0b" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Logged Defects (NCRs)</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.totalDefectsLogged}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Active non-conformance reports requiring CAPA</p>
          </div>
        </div>

        {/* Detailed Analysis Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Rejection Analysis */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Rejection Analysis by Stage</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Incoming Raw Materials</span>
                  <strong>{data.typeRejections['Incoming']} Rejections</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.totalInspections ? (data.typeRejections['Incoming']/data.totalInspections)*100 : 0}%`, backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>In-Process Operations</span>
                  <strong>{data.typeRejections['In-Process']} Rejections</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.totalInspections ? (data.typeRejections['In-Process']/data.totalInspections)*100 : 0}%`, backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Final Finished Goods</span>
                  <strong>{data.typeRejections['Final']} Rejections</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.totalInspections ? (data.typeRejections['Final']/data.totalInspections)*100 : 0}%`, backgroundColor: '#ef4444' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Quality Analysis */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#10b981" /> Vendor Quality Analysis
            </h3>
            
            {data.vendorAverages.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>No vendor quality data available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.vendorAverages.sort((a,b) => b.averageScore - a.averageScore).map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{v.vendorName}</span>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: v.averageScore >= 80 ? '#10b98115' : v.averageScore >= 50 ? '#f59e0b15' : '#ef444415',
                      color: v.averageScore >= 80 ? '#10b981' : v.averageScore >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {v.averageScore} / 100 Score
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default QualityAnalytics;
