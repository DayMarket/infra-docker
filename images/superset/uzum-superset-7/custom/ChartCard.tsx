import React, { useEffect, useState } from 'react';
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
import { Chart } from 'src/views/CRUD/types';

interface ChartCardProps {
  chart: Chart;
  hasPerm: (name: string) => boolean;
  bulkSelectEnabled: boolean;
  userId?: string | number;
  showThumbnails?: boolean;
  favoriteStatus: boolean;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  openChartEditModal?: (c: Chart) => void;
  handleBulkChartExport: (chartsToExport: Chart[]) => void;
  onDelete: (chart: Chart) => void;
}

export default function ChartCard({
  chart,
  hasPerm,
  bulkSelectEnabled,
  userId,
  showThumbnails,
  favoriteStatus,
  saveFavoriteStatus,
  openChartEditModal,
  handleBulkChartExport,
  onDelete,
}: ChartCardProps) {
  const history = useHistory();
  const theme = useTheme();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    chart.thumbnail_url || null,
  );
  const [fetchingThumbnail, setFetchingThumbnail] = useState(false);

  useEffect(() => {
    if (
      !showThumbnails ||
      fetchingThumbnail ||
      thumbnailUrl ||
      !isFeatureEnabled('THUMBNAILS')
    ) {
      return;
    }
    setFetchingThumbnail(true);
    SupersetClient.get({ endpoint: `/api/v1/chart/${chart.id}` })
      .then(({ json = {} }) => {
        setThumbnailUrl(json.thumbnail_url || null);
      })
      .catch(() => {
        setThumbnailUrl(null);
      })
      .finally(() => setFetchingThumbnail(false));
  }, [showThumbnails, chart.id, fetchingThumbnail, thumbnailUrl]);

  const menu = (
    <Menu>
      {hasPerm('can_write') && openChartEditModal && (
        <Menu.Item>
          <div
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={() => openChartEditModal(chart)}
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
            onClick={() => handleBulkChartExport([chart])}
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
            onClick={() => onDelete(chart)}
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
          history.push(chart.url);
        }
      }}
    >
      <ListViewCard
        title={chart.slice_name}
        description={t('Modified %s', chart.changed_on_delta_humanized)}
        titleRight={<Label>{chart.published ? t('published') : t('draft')}</Label>}
        cover={
          showThumbnails && (
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
                src={thumbnailUrl ?? '/static/assets/images/chart-card-fallback.svg'}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )
        }
        url={bulkSelectEnabled ? undefined : chart.url}
        linkComponent={Link}
        coverLeft={<FacePile users={chart.owners || []} />}
        actions={
          <ListViewCard.Actions
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {userId && (
              <FaveStar
                itemId={chart.id}
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
