import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, isLoading, customActions }) => {
  if (isLoading) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        No records found.
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', overflowX: 'auto', overflowY: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', borderRight: index < columns.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || customActions) && (
              <th style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)', width: '100px', textAlign: 'right' }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row._id || rowIndex} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-tertiary)' }}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ padding: '6px 10px', color: 'var(--text-secondary)', borderRight: colIndex < columns.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
              {(onEdit || onDelete || customActions) && (
                <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {customActions && customActions(row)}
                    {onEdit && (
                      <button onClick={() => onEdit(row)} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
