// UZUM CUSTOM - Dashboard List Page with Thumbnail Cards
import React, { useEffect, useState } from 'react';
import { t, SupersetClient } from '@superset-ui/core';
import { Card, Empty, Row, Col, Spin } from 'antd';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';

const PAGE_SIZE = 20;

interface Dashboard {
  id: number;
  dashboard_title: string;
  thumbnail_url: string;
  url: string;
}

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${encodeURIComponent(
        JSON.stringify({
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
          page: 0,
          page_size: PAGE_SIZE,
        }),
      )}`,
    })
      .then(({ json }) => {
        setDashboards(json.result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboards:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spin tip="Loading dashboards..." />;
  }

  if (!dashboards.length) {
    return <Empty description={t('No dashboards found')} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>UZUM CUSTOM: Dashboards</h2>
      <Row gutter={[16, 16]}>
        {dashboards.map(dashboard => (
          <Col key={dashboard.id} xs={24} sm={12} md={8} lg={6} xl={6}>
            <Link to={dashboard.url}>
              <DashboardCard dashboard={dashboard} />
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
