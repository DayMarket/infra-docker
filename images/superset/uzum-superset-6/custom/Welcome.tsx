// Home/index.tsx

import { useEffect, useMemo, useState } from 'react';
import {
  isFeatureEnabled,
  FeatureFlag,
  getExtensionsRegistry,
  JsonObject,
  styled,
  t,
  SupersetClient,
} from '@superset-ui/core';
import rison from 'rison';
import Collapse from 'src/components/Collapse';
import { User } from 'src/types/bootstrapTypes';
import { reject } from 'lodash';
import {
  dangerouslyGetItemDoNotUse,
  dangerouslySetItemDoNotUse,
  getItem,
  LocalStorageKeys,
  setItem,
} from 'src/utils/localStorageHelpers';
import ListViewCard from 'src/components/ListViewCard';
import withToasts from 'src/components/MessageToasts/withToasts';
import {
  CardContainer,
  createErrorHandler,
  getRecentActivityObjs,
  loadingCardCount,
} from 'src/views/CRUD/utils';
import { AntdSwitch } from 'src/components';
import getBootstrapData from 'src/utils/getBootstrapData';
import { TableTab } from 'src/views/CRUD/types';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import { userHasPermission } from 'src/dashboard/util/permissionUtils';
import { WelcomePageLastTab } from 'src/features/home/types';
import ActivityTable from 'src/features/home/ActivityTable';
import ChartTable from 'src/features/home/ChartTable';
import SavedQueries from 'src/features/home/SavedQueries';
import DashboardTable from 'src/features/home/DashboardTable';

const extensionsRegistry = getExtensionsRegistry();

interface WelcomeProps {
  user: User;
  addDangerToast: (arg0: string) => void;
}

export interface ActivityData {
  [TableTab.Created]?: JsonObject[];
  [TableTab.Edited]?: JsonObject[];
  [TableTab.Viewed]?: JsonObject[];
  [TableTab.Other]?: JsonObject[];
}

interface LoadingProps {
  cover?: boolean;
}

const DEFAULT_TAB_ARR = ['2', '3'];

const WelcomeContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.grayscale.light4};
  .loading-cards {
    margin-top: ${({ theme }) => theme.gridUnit * 8}px;
    .ant-card-cover > div {
      height: 168px;
    }
  }
`;

const WelcomeNav = styled.div`
  ${({ theme }) => `
    .switch {
      display: flex;
      flex-direction: row;
      margin: ${theme.gridUnit * 4}px;
      span {
        display: block;
        margin: ${theme.gridUnit}px;
        line-height: ${theme.gridUnit * 3.5}px;
      }
    }
  `}
`;

const bootstrapData = getBootstrapData();

export const LoadingCards = ({ cover }: LoadingProps) => (
  <CardContainer showThumbnails={cover} className="loading-cards">
    {[...new Array(loadingCardCount)].map((_, index) => (
      <ListViewCard
        key={index}
        cover={false}
        description=""
        loading
      />
    ))}
  </CardContainer>
);

function Welcome({ user, addDangerToast }: WelcomeProps) {
  const canReadSavedQueries = userHasPermission(user, 'SavedQuery', 'can_read');
  const id = user.userId!.toString();
  const params = rison.encode({ page_size: 6 });
  const recent = `/api/v1/log/recent_activity/?q=${params}`;
  const userKey = dangerouslyGetItemDoNotUse(id, null);
  const isThumbnailsEnabled = isFeatureEnabled(FeatureFlag.Thumbnails);
  const [checked, setChecked] = useState(
    isThumbnailsEnabled ? userKey?.thumbnails ?? true : false,
  );

  const [activeChild, setActiveChild] = useState('Loading');
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [chartData, setChartData] = useState<Array<object> | null>(null);
  const [queryData, setQueryData] = useState<Array<object> | null>(null);
  const [dashboardData, setDashboardData] = useState<Array<object> | null>(null);
  const [isFetchingActivityData, setIsFetchingActivityData] = useState(true);

  const collapseState = getItem(LocalStorageKeys.HomepageCollapseState, null);
  const [activeState, setActiveState] = useState<Array<string>>(
    collapseState ?? DEFAULT_TAB_ARR,
  );

  const handleCollapse = (state: Array<string>) => {
    setActiveState(state);
    setItem(LocalStorageKeys.HomepageCollapseState, state);
  };

  const [otherTabTitle, otherTabFilters] = useMemo(() => {
    const lastTab = bootstrapData.common?.conf.WELCOME_PAGE_LAST_TAB as WelcomePageLastTab;
    const [customTitle, customFilter] = Array.isArray(lastTab)
      ? lastTab
      : [undefined, undefined];
    if (customTitle && customFilter) return [t(customTitle), customFilter];
    if (lastTab === 'all') return [t('All'), []];
    return [
      t('Examples'),
      [{ col: 'created_by', opr: 'rel_o_m', value: 0 }],
    ];
  }, []);

  useEffect(() => {
    if (!otherTabFilters) return;

    getRecentActivityObjs(user.userId!, recent, addDangerToast, otherTabFilters)
      .then(res => {
        const data: ActivityData | null = {};
        data[TableTab.Other] = res.other;
        data[TableTab.Viewed] = reject(res.viewed, ['item_url', null]);
        setActiveChild(TableTab.Viewed);
        setActivityData(prev => ({ ...prev, ...data }));
      })
      .catch(
        createErrorHandler(errMsg => {
          setActivityData(prev => ({ ...prev, [TableTab.Viewed]: [] }));
          addDangerToast(t('There was an issue fetching your recent activity: %s', errMsg));
        }),
      );

    // const filters = [{ col: 'owners', opr: 'rel_m_m', value: id }];
    const filters: any[] = [];
    const queryFilters = [{ col: 'created_by', opr: 'rel_o_m', value: id }];

    Promise.all([
      SupersetClient.get({ endpoint: `/api/v1/dashboard/?q=${rison.encode({ page_size: 6, filters })}` })
        .then(({ json }) => setDashboardData(json.result))
        .catch(() => setDashboardData([])),
      SupersetClient.get({ endpoint: `/api/v1/chart/?q=${rison.encode({ page_size: 6, filters })}` })
        .then(({ json }) => setChartData(json.result))
        .catch(() => setChartData([])),
      canReadSavedQueries
        ? SupersetClient.get({ endpoint: `/api/v1/saved_query/?q=${rison.encode({ page_size: 6, filters: queryFilters })}` })
            .then(({ json }) => setQueryData(json.result))
            .catch(() => setQueryData([]))
        : Promise.resolve(),
    ]).finally(() => setIsFetchingActivityData(false));
  }, [otherTabFilters]);

  const handleToggle = () => {
    setChecked(!checked);
    dangerouslySetItemDoNotUse(id, { thumbnails: !checked });
  };

  const menuData: SubMenuProps = {
    activeChild: 'Home',
    name: t('Home'),
  };

  if (isThumbnailsEnabled) {
    menuData.buttons = [
      {
        name: (
          <WelcomeNav>
            <div className="switch">
              <AntdSwitch checked={checked} onClick={handleToggle} />
              <span>{t('Thumbnails')}</span>
            </div>
          </WelcomeNav>
        ),
        onClick: handleToggle,
        buttonStyle: 'link',
      },
    ];
  }

  return (
    <>
      <SubMenu {...menuData} />
      <WelcomeContainer>
        <Collapse activeKey={activeState} onChange={handleCollapse} ghost bigger>
          <Collapse.Panel header={t('Recents')} key="1">
            <ActivityTable
              user={{ userId: user.userId! }}
              activeChild={activeChild}
              setActiveChild={setActiveChild}
              activityData={activityData || {}}
              isFetchingActivityData={isFetchingActivityData}
            />
          </Collapse.Panel>
          <Collapse.Panel header={t('Dashboards')} key="2">
            {!dashboardData ? (
              <LoadingCards cover={checked} />
            ) : (
              <DashboardTable
                user={user}
                mine={dashboardData}
                showThumbnails={checked}
                otherTabData={activityData?.[TableTab.Other]}
                otherTabFilters={otherTabFilters}
                otherTabTitle={otherTabTitle}
              />
            )}
          </Collapse.Panel>
          <Collapse.Panel header={t('Charts')} key="3">
            {!chartData ? (
              <LoadingCards cover={checked} />
            ) : (
              <ChartTable
                showThumbnails={checked}
                user={user}
                mine={chartData}
                otherTabData={activityData?.[TableTab.Other]}
                otherTabFilters={otherTabFilters}
                otherTabTitle={otherTabTitle}
              />
            )}
          </Collapse.Panel>
          {canReadSavedQueries && (
            <Collapse.Panel header={t('SQL queries')} key="4">
              {!queryData ? (
                <LoadingCards cover={checked} />
              ) : (
                <SavedQueries
                  showThumbnails={checked}
                  user={user}
                  mine={queryData}
                  otherTabData={activityData?.[TableTab.Other]}
                  otherTabFilters={otherTabFilters}
                  otherTabTitle={otherTabTitle}
                />
              )}
            </Collapse.Panel>
          )}
        </Collapse>
      </WelcomeContainer>
    </>
  );
}

export default withToasts(Welcome);
