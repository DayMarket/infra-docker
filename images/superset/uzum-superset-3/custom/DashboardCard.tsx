import React from 'react';
import { t } from '@superset-ui/core';
import { MainNav as SubMenu } from 'src/components/Menu';
import ListView from 'src/components/ListView';
import DashboardCard from './DashboardCard';
import { useDashboardList } from 'src/features/dashboards/hooks/useDashboardList';
import { PageHeaderWithActions } from 'src/components/PageHeaderWithActions';

export default function DashboardList() {
  const { dashboards, loading } = useDashboardList();

  return (
    <>
      <SubMenu
        name={t('Dashboards')}
        breadcrumbs={[{ label: t('Home'), url: '/' }, { label: t('Dashboards') }]}
      />
      <PageHeaderWithActions
        title={t('')}
        showTitle
        addButtonTitle={t('Add dashboard')}
        addButtonTooltip={t('Create a new dashboard')}
        onAdd={() => window.location.assign('/dashboard/new')}
      />
      <ListView
        loading={loading}
        data={dashboards}
        renderItem={dashboard => <DashboardCard dashboard={dashboard} />}
        emptyMessage={t('No dashboards available')}
      />
    </>
  );
}
