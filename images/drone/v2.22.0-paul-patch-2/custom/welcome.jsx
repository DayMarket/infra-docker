import classNames from 'classnames/bind';
import React, {
  useEffect, useState, useMemo, useContext,
} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import ReposRecent from 'components/pages/home/repos-recent';
import Input from 'components/shared/form/input';
import ZeroState from 'components/shared/zero-state';
import { AppContext } from 'context';
import { useCustomTitle, useToast } from 'hooks';
import { useStore } from 'hooks/store';
import { useViewer, useSyncAccount } from 'hooks/swr';
import { byBuildCreatedAtDesc } from 'utils';

import styles from './welcome.module.scss';

const cx = classNames.bind(styles);

const CHUNK_SIZE = 20;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export default function Welcome() {
  const [context, setContext] = useContext(AppContext);
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

  const [itemsToShow, setItemsToShow] = useState(CHUNK_SIZE);
  const [filter, setFilter] = useState('');

  useEffect(() => reloadOnce(), [reloadOnce]);
  useCustomTitle();

  const filtered = useMemo(() => {
    const now = Date.now();
    return (
      data?.filter(repo => {
        const activeWithin2h = repo.last_activity_at
          ? new Date(repo.last_activity_at).getTime() >= now - TWO_HOURS_MS
          : false;
        return (repo.build || activeWithin2h) && repo.slug.includes(filter);
      }) ?? []
    );
  }, [data, filter]);

  const sorted = useMemo(() => {
    return filtered.slice().sort(byBuildCreatedAtDesc).slice(0, itemsToShow);
  }, [filtered, itemsToShow]);
  

  useEffect(() => {
    if (syncError || viewerError) {
      setContext({ ...context, isAccSyncing: false });
      showError('Sync error has occurred, please, try again');
      console.error(
        'Sync error:',
        syncError?.message || viewerError?.message,
      ); // eslint-disable-line no-console
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
    setItemsToShow(prev => prev + CHUNK_SIZE);
  };
  const handleFilter = e => setFilter(e.target.value.trim());

  return (
    <>
      <header className={cx('header')}>
        <h1>Recent Builds</h1>
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
        <div className={cx('subheader')}>
          <h2 className={cx('section-title')}>Activity</h2>
          <div className={cx('actions')}>
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
        {isLoading ? null : sorted.length === 0 ? (
          <ZeroState
            title="No Recent Activity"
            message="No repositories with builds or recent activity match your criteria."
          />
        ) : (
          <InfiniteScroll
            dataLength={sorted.length}
            next={handleLoadMore}
            hasMore={itemsToShow < filtered.length}
            loader={<h4 className={cx('loader')}>Loading more...</h4>}
          >
            <ReposRecent repos={sorted} />
          </InfiniteScroll>
        )}
      </section>
    </>
  );
}
