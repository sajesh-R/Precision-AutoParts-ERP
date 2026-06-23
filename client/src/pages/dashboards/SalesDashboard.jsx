import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, DollarSign, Users, TrendingUp } from 'lucide-react';

const SalesDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/sales');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Sales Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of sales performance and customer metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Orders */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Sales Orders</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><ShoppingCart size={20} color="#3b82f6" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.orders.pending + data.orders.completed}</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <span>New: <strong style={{ color: 'var(--text-primary)' }}>{data.orders.new}</strong></span>
              <span>Pending: <strong style={{ color: 'var(--accent-warning)' }}>{data.orders.pending}</strong></span>
              <span>Completed: <strong style={{ color: 'var(--accent-success)' }}>{data.orders.completed}</strong></span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Total Value: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{data.orders.totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Monthly Revenue</span>
            <div style={{ padding: '8px', backgroundColor: '#10b98115', borderRadius: '8px' }}><DollarSign size={20} color="#10b981" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.revenue.currentMonth.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <TrendingUp size={16} /> {data.revenue.growth}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs Last Month (₹{data.revenue.lastMonth.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Customer Performance */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Top Customers</span>
            <div style={{ padding: '8px', backgroundColor: '#8b5cf615', borderRadius: '8px' }}><Users size={20} color="#8b5cf6" /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.customerPerformance.map((customer, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{customer.customer}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{customer.orders} Orders this month</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                  ₹{customer.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
