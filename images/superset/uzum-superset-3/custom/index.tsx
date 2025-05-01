/**
 * UZUM CUSTOM Dashboard List
 * Версия с облаком цитат и замаскированными placeholder'ами
 */

import React from 'react';
import rison from 'rison';
import { styled, t } from '@superset-ui/core';
import moment from 'moment';
import ListView from 'src/components/ListView';
import FacePile from 'src/components/FacePile';
import FaveStar from 'src/components/FaveStar';
import { Tooltip } from 'src/components/Tooltip';
import { Link } from 'react-router-dom';
import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import withToasts from 'src/components/MessageToasts/withToasts';
import { createErrorHandler } from 'src/views/CRUD/utils';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
import Icons from 'src/components/Icons';
import {
  isUserAdmin,
  isUserOwner,
} from 'src/views/CRUD/utils';
import { Dashboard, DashboardListProps } from 'src/types/DashboardTypes';
import Thumbnail from './DashboardThumbnail';

const Quote = styled.div`
  font-style: italic;
  background: #f9f9f9;
  border-left: 4px solid #ccc;
  margin: 0;
  padding: 0.5em 1em;
  color: #555;
  font-size: 90%;
  text-align: center;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PLACEHOLDER_QUOTES = atob(
  'WyJQcmV2aXUgYnVkZXQgdSBuZXh0IHNwcmludCIsIlV0cm9tIGRhdW5ueWUg4oKsIGZldmVyeW5nIGRhc2hib3JkcyIsIk1lc3RvIG5ldC4uLiIsIlNrb29uIHNvb24hIiwiUGxhdGZvcm0gdXBsb2FkIGluIHByb2dyZXNzIiwiVmlldyBmb3IgdGhlIGJlc3QgZGFzaGJvYXJkcyIsIkFuYWx5dGljIGluIHByb2dyZXNzIiwiU3RheSB0dW5lZC4uLiIsIlRoaXMgc3BhY2Ugd2lsbCBiZSBvd25lZCBieSB5b3UiLCJXYWl0aW5nIGZvciBkYXRhIiwiU2VlIHlvdSBuZXh0IHdlZWsiLCJDb25uZWN0aW5nIHRoZSBkb3RzIiwiU3ltbGljIG1pc3Npb24iLCJEYXRhIHdpbGwgYmUgcHJvY2Vzc2VkIiwiVG9vIG11Y2ggaW5mb3JtYXRpb24iLCJIb2xkaW5nIGZvciBhcHByb3ZhbCIsIlByZXZpZXcgaXMgbWlzc2luZyIsIlBlbmRpbmcgYXBwcm92YWwiLCJTY2hlZHVsZWQgdXBncmFkZSIsIlJlZnJlc2ggcmVxdWlyZWQiXQ=='
).split(',');

const DashboardList = (props: DashboardListProps) => {
  const { addDangerToast } = props;

  const renderCard = (dashboard: Dashboard) => {
    const showQuote = !dashboard.thumbnail_url;

    return (
      <div className="dashboard-card">
        {dashboard.thumbnail_url ? (
          <img
            src={dashboard.thumbnail_url}
            alt="Превью в процессе обработки"
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <Quote>
            {PLACEHOLDER_QUOTES[
              Math.floor(Math.random() * PLACEHOLDER_QUOTES.length)
            ]}
          </Quote>
        )}
        <div className="dashboard-title">
          <Link to={`/dashboard/${dashboard.slug || dashboard.id}/`}>
            {dashboard.dashboard_title}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <ListView
      title={t('Dashboards')}
      renderCard={renderCard}
      // Остальные пропсы и логика здесь
    />
  );
};

export default withToasts(DashboardList);
