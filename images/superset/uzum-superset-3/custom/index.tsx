import React, { useCallback } from 'react';
import { t, isFeatureEnabled, FeatureFlag } from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { dangerouslyGetItemDoNotUse } from 'src/utils/localStorageHelpers';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import SubMenu from 'src/features/home/SubMenu';
import { ListView } from 'src/components/ListView';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import { createFetchRelated, handleDashboardDelete } from 'src/views/CRUD/utils';
import { DashboardStatus } from 'src/features/dashboards/types';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import FacePile from 'src/components/FacePile';
import Icons from 'src/components/Icons';
import Tooltip from 'src/components/Tooltip';
import withToasts from 'src/components/MessageToasts/withToasts';
import DashboardCard from 'src/features/dashboards/DashboardCard';

interface Dashboard {
  id: number;
  dashboard_title: string;
  thumbnail_url?: string;
  url: string;
  certified_by?: string | null;
  certification_details?: string | null;
  changed_by_name?: string;
  changed_by_url?: string;
  changed_by?: any;
  changed_on_delta_humanized?: string;
  owners?: any[];
  tags?: any[];
}

interface Props {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
  };
}

function DashboardList(props: Props) {
  const { addDangerToast, addSuccessToast, user } = props;

  const { state, hasPerm, fetchData, toggleBulkSelect, refreshData } =
    useListViewResource<Dashboard>(
      'dashboard',
      t('dashboard'),
      addDangerToast,
      undefined,
      undefined,
      undefined,
      undefined,
      [
        'id',
        'dashboard_title',
        'url',
        'thumbnail_url',
        'certified_by',
        'certification_details',
        'changed_by',
        'changed_by_name',
        'changed_by_url',
        'changed_on_delta_humanized',
        'owners',
        'tags',
      ],
    );

  const {
    loading,
    resourceCollection: dashboards,
    bulkSelectEnabled,
  } = state;

  const dashboardIds = dashboards.map(d => d.id);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboardIds,
    addDangerToast,
  );

  const userKey = dangerouslyGetItemDoNotUse(user?.userId?.toString(), null);

  const showThumbnails =
    userKey && typeof userKey.thumbnails !== 'undefined'
      ? userKey.thumbnails
      : isFeatureEnabled(FeatureFlag.Thumbnails);

  const renderCard = useCallback(
    (dashboard: Dashboard) => {
      return (
        <DashboardCard
          dashboard={dashboard}
          hasPerm={hasPerm}
          bulkSelectEnabled={bulkSelectEnabled}
          showThumbnails={showThumbnails}
          userId={user?.userId}
          loading={loading}
          openDashboardEditModal={() => {}}
          saveFavoriteStatus={saveFavoriteStatus}
          favoriteStatus={favoriteStatus[dashboard.id]}
          handleBulkDashboardExport={() => {}}
          onDelete={() => {}}
        />
      );
    },
    [
      hasPerm,
      bulkSelectEnabled,
      user?.userId,
      loading,
      userKey,
      showThumbnails,
      favoriteStatus,
      saveFavoriteStatus,
    ],
  );

  return (
    <>
      <SubMenu name={t('Dashboards')} buttons={[]} />
      <ListView
        className="dashboard-list-view"
        columns={[]} // simplified, as we focus on cards
        data={dashboards}
        count={dashboards.length}
        loading={loading}
        fetchData={fetchData}
        refreshData={refreshData}
        renderCard={renderCard}
        showThumbnails={showThumbnails}
        defaultViewMode="card"
      />
    </>
  );
}

export default withToasts(DashboardList);
