// UZUM CUSTOM - stable version for Superset 4.1.2

import React from 'react';
import Card from 'src/components/Card/Card';
import { Dashboard } from 'src/views/DashboardList/types';

interface DashboardCardProps {
  dashboard: Dashboard;
}

const getDashboardUrl = (id: number | string) => `/dashboard/${id}/`;

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard }) => {
  const { id, dashboard_title, thumbnail_url } = dashboard;

  return (
    <Card hoverable className="dashboard-card">
      <a href={getDashboardUrl(id)}>
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '160px',
              backgroundColor: '#f0f0f0',
            }}
          />
        )}
      </a>
      <div className="dashboard-card-body">
        <div className="dashboard-title">
          <a href={getDashboardUrl(id)} className="title-link">
            {dashboard_title}
          </a>
        </div>
      </div>
    </Card>
  );
};

export default DashboardCard;
