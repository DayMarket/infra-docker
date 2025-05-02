import React from 'react';
import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView';
import Icon from 'src/components/Icon';
import CertifiedBadge from 'src/components/CertifiedBadge';
import TooltipWrapper from 'src/components/TooltipWrapper';
import FaveStar from 'src/components/FaveStar';
import { createErrorHandler, handleSave } from 'src/views/CRUD/utils';
import { Dashboard, DashboardListProps } from 'src/views/CRUD/types';
import { getItemById, updateResource } from 'src/views/CRUD/utils/apiResources';
import SubMenu from 'src/views/components/SubMenu';

const DashboardList: React.FC<DashboardListProps> = props => {
  return (
    <>
      <SubMenu
        name={t('Your Dashboards')}
        breadcrumbParentId="Dashboards"
        tabs={[
          {
            label: t('Your Dashboards'),
            name: 'Dashboards',
            icon: <Icon name="dashboard" />,
            url: '/dashboard/list/',
          },
        ]}
      />
      <ListView
        {...props}
        title={t('Your Dashboards')}
        renderItem={(dashboard: Dashboard) => ({
          title: dashboard.dashboard_title,
          description: dashboard.description,
          actions: [
            <FaveStar
              key="fave-star"
              itemId={dashboard.id}
              fetchFaveStar={() => Promise.resolve(false)}
              saveFaveStar={() => Promise.resolve()}
            />,
          ],
        })}
        loading={props.loading}
        fetchData={props.fetchData}
      />
    </>
  );
};

export default DashboardList;
