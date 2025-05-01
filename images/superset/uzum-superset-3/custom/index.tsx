import React from 'react';
import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView';
import { ColumnsType } from 'antd/lib/table';
import { useListViewResource } from 'src/views/CRUD/hooks';
import { isFeatureEnabled, FeatureFlag } from 'src/featureFlags';
import DashboardCard from './DashboardCard';
import { DashboardInfo } from 'src/views/DashboardList/types';

const PAGE_SIZE = 25;

const DashboardList = () => {
  const {
    state: { loading, resourceCount: dashboardsCount, resourceCollection: dashboards },
    fetchData,
    setResourceCollection: setDashboards,
  } = useListViewResource<DashboardInfo>(
    'dashboard',
    t('dashboard'),
    addDangerToast,
  );

  const columns: ColumnsType<DashboardInfo> = [
    {
      title: t('Title'),
      dataIndex: 'dashboard_title',
      key: 'dashboard_title',
    },
    {
      title: t('Creator'),
      dataIndex: 'created_by',
      key: 'created_by',
      render: ({ first_name, last_name }) => `${first_name} ${last_name}`,
    },
  ];

  return (
    <ListView<DashboardInfo>
      title={t('Your Dashboards')}
      loading={loading}
      data={dashboards || []}
      count={dashboardsCount}
      pageSize={PAGE_SIZE}
      columns={columns}
      fetchData={fetchData}
      renderCard={(dashboard: DashboardInfo) => {
        if (!dashboard) return null;
        return <DashboardCard key={dashboard.id} dashboard={dashboard} />;
      }}
      cardView
    />
  );
};

export default DashboardList;
