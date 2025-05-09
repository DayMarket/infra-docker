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
  mq,
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
  .ant-row.menu {
    margin-top: -15px;
    background-color: ${({ theme }) => theme.colors.grayscale.light4};
    &:after {
      content: '';
      display: block;
      border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
      margin: 0 ${({ theme }) => theme.gridUnit * 6}px;
      position: relative;
      width: 100%;
      ${mq[1]} {
        margin: 0 2px;
      }
    }
    .ant-menu.ant-menu-light.ant-menu-root.ant-menu-horizontal {
      padding-left: ${({ theme }) => theme.gridUnit * 8}px;
    }
    button {
      padding: 3px 21px;
    }
  }
  .ant-card-meta-description {
    margin-top: ${({ theme }) => theme.gridUnit}px;
  }
  .ant-card.ant-card-bordered {
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  }
  .ant-collapse-item .ant-collapse-content {
    margin-bottom: ${({ theme }) => theme.gridUnit * -6}px;
  }
  div.ant-collapse-item:last-child.ant-collapse-item-active .ant-collapse-header {
    padding-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }
  div.ant-collapse-item:last-child .ant-collapse-header {
    padding-bottom: ${({ theme }) => theme.gridUnit * 9}px;
  }
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
        cover={cover ? false : <></>}
        description=""
        loading
      />
    ))}
  </CardContainer>
);

function Welcome({ user, addDangerToast }: WelcomeProps) {
  const canReadSavedQueries = userHasPermission(user, 'SavedQuery', 'can_read');
  const userid = user.userId;
  const id = userid!.toString();
  const recent = `/api/v1/log/recent_activity/?q=${rison.encode({ page_size: 6 })}`;
  const [activeChild, setActiveChild] = useState('Loading');
  const userKey = dangerouslyGetItemDoNotUse(id, null);
  const isThumbnailsEnabled = isFeatureEnabled(FeatureFlag.Thumbnails);
  const defaultChecked = userKey?.thumbnails === undefined ? true : userKey?.thumbnails;
  const [checked, setChecked] = useState(defaultChecked);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [chartData, setChartData] = useState<Array<object> | null>(null);
  const [queryData, setQueryData] = useState<Array<object> | null>(null);
  const [dashboardData, setDashboardData] = useState<Array<object> | null>(null);
  const [isFetchingActivityData, setIsFetchingActivityData] = useState(true);
  const collapseState = getItem(LocalStorageKeys.HomepageCollapseState, []);
  const [activeState, setActiveState] = useState<Array<string>>(collapseState);

  const handleCollapse = (state: Array<string>) => {
    setActiveState(state);
    setItem(LocalStorageKeys.HomepageCollapseState, state);
  };

  const SubmenuExtension = extensionsRegistry.get('home.submenu');
  const WelcomeMessageExtension = extensionsRegistry.get('welcome.message');
  const WelcomeTopExtension = extensionsRegistry.get('welcome.banner');
  const WelcomeMainExtension = extensionsRegistry.get('welcome.main.replacement');

  const [otherTabTitle, otherTabFilters] = useMemo(() => {
    const lastTab = bootstrapData.common?.conf?.WELCOME_PAGE_LAST_TAB as WelcomePageLastTab;
    const [customTitle, customFilter] = Array.isArray(lastTab)
      ? lastTab
      : [undefined, undefined];
    if (customTitle && customFilter) {
      return [t(customTitle), customFilter];
    }
    if (lastTab === 'all') return [t('All'), []];
    return [t('Examples'), [{ col: 'created_by', opr: 'rel_o_m', value: 0 }]];
  }, []);

  useEffect(() => {
    if (!otherTabFilters || WelcomeMainExtension) return;

    const activeTab = getItem(LocalStorageKeys.HomepageActivityFilter, null);
    setActiveState(collapseState.length > 0 ? collapseState : DEFAULT_TAB_ARR);

    getRecentActivityObjs(user.userId!, recent, addDangerToast, otherTabFilters)
      .then(res => {
        const data: ActivityData | null = {};
        data[TableTab.Other] = res.other;
        if (res.viewed) {
          const filtered = reject(res.viewed, ['item_url', null]);
          data[TableTab.Viewed] = filtered;
          setActiveChild(activeTab || (filtered.length ? TableTab.Viewed : TableTab.Created));
        } else {
          setActiveChild(activeTab || TableTab.Created);
        }
        setActivityData(data);
      })
      .catch(
        createErrorHandler((errMsg: unknown) => {
          setActivityData({ [TableTab.Viewed]: [] });
          addDangerToast(t('There was an issue fetching your recent activity: %s', errMsg));
        }),
      );

    const fetch = (endpoint: string) =>
      SupersetClient.get({ endpoint })
        .then(({ json }) => json.result)
        .catch(err => {
          err.text?.().then(msg => addDangerToast(t('Error: %s', msg)));
          return [];
        });

    const filters = [{ col: 'owners', opr: 'rel_m_m', value: 'self' }];
    const q = rison.encode({ page_size: 6, filters });

    Promise.all([
      fetch(`/api/v1/dashboard/?q=${q}`).then(setDashboardData),
      fetch(`/api/v1/chart/?q=${q}`).then(setChartData),
      canReadSavedQueries
        ? fetch(`/api/v1/saved_query/?q=${rison.encode({
            page_size: 6,
            filters: [{ col: 'created_by', opr: 'rel_o_m', value: id }],
          })}`).then(setQueryData)
        : Promise.resolve(),
    ]).then(() => setIsFetchingActivityData(false));
  }, [otherTabFilters]);

  const handleToggle = () => {
    setChecked(!checked);
    dangerouslySetItemDoNotUse(id, { thumbnails: !checked });
  };

  useEffect(() => {
    if (!collapseState && queryData?.length) {
      setActiveState(prev => [...prev, '4']);
    }
    setActivityData(prev => ({
      ...prev,
      Created: [
        ...(chartData?.slice(0, 3) || []),
        ...(dashboardData?.slice(0, 3) || []),
        ...(queryData?.slice(0, 3) || []),
      ],
    }));
  }, [chartData, queryData, dashboardData]);

  useEffect(() => {
    if (!collapseState && activityData?.[TableTab.Viewed]?.length) {
      setActiveState(prev => ['1', ...prev]);
    }
  }, [activityData]);

  const isRecentActivityLoading =
    !activityData?.[TableTab.Other] && !activityData?.[TableTab.Viewed];

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
      {SubmenuExtension ? <SubmenuExtension {...menuData} /> : <SubMenu {...menuData} />}
      <WelcomeContainer>
        {WelcomeMessageExtension && <WelcomeMessageExtension />}
        {WelcomeTopExtension && <WelcomeTopExtension />}
        {WelcomeMainExtension && <WelcomeMainExtension />}
        {(!WelcomeTopExtension || !WelcomeMainExtension) && (
          <Collapse activeKey={activeState} onChange={handleCollapse} ghost bigger>
            <Collapse.Panel header={t('Recents')} key="1">
              {activityData &&
              (activityData[TableTab.Viewed] ||
                activityData[TableTab.Other] ||
                activityData[TableTab.Created]) &&
              activeChild !== 'Loading' ? (
                <ActivityTable
                  user={{ userId: user.userId! }}
                  activeChild={activeChild}
                  setActiveChild={setActiveChild}
                  activityData={activityData}
                  isFetchingActivityData={isFetchingActivityData}
                />
              ) : (
                <LoadingCards />
              )}
            </Collapse.Panel>
            <Collapse.Panel header={t('Dashboards')} key="2">
              {!dashboardData || isRecentActivityLoading ? (
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
              {!chartData || isRecentActivityLoading ? (
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
              <Collapse.Panel header={t('Saved queries')} key="4">
                {!queryData ? (
                  <LoadingCards cover={checked} />
                ) : (
                  <SavedQueries
                    showThumbnails={checked}
                    user={user}
                    mine={queryData}
                    featureFlag={isThumbnailsEnabled}
                  />
                )}
              </Collapse.Panel>
            )}
          </Collapse>
        )}
      </WelcomeContainer>
    </>
  );
}

export default withToasts(Welcome);
