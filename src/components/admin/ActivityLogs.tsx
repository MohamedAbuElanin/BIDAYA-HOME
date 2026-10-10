import React, { useState, useEffect } from 'react';
import { History, Shield, User, Clock, Filter } from 'lucide-react';
import { ActivityLog } from '../../types';
import { dataStore } from '../../services/dataStore';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    setLogs(dataStore.getActivityLogs());
    return dataStore.subscribe(() => {
      setLogs(dataStore.getActivityLogs());
    });
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (filterType !== 'all' && l.target_type !== filterType) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
            سجل عمليات النظام (Audit Activity Logs)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            تتبع وتوثيق كافة التعديلات والتغييرات التي تمت داخل لوحة الإدارة
          </p>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #E2E8F0', fontSize: '0.85rem' }}
        >
          <option value="all">كافة العمليات ({logs.length})</option>
          <option value="product">تعديلات المنتجات</option>
          <option value="category">تعديلات الأقسام</option>
          <option value="order">تحديثات الطلبات</option>
          <option value="setting">إعدادات المتجر</option>
          <option value="auth">تسجيلات الدخول</option>
        </select>
      </div>

      {/* Logs Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px' }}>المستخدم الإداري</th>
                <th style={{ padding: '12px 16px' }}>نوع الإجراء</th>
                <th style={{ padding: '12px 16px' }}>الهدف المستهدف</th>
                <th style={{ padding: '12px 16px' }}>التفاصيل والملاحظات</th>
                <th style={{ padding: '12px 16px' }}>التوقيت</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{log.admin_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{log.admin_role}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary-800)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {log.target_title || log.target_id || log.target_type}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '300px' }}>
                    {log.details || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8' }}>
                    {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
