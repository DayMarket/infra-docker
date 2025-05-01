// src/pages/DashboardList/DashboardCard.tsx
import React from 'react';
import { t } from '@superset-ui/core';
import moment from 'moment';
import Card from 'src/components/Card';
import { Link } from 'react-router-dom';
import { Tooltip } from 'src/components/Tooltip';
import Icons from 'src/components/Icons';
import { isDefined } from 'src/utils/common';

const PLACEHOLDER_QUOTES = [
  '0J/RgNC40LLQtdGCLCDQv9C+0LrQvtCz0L4g0YLRgNC+0YHRgtGA0L7QstCwLg==',
  '0JHQvtC70YzRidC10L3QvdC+INCy0YvQuSDRg9GC0LDRgNC10L3QuNC5Lg==',
  '0KLQtdC00Ywg0LvQvtC70YzRidC10L3QuNGH0LXRgdGC0Yw=',
  '0JrQsNGA0LDRgtC+0LLQutCwINC/0YDQsNC50YLQuNC90LjRjw==',
  '0J/RgNC+0YHRgtGA0L7QstCwINC/0YDQvtCz0YDQsNC30LjRh9C10L3QuNC5',
  '0KHQvtC+0LvQsNC90LjQtSDQv9C10YDQvtC00LDQu9C40Y8=',
  '0JrQvtC70YzRidC10L3QvdGL0Lkg0Y/Rh9C10YHRgtCy0L7Qu9C10L0u',
  '0J3QsNGI0LjQvdC40Y8g0YLQtdGA0LzQtdGC0LU=',
  '0KLRgNC+0L3QuNC1INGB0LjRgdCw0LvQuNGC0Ywg0YTQsNC50YHRjCDRgdCw0LzQtdC90YvQuQ==',
  '0KHQtdGA0LXQvdC+0YfQvdGL0Lkg0YLQtdGF0L3QuNC60Lgg0LrQsNC70YzRidC10L0=',
].map(str => atob(str));

type DashboardCardProps = {
  dashboard: {
    id: number;
    dashboard_title: string;
    changed_on_utc: string;
    url: string;
    thumbnail_url?: string | null;
  };
};

export default function DashboardCard({ dashboard }: DashboardCardProps) {
  const randomPlaceholder =
    PLACEHOLDER_QUOTES[Math.floor(Math.random() * PLACEHOLDER_QUOTES.length)];

  return (
    <Card className="dashboard-card" hoverable>
      <Link to={dashboard.url}>
        {dashboard.thumbnail_url ? (
          <img
            src={dashboard.thumbnail_url}
            alt="Превью в процессе создания"
            style={{
              width: '100%',
              height: 150,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #e2e2e2',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: 150,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fafafa',
              color: '#999',
              borderRadius: 4,
              border: '1px dashed #ccc',
              fontSize: 12,
              padding: 10,
              textAlign: 'center',
            }}
          >
            “{randomPlaceholder}”
          </div>
        )}
        <div style={{ marginTop: 12, fontWeight: 600 }}>
          {dashboard.dashboard_title}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          {t('Last modified: %s', moment(dashboard.changed_on_utc).fromNow())}
        </div>
      </Link>
    </Card>
  );
}
