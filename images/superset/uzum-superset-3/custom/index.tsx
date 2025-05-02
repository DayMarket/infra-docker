// UZUM CUSTOM - Dashboard list view without headers or spinners

import React from 'react';
import ListView from 'src/components/ListView/ListView';
import { t } from '@superset-ui/core';
import { useListViewResource } from 'src/views/CRUD/hooks';
import { createErrorHandler } from 'src/views/CRUD/utils';
import { Dashboard } from './types';
import DashboardCard from './DashboardCard';

const PAGE_SIZE = 25;

export default function DashboardList() {
  const {
    state: { loading, resourceCount, resourceCollection },
    fetchData,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    createErrorHandler(errMsg =>
      t('There was an issue fetching dashboards: %s', errMsg),
    ),
  );

  const renderCard = (dashboard: Dashboard) =>
    dashboard ? (
      <DashboardCard key={dashboard.id} dashboard={dashboard} />
    ) : null;

  return (
    <ListView<Dashboard>
      className="dashboard-list-view-container"
      columns={[]}
      data={resourceCollection}
      count={resourceCount}
      loading={loading}
      pageSize={PAGE_SIZE}
      fetchData={fetchData}
      renderCard={renderCard}
    />
  );
}
