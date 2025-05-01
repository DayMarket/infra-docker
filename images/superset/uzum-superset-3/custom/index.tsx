// src/pages/DashboardList/index.tsx

import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { t } from '@superset-ui/core';
import { SupersetClient } from '@superset-ui/core';
import { ListView } from 'src/components/ListView';
import { Tooltip } from 'src/components/Tooltip';
import Icons from 'src/components/Icons';
import DashboardCard from './DashboardCard';

interface Dashboard {
  id: number;
  dashboard_title: string;
  changed_on_utc: string;
  thumbnail_url?: string | null;
}

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = rison.encode_uri({ order_column: 'changed_on_delta_humanized', order_direction: 'desc' });
        const { json } = await SupersetClient.get({
          endpoint: `/api/v1/dashboard/?q=${queryParams}`,
        });
        setDashboards(json.result || []);
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
        setDashboards([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderCard = (dashboard: Dashboard) => {
    if (!dashboard || !dashboard.id || !dashboard.dashboard_title) return null;
    return <DashboardCard dashboard={dashboard} key={dashboard.id} />;
  };

  return (
    <div className="dashboard-list-container" style={{ padding: '16px' }}>
      <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {!loading && dashboards.length > 0 ? (
          dashboards.map(renderCard)
        ) : !loading && dashboards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', fontSize: '16px' }}>
            {t('No dashboards available')}
          </div>
        ) : null}
      </div>
    </div>
  );
}
