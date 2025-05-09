import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  isFeatureEnabled,
  FeatureFlag,
  styled,
  SupersetClient,
  t,
} from '@superset-ui/core';
import { useSelector } from 'react-redux';
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

const PAGE_SIZE = 25;
const PASSWORDS_NEEDED_MESSAGE = t('The passwords for the databases below are needed in order to import them together with the dashboards.');
const CONFIRM_OVERWRITE_MESSAGE = t('You are importing one or more dashboards that already exist. Overwriting might cause you to lose some of your work. Are you sure you want to overwrite?');

function DashboardList(props) {
  const { addDangerToast, addSuccessToast, user } = props;
  const { roles } = useSelector(state => state.user);
  const canReadTag = findPermission('can_read', 'Tag', roles);

  const {
    state: { loading, resourceCount, resourceCollection, bulkSelectEnabled },
    setResourceCollection,
    hasPerm,
    fetchData,
    toggleBulkSelect,
    refreshData,
  } = useListViewResource('dashboard', t('dashboard'), addDangerToast, undefined, undefined, undefined, undefined, [
    'id','dashboard_title','published','url','slug','changed_by','changed_on_delta_humanized','owners.id','owners.first_name','owners.last_name','owners','tags.id','tags.name','tags.type','status','certified_by','certification_details','changed_on','thumbnail_url']
  );

  const [showThumbnails, setShowThumbnails] = useState(true);

  const dashboardIds = useMemo(() => resourceCollection.map(d => d.id), [resourceCollection]);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus('dashboard', dashboardIds, addDangerToast);
  const [dashboardToEdit, setDashboardToEdit] = useState(null);
  const [dashboardToDelete, setDashboardToDelete] = useState(null);
  const [importingDashboard, showImportModal] = useState(false);
  const [passwordFields, setPasswordFields] = useState([]);
  const [preparingExport, setPreparingExport] = useState(false);
  const [sshTunnelPasswordFields, setSSHTunnelPasswordFields] = useState([]);
  const [sshTunnelPrivateKeyFields, setSSHTunnelPrivateKeyFields] = useState([]);
  const [sshTunnelPrivateKeyPasswordFields, setSSHTunnelPrivateKeyPasswordFields] = useState([]);

  const handleBulkDashboardExport = dashboards => {
    const ids = dashboards.map(({ id }) => id);
    handleResourceExport('dashboard', ids, () => setPreparingExport(false));
    setPreparingExport(true);
  };

  const renderCard = useCallback(
    dashboard => (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={hasPerm}
        bulkSelectEnabled={bulkSelectEnabled}
        showThumbnails={showThumbnails}
        userId={user?.userId}
        openDashboardEditModal={setDashboardToEdit}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={handleBulkDashboardExport}
        onDelete={setDashboardToDelete}
      />
    ),
    [bulkSelectEnabled, favoriteStatus, hasPerm, showThumbnails, user?.userId, saveFavoriteStatus],
  );

  const subMenuButtons = [];
  subMenuButtons.push({
    name: showThumbnails ? t('Hide thumbnails') : t('Show thumbnails'),
    buttonStyle: 'tertiary',
    onClick: () => setShowThumbnails(!showThumbnails),
  });

  return (
    <>
      <SubMenu name={t('Dashboards')} buttons={subMenuButtons} />
      <ListView
        bulkActions={[]}
        bulkSelectEnabled={bulkSelectEnabled}
        cardSortSelectOptions={[]}
        className="dashboard-list-view"
        columns={[]}
        count={resourceCount}
        data={resourceCollection}
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
      {preparingExport && <Loading />}
    </>
  );
}

export default withToasts(DashboardList);
