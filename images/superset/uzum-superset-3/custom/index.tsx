// src/pages/DashboardList/index.tsx

import React from 'react';
import { t } from '@superset-ui/core';
import ListView from 'src/components/ListView/ListView';
import DashboardCard from './DashboardCard';

const DashboardList = ({
  addDangerToast,
  loading = false,
  resourceCollection = [],
}: any) => {
  const renderCard = (dashboard: any) => {
    if (!dashboard) return null;

    return <DashboardCard dashboard={dashboard} />;
  };

  return (
    <ListView
      title={t('Dashboards')}
      loading={loading}
      data={resourceCollection || []}
      renderCard={renderCard}
    />
  );
};

export default DashboardList;
