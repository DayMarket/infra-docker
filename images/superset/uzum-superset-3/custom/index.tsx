// src/pages/DashboardList/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import rison from 'rison';
import { t, SupersetClient } from '@superset-ui/core';
import Button from 'src/components/Button';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
import Icons from 'src/components/Icons';
import ListView from 'src/components/ListView';
import SubMenu from 'src/components/Menu/SubMenu';
import { createErrorHandler, handleBulkDashboardExport } from 'src/views/CRUD/utils';
import { Dashboard } from 'src/types/Dashboard';
import DashboardCard from './DashboardCard';
import PropertiesModal from '../CRUD/Dashboard/PropertiesModal';

const PAGE_SIZE = 25;

function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});
  const [sortColumn, setSortColumn] = useState('changed_on_delta_humanized');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchData = () => {
    setLoading(true);
    const queryParams = rison.encode({
      page: currentPage,
      page_size: PAGE_SIZE,
      sort_column: sortColumn,
      sort_order: sortOrder,
      filters: Object.values(filters),
    });

    SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${queryParams}`,
    })
      .then(({ json }) => {
        setDashboards(json.result);
        setLoading(false);
      })
      .catch(() => {
        setError(t('There was an error fetching the dashboards.'));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [filters, sortColumn, sortOrder, currentPage]);

  const renderCard = (dashboard: Dashboard) => (
    <DashboardCard key={dashboard.id} dashboard={dashboard} />
  );

  const menu = useMemo(
    () => [
      <Button
        key="create"
        buttonStyle="primary"
        href="/dashboard/new"
        data-test="new-dashboard"
      >
        <Icons.Plus iconSize="l" /> {t('Dashboard')}
      </Button>,
    ],
    [],
  );

  return (
    <>
      <SubMenu
        name={t('Dashboards')}
        buttons={menu}
      />
      <ListView
        title={t('Your Dashboards')}
        loading={loading}
        error={error}
        items={dashboards}
        fetchData={fetchData}
        renderCard={renderCard}
        cardView
        showFilters
        pageSize={PAGE_SIZE}
        count={dashboards.length}
        columns={[]}
      />
    </>
  );
}

export default DashboardList;
