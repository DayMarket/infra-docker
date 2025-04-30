import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  isFeatureEnabled,
  FeatureFlag,
  t,
  useTheme,
  SupersetClient,
} from '@superset-ui/core';
import { CardStyles } from 'src/views/CRUD/utils';
import { AntdDropdown } from 'src/components';
import { Menu } from 'src/components/Menu';
import ListViewCard from 'src/components/ListViewCard';
import Icons from 'src/components/Icons';
import Label from 'src/components/Label';
import FacePile from 'src/components/FacePile';
import FaveStar from 'src/components/FaveStar';
import { Dashboard } from 'src/views/CRUD/types';

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

  const theme = useTheme();

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
        setThumbnailUrl(json.thumbnail_url || '');
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
          >
            <Icons.EditAlt iconSize="l" /> {t('Edit')}
          </div>
        </Menu.Item>
      )}
      {canExport && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={() => handleBulkDashboardExport([dashboard])}
          >
            <Icons.Share iconSize="l" /> {t('Export')}
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
          >
            <Icons.Trash iconSize="l" /> {t('Delete')}
          </div>
        </Menu.Item>
      )}
    </Menu>
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
        titleRight={
          <Label>{dashboard.published ? t('published') : t('draft')}</Label>
        }
        cover={
          isFeatureEnabled(FeatureFlag.Thumbnails) && showThumbnails ? (
            <img
              src={thumbnailUrl || ''}
              alt="Dashboard thumbnail"
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
              }}
              onError={e => {
                console.warn('Error loading dashboard preview:', e);
              }}
            />
          ) : undefined
        }
        url={bulkSelectEnabled ? undefined : dashboard.url}
        linkComponent={Link}
        imgURL={undefined}
        imgFallbackURL="/static/assets/images/dashboard-card-fallback.svg"
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
            <AntdDropdown overlay={menu}>
              <Icons.MoreVert iconColor={theme.colors.grayscale.base} />
            </AntdDropdown>
          </ListViewCard.Actions>
        }
      />
    </CardStyles>
  );
}

export default DashboardCard;
