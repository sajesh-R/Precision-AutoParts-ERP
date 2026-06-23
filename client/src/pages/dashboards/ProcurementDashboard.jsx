import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Truck, AlertTriangle, TrendingDown } from 'lucide-react';

const ProcurementDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/procurement');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Procurement Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of purchasing spend and supplier performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Purchase Spend */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Purchase Spend (MTD)</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><CreditCard size={20} color="#3b82f6" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.purchaseSpend.total.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <TrendingDown size={16} /> Savings: ₹{data.purchaseSpend.savings.toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Budget: ₹{data.purchaseSpend.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Vendor Performance */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Top Vendor Performance</span>
            <div style={{ padding: '8px', backgroundColor: '#10b98115', borderRadius: '8px' }}><Truck size={20} color="#10b981" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.vendorPerformance.map((vendor, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600 }}>{vendor.vendor}</div>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>On-Time Delivery</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{vendor.onTimeDelivery}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Quality Rating</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{vendor.qualityRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Shortages */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Critical Material Shortages</span>
            <div style={{ padding: '8px', backgroundColor: '#ef444415', borderRadius: '8px' }}><AlertTriangle size={20} color="#ef4444" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.materialShortages.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: item.status === 'Critical' ? '4px solid var(--accent-danger)' : '4px solid var(--accent-warning)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.item}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status: <span style={{ color: item.status === 'Critical' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 600 }}>{item.status}</span></div>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Required</span>
                    <span style={{ fontWeight: 600 }}>{item.required}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Available</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>{item.available}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
