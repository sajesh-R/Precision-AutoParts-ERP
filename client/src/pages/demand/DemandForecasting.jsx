import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DemandForecasting = () => {
  const [activeTab, setActiveTab] = useState('forecasts'); // 'forecasts', 'historical'
  const [forecasts, setForecasts] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ forecastType: 'Product', seasonalFactor: 1.0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDependencies();
    if (activeTab === 'forecasts') fetchData();
    if (activeTab === 'historical') fetchHistorical();
  }, [activeTab]);

  const fetchDependencies = async () => {
    try {
      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));
      
      const custRes = await axios.get('/master/customer');
      setCustomers(custRes.data.data.filter(c => c.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/demand/forecast');
      setForecasts(res.data.data);
    } catch (err) { console.error('Forecast fetch error', err); }
    setLoading(false);
  };

  const fetchHistorical = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/demand/historical');
      setHistoricalData(res.data.data);
    } catch (err) { console.error('Historical fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/demand/forecast/${editingId}`, formData);
      } else {
        await axios.post('/demand/forecast', formData);
      }
      setIsModalOpen(false);
      setFormData({ forecastType: 'Product', seasonalFactor: 1.0 });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      forecastNumber: row.forecastNumber,
      forecastType: row.forecastType,
      period: row.period,
      productId: row.productId?._id || row.productId,
      customerId: row.customerId?._id || row.customerId,
      seasonalFactor: row.seasonalFactor,
      projectedQuantity: row.projectedQuantity,
      status: row.status,
      notes: row.notes
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const forecastColumns = [
    { header: 'Forecast No', accessor: 'forecastNumber' },
    { header: 'Type', accessor: 'forecastType' },
    { header: 'Period', accessor: 'period' },
    { header: 'Target', render: (row) => row.forecastType === 'Customer' ? (row.customerId?.name || '-') : (row.productId?.name || '-') },
    { header: 'Qty (Adjusted)', render: (row) => `${(row.projectedQuantity * (row.seasonalFactor || 1)).toFixed(0)}` },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Finalized' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.status === 'Finalized' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const historicalColumns = [
    { header: 'Product Code', accessor: 'productCode' },
    { header: 'Product Name', accessor: 'productName' },
    { header: 'Total Sold Qty', render: (row) => row.totalHistoricalQuantity },
    { header: 'Order Count', render: (row) => row.orderCount },
    { header: 'Total Value', render: (row) => `$${(row.totalHistoricalValue || 0).toFixed(2)}` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Demand Forecasting</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyze historical data and generate future demand projections</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', padding: '4px' }}>
            <button 
              className={`btn ${activeTab === 'forecasts' ? 'btn-primary' : ''}`} 
              style={{ background: activeTab === 'forecasts' ? '' : 'transparent', color: activeTab === 'forecasts' ? '' : 'var(--text-secondary)', border: 'none' }}
              onClick={() => setActiveTab('forecasts')}
            >
              <TrendingUp size={14} style={{ marginRight: '6px' }} /> Projections
            </button>
            <button 
              className={`btn ${activeTab === 'historical' ? 'btn-primary' : ''}`} 
              style={{ background: activeTab === 'historical' ? '' : 'transparent', color: activeTab === 'historical' ? '' : 'var(--text-secondary)', border: 'none' }}
              onClick={() => setActiveTab('historical')}
            >
              <BarChart3 size={14} style={{ marginRight: '6px' }} /> Historical
            </button>
          </div>
          
          {activeTab === 'forecasts' && (
            <button className="btn btn-primary" onClick={() => { setFormData({ forecastType: 'Product', seasonalFactor: 1.0, forecastNumber: 'FC-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
              <Plus size={14} /> Create Forecast
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          {activeTab === 'forecasts' ? (
            <DataTable columns={forecastColumns} data={forecasts} isLoading={loading} onEdit={handleEdit} />
          ) : (
            <DataTable columns={historicalColumns} data={historicalData} isLoading={loading} onEdit={() => {}} />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Demand Forecast`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Forecast Number</label>
              <input type="text" className="input-field" required readOnly value={formData.forecastNumber || ''} onChange={e => setFormData({...formData, forecastNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Period (e.g., Q3-2026, Oct-2026)</label>
              <input type="text" className="input-field" required value={formData.period || ''} onChange={e => setFormData({...formData, period: e.target.value})} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Forecast Type</label>
            <select className="input-field" required value={formData.forecastType} onChange={e => setFormData({...formData, forecastType: e.target.value})}>
              <option value="Product">Product Forecast</option>
              <option value="Seasonal">Seasonal Forecast</option>
              <option value="Customer">Customer Demand Forecast</option>
            </select>
          </div>

          {(formData.forecastType === 'Product' || formData.forecastType === 'Seasonal') && (
            <div className="input-group">
              <label className="input-label">Target Product</label>
              <select className="input-field" required value={formData.productId || ''} onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="" disabled>Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {products.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please create an active Product first.</p>}
            </div>
          )}

          {formData.forecastType === 'Customer' && (
            <div className="input-group">
              <label className="input-label">Target Customer</label>
              <select className="input-field" required value={formData.customerId || ''} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                <option value="" disabled>Select Customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {customers.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please create a Customer first.</p>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Projected Base Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.projectedQuantity || ''} onChange={e => setFormData({...formData, projectedQuantity: e.target.value})} />
            </div>
            {formData.forecastType === 'Seasonal' && (
              <div className="input-group">
                <label className="input-label">Seasonal Factor (e.g. 1.2 for 20% increase)</label>
                <input type="number" className="input-field" required min="0" step="0.1" value={formData.seasonalFactor || ''} onChange={e => setFormData({...formData, seasonalFactor: e.target.value})} />
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="input-field" required value={formData.status || 'Draft'} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Draft">Draft</option>
              <option value="Finalized">Finalized</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Forecast' : 'Save Forecast'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandForecasting;
