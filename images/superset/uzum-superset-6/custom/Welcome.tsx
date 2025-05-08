import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { t, SupersetClient } from '@superset-ui/core';
import { Dashboard, Chart, SavedQueryObject } from 'src/types';
import ListViewCard from 'src/components/ListViewCard';
import { createErrorHandler } from 'src/views/CRUD/utils';
import { WelcomeContainer, CardContainer, CardStyles } from './styles';

const PAGE_SIZE = 5;

export default function Welcome() {
  const [recentDashboards, setRecentDashboards] = useState<Dashboard[]>([]);
  const [userDashboards, setUserDashboards] = useState<Dashboard[]>([]);
  const [userCharts, setUserCharts] = useState<Chart[]>([]);
  const [userQueries, setUserQueries] = useState<SavedQueryObject[]>([]);

  const fetchData = () => {
    SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${rison.encode({
        page_size: PAGE_SIZE,
        order_column: 'changed_on', // ⬅ заменено для ускорения
        order_direction: 'desc',
      })}`,
    })
      .then(({ json }) => {
        setRecentDashboards(json.result);
      })
      .catch(createErrorHandler(t('There was an error fetching recent dashboards')));

    SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${rison.encode({
        page_size: PAGE_SIZE,
        order_column: 'changed_on',
        order_direction: 'desc',
        filters: [{ col: 'owners', opr: 'rel_m_m', value: 'self' }],
      })}`,
    })
      .then(({ json }) => {
        setUserDashboards(json.result);
      })
      .catch(createErrorHandler(t('There was an error fetching your dashboards')));

    SupersetClient.get({
      endpoint: `/api/v1/chart/?q=${rison.encode({
        page_size: PAGE_SIZE,
        order_column: 'changed_on',
        order_direction: 'desc',
        filters: [{ col: 'owners', opr: 'rel_m_m', value: 'self' }],
      })}`,
    })
      .then(({ json }) => {
        setUserCharts(json.result);
      })
      .catch(createErrorHandler(t('There was an error fetching your charts')));

    SupersetClient.get({
      endpoint: `/api/v1/saved_query/?q=${rison.encode({
        page_size: PAGE_SIZE,
        order_column: 'changed_on',
        order_direction: 'desc',
        filters: [{ col: 'created_by', opr: 'rel_o_m', value: 'self' }],
      })}`,
    })
      .then(({ json }) => {
        setUserQueries(json.result);
      })
      .catch(createErrorHandler(t('There was an error fetching your saved queries')));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <WelcomeContainer>
      <h2>{t('Recently modified dashboards')}</h2>
      <CardContainer>
        {recentDashboards.map(dash => (
          <ListViewCard
            key={`recent-dash-${dash.id}`}
            title={dash.dashboard_title}
            url={`/superset/dashboard/${dash.id}/`}
            imgURL={dash.thumbnail_url || undefined}
            description={dash.description}
          />
        ))}
      </CardContainer>

      <h2>{t('Your dashboards')}</h2>
      <CardContainer>
        {userDashboards.map(dash => (
          <ListViewCard
            key={`user-dash-${dash.id}`}
            title={dash.dashboard_title}
            url={`/superset/dashboard/${dash.id}/`}
            imgURL={dash.thumbnail_url || undefined}
            description={dash.description}
          />
        ))}
      </CardContainer>

      <h2>{t('Your charts')}</h2>
      <CardContainer>
        {userCharts.map(chart => (
          <ListViewCard
            key={`user-chart-${chart.id}`}
            title={chart.slice_name}
            url={`/explore/?slice_id=${chart.id}`}
            imgURL={chart.thumbnail_url || undefined}
            description={chart.description}
          />
        ))}
      </CardContainer>

      <h2>{t('Your saved queries')}</h2>
      <CardContainer>
        {userQueries.map(query => (
          <ListViewCard
            key={`user-query-${query.id}`}
            title={query.label}
            url={`/sql_lab/?savedQueryId=${query.id}`}
            description={query.sql}
          />
        ))}
      </CardContainer>
    </WelcomeContainer>
  );
}
