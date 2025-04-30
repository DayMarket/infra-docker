import {
  isFeatureEnabled,
  FeatureFlag,
  styled,
  SupersetClient,
  t,
} from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import rison from 'rison';
import {
  createFetchRelated,
  createErrorHandler,
  handleDashboardDelete,
} from 'src/views/CRUD/utils';
import { useListViewResource, useFavoriteStatus } from 'src/views/CRUD/hooks';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
import { TagsList } from 'src/components/Tags';
import handleResourceExport from 'src/utils/export';
import Loading from 'src/components/Loading';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import ListView, {
  ListViewProps,
  Filter,
  Filters,
  FilterOperator,
} from 'src/components/ListView';
import Owner from 'src/types/Owner';
import Tag from 'src/types/TagType';
import withToasts from 'src/components/MessageToasts/withToasts';
import FacePile from 'src/components/FacePile';
import Icons from 'src/components/Icons';
import DeleteModal from 'src/components/DeleteModal';
import FaveStar from 'src/components/FaveStar';
import PropertiesModal from 'src/dashboard/components/PropertiesModal';
import { Tooltip } from 'src/components/Tooltip';
import ImportModelsModal from 'src/components/ImportModal/index';

import {
  Dashboard as CRUDDashboard,
  QueryObjectColumns,
} from 'src/views/CRUD/types';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { loadTags } from 'src/components/Tags/utils';
import DashboardCard from 'src/features/dashboards/DashboardCard';
import { DashboardStatus } from 'src/features/dashboards/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { findPermission } from 'src/utils/findPermission';
import { ModifiedInfo } from 'src/components/AuditInfo';

const PAGE_SIZE = 25;

interface DashboardListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
    firstName: string;
    lastName: string;
  };
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
  'thumbnail_url',
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
];

function DashboardList(props: DashboardListProps) {
  const { addDangerToast, addSuccessToast, user } = props;
  const { roles } = useSelector<any, UserWithPermissionsAndRoles>(
    state => state.user,
  );
  const canReadTag = findPermission('can_read', 'Tag', roles);

  const {
    state: {
      loading,
      resourceCount: dashboardCount,
      resourceCollection: dashboards,
      bulkSelectEnabled,
    },
    setResourceCollection: setDashboards,
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

  const dashboardIds = useMemo(() => dashboards.map(d => d.id), [dashboards]);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'dashboard',
    dashboardIds,
    addDangerToast,
  );

  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | null>(
    null,
  );
  const [dashboardToDelete, setDashboardToDelete] =
    useState<CRUDDashboard | null>(null);

  const renderCard = useCallback(
    (dashboard: Dashboard) => (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={hasPerm}
        bulkSelectEnabled={bulkSelectEnabled}
        showThumbnails={true}
        userId={user?.userId}
        loading={loading}
        openDashboardEditModal={setDashboardToEdit}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={ids => handleResourceExport('dashboard', ids)}
        onDelete={dashboard => setDashboardToDelete(dashboard)}
      />
    ),
    [
      bulkSelectEnabled,
      favoriteStatus,
      hasPerm,
      loading,
      user?.userId,
      saveFavoriteStatus,
    ],
  );

  const filters: Filters = useMemo(
    () => [
      {
        Header: t('Name'),
        key: 'search',
        id: 'dashboard_title',
        input: 'search',
        operator: FilterOperator.TitleOrSlug,
      },
    ],
    [],
  );

  return (
    <>
      <SubMenu name={t('Dashboards')} />
      <ListView<Dashboard>
        bulkActions={[]}
        bulkSelectEnabled={bulkSelectEnabled}
        cardSortSelectOptions={[]}
        className="dashboard-list-view"
        columns={[]}
        count={dashboardCount}
        data={dashboards}
        disableBulkSelect={toggleBulkSelect}
        fetchData={fetchData}
        refreshData={refreshData}
        filters={filters}
        loading={loading}
        pageSize={PAGE_SIZE}
        addSuccessToast={addSuccessToast}
        addDangerToast={addDangerToast}
        showThumbnails={true}
        renderCard={renderCard}
        defaultViewMode="card"
      />
    </>
  );
}

export default withToasts(DashboardList);
