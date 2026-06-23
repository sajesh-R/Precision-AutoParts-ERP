import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Cog, LineChart, DollarSign, TrendingUp } from 'lucide-react';

const CostAccounting = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('material'); // material, production, profitability

  useEffect(() => {
    fetchCosting();
  }, []);

  const fetchCosting = async () => {
    try {
      const res = await axios.get('/finance/costing');
      setData(res.data.data);
    } catch (err) { console.error('Costing fetch error', err); }
    setLoading(false);
  };

  if (loading || !data) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Calculating Cost Centers...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Cost Accounting</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyze material, production, and product costing for profitability optimization</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('material')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'material' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'material' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} /> Material Costing
        </button>
        <button onClick={() => setActiveTab('production')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'production' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'production' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cog size={16} /> Production Costing
        </button>
        <button onClick={() => setActiveTab('profitability')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'profitability' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'profitability' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChart size={16} /> Profitability Analysis
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        {activeTab === 'material' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Material Cost Analysis</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Material Procurement Cost</p>
                 <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>${data.materialCosting.totalMaterialCost.toLocaleString()}</div>
                 <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>{data.materialCosting.variance} vs Last Quarter</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Production Cost Analysis (Labor & Overheads)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Direct Labor Cost</p>
                 <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>${data.productionCosting.totalLaborCost.toLocaleString()}</div>
               </div>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manufacturing Overheads</p>
                 <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>${data.productionCosting.totalOverheadCost.toLocaleString()}</div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'profitability' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Product Profitability Analysis</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ padding: '12px', backgroundColor: '#3b82f615', borderRadius: '50%' }}><DollarSign size={24} color="#3b82f6" /></div>
                 <div>
                   <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average Gross Margin</p>
                   <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{data.profitability.grossMargin}</div>
                 </div>
               </div>

               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ padding: '12px', backgroundColor: '#10b98115', borderRadius: '50%' }}><TrendingUp size={24} color="#10b981" /></div>
                 <div>
                   <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average Net Margin</p>
                   <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{data.profitability.netMargin}</div>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CostAccounting;
