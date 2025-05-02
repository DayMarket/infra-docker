import Card from 'src/components/Card';
import { t } from '@superset-ui/core';
import { Dropdown } from 'src/components/Dropdown';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import { Dashboard } from 'src/views/CRUD/types';

interface DashboardCardProps {
  dashboard: Dashboard;
  hasPerm: boolean;
  showThumbnails?: boolean;
  isFavorite?: boolean;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  loading: boolean;
}

const DashboardCard = ({
  dashboard,
  hasPerm,
  showThumbnails = false,
  isFavorite = false,
  saveFavoriteStatus,
  loading,
}: DashboardCardProps) => {
  const handleFavoriteToggle = () => {
    saveFavoriteStatus(dashboard.id, !isFavorite);
  };

  const menuOverlay = (
    <div>
      {hasPerm && <div className="dropdown-item">{t('Edit')}</div>}
      <div className="dropdown-item">{t('Export')}</div>
    </div>
  );

  return (
    <Card
      loading={loading}
      title={dashboard.dashboard_title}
      cover={
        showThumbnails && dashboard.thumbnail_url ? (
          <img
            src={dashboard.thumbnail_url}
            alt=""
            style={{ width: '100%', height: 'auto' }}
          />
        ) : null
      }
      actions={[
        <Tooltip title={t('Favorite')} key="favorite">
          <span role="button" tabIndex={0} onClick={handleFavoriteToggle}>
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutlined />}
          </span>
        </Tooltip>,
        hasPerm ? (
          <Dropdown overlay={menuOverlay} trigger={['click']} key="menu" />
        ) : null,
      ]}
    />
  );
};

export default DashboardCard;
