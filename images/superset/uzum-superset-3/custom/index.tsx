// UZUM CUSTOM DashboardList/index.tsx
import React from 'react';
import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView/ListView';
import { useListViewResource } from 'src/views/CRUD/hooks';
import { Dashboard } from 'src/types/Dashboard';
import DashboardCard from './DashboardCard';

const DashboardList = () => {
  const {
    state: { loading, resourceCount, resourceCollection },
    fetchData,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    addDangerToast, // Убедитесь, что эта функция определена
  );

  const renderCard = (dashboard: Dashboard) => {
    if (!dashboard || !dashboard.id) {
      return null;
    }
    return <DashboardCard key={dashboard.id} dashboard={dashboard} />;
  };

  return (
    <div className="dashboard-list-view">
      <h2>{t('Your Dashboards')}</h2>
      {loading && <div>{t('Loading dashboards...')}</div>}
      {!loading && resourceCollection && resourceCollection.length === 0 && (
        <div>{t('No dashboards available')}</div>
      )}
      <div className="dashboard-card-grid">
        {resourceCollection?.map(renderCard)}
      </div>
    </div>
  );
};

export default DashboardList;
