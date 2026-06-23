import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Database, Boxes, Settings } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

const InventoryControl = () => {
  const [activeTab, setActiveTab] = useState('Raw Material'); // Raw Material, WIP, Finished Goods, Spare Parts
  const [inventoryData, setInventoryData] = useState({
    'Raw Material': [],
    'WIP': [],
    'Finished Goods': [],
    'Spare Parts': []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory/control');
      setInventoryData(res.data.data);
    } catch (err) { console.error('Inventory fetch error', err); }
    setLoading(false);
  };

  const columns = [
    { header: 'Batch No', accessor: 'batchNumber' },
    { header: 'Material Name', render: (row) => row.materialId?.name || '-' },
    { header: 'Material Code', render: (row) => row.materialId?.code || '-' },
    { header: 'Warehouse', render: (row) => row.warehouseId?.name || '-' },
    { header: 'Qty Available', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.quantityAvailable}</strong> },
    { header: 'Posting Date', render: (row) => new Date(row.postingDate).toLocaleDateString() },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Active' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.status === 'Active' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Inventory Control</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitor and view stock levels categorized by material type</p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', padding: '4px' }}>
          <button 
            className={`btn ${activeTab === 'Raw Material' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'Raw Material' ? '' : 'transparent', color: activeTab === 'Raw Material' ? '' : 'var(--text-secondary)', border: 'none' }}
            onClick={() => setActiveTab('Raw Material')}
          >
            <Database size={14} style={{ marginRight: '6px' }} /> Raw Material
          </button>
          <button 
            className={`btn ${activeTab === 'WIP' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'WIP' ? '' : 'transparent', color: activeTab === 'WIP' ? '' : 'var(--text-secondary)', border: 'none' }}
            onClick={() => setActiveTab('WIP')}
          >
            <Settings size={14} style={{ marginRight: '6px' }} /> WIP
          </button>
          <button 
            className={`btn ${activeTab === 'Finished Goods' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'Finished Goods' ? '' : 'transparent', color: activeTab === 'Finished Goods' ? '' : 'var(--text-secondary)', border: 'none' }}
            onClick={() => setActiveTab('Finished Goods')}
          >
            <Package size={14} style={{ marginRight: '6px' }} /> Finished Goods
          </button>
          <button 
            className={`btn ${activeTab === 'Spare Parts' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'Spare Parts' ? '' : 'transparent', color: activeTab === 'Spare Parts' ? '' : 'var(--text-secondary)', border: 'none' }}
            onClick={() => setActiveTab('Spare Parts')}
          >
            <Boxes size={14} style={{ marginRight: '6px' }} /> Spare Parts
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inventoryData[activeTab] || []} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default InventoryControl;
