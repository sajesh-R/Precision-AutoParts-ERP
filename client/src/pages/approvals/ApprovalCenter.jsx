import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import { Check, X } from 'lucide-react';

const ApprovalCenter = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/approvals/pending');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch approvals', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      await axios.post(`/approvals/${id}/${action}`);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const columns = [
    { header: 'Requested Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Module', accessor: 'module' },
    { header: 'Action', accessor: 'action' },
    { header: 'Requested By', render: (row) => row.requestedBy ? `${row.requestedBy.firstName} ${row.requestedBy.lastName}` : 'System' },
    { 
      header: 'Details', 
      render: (row) => {
        if (!row.payload) return '-';
        return (
          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.entries(row.payload).map(([k, v]) => {
              if (k.startsWith('_') || k === 'id') return null;
              const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              let displayVal = '';
              if (typeof v === 'object' && v !== null) {
                displayVal = JSON.stringify(v);
              } else {
                displayVal = String(v);
              }
              return (
                <div key={k} style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formattedKey}:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{displayVal}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Approval Center</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Review and action pending system requests.</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <DataTable 
          columns={columns} 
          data={data} 
          isLoading={loading} 
          customActions={(row) => (
            <>
              <button onClick={() => handleAction(row._id, 'approve')} title="Approve" style={{ background: 'none', border: 'none', color: 'var(--accent-success)', cursor: 'pointer', padding: '4px' }}>
                <Check size={16} />
              </button>
              <button onClick={() => handleAction(row._id, 'reject')} title="Reject" style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default ApprovalCenter;
