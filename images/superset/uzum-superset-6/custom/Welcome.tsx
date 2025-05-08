import React, { useEffect, useState } from 'react';
import { t } from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { WelcomeDashboard, WelcomeChart } from './types';
import { EmptyStateBig } from 'src/components/EmptyState';
import { CardGrid } from 'src/components/CardGrid';
import DashboardCard from 'src/custom/DashboardCard';
import ChartCard from 'src/custom/ChartCard';
import { getRecentDashboards, getRecentCharts } from './utils';

export default function Welcome() {
  const user = useSelector<any, UserWithPermissionsAndRoles>(
    state => state.user,
  );
  const [dashboards, setDashboards] = useState<WelcomeDashboard[]>([]);
  const [charts, setCharts] = useState<WelcomeChart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [dashboardsResponse, chartsResponse] = await Promise.all([
          getRecentDashboards(),
          getRecentCharts(),
        ]);
        if (isMounted) {
          setDashboards(dashboardsResponse);
          setCharts(chartsResponse);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <h2>{t('Dashboards')}</h2>
      {dashboards.length === 0 && !loading ? (
        <EmptyStateBig
          title={t('No dashboards yet')}
          description={t('You haven’t viewed any dashboards yet.')}
        />
      ) : (
        <CardGrid
          cards={dashboards.map(dashboard => (
            <DashboardCard
              key={`dashboard-${dashboard.id}`}
              dashboard={dashboard}
              showThumbnails
              userId={user?.userId}
              hasPerm={() => true}
              bulkSelectEnabled={false}
              loading={false}
              saveFavoriteStatus={() => {}}
              favoriteStatus={false}
              handleBulkDashboardExport={() => {}}
              onDelete={() => {}}
            />
          ))}
          showLoading={loading}
        />
      )}

      <h2 style={{ marginTop: '3rem' }}>{t('Charts')}</h2>
      {charts.length === 0 && !loading ? (
        <EmptyStateBig
          title={t('No charts yet')}
          description={t('You haven’t viewed any charts yet.')}
        />
      ) : (
        <CardGrid
          cards={charts.map(chart => (
            <ChartCard
              key={`chart-${chart.id}`}
              chart={chart}
              showThumbnails
              userId={user?.userId}
              hasPerm={() => true}
              bulkSelectEnabled={false}
              favoriteStatus={false}
              saveFavoriteStatus={() => {}}
              handleBulkChartExport={() => {}}
              onDelete={() => {}}
            />
          ))}
          showLoading={loading}
        />
      )}
    </>
  );
}
