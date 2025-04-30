import React from 'react';
import { t, styled, SupersetTheme } from '@superset-ui/core';
import Icons from 'src/components/Icons';
import CertifiedBadge from 'src/components/CertifiedBadge';
import FaveStar from 'src/components/FaveStar';
import Owners from 'src/components/Owners';
import InfoTooltip from 'src/components/InfoTooltip';
import DashboardThumbnail from './DashboardThumbnail';

// Стили
const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.gridUnit}px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  background-color: ${({ theme }) => theme.colors.grayscale.light5};
`;

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

export interface DashboardCardProps {
  dashboard: any;
  openDashboardEditModal: (dashboard: any) => void;
  showThumbnails: boolean;
}

export default function DashboardCard({
  dashboard,
  openDashboardEditModal,
  showThumbnails,
}: DashboardCardProps) {
  console.log('📦 props.dashboard:', dashboard);
  console.log('🖼️ showThumbnails:', showThumbnails);

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

  console.log('🖼️ thumbnail_url:', thumbnail_url);


  return (
    <CardContainer>
      {showThumbnails && thumbnail_url && (
        <a href={url}>
          <DashboardThumbnail url={thumbnail_url} />
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
          {/* Tags пропущен, так как импортировать нечего и структура может отличаться */}
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
