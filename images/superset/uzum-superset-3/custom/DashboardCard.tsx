// src/pages/DashboardList/DashboardCard.tsx

import React from 'react';
import { t } from '@superset-ui/core';
import { Card } from 'src/components/Card';
import ListViewCard from 'src/components/ListViewCard';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import { Dashboard } from 'src/types/Dashboard';

export interface DashboardCardProps {
  dashboard: Dashboard;
}// File: src/pages/DashboardList/DashboardCard.tsx

import React from 'react';
import { Card } from 'antd';
import { useHistory } from 'react-router-dom';

interface Dashboard {
  id: number;
  dashboard_title: string;
  thumbnail_url?: string;
}

interface Props {
  dashboard: Dashboard;
}

function DashboardCard({ dashboard }: Props) {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/dashboard/${dashboard.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      cover={
        dashboard.thumbnail_url ? (
          <img
            src={dashboard.thumbnail_url}
            alt=""
            style={{ height: 200, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              height: 200,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#888',
            }}
          >
            Превью процессится
          </div>
        )
      }
    >
      <Card.Meta
        title={dashboard.dashboard_title || 'Без названия'}
        description={`ID: ${dashboard.id}`}
      />
    </Card>
  );
}

export default DashboardCard;

export default function DashboardCard({ dashboard }: DashboardCardProps) {
  const {
    id,
    dashboard_title: title,
    thumbnail_url: thumbnailUrl,
    url,
    changed_by_name,
    changed_by_url,
    changed_by_initials,
    changed_on_delta_humanized: changedOn,
  } = dashboard;

  const titleLink = url || `/dashboard/${id}/`;

  return (
    <ListViewCard
      url={titleLink}
      title={title || t('Untitled')}
      description=""
      cover={
        <img
          src={thumbnailUrl || ''}
          alt=""
          style={{
            width: '100%',
            height: 100,
            objectFit: 'cover',
            borderRadius: '4px 4px 0 0',
            backgroundColor: '#f0f0f0',
          }}
          onError={e => {
            (e.target as HTMLImageElement).src = '';
          }}
        />
      }
      actions={
        <Tooltip title={t('More options')}>
          <Icons.MoreVert />
        </Tooltip>
      }
      updatedOn={changedOn}
      updatedBy={changed_by_name}
      updatedByUrl={changed_by_url}
      updatedByInitials={changed_by_initials}
    />
  );
}
