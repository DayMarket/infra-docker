import React, { useEffect, useState } from 'react';
import rison from 'rison';
import { styled, SupersetClient, t } from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { JsonObject } from '@superset-ui/core/src/query/types';
import { EmptyStateBig } from 'src/components/EmptyState';
import Icons from 'src/components/Icons';
import Loading from 'src/components/Loading';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import Tabs from 'src/components/Tabs';
import ChartList from 'src/views/ChartList';
import DashboardList from 'src/pages/DashboardList';
import { SavedQueryObject } from 'src/views/CRUD/types';
import { WelcomeContainer } from 'src/views/CRUD/welcome/styles';
import { WelcomePage } from 'src/views/CRUD/welcome/types';
import { CardContainer } from 'src/views/CRUD/welcome/Welcome';

const { TabPane } = Tabs;

interface Dashboard {
  id: number;
  dashboard_title: string;
}

interface Chart {
  id: number;
  slice_name: string;
}

interface SavedQuery {
  id: number;
  label: string;
}

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 16px;
  }
`;

export default function Welcome() {
  const [dashboardData, setDashboardData] = useState<Dashboard[]>([]);
  const [chartData, setChartData] = useState<Chart[]>([]);
  const [queryData, setQueryData] = useState<SavedQuery[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(true);

  const [showThumbnails, setShowThumbnails] = useState(true);

  const user = useSelector<any, UserWithPermissionsAndRoles>(
    state => state.user,
  );

  useEffect(() => {
    if (!user?.userId) return;

    setDashboardLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${rison.encode({
        filters: [{ col: 'owners', opr: 'rel_m_m', value: user.userId }],
        columns: ['id', 'dashboard_title'],
        page_size: 6,
      })}`,
    })
      .then(({ json }) => setDashboardData(json.result))
      .catch(() => setDashboardData([]))
      .finally(() => setDashboardLoading(false));

    setChartLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/chart/?q=${rison.encode({
        filters: [{ col: 'owners', opr: 'rel_m_m', value: user.userId }],
        columns: ['id', 'slice_name'],
        page_size: 6,
      })}`,
    })
      .then(({ json }) => setChartData(json.result))
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));

    setQueryLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/saved_query/?q=${rison.encode({
        filters: [{ col: 'created_by', opr: 'rel_o_m', value: user.userId }],
        columns: ['id', 'label'],
        page_size: 6,
      })}`,
    })
      .then(({ json }) => setQueryData(json.result))
      .catch(() => setQueryData([]))
      .finally(() => setQueryLoading(false));
  }, [user?.userId]);

  const renderTab = (
    loading: boolean,
    data: any[],
    Component: React.ElementType,
    props: JsonObject = {},
    emptyText: string,
  ) => {
    if (loading) {
      return <Loading />;
    }
    if (data.length === 0) {
      return (
        <EmptyStateBig
          image="document.svg"
          title={t('Nothing here yet')}
          description={emptyText}
        />
      );
    }
    return <Component initialData={data} showThumbnails={showThumbnails} user={user} {...props} />;
  };

  return (
    <WelcomeContainer data-test="welcome-container">
      <StyledTabs
        defaultActiveKey={WelcomePage.DASHBOARDS}
        id="welcome-tabs"
        animated={false}
        tabBarExtraContent={
          <div
            role="button"
            tabIndex={0}
            className="toggle-thumbnails"
            onClick={() => setShowThumbnails(prev => !prev)}
            onKeyPress={() => setShowThumbnails(prev => !prev)}
          >
            <Icons.TimelineOutlined />
            {showThumbnails
              ? t('Hide Thumbnails')
              : t('Show Thumbnails')}
          </div>
        }
      >
        <TabPane tab={t('Dashboards')} key={WelcomePage.DASHBOARDS}>
          <CardContainer>
            {renderTab(
              dashboardLoading,
              dashboardData,
              DashboardList,
              {},
              t('You haven’t created any dashboards yet'),
            )}
          </CardContainer>
        </TabPane>

        <TabPane tab={t('Charts')} key={WelcomePage.CHARTS}>
          <CardContainer>
            {renderTab(
              chartLoading,
              chartData,
              ChartList,
              {},
              t('You haven’t created any charts yet'),
            )}
          </CardContainer>
        </TabPane>

        <TabPane tab={t('Saved Queries')} key={WelcomePage.SAVED_QUERIES}>
          <CardContainer>
            {renderTab(
              queryLoading,
              queryData,
              () => null,
              {},
              t('You haven’t saved any queries yet'),
            )}
          </CardContainer>
        </TabPane>
      </StyledTabs>
    </WelcomeContainer>
  );
}
