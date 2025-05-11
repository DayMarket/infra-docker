import React, { useEffect, useState } from 'react';
import {
  isFeatureEnabled,
  FeatureFlag,
  getExtensionsRegistry,
  JsonObject,
  styled,
  t,
} from '@superset-ui/core';
import rison from 'rison';
import Collapse from 'src/components/Collapse';
import { User } from 'src/types/bootstrapTypes';
import {
  getItem,
  LocalStorageKeys,
  setItem,
  dangerouslyGetItemDoNotUse,
  dangerouslySetItemDoNotUse,
} from 'src/utils/localStorageHelpers';
import ListViewCard from 'src/components/ListViewCard';
import withToasts from 'src/components/MessageToasts/withToasts';
import {
  CardContainer,
  createErrorHandler,
  getRecentActivityObjs,
  getUserOwnedObjects,
  loadingCardCount,
  mq,
} from 'src/views/CRUD/utils';
import { AntdSwitch } from 'src/components';
import getBootstrapData from 'src/utils/getBootstrapData';
import { TableTab } from 'src/views/CRUD/types';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import { userHasPermission } from 'src/dashboard/util/permissionUtils';
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

const DEFAULT_TAB_ARR: string[] = [];

const WelcomeContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.grayscale.light4};
  .ant-row.menu {
    margin-top: -15px;
    background-color: ${({ theme }) => theme.colors.grayscale.light4};
    &:after {
      content: '';
      display: block;
      border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
      margin: 0px ${({ theme }) => theme.gridUnit * 6}px;
      position: relative;
      width: 100%;
      ${mq[1]} {
        margin-top: 5px;
        margin: 0px 2px;
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
  div.ant-collapse-item:last-child.ant-collapse-item-active
    .ant-collapse-header {
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

export const LoadingCards = ({ cover }: { cover?: boolean }) => (
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
  const recent = `/api/v1/log/recent_activity/?q=${rison.encode({
    page_size: 6,
  })}`;

  const userKey = dangerouslyGetItemDoNotUse(id, {});
  const isThumbnailsEnabled = isFeatureEnabled(FeatureFlag.Thumbnails);
  const defaultChecked = isThumbnailsEnabled
      ? userKey?.thumbnails ?? true
      : false;
  
  const [checked, setChecked] = useState(defaultChecked);
  
  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    const prev = dangerouslyGetItemDoNotUse(id, {});
    dangerouslySetItemDoNotUse(id, {
      ...prev,
      thumbnails: newValue,
    });
  };
  
  
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [chartData, setChartData] = useState<object[] | null>(null);
  const [queryData, setQueryData] = useState<object[] | null>(null);
  const [dashboardData, setDashboardData] = useState<object[] | null>(null);
  const [isFetchingActivityData, setIsFetchingActivityData] = useState(true);

  const collapseState = getItem(LocalStorageKeys.HomepageCollapseState, []);
  const [activeState, setActiveState] = useState<string[]>(
    collapseState.length ? collapseState : DEFAULT_TAB_ARR,
  );

  const handlePanelChange = (keys: string | string[]) => {
    const currentKeys = typeof keys === 'string' ? [keys] : keys;
    setActiveState(currentKeys);
    setItem(LocalStorageKeys.HomepageCollapseState, currentKeys);

    if (currentKeys.includes('2') && !dashboardData) {
      getUserOwnedObjects(id, 'dashboard')
        .then(r => setDashboardData(r))
        .catch(() => setDashboardData([]));
    }
    if (currentKeys.includes('3') && !chartData) {
      getUserOwnedObjects(id, 'chart')
        .then(r => setChartData(r))
        .catch(() => setChartData([]));
    }
    if (currentKeys.includes('4') && !queryData && canReadSavedQueries) {
      getUserOwnedObjects(id, 'saved_query', [
        { col: 'created_by', opr: 'rel_o_m', value: `${id}` },
      ])
        .then(r => setQueryData(r))
        .catch(() => setQueryData([]));
    }
  };

  useEffect(() => {
    getRecentActivityObjs(
      user.userId!,
      recent,
      addDangerToast,
      [],
    )
      .then(res => {
        const data: ActivityData = {};
        data[TableTab.Other] = res.other;
        if (res.viewed) {
          data[TableTab.Viewed] = res.viewed.filter(
            r => r.item_url !== null,
          );
          setActivityData(data);
        } else {
          setActivityData(data);
        }
      })
      .catch(
        createErrorHandler(errMsg => {
          addDangerToast(
            t('There was an issue fetching recent activity: %s', errMsg),
          );
        }),
      )
      .finally(() => setIsFetchingActivityData(false));
  }, []);

  useEffect(() => {
    if (dashboardData === null && chartData === null && queryData === null) {
      setActiveState(DEFAULT_TAB_ARR);
      const prev = dangerouslyGetItemDoNotUse(id, {});
      dangerouslySetItemDoNotUse(id, {
        ...prev,
        collapseState: DEFAULT_TAB_ARR,
      });
    }
  }, [dashboardData, chartData, queryData]);
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
        <Collapse
          activeKey={activeState}
          onChange={handlePanelChange}
          ghost
          bigger
        >
          <Collapse.Panel header={t('Recents')} key="1">
            {activityData && !isFetchingActivityData ? (
              <ActivityTable
                user={{ userId: user.userId! }}
                activeChild={'Viewed'}
                setActiveChild={() => {}}
                activityData={activityData}
                isFetchingActivityData={isFetchingActivityData}
              />
            ) : (
              <LoadingCards />
            )}
          </Collapse.Panel>
          <Collapse.Panel header={t('Dashboards')} key="2">
            {!dashboardData ? (
              <LoadingCards cover={checked} />
            ) : (
              <DashboardTable
                showThumbnails={checked}
                user={user}                
                mine={dashboardData}
                otherTabData={[]}
                otherTabFilters={[]}
                otherTabTitle={t('All')}
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
                otherTabData={[]}
                otherTabFilters={[]}
                otherTabTitle={t('All')}
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
      </WelcomeContainer>
    </>
  );
}

export default withToasts(Welcome);
