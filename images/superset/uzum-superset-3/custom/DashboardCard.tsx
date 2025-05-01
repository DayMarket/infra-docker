// superset-frontend/src/pages/DashboardList/DashboardCard.tsx

import React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import { t } from '@superset-ui/core';
import { AntdTooltip } from 'src/components/Tooltip';

const encodedPlaceholders = [
  "0J/RgNC+0YHQv9C10LrRgiDQutCw0LnQtNC10YDQvdGL",
  "0KHRgtGA0LDQstCwINGC0LXQvNC+0L3QtdGB0YI=",
  "0KDQtdGB0L/RgNC+0L3QuNC1INGC0LDRgNC+0YHRgtC+",
  "0J/QtdGA0LXQutCw0Y8g0YfQuNGB0YLRgNC+0Lkg0YHQv9C10LrRgiA=",
  "0JfQsNC/0L7Qu9GM0L3QvtC80YMg0LzQvtC80L7Qu9GP",
  "0J7QvNC+0LPRgNCw0LrQvtCz0L4g0LjQv9C+0YDQvtC60LA=",
];

function getRandomPlaceholder(): string {
  const decoded = encodedPlaceholders.map(p => atob(p));
  return decoded[Math.floor(Math.random() * decoded.length)];
}

interface DashboardCardProps {
  dashboard: {
    id: number;
    dashboard_title: string;
    changed_by_name: string;
    changed_on_utc: string;
    thumbnail_url: string | null;
    url: string;
  };
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard }) => {
  const {
    id,
    dashboard_title,
    changed_by_name,
    changed_on_utc,
    thumbnail_url,
    url,
  } = dashboard;

  const isImageAvailable = !!thumbnail_url;

  return (
    <Card
      hoverable
      style={{ width: 300, marginBottom: 16 }}
      cover={
        isImageAvailable ? (
          <img
            alt="Превью может быть недоступно"
            src={thumbnail_url!}
            style={{ height: 180, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
              textAlign: 'center',
              fontStyle: 'italic',
              background: '#f5f5f5',
              border: '1px dashed #d9d9d9',
              color: '#999',
            }}
          >
            “{getRandomPlaceholder()}”
          </div>
        )
      }
    >
      <Card.Meta
        title={
          <Link to={url}>
            <AntdTooltip title={dashboard_title}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {dashboard_title}
              </span>
            </AntdTooltip>
          </Link>
        }
        description={t('Updated by %s', changed_by_name)}
      />
    </Card>
  );
};

export default DashboardCard;
