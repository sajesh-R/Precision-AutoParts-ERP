import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, TrendingDown, DollarSign } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ScrapManagement = () => {
  const [scrapRecords, setScrapRecords] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [woRes, matRes] = await Promise.all([
        axios.get('/production/wo'),
        axios.get('/master/material')
      ]);
      setWorkOrders(woRes.data.data.filter(wo => wo.status !== 'Created')); // Allow scrap logging on active/completed
      setMaterials(matRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shopfloor/scrap');
      setScrapRecords(res.data.data);
    } catch (err) { console.error('Scrap fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/shopfloor/scrap', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording scrap');
    }
  };

  const columns = [
    { header: 'Scrap Log', accessor: 'scrapNumber' },
    { header: 'Source Work Order', render: (row) => row.workOrderId?.workOrderNumber || '-' },
    { header: 'Scrapped Material', render: (row) => <strong>{row.materialId?.name}</strong> },
    { header: 'Qty', render: (row) => <strong style={{ color: '#ef4444' }}>{row.scrapQuantity}</strong> },
    { header: 'Unit Cost', render: (row) => <span style={{ fontSize: '12px' }}>${row.unitCost?.toFixed(2)}</span> },
    { header: 'Total Value Lost', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>${row.totalScrapCost?.toFixed(2)}</strong> },
    { header: 'Root Cause', render: (row) => <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.rootCauseAnalysis || '-'}</span> },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  // Analysis Cards calculations
  const totalScrapValue = scrapRecords.reduce((acc, curr) => acc + (curr.totalScrapCost || 0), 0);
  const totalItemsScrapped = scrapRecords.reduce((acc, curr) => acc + (curr.scrapQuantity || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Scrap Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Log manufacturing scrap and automatically track financial loss</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Trash2 size={14} /> Record Scrap
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <DollarSign size={16} color="#ef4444" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Financial Impact</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>${totalScrapValue.toFixed(2)}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <TrendingDown size={16} color="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Items Scrapped</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalItemsScrapped} units</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <Trash2 size={16} color="#3b82f6" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Scrap Incidents</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{scrapRecords.length} Events</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={scrapRecords} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Manufacturing Scrap">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Source Work Order</label>
            <select className="input-field" required value={formData.workOrderId || ''} onChange={e => setFormData({...formData, workOrderId: e.target.value})}>
              <option value="" disabled>Select Work Order</option>
              {workOrders.map(wo => <option key={wo._id} value={wo._id}>{wo.workOrderNumber}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Scrapped Material (Component/FG)</label>
              <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
                <option value="" disabled>Select Material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.name} (${m.standardCost})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.scrapQuantity || ''} onChange={e => setFormData({...formData, scrapQuantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Root Cause Analysis</label>
            <textarea className="input-field" required rows="2" value={formData.rootCauseAnalysis || ''} onChange={e => setFormData({...formData, rootCauseAnalysis: e.target.value})}></textarea>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            The financial cost will be automatically calculated by querying the Master Material's standard valuation and multiplying it by the scrap quantity.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Log Scrap Data</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ScrapManagement;
