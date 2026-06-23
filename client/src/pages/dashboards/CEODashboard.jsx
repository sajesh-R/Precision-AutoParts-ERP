import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Package, Activity, AlertCircle, TrendingDown } from 'lucide-react';

const CEODashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/dashboards/ceo');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>CEO Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>High-level executive overview of company performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Revenue */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Revenue</span>
            <div style={{ padding: '8px', backgroundColor: '#3b82f615', borderRadius: '8px' }}><DollarSign size={20} color="#3b82f6" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.revenue.current.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.revenue.trend.includes('+') ? 'var(--accent-success)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                {data.revenue.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.revenue.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs Target ₹{data.revenue.target.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Net Profit</span>
            <div style={{ padding: '8px', backgroundColor: '#10b98115', borderRadius: '8px' }}><TrendingUp size={20} color="#10b981" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.profit.current.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.profit.trend.includes('+') ? 'var(--accent-success)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                {data.profit.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.profit.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs Target ₹{data.profit.target.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Operating Cash Flow</span>
            <div style={{ padding: '8px', backgroundColor: '#8b5cf615', borderRadius: '8px' }}><Activity size={20} color="#8b5cf6" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.cashFlow.current.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.cashFlow.trend.includes('+') ? 'var(--accent-success)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                {data.cashFlow.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.cashFlow.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs Target ₹{data.cashFlow.target.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Inventory Value</span>
            <div style={{ padding: '8px', backgroundColor: '#f59e0b15', borderRadius: '8px' }}><Package size={20} color="#f59e0b" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{data.inventoryValue.current.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.inventoryValue.trend.includes('+') ? 'var(--accent-danger)' : 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                {data.inventoryValue.trend.includes('-') ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                {data.inventoryValue.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs Budget ₹{data.inventoryValue.target.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Open Orders */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Open Sales Orders</span>
            <div style={{ padding: '8px', backgroundColor: '#06b6d415', borderRadius: '8px' }}><AlertCircle size={20} color="#06b6d4" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.openOrders.count}</div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Total Value: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{data.openOrders.value.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Production Efficiency */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Production Efficiency</span>
            <div style={{ padding: '8px', backgroundColor: '#ec489915', borderRadius: '8px' }}><Activity size={20} color="#ec4899" /></div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{data.productionEfficiency.current}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
              <span style={{ color: data.productionEfficiency.trend.includes('+') ? 'var(--accent-success)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                {data.productionEfficiency.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.productionEfficiency.trend}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Target: {data.productionEfficiency.target}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
