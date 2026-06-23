import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, PackageX, Factory } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

const ShortageAnalysis = () => {
  const [mrpRuns, setMrpRuns] = useState([]);
  const [shortages, setShortages] = useState([]);
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
        fetchShortages(res.data.data[0]._id);
      }
    } catch (err) { console.error('MRP Runs fetch error', err); }
  };

  const fetchShortages = async (runId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/mrp/shortages?runId=${runId}`);
      setShortages(res.data.data);
    } catch (err) { console.error('Shortages fetch error', err); }
    setLoading(false);
  };

  const handleRunChange = (e) => {
    setSelectedRunId(e.target.value);
    fetchShortages(e.target.value);
  };

  const rawMaterialShortages = shortages.filter(s => s.shortageType === 'RawMaterial');
  const componentShortages = shortages.filter(s => s.shortageType === 'Component');
  const productionConstraints = shortages.filter(s => s.shortageType === 'ProductionConstraint');

  const shortageColumns = [
    { header: 'Item Name', render: (row) => row.itemId?.name || '-' },
    { header: 'Item Code', render: (row) => row.itemId?.code || '-' },
    { header: 'Shortage Qty', render: (row) => <strong style={{ color: 'var(--accent-danger)' }}>{(row.shortageQuantity ?? 0).toFixed(2)}</strong> }
  ];

  const constraintColumns = [
    { header: 'Target Product', render: (row) => row.itemId?.name || '-' },
    { header: 'Blocked Qty', render: (row) => <strong style={{ color: 'var(--accent-danger)' }}>{(row.shortageQuantity ?? 0).toFixed(2)}</strong> },
    { header: 'Constraint Reason', accessor: 'constraintDetails' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Shortage Analysis</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Identify gaps between requirements and on-hand inventory</p>
        </div>
        <div style={{ width: '250px' }}>
          <select className="input-field" value={selectedRunId} onChange={handleRunChange}>
            <option value="" disabled>Select MRP Run</option>
            {mrpRuns.map(r => <option key={r._id} value={r._id}>{r.runNumber} ({r.period})</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>Loading Analysis...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          
          {/* Production Constraints */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid #ef444450', borderRadius: '6px' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #ef444450', backgroundColor: '#ef444415', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <strong style={{ fontSize: '13px', color: '#ef4444' }}>Production Constraints ({productionConstraints.length})</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
              {productionConstraints.length > 0 ? (
                <DataTable columns={constraintColumns} data={productionConstraints} />
              ) : (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No production constraints identified.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Raw Material Shortages */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackageX size={16} color="var(--accent-warning)" />
                <strong style={{ fontSize: '13px' }}>Raw Material Shortages ({rawMaterialShortages.length})</strong>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
                {rawMaterialShortages.length > 0 ? (
                  <DataTable columns={shortageColumns} data={rawMaterialShortages} />
                ) : (
                  <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No raw material shortages.</div>
                )}
              </div>
            </div>

            {/* Component Shortages */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Factory size={16} color="var(--accent-primary)" />
                <strong style={{ fontSize: '13px' }}>Component Shortages ({componentShortages.length})</strong>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)' }}>
                {componentShortages.length > 0 ? (
                  <DataTable columns={shortageColumns} data={componentShortages} />
                ) : (
                  <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>No component shortages.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ShortageAnalysis;
