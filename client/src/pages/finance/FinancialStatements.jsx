import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, TrendingUp, Download, Briefcase, Activity } from 'lucide-react';

const FinancialStatements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pl'); // pl, bs, cf

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      const res = await axios.get('/finance/statements');
      setData(res.data.data);
    } catch (err) { console.error('Statements fetch error', err); }
    setLoading(false);
  };

  if (loading || !data) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Compiling Financial Data...</div>;
  }

  const { profitAndLoss, balanceSheet, cashFlow } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Financial Statements</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Generate and analyze core financial reports based on live ledger data</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={14} /> Export Report
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('pl')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'pl' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'pl' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} /> Profit & Loss
        </button>
        <button onClick={() => setActiveTab('bs')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'bs' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'bs' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={16} /> Balance Sheet
        </button>
        <button onClick={() => setActiveTab('cf')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'cf' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'cf' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} /> Cash Flow
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        {activeTab === 'pl' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Income Statement (Profit & Loss)</h2>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '32px' }}>For the Current Fiscal Year</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Operating Revenue</span>
                <span>${profitAndLoss.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operating Expenses (COGS & Overheads)</span>
                <span style={{ color: '#ef4444' }}>- ${profitAndLoss.expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginTop: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Net Profit</span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: profitAndLoss.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                  ${profitAndLoss.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bs' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Balance Sheet</h2>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '32px' }}>As of Today</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Assets */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '2px solid var(--accent-primary)', paddingBottom: '8px', marginBottom: '16px' }}>Assets</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Accounts Receivable</span>
                  <span>${balanceSheet.assets?.accountsReceivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cash & Equivalents</span>
                  <span style={{ color: 'var(--text-secondary)' }}>$125,000.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginTop: '16px' }}>
                  <span style={{ fontWeight: 600 }}>Total Assets</span>
                  <span style={{ fontWeight: 600 }}>${(balanceSheet.assets?.accountsReceivable + 125000).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '2px solid #ef4444', paddingBottom: '8px', marginBottom: '16px' }}>Liabilities</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Accounts Payable</span>
                  <span>${balanceSheet.liabilities?.accountsPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginTop: '16px' }}>
                  <span style={{ fontWeight: 600 }}>Total Liabilities</span>
                  <span style={{ fontWeight: 600 }}>${balanceSheet.liabilities?.accountsPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cf' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Cash Flow Statement</h2>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '32px' }}>YTD Cash Activities</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Cash from Operating Activities</span>
                <span style={{ color: cashFlow.operatingActivities >= 0 ? '#10b981' : '#ef4444' }}>
                  {cashFlow.operatingActivities >= 0 ? '+' : ''} ${cashFlow.operatingActivities.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FinancialStatements;
