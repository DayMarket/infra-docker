import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  isFeatureEnabled,
  FeatureFlag,
  t,
  SupersetClient,
} from '@superset-ui/core';
import { CardStyles } from 'src/views/CRUD/utils';
import { Dropdown } from 'src/components/Dropdown';
import { Menu } from 'src/components/Menu';
import ListViewCard from 'src/components/ListViewCard';
import Icons from 'src/components/Icons';
import PublishedLabel from 'src/components/Label';
import FacePile from 'src/components/FacePile';
import FaveStar from 'src/components/FaveStar';
import { Dashboard } from 'src/views/CRUD/types';
import { Button } from 'src/components';
import { assetUrl } from 'src/utils/assetUrl';

interface DashboardCardProps {
  isChart?: boolean;
  dashboard: Dashboard;
  hasPerm: (name: string) => boolean;
  bulkSelectEnabled: boolean;
  loading: boolean;
  openDashboardEditModal?: (d: Dashboard) => void;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  favoriteStatus: boolean;
  userId?: string | number;
  showThumbnails?: boolean;
  handleBulkDashboardExport: (dashboardsToExport: Dashboard[]) => void;
  onDelete: (dashboard: Dashboard) => void;
}

function DashboardCard({
  dashboard,
  hasPerm,
  bulkSelectEnabled,
  userId,
  openDashboardEditModal,
  favoriteStatus,
  saveFavoriteStatus,
  showThumbnails,
  handleBulkDashboardExport,
  onDelete,
}: DashboardCardProps) {
  const history = useHistory();
  const canEdit = hasPerm('can_write');
  const canDelete = hasPerm('can_write');
  const canExport = hasPerm('can_export');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fetchingThumbnail, setFetchingThumbnail] = useState<boolean>(false);

  useEffect(() => {
    if (
      !fetchingThumbnail &&
      dashboard.id &&
      (thumbnailUrl === undefined || thumbnailUrl === null) &&
      isFeatureEnabled(FeatureFlag.Thumbnails)
    ) {
      if (dashboard.thumbnail_url) {
        setThumbnailUrl(dashboard.thumbnail_url || '');
        return;
      }
      setFetchingThumbnail(true);
      SupersetClient.get({
        endpoint: `/api/v1/dashboard/${dashboard.id}`,
      }).then(({ json = {} }) => {
        setThumbnailUrl(json.result?.thumbnail_url || '');
        setFetchingThumbnail(false);
      });
    }
  }, [dashboard, thumbnailUrl]);

  const menu = (
    <Menu>
      {canEdit && openDashboardEditModal && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={() => openDashboardEditModal?.(dashboard)}
            data-test="dashboard-card-option-edit-button"
          >
            <Icons.EditOutlined iconSize="l" data-test="edit-alt" /> {t('Edit')}
          </div>
        </Menu.Item>
      )}
      {canExport && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleBulkDashboardExport([dashboard])}
            className="action-button"
            data-test="dashboard-card-option-export-button"
          >
            <Icons.UploadOutlined iconSize="l" /> {t('Export')}
          </div>
        </Menu.Item>
      )}
      {canDelete && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={() => onDelete(dashboard)}
            data-test="dashboard-card-option-delete-button"
          >
            <Icons.DeleteOutlined iconSize="l" /> {t('Delete')}
          </div>
        </Menu.Item>
      )}
    </Menu>
  );

  const fallback = assetUrl(
    '/static/assets/images/dashboard-card-fallback.svg',
  );

  return (
    <CardStyles
      onClick={() => {
        if (!bulkSelectEnabled) {
          history.push(dashboard.url);
        }
      }}
    >
      <ListViewCard
        loading={dashboard.loading || false}
        title={dashboard.dashboard_title}
        certifiedBy={dashboard.certified_by}
        certificationDetails={dashboard.certification_details}
        titleRight={<PublishedLabel isPublished={dashboard.published} />}
        cover={
          isFeatureEnabled(FeatureFlag.Thumbnails) && showThumbnails ? (
            <img
              src={thumbnailUrl || fallback}
              alt={t('Dashboard thumbnail')}
              style={{ width: '100%', height: 'auto' }}
            />
          ) : null
        }
        url={bulkSelectEnabled ? undefined : dashboard.url}
        linkComponent={Link}
        description={t('Modified %s', dashboard.changed_on_delta_humanized)}
        coverLeft={<FacePile users={dashboard.owners || []} />}
        actions={
          <ListViewCard.Actions
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {userId && (
              <FaveStar
                itemId={dashboard.id}
                saveFaveStar={saveFavoriteStatus}
                isStarred={favoriteStatus}
              />
            )}
            <Dropdown dropdownRender={() => menu} trigger={['hover', 'click']}>
              <Button buttonSize="xsmall" type="link">
                <Icons.MoreOutlined iconSize="xl" />
              </Button>
            </Dropdown>
          </ListViewCard.Actions>
        }
      />
    </CardStyles>
  );
}

export default DashboardCard;
