import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', /* Solid dark backdrop */
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'none' /* Remove glassmorphism */
    }}>
      <div className="animate-fade-in" style={{
        backgroundColor: 'var(--bg-primary)',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid var(--border-color)', /* Strict native border */
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        <div style={{ 
          padding: '8px 12px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)' /* Native titlebar style */
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '16px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
