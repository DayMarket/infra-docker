import { t, styled, SupersetTheme } from '@superset-ui/core';
import React from 'react';
import Icons from 'src/components/Icons';
import CertifiedBadge from 'src/components/CertifiedBadge';
import { CardContainer } from 'src/views/CRUD/utils';
import FaveStar from 'src/components/FaveStar';
import Owners from 'src/components/Owners';
import Tags from 'src/views/CRUD/data/components/Tags';
import InfoTooltip from 'src/components/InfoTooltip';
import DashboardThumbnail from './DashboardThumbnail';

export interface DashboardCardProps {
  dashboard: any;
  openDashboardEditModal: (dashboard: any) => void;
  showThumbnails?: boolean; // Мы игнорируем его, но не убираем полностью
}

const TitleLink = styled.a`
  ${({ theme }: { theme: SupersetTheme }) => `
    font-size: ${theme.typography.sizes.l}px;
    font-weight: ${theme.typography.weights.bold};
    color: ${theme.colors.grayscale.dark1};

    &:hover {
      color: ${theme.colors.primary.base};
    }
  `}
`;

export default function DashboardCard({
  dashboard,
  openDashboardEditModal,
}: DashboardCardProps) {
  const {
    id,
    url,
    dashboard_title,
    thumbnail_url,
    certified_by,
    certification_details,
    changed_by_name,
    changed_by_url,
    changed_by,
    changed_on_humanized,
    owners,
    tags,
  } = dashboard;

  console.log('🧩 DashboardCard -> thumbnail_url:', thumbnail_url);

  return (
    <CardContainer>
      {thumbnail_url && (
        <a href={url}>
          <DashboardThumbnail url={thumbnail_url} alt={dashboard_title} />
        </a>
      )}
      <div className="card-body">
        <div className="card-header">
          <TitleLink href={url} className="card-title">
            {dashboard_title}{' '}
            {certified_by && (
              <CertifiedBadge
                certifiedBy={certified_by}
                details={certification_details}
              />
            )}
          </TitleLink>
          <div className="fave-unfave-icon">
            <FaveStar itemId={id} itemType="dashboard" />
          </div>
        </div>
        <div className="card-description">
          <div className="card-row">
            <Icons.Person iconSize="l" />
            <a href={changed_by_url}>
              <strong>{changed_by_name || changed_by?.first_name}</strong>
            </a>
            <span className="card-alt-text">{changed_on_humanized}</span>
          </div>
          <div className="card-row">
            <Owners owners={owners} />
          </div>
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="card-row">
              <Tags tags={tags} />
            </div>
          )}
        </div>
        <div className="card-footer">
          <InfoTooltip tooltip={t('Click to edit dashboard properties')}>
            <Icons.EditAlt
              iconSize="l"
              onClick={() => openDashboardEditModal(dashboard)}
              data-test="edit-dashboard"
              role="button"
            />
          </InfoTooltip>
        </div>
      </div>
    </CardContainer>
  );
}
