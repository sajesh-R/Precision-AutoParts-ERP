import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Hammer, Stethoscope, Clock, AlertOctagon } from 'lucide-react';

const MaintenanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/maintenance');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Maintenance Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of equipment health and maintenance schedules.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Maintenance Status */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Current Work Orders</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><Hammer size={20} color="#3b82f6" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scheduled</div>
              <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-primary)' }}>{data.maintenanceStatus.scheduled}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</div>
              <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-success)' }}>{data.maintenanceStatus.completed}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '4px solid var(--accent-danger)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overdue</div>
              <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-danger)' }}>{data.maintenanceStatus.overdue}</div>
            </div>
          </div>
        </div>

        {/* Machine Health */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Machine Health Checks</span>
            <div style={{ padding: '8px', backgroundColor: '#10b98115', borderRadius: '8px' }}><Stethoscope size={20} color="#10b981" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.machineHealth.map((machine, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: machine.status === 'Good' ? '4px solid var(--accent-success)' : '4px solid var(--accent-warning)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{machine.machine}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status: <span style={{ color: machine.status === 'Good' ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>{machine.status}</span></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last Maintained</span>
                  <span style={{ fontWeight: 600 }}>{new Date(machine.lastMaintained).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downtime Trends */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Reliability Metrics</span>
            <div style={{ padding: '8px', backgroundColor: '#ef444415', borderRadius: '8px' }}><Clock size={20} color="#ef4444" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                 <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>MTBF</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mean Time Between Failures</div>
               </div>
               <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-success)' }}>{data.downtimeTrends.mtbf}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                 <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>MTTR</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mean Time To Repair</div>
               </div>
               <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-warning)' }}>{data.downtimeTrends.mttr}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
