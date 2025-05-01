import React from 'react';
import { t } from '@superset-ui/core';
import { Card } from 'src/components/Card';
import { Tooltip } from 'src/components/Tooltip';
import { Link } from 'react-router-dom';
import FallbackThumbnail from 'src/components/FallbackThumbnail';
import { DashboardCardProps } from './types';
import './styles.css';

const placeholderBase64 = [
  '0J/RgNC40LLQtdGA0LrQsNGPINC+0YDQvtC00LAg0L/RgNC+0LHRgNCw0YDQvtC00YPRgA==',
  '0JHQsNC80L7RgdGC0YDQvtCy0YvQuSDQuCDRgdC+0YDQuNC80LDRgtGM0LrQvtCz0L4u',
  '0J/RgNC10LrQuNC90LjQtSDRgdC10LzQsNGC0Ywg0YPRgNCz0LjQvdC10L3QuNC1',
  '0JfQsNC80LXQvNCw0YDQvtCy0LDQvdC+0LLQsNGPINC40LzQvtC70YzRgdC60LjQuSDRgNC+0YHQvtCy0LXRgi4=',
  '0JzQvtC90LjQuSDQv9C+0LrQsNC60YHRgiDQv9C+0LvQvtC80L7QvdC+0LLQsNC90LjRjy4=',
  '0KHRgtC+0Lwg0YHRgtC10YHRgtGA0L7QstCw0YLRjCDRgNC10LzQtdC90LjQtSDRgtC+0YDQsNC30LDQvNC40Y8=',
  '0JrQsNC30LDQvdC+INC/0L7QsdGA0LDQstC40Y8g0LIg0LfQsNC70L7QvNC+0LzQuCDQvtC/0LjQvdC+0Lkg0YHRgtGA0LDQuy4=',
  '0J/RgNC10LzQtdC90LjQtSDQv9Cw0YDQsNC90L3Ri9C5INCx0LvQuNC+0YLQtdC90LjRjy4=',
  '0J/RgNC+0YHRgtC+0LLQsNGPINC/0YDQuNCx0LXRgiDQvtCx0LvQuNC90LjRj9C10YHRjA==',
  '0KHRgNC+0YHQtdGA0LDRgtGMINC90LXQvNC+0Lkg0L3QsCDQv9GA0L7QtNGLINC00LvRjy4='
];

function decodeBase64(str: string): string {
  try {
    return atob(str);
  } catch {
    return 'Preview unavailable';
  }
}

export const DashboardCard = ({ dashboard }: DashboardCardProps) => {
  const { id, dashboard_title, url, thumbnail_url } = dashboard || {};
  const title = dashboard_title || t('Untitled');

  return (
    <div className="dashboard-card">
      <Card className="dashboard-card-inner" hoverable>
        <Link to={url || `/dashboard/${id}/`}>
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt=""
              className="dashboard-card-thumb"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          ) : (
            <FallbackThumbnail
              text={decodeBase64(
                placeholderBase64[Math.floor(Math.random() * placeholderBase64.length)]
              )}
            />
          )}
        </Link>
        <Tooltip title={title}>
          <div className="dashboard-card-title">{title}</div>
        </Tooltip>
      </Card>
    </div>
  );
};

export default DashboardCard;
