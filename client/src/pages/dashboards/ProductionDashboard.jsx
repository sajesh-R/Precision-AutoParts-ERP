import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Cpu, PowerOff, Zap } from 'lucide-react';

const ProductionDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/production');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Production Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of manufacturing efficiency and machine utilization.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* OEE */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Overall Equipment Effectiveness (OEE)</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><Activity size={20} color="#3b82f6" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Availability</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.oee.availability}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Performance</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.oee.performance}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Quality</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.oee.quality}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Overall OEE</div>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{data.oee.overall}</div>
            </div>
          </div>
        </div>

        {/* Production Output */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Production Output (Today)</span>
            <div style={{ padding: '8px', backgroundColor: '#10b98115', borderRadius: '8px' }}><Zap size={20} color="#10b981" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.productionOutput.actual.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{data.productionOutput.unit}</span></div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Target: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{data.productionOutput.planned.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: '12px', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(data.productionOutput.actual / data.productionOutput.planned) * 100}%`, height: '100%', backgroundColor: 'var(--accent-success)' }}></div>
            </div>
          </div>
        </div>

        {/* Machine Utilization */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Machine Utilization</span>
            <div style={{ padding: '8px', backgroundColor: '#8b5cf615', borderRadius: '8px' }}><Cpu size={20} color="#8b5cf6" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.machineUtilization.map((machine, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600 }}>{machine.machine}</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {machine.utilization}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downtime */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Downtime (Hours)</span>
            <div style={{ padding: '8px', backgroundColor: '#ef444415', borderRadius: '8px' }}><PowerOff size={20} color="#ef4444" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.downtime.totalHours} Hrs</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-warning)' }}></div>
                Planned: <strong style={{ color: 'var(--text-primary)' }}>{data.downtime.planned} Hrs</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-danger)' }}></div>
                Unplanned: <strong style={{ color: 'var(--text-primary)' }}>{data.downtime.unplanned} Hrs</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
