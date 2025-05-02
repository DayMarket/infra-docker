import React, { useCallback } from 'react';
import { t, isFeatureEnabled, FeatureFlag } from '@superset-ui/core';
import SubMenu from 'src/views/components/SubMenu';
import ListView from 'src/components/ListView';
import Icon from 'src/components/Icon';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { createErrorHandler } from 'src/views/CRUD/utils';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import { Dashboard } from 'src/views/CRUD/types';
import DashboardCard from 'src/pages/DashboardList/DashboardCard';

const DashboardList = () => {
  const {
    state: { loading, resourceCount: count, resourceCollection: dashboards },
    hasPerm,
    fetchData,
  } = useListViewResource<Dashboard>('dashboard', t('dashboard'), createErrorHandler);

  const dashboardIds = dashboards.map(d => d.id);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboardIds,
    createErrorHandler,
  );

  const columns = [
    {
      Header: t('Title'),
      accessor: 'dashboard_title',
    },
    {
      Header: t('Certified'),
      accessor: 'certified_by',
      Cell: ({ cell: { value }, row: { original } }) =>
        value ? (
          <CertifiedBadge
            certifiedBy={value}
            details={original.certification_details}
          />
        ) : null,
    },
    {
      Header: t('Modified'),
      accessor: 'changed_on_delta_humanized',
    },
    {
      Header: t('Modified by'),
      accessor: 'changed_by_name',
    },
    {
      Header: t('Actions'),
      id: 'actions',
      Cell: ({ row: { original } }) => (
        <FaveStar
          itemId={original.id}
          saveFaveStar={saveFavoriteStatus}
          isStarred={favoriteStatus[original.id]}
        />
      ),
    },
  ];

  const renderCard = useCallback(
    (dashboard: Dashboard) => (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={hasPerm}
        bulkSelectEnabled={false}
        showThumbnails={isFeatureEnabled(FeatureFlag.Thumbnails)}
        userId={null}
        loading={loading}
        openDashboardEditModal={() => {}}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={() => {}}
        onDelete={() => {}}
      />
    ),
    [hasPerm, loading, saveFavoriteStatus, favoriteStatus],
  );

  return (
    <>
      <SubMenu
        name={t('Dashboards')}
        tabs={[
          {
            label: t('Dashboards'),
            name: 'Dashboards',
            icon: <Icon name="dashboard" />,
            url: '/dashboard/list/',
          },
        ]}
      />
      <ListView
        className="dashboard-list-view"
        columns={columns}
        data={dashboards}
        count={count}
        loading={loading}
        fetchData={fetchData}
        title={t('Dashboards')}
        renderCard={renderCard}
        cardView
        enableViewModeToggle
      />
    </>
  );
};

export default DashboardList;
