/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 */

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
import { reject } from 'lodash';
import Collapse from 'src/components/Collapse';
import { AntdSwitch } from 'src/components';
import { User } from 'src/types/bootstrapTypes';
import ListViewCard from 'src/components/ListViewCard';
import withToasts from 'src/components/MessageToasts/withToasts';
import getBootstrapData from 'src/utils/getBootstrapData';
import {
  dangerouslyGetItemDoNotUse,
  dangerouslySetItemDoNotUse,
  getItem,
  setItem,
  LocalStorageKeys,
} from 'src/utils/localStorageHelpers';
import {
  CardContainer,
  createErrorHandler,
  getRecentActivityObjs,
  loadingCardCount,
  mq,
} from 'src/views/CRUD/utils';
import { TableTab } from 'src/views/CRUD/types';
import { userHasPermission } from 'src/dashboard/util/permissionUtils';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import ActivityTable from 'src/features/home/ActivityTable';
import ChartTable from 'src/features/home/ChartTable';
import DashboardTable from 'src/features/home/DashboardTable';
import SavedQueries from 'src/features/home/SavedQueries';
import { WelcomePageLastTab } from 'src/features/home/types';

const extensionsRegistry = getExtensionsRegistry();

interface WelcomeProps {
  user: User;
  addDangerToast: (msg: string) => void;
}

export interface ActivityData {
  [TableTab.Created]?: JsonObject[];
  [TableTab.Edited]?: JsonObject[];
  [TableTab.Viewed]?: JsonObject[];
  [TableTab.Other]?: JsonObject[];
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
      width: 100%;
      position: relative;
      ${mq[1]} {
        margin: 0 2px;
      }
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
        margin: ${theme.gridUnit}px;
        line-height: ${theme.gridUnit * 3.5}px;
      }
    }
  `}
`;

export const LoadingCards = ({ cover }: { cover?: boolean }) => (
  <CardContainer showThumbnails={cover} className="loading-cards">
    {new Array(loadingCardCount).fill(null).map((_, idx) => (
      <ListViewCard key={idx} loading cover={cover ? false : <></>} description="" />
    ))}
  </CardContainer>
);

function Home({ user, addDangerToast }: WelcomeProps) {
  const canReadSavedQueries = userHasPermission(user, 'SavedQuery', 'can_read');
  const userId = user.userId!;
  const id = String(userId);
  const bootstrapData = getBootstrapData();

  const collapseState = getItem(LocalStorageKeys.HomepageCollapseState, []);
  const userKey = dangerouslyGetItemDoNotUse(id, null);
  const thumbnailsEnabled = isFeatureEnabled(FeatureFlag.Thumbnails);
  const defaultChecked = thumbnailsEnabled
    ? userKey?.thumbnails ?? true
    : false;

  const [checked, setChecked] = useState(defaultChecked);
  const [activeState, setActiveState] = useState<Array<string>>(collapseState);
  const [activeChild, setActiveChild] = useState('Loading');
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [chartData, setChartData] = useState<object[] | null>(null);
  const [dashboardData, setDashboardData] = useState<object[] | null>(null);
  const [queryData, setQueryData] = useState<object[] | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const [otherTabTitle, otherTabFilters] = useMemo(() => {
    const conf = bootstrapData.common?.conf;
    const lastTab = conf?.WELCOME_PAGE_LAST_TAB as WelcomePageLastTab;
    const [customTitle, customFilter] = Array.isArray(lastTab)
      ? lastTab
      : [undefined, undefined];
    if (customTitle && customFilter) return [t(customTitle), customFilter];
    if (lastTab === 'all') return [t('All'), []];
    return [t('Examples'), [{ col: 'created_by', opr: 'rel_o_m', value: 0 }]];
  }, []);

  const submenuExt = extensionsRegistry.get('home.submenu');
  const topExt = extensionsRegistry.get('welcome.banner');
  const msgExt = extensionsRegistry.get('welcome.message');
  const mainExt = extensionsRegistry.get('welcome.main.replacement');

  const handleCollapse = (state: string[]) => {
    setActiveState(state);
    setItem(LocalStorageKeys.HomepageCollapseState, state);
  };

  const handleToggle = () => {
    const next = !checked;
    setChecked(next);
    dangerouslySetItemDoNotUse(id, { thumbnails: next });
  };

  useEffect(() => {
    if (!otherTabFilters || mainExt) return;

    const activeTab = getItem(LocalStorageKeys.HomepageActivityFilter, null);
    setActiveState(collapseState.length > 0 ? collapseState : DEFAULT_TAB_ARR);

    getRecentActivityObjs(userId, `/api/v1/log/recent_activity/?q=${rison.encode({ page_size: 6 })}`, addDangerToast, otherTabFilters)
      .then(res => {
        const data: ActivityData = { [TableTab.Other]: res.other };
        if (res.viewed) {
          const viewed = reject(res.viewed, ['item_url', null]);
          data[TableTab.Viewed] = viewed;
          setActiveChild(activeTab ?? (viewed.length ? TableTab.Viewed : TableTab.Created));
        } else {
          setActiveChild(activeTab ?? TableTab.Created);
        }
        setActivityData(prev => ({ ...prev, ...data }));
      })
      .catch(
        createErrorHandler(errMsg => {
          setActivityData(prev => ({ ...prev, [TableTab.Viewed]: [] }));
          addDangerToast(t('There was an issue fetching your recent activity: %s', errMsg));
        })
      );

    const filters = [{ col: 'owners', opr: 'rel_m_m', value: 'self' }];
    const qBase = { page_size: 6, order_column: 'changed_on_delta_humanized', order_direction: 'desc', filters };

    Promise.all([
      SupersetClient.get({ endpoint: `/api/v1/dashboard/?q=${rison.encode(qBase)}` })
        .then(({ json }) => setDashboardData(json.result))
        .catch((err: Response) => {
          err.text?.().then(msg => addDangerToast(t('Dashboard fetch failed: %s', msg)));
          setDashboardData([]);
        }),

      SupersetClient.get({ endpoint: `/api/v1/chart/?q=${rison.encode(qBase)}` })
        .then(({ json }) => setChartData(json.result))
        .catch((err: Response) => {
          err.text?.().then(msg => addDangerToast(t('Chart fetch failed: %s', msg)));
          setChartData([]);
        }),

      canReadSavedQueries
        ? SupersetClient.get({
            endpoint: `/api/v1/saved_query/?q=${rison.encode({
              page_size: 6,
              order_column: 'changed_on_delta_humanized',
              order_direction: 'desc',
              filters: [{ col: 'created_by', opr: 'rel_o_m', value: id }],
            })}`,
          })
            .then(({ json }) => setQueryData(json.result))
            .catch((err: Response) => {
              err.text?.().then(msg => addDangerToast(t('Saved query fetch failed: %s', msg)));
              setQueryData([]);
            })
        : Promise.resolve(),
    ]).finally(() => setIsFetching(false));
  }, [otherTabFilters]);

  useEffect(() => {
    if (!collapseState && queryData?.length) {
      setActiveState(state => [...state, '4']);
    }
    setActivityData(data => ({
      ...data,
      Created: [
        ...(chartData?.slice(0, 3) || []),
        ...(dashboardData?.slice(0, 3) || []),
        ...(queryData?.slice(0, 3) || []),
      ],
    }));
  }, [chartData, dashboardData, queryData]);

  const menuData: SubMenuProps = {
    activeChild: 'Home',
    name: t('Home'),
    buttons: thumbnailsEnabled
      ? [
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
        ]
      : [],
  };

  const isRecentLoading = !activityData?.[TableTab.Other] && !activityData?.[TableTab.Viewed];

  return (
    <>
      {submenuExt ? <submenuExt {...menuData} /> : <SubMenu {...menuData} />}
      <WelcomeContainer>
        {msgExt && <msgExt />}
        {topExt && <topExt />}
        {mainExt && <mainExt />}
        {!mainExt && (
          <Collapse activeKey={activeState} onChange={handleCollapse} ghost bigger>
            <Collapse.Panel header={t('Recents')} key="1">
              {activityData && (activityData[TableTab.Viewed] || activityData[TableTab.Other] || activityData[TableTab.Created]) && activeChild !== 'Loading' ? (
                <ActivityTable
                  user={{ userId }}
                  activeChild={activeChild}
                  setActiveChild={setActiveChild}
                  activityData={activityData}
                  isFetchingActivityData={isFetching}
                />
              ) : (
                <LoadingCards />
              )}
            </Collapse.Panel>
            <Collapse.Panel header={t('Dashboards')} key="2">
              {!dashboardData || isRecentLoading ? (
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
              {!chartData || isRecentLoading ? (
                <LoadingCards cover={checked} />
              ) : (
                <ChartTable
                  user={user}
                  mine={chartData}
                  showThumbnails={checked}
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
                    user={user}
                    mine={queryData}
                    showThumbnails={checked}
                    featureFlag={thumbnailsEnabled}
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

export default withToasts(Home);
