import { t, isFeatureEnabled, FeatureFlag } from '@superset-ui/core';
import { useCallback } from 'react';
import ListView from 'src/components/ListView';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import { Dashboard } from 'src/views/CRUD/types';
import DashboardCard from 'src/features/dashboards/DashboardCard';
import { useSelector } from 'react-redux';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';

const DashboardList = () => {
  const {
    state: {
      loading,
      resourceCount: dashboardsCount,
      resourceCollection: dashboards,
    },
    fetchData,
    refreshData,
    hasPerm,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    () => {},
  );

  const { user } = useSelector<any, { user: UserWithPermissionsAndRoles }>(
    state => state,
  );
  const dashboardIds = dashboards.map(d => d.id);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboardIds,
    () => {},
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
        hasPerm={() => true}
        bulkSelectEnabled={false}
        showThumbnails={isFeatureEnabled(FeatureFlag.Thumbnails)}
        userId={user?.userId}
        loading={loading}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={() => {}}
        onDelete={() => {}}
      />
    ),
    [favoriteStatus, loading, saveFavoriteStatus, user?.userId],
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
      refreshData={refreshData}
      renderCard={renderCard}
      addSuccessToast={() => {}}
      addDangerToast={() => {}}
    />
  );
};

export default DashboardList;
