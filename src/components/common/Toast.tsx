import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        insetInlineStart: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#1C1917',
        color: '#FFFFFF',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.95rem',
        fontWeight: 600,
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <CheckCircle2 size={20} color="#25D366" />
      <span>{toastMessage}</span>
    </div>
  );
};
