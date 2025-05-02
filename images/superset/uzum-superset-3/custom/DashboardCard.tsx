import React from 'react';
import { Card } from 'src/components/Card';
import { t } from '@superset-ui/core';
import { Dropdown, Menu } from 'src/components/Dropdown';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import { Dashboard } from 'src/views/CRUD/types';

export interface DashboardCardProps {
  dashboard: Dashboard;
  hasPerm: boolean;
  isFavorite: boolean;
  showThumbnails?: boolean;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
}

const DashboardCard = ({
  dashboard,
  hasPerm,
  isFavorite,
  showThumbnails = false,
  saveFavoriteStatus,
}: DashboardCardProps) => {
  const handleFavoriteToggle = () => {
    saveFavoriteStatus(dashboard.id, !isFavorite);
  };

  const menu = (
    <Menu>
      {hasPerm && (
        <Menu.Item key="edit">
          <a href={`/dashboard/edit/${dashboard.id}`}>{t('Edit')}</a>
        </Menu.Item>
      )}
      <Menu.Item key="view">
        <a href={`/superset/dashboard/${dashboard.id}/`}>{t('View')}</a>
      </Menu.Item>
    </Menu>
  );

  const thumbnail = dashboard.thumbnail_url ? (
    <img
      src={dashboard.thumbnail_url}
      className="dashboard-card-thumbnail"
      alt=""
    />
  ) : (
    <div className="dashboard-card-fallback">
      <span>{t('No preview available')}</span>
    </div>
  );

  return (
    <Card
      className="dashboard-card"
      title={dashboard.dashboard_title}
      cover={showThumbnails ? thumbnail : null}
      actions={[
        <Tooltip
          title={isFavorite ? t('Unfavorite') : t('Favorite')}
          key="favorite"
        >
          <span onClick={handleFavoriteToggle}>
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutlined />}
          </span>
        </Tooltip>,
        <Dropdown overlay={menu} trigger={['click']} key="menu">
          <Icons.MoreVertical />
        </Dropdown>,
      ]}
    />
  );
};

export default DashboardCard;
