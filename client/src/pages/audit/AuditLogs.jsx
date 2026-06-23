import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, LogIn, Monitor, FileClock } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (activeTab === 'transactions') fetchLogs();
    else fetchLoginHistory();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/audit/logs');
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchLoginHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/audit/login-history');
      setLoginHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const transactionColumns = [
    { header: 'Action', render: (row) => {
      const color = row.action === 'CREATE' ? 'var(--accent-success)' : 
                    row.action === 'DELETE' ? 'var(--accent-danger)' : 'var(--accent-primary)';
      return (
        <span style={{ fontWeight: 700, color }}>{row.action}</span>
      )
    }},
    { header: 'Module', accessor: 'module' },
    { header: 'User', render: (row) => {
      const name = row.changedBy ? `${row.changedBy.firstName || ''} ${row.changedBy.lastName || ''}`.trim() : '';
      return name ? name : 'System Admin';
    }},
    { header: 'IP Address', accessor: 'ipAddress' },
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
    { header: 'Details', render: (row) => (
      <button onClick={() => setSelectedLog(row)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        <FileClock size={18} />
      </button>
    )}
  ];

  const loginColumns = [
    { header: 'Status', render: (row) => {
      const color = row.status === 'Success' ? 'var(--accent-success)' : 
                    row.status === 'Logout' ? 'var(--text-muted)' : 'var(--accent-danger)';
      return (
        <span style={{ fontWeight: 700, color }}>{row.status}</span>
      )
    }},
    { header: 'User', render: (row) => row.userId ? `${row.userId.firstName} ${row.userId.lastName}` : row.email },
    { header: 'IP Address', accessor: 'ipAddress' },
    { header: 'Device', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.userAgent}>
        <Monitor size={14} /> {row.userAgent || 'Unknown'}
      </div>
    )},
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Audit & Activity Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>View system-wide transaction logs and login history.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', backgroundColor: 'var(--bg-tertiary)' }}>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderBottom: activeTab === 'transactions' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'transactions' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'transactions' ? 600 : 500, backgroundColor: activeTab === 'transactions' ? 'var(--bg-primary)' : 'transparent',
              fontSize: '13px'
            }}
          >
            <Activity size={14} /> Transaction Logs
          </button>
          <button
            onClick={() => setActiveTab('logins')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderBottom: activeTab === 'logins' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'logins' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'logins' ? 600 : 500, backgroundColor: activeTab === 'logins' ? 'var(--bg-primary)' : 'transparent',
              fontSize: '13px'
            }}
          >
            <LogIn size={14} /> Login History
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'transactions' ? (
            <DataTable columns={transactionColumns} data={logs} isLoading={loading} />
          ) : (
            <DataTable columns={loginColumns} data={loginHistory} isLoading={loading} />
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Change History Details">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.action}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Module</span>
                <div style={{ fontWeight: 600 }}>{selectedLog.module}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target ID</span>
                <div style={{ fontSize: '0.875rem' }}>{selectedLog.recordId}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Changed By</span>
                <div style={{ fontSize: '0.875rem' }}>
                  {(() => {
                    const name = selectedLog.changedBy ? `${selectedLog.changedBy.firstName || ''} ${selectedLog.changedBy.lastName || ''}`.trim() : '';
                    return name ? name : 'System Admin';
                  })()}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payload Data (New Values)</h4>
              <pre style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                overflowX: 'auto',
                color: 'var(--text-primary)'
              }}>
                {JSON.stringify(selectedLog.newValue || selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
