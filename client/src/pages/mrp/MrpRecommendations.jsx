import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Hammer, CalendarClock, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

const MrpRecommendations = () => {
  const [mrpRuns, setMrpRuns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState('');
  
  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await axios.get('/mrp/run');
      setMrpRuns(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedRunId(res.data.data[0]._id);
        fetchRecommendations(res.data.data[0]._id);
      }
    } catch (err) { console.error('MRP Runs fetch error', err); }
  };

  const fetchRecommendations = async (runId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/mrp/recommendations?runId=${runId}`);
      setRecommendations(res.data.data);
    } catch (err) { console.error('Recommendations fetch error', err); }
    setLoading(false);
  };

  const handleRunChange = (e) => {
    setSelectedRunId(e.target.value);
    fetchRecommendations(e.target.value);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/mrp/recommendations/${id}/status`, { status });
      fetchRecommendations(selectedRunId);
    } catch (err) { alert('Error updating suggestion status'); }
  };

  const purchaseSuggestions = recommendations.filter(r => r.suggestionType === 'Purchase');
  const productionSuggestions = recommendations.filter(r => r.suggestionType === 'Production');
  const reschedulingSuggestions = recommendations.filter(r => r.suggestionType === 'Rescheduling'); // Placeholder for now

  const columns = [
    { header: 'Target Item', render: (row) => row.itemId?.name || '-' },
    { header: 'Item Code', render: (row) => row.itemId?.code || '-' },
    { header: 'Suggested Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{(row.suggestedQuantity ?? 0).toFixed(2)}</strong> },
    { header: 'Suggested Date', render: (row) => row.suggestedDate ? new Date(row.suggestedDate).toLocaleDateString() : '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Converted' ? '#10b98115' : row.status === 'Dismissed' ? '#ef444415' : 'var(--bg-tertiary)',
        color: row.status === 'Converted' ? '#10b981' : row.status === 'Dismissed' ? '#ef4444' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const actionRenderer = (row) => {
    if (row.status === 'Pending') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => updateStatus(row._id, 'Converted')} title="Convert to Order" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-success)' }}><CheckCircle size={14} /></button>
          <button onClick={() => updateStatus(row._id, 'Dismissed')} title="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}><XCircle size={14} /></button>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>MRP Recommendations</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Review and convert MRP engine suggestions</p>
        </div>
        <div style={{ width: '250px' }}>
          <select className="input-field" value={selectedRunId} onChange={handleRunChange}>
            <option value="" disabled>Select MRP Run</option>
            {mrpRuns.map(r => <option key={r._id} value={r._id}>{r.runNumber} ({r.period})</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>Loading Recommendations...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          
          {/* Purchase Suggestions */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} color="var(--accent-primary)" />
              <strong style={{ fontSize: '13px' }}>Purchase Suggestions ({purchaseSuggestions.length})</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
              {purchaseSuggestions.length > 0 ? (
                <DataTable columns={columns} data={purchaseSuggestions} onEdit={() => {}} customActions={actionRenderer} />
              ) : (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No purchase suggestions generated.</div>
              )}
            </div>
          </div>

          {/* Production Suggestions */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hammer size={16} color="var(--accent-warning)" />
              <strong style={{ fontSize: '13px' }}>Production Suggestions ({productionSuggestions.length})</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
              {productionSuggestions.length > 0 ? (
                <DataTable columns={columns} data={productionSuggestions} onEdit={() => {}} customActions={actionRenderer} />
              ) : (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No production suggestions generated.</div>
              )}
            </div>
          </div>

          {/* Rescheduling Suggestions */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarClock size={16} color="#8b5cf6" />
              <strong style={{ fontSize: '13px' }}>Rescheduling Suggestions ({reschedulingSuggestions.length})</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
              {reschedulingSuggestions.length > 0 ? (
                <DataTable columns={columns} data={reschedulingSuggestions} onEdit={() => {}} customActions={actionRenderer} />
              ) : (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No rescheduling required at this time.</div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MrpRecommendations;
