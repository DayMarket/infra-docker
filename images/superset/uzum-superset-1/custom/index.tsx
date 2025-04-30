/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
  thumbnail_url: string;
  url: string;
  certified_by: string | null;
  certification_details: string | null;
  changed_by_name: string;
  changed_by_url: string;
  changed_by: any;
  changed_on_delta_humanized: string;
  owners: any[];
  tags: any[];
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

  const renderCard = useCallback(
    (dashboard: Dashboard) => (
      <DashboardCard
        dashboard={dashboard}
        hasPerm={hasPerm}
        bulkSelectEnabled={bulkSelectEnabled}
        showThumbnails={
          userKey
            ? userKey.thumbnails
            : isFeatureEnabled(FeatureFlag.Thumbnails)
        }
        userId={user?.userId}
        loading={loading}
        openDashboardEditModal={() => {}}
        saveFavoriteStatus={saveFavoriteStatus}
        favoriteStatus={favoriteStatus[dashboard.id]}
        handleBulkDashboardExport={() => {}}
        onDelete={() => {}}
      />
    ),
    [
      hasPerm,
      bulkSelectEnabled,
      user?.userId,
      loading,
      userKey,
      favoriteStatus,
      saveFavoriteStatus,
    ],
  );

  return (
    <>
      <SubMenu name={t('Dashboards')} buttons={[]} />
      <ListView
        className="dashboard-list-view"
        columns={[]}
        data={dashboards}
        count={dashboards.length}
        loading={loading}
        fetchData={fetchData}
        refreshData={refreshData}
        renderCard={renderCard}
        showThumbnails={
          userKey
            ? userKey.thumbnails
            : isFeatureEnabled(FeatureFlag.Thumbnails)
        }
        defaultViewMode="card"
      />
    </>
  );
}

export default withToasts(DashboardList);
