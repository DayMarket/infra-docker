import classNames from 'classnames/bind';
import InfiniteScroll from 'react-infinite-scroll-component';
import React, { 
  useEffect, 
  useState, 
  useMemo, 
  useContext 
} from 'react';
import Repos from 'components/pages/home/repos';
import ReposRecent from 'components/pages/home/repos-recent';
import Button from 'components/shared/button';
import Input from 'components/shared/form/input';
import Select from 'components/shared/form/select';
import Switch from 'components/shared/switch';
import ZeroState from 'components/shared/zero-state';
import { AppContext } from 'context';
import { useLocalStorage, useCustomTitle, useToast } from 'hooks';
import { useStore } from 'hooks/store';
import { useViewer, useSyncAccount } from 'hooks/swr';
import { byBuildCreatedAtDesc } from 'utils';

import styles from './home.module.scss';

const cx = classNames.bind(styles);

const REPOS_CHUNK_SIZE = 20;

export default function Home() {
  const [context, setContext] = useContext(AppContext);
  const [isActiveOnly] = useState(true);
  const [shouldStartSync, setShouldStartSync] = useState(context.isAccSyncing);
  const { showError } = useToast();
  const { hasSyncReqFiredOff, isError: syncError } = useSyncAccount(shouldStartSync);
  const { isSynced, isSyncing, isError: viewerError } = useViewer({ withPolling: hasSyncReqFiredOff });

  const { 
    repos, 
    error, 
    reload, 
    reloadOnce 
  } = useStore();
  const data = repos ? Object.values(repos) : undefined;
  const isLoading = !data && !error;

  const [itemsToShow, setItemsToShow] = useState(REPOS_CHUNK_SIZE);
  const [filter, setFilter] = useState('');

  useEffect(() => reloadOnce(), [reloadOnce]);
  useCustomTitle();

  const filtered = useMemo(
    () => data?.filter(repo => (isActiveOnly ? repo.active : true))
      .filter(repo => repo.slug.includes(filter)) ?? [],
    [data, isActiveOnly, filter],
  );

  const recent = useMemo(
    () => data?.slice(0).sort(byBuildCreatedAtDesc).filter(repo => repo.build).slice(0, 6) ?? [],
    [data],
  );

  useEffect(() => {
    if (syncError || viewerError) {
      setContext({ ...context, isAccSyncing: false });
      showError('Sync error has occurred, please, try again');
      console.error('Sync error:', syncError?.message || viewerError?.message); // eslint-disable-line no-console
    }
  }, [syncError, viewerError, showError, context, setContext]);

  useEffect(() => {
    if (isSynced) {
      setShouldStartSync(false);
      reload();
      if (context.isAccSyncing) {
        setContext({ ...context, isAccSyncing: false });
      }
    }
  }, [isSynced, context, setContext, reload]);

  const handleSyncClick = () => setShouldStartSync(true);

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + REPOS_CHUNK_SIZE);
  };

  const handleFilter = (e) => setFilter(e.target.value.trim());

  return (
    <>
      <header className={cx('header')}>
        <h1>Dashboard</h1>
        <button
          type="button"
          className={cx('btn', 'btn-sync')}
          disabled={isSyncing || hasSyncReqFiredOff}
          onClick={handleSyncClick}
        >
          {(isSyncing || hasSyncReqFiredOff) && (
            <span className={cx('btn-sync-spinner')} />
          )}
          {(isSyncing || hasSyncReqFiredOff) ? 'Syncing' : 'Sync'}
        </button>
      </header>
      <section className={cx('wrapper')}>
        {!!recent.length && (
          <>
            <h2 className={cx('section-title', 'section-title-recent')}>Recent Activity</h2>
            <ReposRecent repos={recent} />
          </>
        )}
        <div className={cx('subheader')}>
          <h2 className={cx('section-title')}>Repositories</h2>
          <div className={cx('actions')}>
            <Switch
              id="active-switch"
              checked={isActiveOnly}
              onChange={() => {}}
            >
              Active Only
            </Switch>
            <Input
              placeholder="Filter …"
              icon="search"
              className={cx('search')}
              width={300}
              name="repo-search"
              onChange={handleFilter}
            />
          </div>
        </div>
        {isLoading ? null : filtered.length === 0 ? (
          <ZeroState
            title="No Repositories Found"
            message="No repositories match your criteria."
          />
        ) : (
          <InfiniteScroll
            dataLength={Math.min(itemsToShow, filtered.length)}
            next={handleLoadMore}
            hasMore={itemsToShow < filtered.length}
            loader={<h4 className={cx('loader')}>Loading more...</h4>}
          >
            <Repos repos={filtered.slice(0, itemsToShow)} />
          </InfiniteScroll>
        )}
      </section>
    </>
  );
}
