// UZUM CUSTOM - DashboardCard without jokes or fallbacks

import React from 'react';
import { Card, CardBody } from 'src/components/Card';
import { FallbackComponentProps } from 'src/components/FallbackComponent';
import { t } from '@superset-ui/core';
import { Dashboard } from 'src/views/DashboardList/types';
import InfoTooltip from 'src/components/InfoTooltip';
import Icons from 'src/components/Icons';
import { getDashboardUrl } from 'src/views/DashboardList/utils';
import { Tooltip } from 'src/components/Tooltip';
import Actions from './Actions';

interface DashboardCardProps {
  dashboard: Dashboard;
  loading?: boolean;
}

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
      <CardBody>
        <div className="dashboard-title">
          <a href={getDashboardUrl(id)} className="title-link">
            {dashboard_title}
          </a>
        </div>
        <div className="dashboard-actions">
          <Actions dashboard={dashboard} />
        </div>
      </CardBody>
    </Card>
  );
};

export default DashboardCard;
