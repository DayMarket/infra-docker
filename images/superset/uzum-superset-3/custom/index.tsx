// src/pages/DashboardList/index.tsx
import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { SupersetClient, t } from '@superset-ui/core';
import { ListView } from 'src/components/ListView';
import { Tooltip } from 'src/components/Tooltip';
import Icons from 'src/components/Icons';
import DashboardCard from './DashboardCard';

interface Dashboard {
  id: number;
  dashboard_title: string;
  changed_on_utc: string;
  url: string;
  thumbnail_url?: string | null;
}

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const queryParams = rison.encode_uri({
          columns: ['dashboard_title', 'changed_on_utc', 'url', 'thumbnail_url'],
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
          page: 0,
          page_size: 100,
        });

        const response = await SupersetClient.get({
          endpoint: `/api/v1/dashboard/?q=${queryParams}`,
        });

        setDashboards(response.json.result);
      } catch (error) {
        console.error('Failed to load dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>{t('Your Dashboards')}</h2>
      {loading ? (
        <div>{t('Loading dashboards...')}</div>
      ) : dashboards.length === 0 ? (
        <div>{t('No dashboards available')}</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
            marginTop: 16,
          }}
        >
          {dashboards.map(dashboard => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} />
          ))}
        </div>
      )}
    </div>
  );
}
