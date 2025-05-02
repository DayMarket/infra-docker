import Card from 'src/components/Card';
import { t } from '@superset-ui/core';
import { Dropdown } from 'src/components/Dropdown';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import { Dashboard } from 'src/views/CRUD/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';

export interface DashboardCardProps {
  dashboard: Dashboard;
  hasPerm: boolean;
  showThumbnails?: boolean;
  isFavorite: boolean;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  loading: boolean;
  userId?: UserWithPermissionsAndRoles['userId'];
}

const DashboardCard = ({
  dashboard,
  hasPerm,
  showThumbnails,
  isFavorite,
  saveFavoriteStatus,
  loading,
}: DashboardCardProps) => {
  const handleFavoriteToggle = () => {
    saveFavoriteStatus(dashboard.id, !isFavorite);
  };

  const menuOverlay = (
    <div className="menu">
      <div>{t('Edit')}</div>
      <div>{t('Delete')}</div>
    </div>
  );

  return (
    <Card
      loading={loading}
      title={dashboard.dashboard_title}
      url={dashboard.url}
      imgURL={showThumbnails ? dashboard.thumbnail_url : undefined}
      actions={[
        <Tooltip title={t('Favorite')} key="favorite">
          <span role="button" tabIndex={0} onClick={handleFavoriteToggle}>
            {isFavorite ? <Icons.StarFilled /> : <Icons.StarOutlined />}
          </span>
        </Tooltip>,
        hasPerm && (
          <Dropdown overlay={menuOverlay} trigger={['click']} key="menu">
            <Icons.MoreVertical />
          </Dropdown>
        ),
      ]}
    />
  );
};

export default DashboardCard;
