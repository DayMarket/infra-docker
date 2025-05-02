import { useCallback } from 'react';
import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { createErrorHandler } from 'src/views/CRUD/utils';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import { Dashboard } from 'src/views/CRUD/types';
import DashboardCard from 'src/features/dashboards/DashboardCard';

const DashboardList = () => {
  const {
    state: {
      loading,
      resourceCount: dashboardsCount,
      resourceCollection: dashboards,
    },
    fetchData,
    refreshData,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    createErrorHandler,
  );

  const dashboardIds = dashboards.map(d => d.id);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboardIds,
    createErrorHandler,
  );

  const columns = [
    {
      Header: t('Dashboard'),
      accessor: 'dashboard_title',
    },
    {
      Header: t('Certified'),
      accessor: 'certified_by',
      Cell: ({ cell: { value } }: any) =>
        value ? <CertifiedBadge certifiedBy={value} /> : null,
    },
    {
      Header: t('Actions'),
      id: 'actions',
      Cell: ({ row: { original } }: any) => (
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
        hasPerm
        showThumbnails
        saveFavoriteStatus={saveFavoriteStatus}
        isFavorite={favoriteStatus[dashboard.id]}
        loading={loading}
      />
    ),
    [saveFavoriteStatus, favoriteStatus, loading],
  );

  return (
    <ListView
      className="dashboard-list-view"
      columns={columns}
      data={dashboards}
      count={dashboardsCount}
      pageSize={25}
      loading={loading}
      fetchData={fetchData}
      renderCard={renderCard}
      refreshData={refreshData}
      addSuccessToast={() => {}}
      addDangerToast={() => {}}
    />
  );
};

export default DashboardList;
