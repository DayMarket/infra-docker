/* eslint-disable no-param-reassign */
import {
  styled,
  SupersetClient,
  t,
} from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import Loading from 'src/components/Loading';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import ListView from 'src/components/ListView';
import withToasts from 'src/components/MessageToasts/withToasts';
import DashboardCard from 'src/features/dashboards/DashboardCard';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { Owner, Tag } from 'src/types';
import { findPermission } from 'src/utils/findPermission';

const PAGE_SIZE = 25;

interface DashboardListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
    firstName: string;
    lastName: string;
  };
  showThumbnails?: boolean;
}

export interface Dashboard {
  changed_by_name: string;
  changed_on_delta_humanized: string;
  changed_by: string;
  dashboard_title: string;
  id: number;
  published: boolean;
  url: string;
  thumbnail_url: string;
  owners: Owner[];
  tags: Tag[];
  created_by: object;
}

const Actions = styled.div`
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const DASHBOARD_COLUMNS_TO_FETCH = [
  'id',
  'dashboard_title',
  'published',
  'url',
  'slug',
  'changed_by',
  'changed_on_delta_humanized',
  'owners.id',
  'owners.first_name',
  'owners.last_name',
  'owners',
  'tags.id',
  'tags.name',
  'tags.type',
  'status',
  'certified_by',
  'certification_details',
  'changed_on',
  'thumbnail_url',
];

function DashboardList(props: DashboardListProps) {
  const {
    addDangerToast,
    addSuccessToast,
    user,
    showThumbnails = true,
  } = props;

  const { roles } = useSelector<any, UserWithPermissionsAndRoles>(
    state => state.user,
  );
  const {
    state: {
      loading,
      resourceCount: dashboardCount,
      resourceCollection: dashboards,
      bulkSelectEnabled,
    },
    hasPerm,
    fetchData,
    toggleBulkSelect,
    refreshData,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    addDangerToast,
    undefined,
    undefined,
    undefined,
    undefined,
    DASHBOARD_COLUMNS_TO_FETCH,
  );

  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboards.map(d => d.id),
    addDangerToast,
  );

  const renderCard = useCallback(
    (dashboard: Dashboard) => {
      if (!dashboard.dashboard_title) return null;

      return (
        <DashboardCard
          dashboard={dashboard}
          hasPerm={hasPerm}
          bulkSelectEnabled={bulkSelectEnabled}
          showThumbnails={showThumbnails}
          userId={user?.userId}
          openDashboardEditModal={() => {}}
          saveFavoriteStatus={saveFavoriteStatus}
          favoriteStatus={favoriteStatus[dashboard.id] || false}
          handleBulkDashboardExport={() => {}}
          onDelete={() => {}}
        />
      );
    },
    [bulkSelectEnabled, favoriteStatus, hasPerm, showThumbnails, user?.userId, saveFavoriteStatus],
  );

  const subMenuButtons: SubMenuProps['buttons'] = [];
  if (hasPerm('can_write')) {
    subMenuButtons.push({
      name: (
        <>
          <i className="fa fa-plus" /> {t('Dashboard')}
        </>
      ),
      buttonStyle: 'primary',
      onClick: () => {
        window.location.assign('/dashboard/new');
      },
    });
  }

  return (
    <>
      <SubMenu name={t('Dashboards')} buttons={subMenuButtons} />
      <ListView<Dashboard>
        bulkActions={[]}
        bulkSelectEnabled={bulkSelectEnabled}
        cardSortSelectOptions={[
          { id: 'changed_on_delta_humanized', label: t('Modified'), desc: true },
        ]}
        className="dashboard-list-view"
        columns={[]}
        count={dashboardCount}
        data={dashboards}
        disableBulkSelect={toggleBulkSelect}
        fetchData={fetchData}
        refreshData={refreshData}
        filters={[]}
        initialSort={[]}
        loading={loading}
        pageSize={PAGE_SIZE}
        addSuccessToast={addSuccessToast}
        addDangerToast={addDangerToast}
        showThumbnails={showThumbnails}
        renderCard={renderCard}
        defaultViewMode={showThumbnails ? 'card' : 'table'}
        enableViewModeToggle
        bulkTagResourceName="dashboard"
      />
      {loading && <Loading />}
    </>
  );
}

export default withToasts(DashboardList);
