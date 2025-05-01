// File: src/pages/DashboardList/index.tsx

import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { t, SupersetClient } from '@superset-ui/core';
import { ListView } from 'src/components/ListView';
import DashboardCard from './DashboardCard';

interface Dashboard {
  id: number;
  dashboard_title: string;
  thumbnail_url?: string;
}

function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = rison.encode({
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
          page_size: 20,
          page: 0,
        });

        const { json } = await SupersetClient.get({ endpoint: `/api/v1/dashboard/?q=${query}` });
        setDashboards(json.result);
      } catch (error) {
        console.error('Error loading dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ListView
      className="dashboard-list-view"
      loading={loading}
      title={t('')}
      data={dashboards}
      columns={[]}
      renderCard={(dashboard: Dashboard) => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} />
      )}
    />
  );
}

export default DashboardList;