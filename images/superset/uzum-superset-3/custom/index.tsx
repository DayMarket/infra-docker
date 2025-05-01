import React from 'react';
import { t } from '@superset-ui/core';
import { useListViewResource } from 'src/views/CRUD/hooks';
import DashboardCard from './DashboardCard';
import { Dashboard } from './types';

const DashboardList = () => {
  const {
    state: { loading, resourceCollection: dashboards },
  } = useListViewResource<Dashboard>('dashboard', t('dashboard'), '/api/v1/dashboard/');

  if (loading) {
    return <div className="dashboard-loading">Загружаем...</div>;
  }

  if (!dashboards?.length) {
    return <div className="dashboard-empty">Нет доступных дашбордов</div>;
  }

  return (
    <div className="dashboard-list">
      {dashboards.map(d => (
        <DashboardCard key={d.id} dashboard={d} />
      ))}
    </div>
  );
};

export default DashboardList;
