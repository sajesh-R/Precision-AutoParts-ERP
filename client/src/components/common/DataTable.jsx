import React, { useState } from 'react';
import { Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, isLoading, customActions, expandedRowRender }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const hasActions = onEdit || onDelete || customActions;
  const colSpanTotal = columns.length + (hasActions ? 1 : 0) + (expandedRowRender ? 1 : 0);

  return (
    <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', overflowX: 'auto', overflowY: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            {expandedRowRender && (
              <th style={{ padding: '6px 10px', width: '32px', borderRight: '1px solid var(--border-color)' }}></th>
            )}
            {columns.map((col, index) => (
              <th key={index} style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', borderRight: index < columns.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                {col.header}
              </th>
            ))}
            {hasActions && (
              <th style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)', width: '100px', textAlign: 'right' }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowId = row._id || rowIndex;
            const isExpanded = !!expandedRows[rowId];
            const baseRowBg = rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-tertiary)';

            return (
              <React.Fragment key={rowId}>
                <tr style={{
                  borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: baseRowBg
                }}>
                  {expandedRowRender && (
                    <td style={{ padding: '6px 10px', width: '32px', borderRight: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleRow(rowId)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          transition: 'color 0.2s'
                        }}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: '6px 10px', color: 'var(--text-secondary)', borderRight: colIndex < columns.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {hasActions && (
                    <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {customActions && customActions(row)}
                        {onEdit && (
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(row); }} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                            <Edit2 size={14} style={{ pointerEvents: 'none' }} />
                          </button>
                        )}
                        {onDelete && (
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(row); }} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                            <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                {expandedRowRender && isExpanded && (
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <td colSpan={colSpanTotal} style={{ padding: '0' }}>
                      {expandedRowRender(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
