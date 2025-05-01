// file: src/pages/DashboardList/index.tsx
import React from 'react';
import { t } from '@superset-ui/core';
import DashboardCard from './DashboardCard';

type DashboardType = {
  id: number;
  dashboard_title: string;
  thumbnail_url?: string | null;
};

const dashboards: DashboardType[] = (window as any).bootstrap?.dashboards || [];

const DashboardList = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{t('Your Dashboards')}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.isArray(dashboards) && dashboards.length > 0 ? (
          dashboards.map(dashboard => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} />
          ))
        ) : (
          <div style={{ fontStyle: 'italic', opacity: 0.6 }}>
            {t('No dashboards available')}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardList;
