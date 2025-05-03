import React, { useMemo } from 'react';
import { styled, t } from '@superset-ui/core';
import { Card, CardActions, CardCover } from 'src/components/Card';
import { Tooltip } from 'src/components/Tooltip';
import Icons from 'src/components/Icons';
import { Dropdown } from 'src/components/Dropdown';
import { Menu } from 'src/components/Menu';
import { MenuItem } from 'src/components/MenuItem';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { Owner } from 'src/types';
import { useFavoriteStatus } from 'src/views/CRUD/hooks';
import { useUser } from 'src/features/auth';
import { TooltipWrapper } from 'src/components/Tooltip';
import { ImportResourceButton } from 'src/views/CRUD/alerts/ImportModal';
import { isUserAdmin } from 'src/views/CRUD/utils';
import PublishedLabel from 'src/components/PublishedLabel';

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.gridUnit}px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const StyledFaveStar = styled(FaveStar)`
  svg {
    margin-right: 0;
  }
`;

const Metadata = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const OwnersLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export type DashboardCardProps = {
  loading?: boolean;
  showThumbnails?: boolean;
  userKey: string;
  card: {
    id: number;
    title: string;
    url: string;
    modified?: string;
    certified?: boolean;
    certifiedBy?: string;
    certificationDetails?: string;
    published?: boolean;
    owners: Owner[];
    created_by: Owner;
    thumbnail_url?: string;
  };
  actions?: React.ReactNode[];
  editUrl?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canShare?: boolean;
  showActions?: boolean;
};

export default function DashboardCard({
  loading = false,
  showThumbnails = false,
  userKey,
  card,
  actions = [],
  editUrl,
  canEdit = false,
  canDelete = false,
  canExport = false,
  canShare = false,
  showActions = true,
}: DashboardCardProps) {
  const { user } = useUser();
  const [isFavorited, toggleFavoriteStatus] = useFavoriteStatus(
    'dashboard',
    card.id,
    card?.created_by?.id,
  );

  const canImport = useMemo(() => isUserAdmin(user), [user]);

  const menuItems = useMemo(() => {
    const items: JSX.Element[] = [];

    if (canShare) {
      items.push(
        <MenuItem key="share">
          <Icons.Share iconSize="m" /> {t('Share')}
        </MenuItem>,
      );
    }

    if (canExport) {
      items.push(
        <MenuItem key="export">
          <Icons.Export iconSize="m" /> {t('Export')}
        </MenuItem>,
      );
    }

    if (canEdit) {
      items.push(
        <MenuItem key="duplicate">
          <Icons.Copy iconSize="m" /> {t('Duplicate')}
        </MenuItem>,
      );
    }

    if (canDelete) {
      items.push(
        <MenuItem key="delete">
          <Icons.Trash iconSize="m" /> {t('Delete')}
        </MenuItem>,
      );
    }

    return items;
  }, [canShare, canExport, canEdit, canDelete]);

  return (
    <Card
      loading={loading}
      title={
        <TitleRow>
          <Title>
            {card.certified && (
              <CertifiedBadge
                certifiedBy={card.certifiedBy}
                certificationDetails={card.certificationDetails}
              />
            )}
            <a href={card.url}>{card.title}</a>
          </Title>
          <StyledFaveStar
            itemId={card.id}
            saveFaveStar={toggleFavoriteStatus}
            isStarred={isFavorited}
          />
        </TitleRow>
      }
      url={card.url}
      cover={
        showThumbnails && card.thumbnail_url ? (
          <CardCover>
            <img
              src={card.thumbnail_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </CardCover>
        ) : undefined
      }
      actions={
        showActions ? (
          <CardActions>
            <Dropdown
              overlay={<Menu>{menuItems}</Menu>}
              trigger={['click']}
              placement="bottomRight"
            >
              <Icons.MoreHoriz iconSize="l" />
            </Dropdown>
            {canImport && (
              <ImportResourceButton resourceName="dashboard" record={card} />
            )}
          </CardActions>
        ) : undefined
      }
    >
      <Metadata>
        <div>
          {card.owners?.length > 0 && (
            <TooltipWrapper label={t('Owners')} tooltip={card.owners.map(o => o.username).join(', ')}>
              <OwnersLabel>
                {card.owners.slice(0, 1).map(owner => owner.username).join(', ')}
                {card.owners.length > 1 && '…'}
              </OwnersLabel>
            </TooltipWrapper>
          )}
        </div>
        <div>
          <PublishedLabel published={card.published} />
        </div>
      </Metadata>
    </Card>
  );
}
