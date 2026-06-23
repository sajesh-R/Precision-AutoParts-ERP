import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, Wrench, DollarSign } from 'lucide-react';

const MaintenanceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/maintenance/analytics');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Analytics fetch error', err);
      setError('Failed to load maintenance analytics.');
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Compiling Maintenance Analytics...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'var(--accent-danger)' }}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No analytics data available.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Maintenance Analytics Dashboard</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyze MTBF, MTTR, and total maintenance financial impact across the factory</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#10b98115', borderRadius: '8px' }}>
                <Activity size={20} color="#10b981" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>MTBF (Factory Avg)</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {data.mtbf} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Hrs</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Mean Time Between Failures</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#ef444415', borderRadius: '8px' }}>
                <Clock size={20} color="#ef4444" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>MTTR (Factory Avg)</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {data.mttr} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Hrs</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Mean Time To Repair</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f59e0b15', borderRadius: '8px' }}>
                <Wrench size={20} color="#f59e0b" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Breakdowns</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.totalBreakdowns}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Resolved incidents on record</p>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#3b82f615', borderRadius: '8px' }}>
                <DollarSign size={20} color="#3b82f6" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Maint. Cost</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>${data.totalMaintenanceCost?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Downtime + Spare Parts</p>
          </div>
        </div>

        {/* Detailed Analysis Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Financial Breakdown */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Maintenance Financial Analysis</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Lost Production (Downtime Cost)</span>
                  <strong style={{ color: '#ef4444' }}>${data.totalDowntimeCost?.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.totalMaintenanceCost ? (data.totalDowntimeCost/data.totalMaintenanceCost)*100 : 0}%`, backgroundColor: '#ef4444' }}></div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Calculated from {data.totalDowntimeHours} total hours of recorded machine downtime.</p>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Spare Parts Consumption</span>
                  <strong style={{ color: '#3b82f6' }}>${data.totalSparePartCost?.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.totalMaintenanceCost ? (data.totalSparePartCost/data.totalMaintenanceCost)*100 : 0}%`, backgroundColor: '#3b82f6' }}></div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Physical material costs routed to maintenance tickets.</p>
              </div>
            </div>
          </div>

          {/* Machine Level MTBF */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#10b981" /> MTBF by Machine
            </h3>
            
            {(data.machineMtbf || []).length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>No breakdown data available to calculate MTBF.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(data.machineMtbf || []).sort((a,b) => a.mtbf - b.mtbf).map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.machine?.name} ({m.machine?.code})</span>
                       <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.breakdownCount} Historical Failures</span>
                    </div>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: m.mtbf < 300 ? '#ef444415' : m.mtbf < 500 ? '#f59e0b15' : '#10b98115',
                      color: m.mtbf < 300 ? '#ef4444' : m.mtbf < 500 ? '#f59e0b' : '#10b981'
                    }}>
                      {m.mtbf} Hrs MTBF
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

export default MaintenanceAnalytics;
