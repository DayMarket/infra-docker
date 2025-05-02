// src/pages/DashboardList/index.tsx

import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { SupersetClient, t } from '@superset-ui/core';
import { ListView } from 'src/components/ListView';
import DashboardCard from 'src/views/DashboardList/DashboardCard';

const DashboardList = () => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboards = async () => {
    try {
      const queryParams = rison.encode({
        columns: [
          'dashboard_title',
          'changed_on_humanized',
          'changed_by_name',
          'thumbnail_url',
          'certified_by',
          'certification_details',
          'description',
          'url',
        ],
        order_column: 'changed_on_delta_humanized',
        order_direction: 'desc',
        page_size: 100,
        page: 0,
      });

      const { json } = await SupersetClient.get({
        endpoint: `/api/v1/dashboard/?q=${queryParams}`,
      });

      setDashboards(json.result);
    } catch (e) {
      console.error('Error fetching dashboards', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="loading">Loading dashboards...</div>
      ) : (
        <div className="dashboard-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {dashboards.map(dashboard => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} loading={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardList;
