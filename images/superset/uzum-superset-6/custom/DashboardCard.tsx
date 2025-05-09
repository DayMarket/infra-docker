import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  isFeatureEnabled,
  SupersetClient,
  t,
  useTheme,
} from '@superset-ui/core';
import { AntdDropdown } from 'src/components';
import { Menu } from 'src/components/Menu';
import { CardStyles } from 'src/views/CRUD/utils';
import ListViewCard from 'src/components/ListViewCard';
import Icons from 'src/components/Icons';
import FacePile from 'src/components/FacePile';
import Label from 'src/components/Label';
import FaveStar from 'src/components/FaveStar';
import { Dashboard } from 'src/views/CRUD/types';

interface DashboardCardProps {
  dashboard: Dashboard;
  hasPerm: (name: string) => boolean;
  bulkSelectEnabled: boolean;
  userId?: string | number;
  showThumbnails?: boolean;
  favoriteStatus: boolean;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  openDashboardEditModal?: (d: Dashboard) => void;
  handleBulkDashboardExport: (dashboardsToExport: Dashboard[]) => void;
  onDelete: (dashboard: Dashboard) => void;
  loading: boolean;
}

export default function DashboardCard({
  dashboard,
  hasPerm,
  bulkSelectEnabled,
  userId,
  showThumbnails,
  favoriteStatus,
  saveFavoriteStatus,
  openDashboardEditModal,
  handleBulkDashboardExport,
  onDelete,
  loading,
}: DashboardCardProps) {
  const history = useHistory();
  const theme = useTheme();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    dashboard.thumbnail_url || null,
  );
  const [fetchingThumbnail, setFetchingThumbnail] = useState(false);

  useEffect(() => {
    if (
      showThumbnails &&
      !thumbnailUrl &&
      !fetchingThumbnail &&
      isFeatureEnabled('THUMBNAILS')
    ) {
      setFetchingThumbnail(true);
      SupersetClient.get({ endpoint: `/api/v1/dashboard/${dashboard.id}` })
        .then(({ json = {} }) => {
          setThumbnailUrl(json.thumbnail_url || null);
        })
        .catch(() => {
          setThumbnailUrl(null);
        })
        .finally(() => setFetchingThumbnail(false));
    }
  }, [showThumbnails, dashboard.id, fetchingThumbnail, thumbnailUrl]);

  const menu = (
    <Menu>
      {hasPerm('can_write') && openDashboardEditModal && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={() => openDashboardEditModal(dashboard)}
          >
            <Icons.EditAlt iconSize="l" /> {t('Edit')}
          </div>
        </Menu.Item>
      )}
      {hasPerm('can_export') && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleBulkDashboardExport([dashboard])}
            className="action-button"
          >
            <Icons.Share iconSize="l" /> {t('Export')}
          </div>
        </Menu.Item>
      )}
      {hasPerm('can_write') && (
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
        title={dashboard.dashboard_title || t('[No title]')}
        description={
          dashboard.changed_on_delta_humanized
            ? t('Modified %s', dashboard.changed_on_delta_humanized)
            : ''
        }
        titleRight={<Label>{dashboard.published ? t('published') : t('draft')}</Label>}
        cover={
          showThumbnails && thumbnailUrl ? (
            <div
              style={{
                width: '100%',
                height: '160px',
                overflow: 'hidden',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <img
                src={thumbnailUrl}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ) : undefined
        }
        url={bulkSelectEnabled ? undefined : dashboard.url}
        linkComponent={Link}
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
