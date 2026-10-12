import React from 'react';

export const PageSkeleton: React.FC<{ cards?: number }> = ({ cards = 8 }) => (
  <div className="container" aria-label="Loading content" style={{ padding: '36px 16px 64px' }}>
    <div className="skeleton" style={{ width: '180px', height: '32px', marginBottom: '14px' }} />
    <div className="skeleton" style={{ width: '280px', height: '18px', marginBottom: '32px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#fff' }}>
          <div className="skeleton" style={{ height: '190px' }} />
          <div style={{ padding: '16px' }}>
            <div className="skeleton" style={{ width: '45%', height: '12px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '18px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '70%', height: '18px', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '38px' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
