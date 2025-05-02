import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { createErrorHandler } from 'src/utils/createErrorHandler';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import { Dashboard } from 'src/views/CRUD/types';
import DashboardCard from 'src/features/dashboards/DashboardCard';

const DashboardList = () => {
  const {
    state: { loading, resourceCount: dashboardsCount, resourceCollection: dashboards },
    hasPerm,
    fetchData,
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
      Header: t('Title'),
      accessor: 'dashboard_title',
    },
    {
      Header: t('Creator'),
      accessor: 'creator.first_name',
    },
    {
      Header: t('Certified'),
      accessor: 'certified_by',
      Cell: ({ cell, row }: any) =>
        cell.value ? (
          <CertifiedBadge
            certifiedBy={cell.value}
            details={row.original.certification_details}
          />
        ) : null,
    },
    {
      Header: t('Actions'),
      id: 'actions',
      Cell: ({ row }: any) => (
        <FaveStar
          itemId={row.original.id}
          saveFaveStar={saveFavoriteStatus}
          isStarred={favoriteStatus[row.original.id]}
          className="m-0"
        />
      ),
    },
  ];

  const renderCard = (dashboard: Dashboard) => {
    if (!dashboard) return null;
    return (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={hasPerm}
        showThumbnails
        saveFavoriteStatus={saveFavoriteStatus}
        isFavorite={favoriteStatus[dashboard.id]}
      />
    );
  };

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
      cardView
      enableViewModeToggle
    />
  );
};

export default DashboardList;
