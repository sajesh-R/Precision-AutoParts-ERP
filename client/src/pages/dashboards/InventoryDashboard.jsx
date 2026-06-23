import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertCircle, Archive, Trash2 } from 'lucide-react';

const InventoryDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/inventory');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Inventory Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of stock valuation and inventory health.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Stock Value */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Total Stock Valuation</span>
            <div style={{ padding: '8px', backgroundColor: '#8b5cf615', borderRadius: '8px' }}><Package size={20} color="#8b5cf6" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Raw Materials</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>₹{data.stockValue.rawMaterials.toLocaleString()}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Work In Progress</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>₹{data.stockValue.workInProgress.toLocaleString()}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Finished Goods</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-primary)' }}>₹{data.stockValue.finishedGoods.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Low Stock Alerts</span>
            <div style={{ padding: '8px', backgroundColor: '#ef444415', borderRadius: '8px' }}><AlertCircle size={20} color="#ef4444" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.lowStockItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-danger)' }}>
                <div style={{ fontWeight: 600 }}>{item.item}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Min</span>
                    <span style={{ fontWeight: 600 }}>{item.minLevel}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>{item.currentStock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Stock Items */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Dead Stock & Aging</span>
            <div style={{ padding: '8px', backgroundColor: '#f59e0b15', borderRadius: '8px' }}><Trash2 size={20} color="#f59e0b" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.deadStockItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.item}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><Archive size={12} style={{ display: 'inline', marginRight: '4px' }}/>{item.daysInStock} Days Aging</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent-warning)' }}>
                  ₹{item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
