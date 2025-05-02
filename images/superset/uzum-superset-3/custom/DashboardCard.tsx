import { t } from '@superset-ui/core';
import Card from 'src/components/Card';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import { Dropdown } from 'src/components/Dropdown';
import { Menu } from 'src/components/Menu';
import { Dashboard } from 'src/views/CRUD/types';

export interface DashboardCardProps {
  dashboard: Dashboard;
  hasPerm: boolean;
  showThumbnails?: boolean;
  isFavorite?: boolean;
  loading: boolean;
  saveFavoriteStatus?: (id: number, isStarred: boolean) => void;
}

const DashboardCard = ({
  dashboard,
  hasPerm,
  showThumbnails,
  isFavorite,
  loading,
  saveFavoriteStatus,
}: DashboardCardProps) => {
  const handleFavoriteToggle = () => {
    if (saveFavoriteStatus) {
      saveFavoriteStatus(dashboard.id, !isFavorite);
    }
  };

  const menuOverlay = (
    <Menu>
      <Menu.Item key="edit">
        <a href={`/dashboard/edit/${dashboard.id}`}>{t('Edit')}</a>
      </Menu.Item>
      <Menu.Item key="explore">
        <a href={`/superset/dashboard/${dashboard.id}/?standalone=true`} target="_blank" rel="noreferrer">
          {t('Open')}
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      loading={loading}
      title={dashboard.dashboard_title}
      imgURL={showThumbnails ? dashboard.thumbnail_url : undefined}
      actions={[
        <Tooltip title={t('Favorite')} key="favorite">
          <span role="button" tabIndex={0} onClick={handleFavoriteToggle} onKeyPress={handleFavoriteToggle}>
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutlined />}
          </span>
        </Tooltip>,
        hasPerm && (
          <Dropdown overlay={menuOverlay} trigger={['click']} key="menu">
            <Icons.MoreVertical />
          </Dropdown>
        ),
      ].filter(Boolean)}
    />
  );
};

export default DashboardCard;
