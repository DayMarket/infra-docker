import {
  isFeatureEnabled,
  FeatureFlag,
  styled,
  SupersetClient,
  t,
  css,
  useTheme,
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
import PublishedLabel from 'src/components/Label';
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
import { dangerouslyGetItemDoNotUse } from 'src/utils/localStorageHelpers';
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
import { navigateTo } from 'src/utils/navigationUtils';

const PAGE_SIZE = 25;

const PASSWORDS_NEEDED_MESSAGE = t(
  'The passwords for the databases below are needed in order to import them together with the dashboards.',
);

const CONFIRM_OVERWRITE_MESSAGE = t(
  'You are importing one or more dashboards that already exist. Overwriting might cause you to lose some of your work. Are you sure you want to overwrite?',
);

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
  'changed_by',
  'changed_by.id',
  'changed_by.first_name',
  'changed_by.last_name',
  'changed_on_delta_humanized',
  'owners',
  'owners.id',
  'owners.first_name',
  'owners.last_name',
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
  const theme = useTheme();
  const { roles } = useSelector<any, UserWithPermissionsAndRoles>(state => state.user);
  const canReadTag = findPermission('can_read', 'Tag', roles);

  const {
    state: {
      loading,
      resourceCount: dashboardCount,
      resourceCollection: dashboards,
      bulkSelectEnabled,
    },
    setResourceCollection: setDashboards,
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

  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | null>(null);
  const [dashboardToDelete, setDashboardToDelete] = useState<CRUDDashboard | null>(null);
  const [importingDashboard, showImportModal] = useState<boolean>(false);
  const [passwordFields, setPasswordFields] = useState<string[]>([]);
  const [preparingExport, setPreparingExport] = useState<boolean>(false);
  const [sshTunnelPasswordFields, setSSHTunnelPasswordFields] = useState<string[]>([]);
  const [sshTunnelPrivateKeyFields, setSSHTunnelPrivateKeyFields] = useState<string[]>([]);
  const [sshTunnelPrivateKeyPasswordFields, setSSHTunnelPrivateKeyPasswordFields] = useState<string[]>([]);

  const openDashboardImportModal = () => showImportModal(true);
  const closeDashboardImportModal = () => showImportModal(false);

  const handleDashboardImport = () => {
    showImportModal(false);
    refreshData();
    addSuccessToast(t('Dashboard imported'));
  };

  const userKey = dangerouslyGetItemDoNotUse(user?.userId?.toString(), null);
  const initialSort = [{ id: 'changed_on_delta_humanized', desc: true }];

  const handleDashboardEdit = (edits: Dashboard) =>
    SupersetClient.get({ endpoint: `/api/v1/dashboard/${edits.id}` }).then(
      ({ json = {} }) => {
        setDashboards(
          dashboards.map(d =>
            d.id === json?.result?.id
              ? {
                  ...d,
                  ...json.result,
                }
              : d,
          ),
        );
      },
      createErrorHandler(errMsg =>
        addDangerToast(t('An error occurred while fetching dashboards: %s', errMsg)),
      ),
    );

  const handleBulkDashboardExport = (dashboardsToExport: Dashboard[]) => {
    const ids = dashboardsToExport.map(({ id }) => id);
    handleResourceExport('dashboard', ids, () => setPreparingExport(false));
    setPreparingExport(true);
  };

  const handleBulkDashboardDelete = (dashboardsToDelete: Dashboard[]) =>
    SupersetClient.delete({
      endpoint: `/api/v1/dashboard/?q=${rison.encode(dashboardsToDelete.map(({ id }) => id))}`,
    }).then(
      ({ json = {} }) => {
        refreshData();
        addSuccessToast(json.message);
      },
      createErrorHandler(errMsg =>
        addDangerToast(t('There was an issue deleting the selected dashboards: ', errMsg)),
      ),
    );

  const renderCard = useCallback(
    (dashboard: Dashboard) => (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={() => true}
        bulkSelectEnabled={bulkSelectEnabled}
        showThumbnails={
          userKey ? userKey.thumbnails : isFeatureEnabled(FeatureFlag.Thumbnails)
        }
        userId={user?.userId}
        loading={loading}
        openDashboardEditModal={setDashboardToEdit}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={handleBulkDashboardExport}
        onDelete={setDashboardToDelete}
      />
    ),
    [
      bulkSelectEnabled,
      favoriteStatus,
      loading,
      saveFavoriteStatus,
      user?.userId,
      userKey,
    ],
  );

  const sortTypes = [
    {
      desc: false,
      id: 'dashboard_title',
      label: t('Alphabetical'),
      value: 'alphabetical',
    },
    {
      desc: true,
      id: 'changed_on_delta_humanized',
      label: t('Recently modified'),
      value: 'recently_modified',
    },
    {
      desc: false,
      id: 'changed_on_delta_humanized',
      label: t('Least recently modified'),
      value: 'least_recently_modified',
    },
  ];

  return (
    <>
      <SubMenu
        name={t('Dashboards')}
        buttons={[
          {
            name: (
              <>
                <Icons.PlusOutlined
                  iconColor={theme.colors.primary.light5}
                  iconSize="m"
                  css={css`
                    margin: auto ${theme.gridUnit * 2}px auto 0;
                    vertical-align: text-top;
                  `}
                />
                {t('Dashboard')}
              </>
            ),
            buttonStyle: 'primary',
            onClick: () => {
              navigateTo('/dashboard/new', { assign: true });
            },
          },
          {
            name: (
              <Tooltip id="import-tooltip" title={t('Import dashboards')} placement="bottomRight">
                <Icons.DownloadOutlined data-test="import-button" />
              </Tooltip>
            ),
            buttonStyle: 'link',
            onClick: openDashboardImportModal,
          },
          {
            name: t('Bulk select'),
            buttonStyle: 'secondary',
            'data-test': 'bulk-select',
            onClick: toggleBulkSelect,
          },
        ]}
      />

      <ConfirmStatusChange
        title={t('Please confirm')}
        description={t('Are you sure you want to delete the selected dashboards?')}
        onConfirm={handleBulkDashboardDelete}
      >
        {confirmDelete => (
          <>
            {dashboardToEdit && (
              <PropertiesModal
                dashboardId={dashboardToEdit.id}
                show
                onHide={() => setDashboardToEdit(null)}
                onSubmit={handleDashboardEdit}
              />
            )}
            {dashboardToDelete && (
              <DeleteModal
                description={
                  <>
                    {t('Are you sure you want to delete')}{' '}
                    <b>{dashboardToDelete.dashboard_title}</b>?
                  </>
                }
                onConfirm={() => {
                  handleDashboardDelete(
                    dashboardToDelete,
                    refreshData,
                    addSuccessToast,
                    addDangerToast,
                    undefined,
                    user?.userId,
                  );
                  setDashboardToDelete(null);
                }}
                onHide={() => setDashboardToDelete(null)}
                open={!!dashboardToDelete}
                title={t('Please confirm')}
              />
            )}
            <ListView<Dashboard>
              className="dashboard-list-view"
              count={dashboardCount}
              data={dashboards}
              loading={loading}
              pageSize={PAGE_SIZE}
              fetchData={fetchData}
              refreshData={refreshData}
              renderCard={renderCard}
              addSuccessToast={addSuccessToast}
              addDangerToast={addDangerToast}
              bulkSelectEnabled={bulkSelectEnabled}
              disableBulkSelect={toggleBulkSelect}
              cardSortSelectOptions={sortTypes}
              defaultViewMode={
                isFeatureEnabled(FeatureFlag.ListviewsDefaultCardView) ? 'card' : 'table'
              }
              showThumbnails={
                userKey ? userKey.thumbnails : isFeatureEnabled(FeatureFlag.Thumbnails)
              }
            />
          </>
        )}
      </ConfirmStatusChange>

      <ImportModelsModal
        resourceName="dashboard"
        resourceLabel={t('dashboard')}
        passwordsNeededMessage={PASSWORDS_NEEDED_MESSAGE}
        confirmOverwriteMessage={CONFIRM_OVERWRITE_MESSAGE}
        addDangerToast={addDangerToast}
        addSuccessToast={addSuccessToast}
        onModelImport={handleDashboardImport}
        show={importingDashboard}
        onHide={closeDashboardImportModal}
        passwordFields={passwordFields}
        setPasswordFields={setPasswordFields}
        sshTunnelPasswordFields={sshTunnelPasswordFields}
        setSSHTunnelPasswordFields={setSSHTunnelPasswordFields}
        sshTunnelPrivateKeyFields={sshTunnelPrivateKeyFields}
        setSSHTunnelPrivateKeyFields={setSSHTunnelPrivateKeyFields}
        sshTunnelPrivateKeyPasswordFields={sshTunnelPrivateKeyPasswordFields}
        setSSHTunnelPrivateKeyPasswordFields={setSSHTunnelPrivateKeyPasswordFields}
      />

      {preparingExport && <Loading />}
    </>
  );
}

export default withToasts(DashboardList);
