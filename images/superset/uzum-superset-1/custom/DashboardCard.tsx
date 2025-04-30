import React from 'react';
import { t, styled, SupersetTheme } from '@superset-ui/core';
import FaveStar from 'src/components/FaveStar';
import CertifiedBadge from 'src/components/CertifiedBadge';
import Owners from 'src/components/Owners';
import InfoTooltip from 'src/components/InfoTooltip';
import Icons from 'src/components/Icons';
import DashboardThumbnail from './DashboardThumbnail';

export interface DashboardCardProps {
  dashboard: any;
  openDashboardEditModal: (dashboard: any) => void;
  showThumbnails: boolean;
}

const CardContainer = styled.div`
  ${({ theme }: { theme: SupersetTheme }) => `
    border: 1px solid ${theme.colors.grayscale.light2};
    border-radius: ${theme.gridUnit}px;
    margin: ${theme.gridUnit * 2}px;
    padding: ${theme.gridUnit * 2}px;
    box-shadow: ${theme.shadows.light};
    background-color: ${theme.colors.grayscale.light5};
  `}
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

export default function DashboardCard({
  dashboard,
  openDashboardEditModal,
  showThumbnails,
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
    changed_on_delta_humanized,
    owners,
  } = dashboard;

  return (
    <CardContainer>
      {showThumbnails && thumbnail_url && (
        <a href={url}>
          <DashboardThumbnail url={thumbnail_url} />
        </a>
      )}
      <div className="card-body">
        <div className="card-header">
          <TitleLink href={url}>
            {dashboard_title}{' '}
            {certified_by && (
              <CertifiedBadge
                certifiedBy={certified_by}
                details={certification_details}
              />
            )}
          </TitleLink>
          <FaveStar itemId={id} itemType="dashboard" />
        </div>
        <div className="card-description">
          <div>
            <Icons.Person iconSize="l" />
            <a href={changed_by_url}>
              <strong>{changed_by_name || changed_by?.first_name}</strong>
            </a>
            <span style={{ marginLeft: 8 }}>{changed_on_delta_humanized}</span>
          </div>
          <Owners owners={owners} />
        </div>
        <div className="card-footer">
          <InfoTooltip tooltip={t('Click to edit dashboard properties')}>
            <Icons.EditAlt
              iconSize="l"
              onClick={() => openDashboardEditModal(dashboard)}
              role="button"
              style={{ cursor: 'pointer' }}
            />
          </InfoTooltip>
        </div>
      </div>
    </CardContainer>
  );
}
