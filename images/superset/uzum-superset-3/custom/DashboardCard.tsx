// UZUM CUSTOM DashboardCard.tsx
import React from 'react';
import { CardBody } from 'src/components/Card';
import { t } from '@superset-ui/core';
import Thumbnail from 'src/components/Thumbnail';
import { Tooltip } from 'src/components/Tooltip';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  dashboard: {
    id: number;
    dashboard_title: string;
    thumbnail_url?: string;
    url: string;
  };
}

const b64Placeholders = [
  '0J/RgNC40LLQtdGAINC60L7QvNC40YAh',
  '0JfQsNC70LjQvdC+0Log0YfQsNC90Yw=',
  '0KHRgtGA0LDRgdC+0LLQsA==',
  '0JfQsNCy0LvQtdC9INC80L7QsdC+0LvQtdC00Ysg0LfQsA==',
  '0J7RgtC/0YDQsNGI0LXQvQ==',
  '0JzQsNC60YDQtdGC0Yw=',
  '0J/RgNC40LLQtdGA0LrQtdC90LjQtQ==',
  '0JHQsNCy0L7Qu9C4INC60L7QvNC40YAg',
  '0JvQtdGC0LjQvdC10YLRgdGP0LrQvtCz0L4=',
  '0JzQvtC00LXRgNC10L3RiyDQvtGC0L7QutC+0YDQvtCy0Ysg',
];

const getRandomPlaceholder = (): string => {
  try {
    const decoded = b64Placeholders.map(b64 =>
      atob(b64).replace(/[\n\r]+/g, '').trim(),
    );
    return decoded[Math.floor(Math.random() * decoded.length)];
  } catch {
    return t('Превью временно недоступно');
  }
};

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard }) => {
  const title = dashboard?.dashboard_title || t('Без названия');
  const url = dashboard?.url || '#';
  const thumbnailUrl = dashboard?.thumbnail_url;

  return (
    <div className="dashboard-card-container">
      <Link to={url}>
        <div className="dashboard-card">
          <div className="thumbnail-wrapper">
            <Thumbnail
              src={thumbnailUrl || ''}
              alt={thumbnailUrl ? title : t('Превью в обработке')}
              fallbackIcon={<div className="placeholder-text">“{getRandomPlaceholder()}”</div>}
            />
          </div>
          <CardBody>
            <Tooltip title={title}>
              <div className="dashboard-card-title">{title}</div>
            </Tooltip>
          </CardBody>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;
