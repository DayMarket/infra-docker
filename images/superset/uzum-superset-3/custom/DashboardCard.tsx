// src/views/DashboardList/DashboardCard.tsx

import React from 'react';
import { Card, Tooltip } from 'src/components';
import Icons from 'src/components/Icons';
import FaveStar from 'src/components/FaveStar';
import InfoTooltip from 'src/components/InfoTooltip';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { t } from '@superset-ui/core';
import { CardStyles } from 'src/views/CRUD/utils';

export interface DashboardCardProps {
  dashboard: {
    id: number;
    dashboard_title: string;
    thumbnail_url?: string;
    certified_by?: string | null;
    certification_details?: string | null;
    description?: string | null;
    changed_on_humanized?: string;
    changed_by_name?: string;
    url?: string;
  };
  loading: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard, loading }) => {
  if (loading) {
    return <div className="placeholder" style={{ height: '200px' }} />;
  }

  return (
    <CardStyles>
      <Card
        cover={
          dashboard.thumbnail_url ? (
            <img
              src={dashboard.thumbnail_url}
              style={{ height: 200, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ height: 200, background: '#f0f0f0' }} />
          )
        }
        title={
          <Tooltip title={dashboard.dashboard_title}>
            <a href={dashboard.url}>{dashboard.dashboard_title}</a>
          </Tooltip>
        }
        actions={[
          <FaveStar
            itemId={dashboard.id}
            fetchFaveStar={() => Promise.resolve(false)}
            saveFaveStar={() => Promise.resolve()}
          />,
          <InfoTooltip tooltip={dashboard.description || t('No description')} />,
        ]}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {dashboard.certified_by && (
            <CertifiedBadge
              certifiedBy={dashboard.certified_by}
              details={dashboard.certification_details}
            />
          )}
          <span>
            {t('Last modified')}: {dashboard.changed_on_humanized} {dashboard.changed_by_name && `by ${dashboard.changed_by_name}`}
          </span>
        </div>
      </Card>
    </CardStyles>
  );
};

export default DashboardCard;
