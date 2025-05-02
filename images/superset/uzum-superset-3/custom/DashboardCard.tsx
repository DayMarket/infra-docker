import React from 'react';
import { Card, Tooltip } from 'src/components';
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

  const {
    id,
    dashboard_title,
    thumbnail_url,
    certified_by,
    certification_details,
    description,
    changed_on_humanized,
    changed_by_name,
    url,
  } = dashboard;

  return (
    <CardStyles>
      <Card
        hoverable
        cover={
          thumbnail_url ? (
            <img
              src={thumbnail_url}
              style={{ height: 200, objectFit: 'cover', width: '100%' }}
            />
          ) : (
            <div style={{ height: 200, backgroundColor: '#f0f0f0' }} />
          )
        }
        title={
          <Tooltip title={dashboard_title}>
            <a href={url}>{dashboard_title}</a>
          </Tooltip>
        }
        actions={[
          <FaveStar
            itemId={id}
            fetchFaveStar={() => Promise.resolve(false)}
            saveFaveStar={() => Promise.resolve()}
          />,
          <InfoTooltip tooltip={description || t('No description')} />,
        ]}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {certified_by && (
            <CertifiedBadge
              certifiedBy={certified_by}
              details={certification_details}
            />
          )}
          <span style={{ fontSize: '0.85em', color: '#888' }}>
            {t('Last modified')}: {changed_on_humanized}
            {changed_by_name && ` by ${changed_by_name}`}
          </span>
        </div>
      </Card>
    </CardStyles>
  );
};

export default DashboardCard;
