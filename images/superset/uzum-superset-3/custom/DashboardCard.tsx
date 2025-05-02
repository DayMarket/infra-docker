// UZUM CUSTOM - DashboardCard component with thumbnail support
import React from 'react';
import { Card } from 'antd';

interface Dashboard {
  id: number;
  dashboard_title: string;
  thumbnail_url?: string;
}

export default function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card
      hoverable
      title={dashboard.dashboard_title}
      cover={
        dashboard.thumbnail_url ? (
          <img
            alt="thumbnail"
            src={dashboard.thumbnail_url}
            style={{ height: 160, objectFit: 'cover' }}
          />
        ) : null
      }
    >
      <p style={{ fontSize: 12, color: '#999' }}>UZUM CUSTOM</p>
    </Card>
  );
}