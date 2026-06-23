import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calculator } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

const InventoryValuation = () => {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory/valuation');
      setValuations(res.data.data);
    } catch (err) { console.error('Valuation fetch error', err); }
    setLoading(false);
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      await axios.post('/inventory/valuation/calculate');
      await fetchData();
    } catch (err) {
      alert('Error calculating valuation');
    }
    setCalculating(false);
  };

  const columns = [
    { header: 'Material Name', render: (row) => row.materialId?.name || '-' },
    { header: 'Standard Cost (Ref)', render: (row) => <span style={{ color: 'var(--text-secondary)' }}>${row.materialId?.standardCost?.toFixed(2)}</span> },
    { header: 'Calculated FIFO Value', render: (row) => <strong style={{ color: '#10b981' }}>${row.fifoValuation?.toFixed(2)}</strong> },
    { header: 'Weighted Avg Cost / Unit', render: (row) => <strong style={{ color: '#3b82f6' }}>${row.weightedAverageCost?.toFixed(2)}</strong> },
    { header: 'Last Calculated', render: (row) => new Date(row.lastCalculatedDate).toLocaleString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Inventory Valuation</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calculate and monitor financial valuation of inventory using FIFO and WAC methods</p>
        </div>
        <button className="btn btn-primary" onClick={handleCalculate} disabled={calculating}>
          {calculating ? 'Calculating...' : <><Calculator size={14} /> Calculate Valuations</>}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        
        {/* Top summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#10b98115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign color="#10b981" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total FIFO Valuation (System-Wide)</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                ${valuations.reduce((acc, curr) => acc + (curr.fifoValuation || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#3b82f615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator color="#3b82f6" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Items Tracked for WAC</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {valuations.length}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={valuations} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default InventoryValuation;
