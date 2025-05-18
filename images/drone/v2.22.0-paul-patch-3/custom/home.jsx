import classNames from 'classnames/bind';
import React, {
  useEffect, useState, useMemo, useContext,
} from 'react';

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

export default function Home() {
  const [context, setContext] = useContext(AppContext);
  const [shouldStartSync, setShouldStartSync] = useState(context.isAccSyncing);
  const { showError } = useToast();
  const { hasSyncReqFiredOff, isError: syncError } = useSyncAccount(shouldStartSync);
  const { isSynced, isSyncing, isError: viewerError } = useViewer({ withPolling: hasSyncReqFiredOff });

  const {
    repos, error, reload, reloadOnce,
  } = useStore();
  const data = repos ? Object.values(repos) : undefined;
  const isLoading = !data && !error;

  useEffect(() => reloadOnce(), [reloadOnce]);
  useCustomTitle();

  const recent = useMemo(
    () => data?.slice(0).sort(byBuildCreatedAtDesc).filter((repo) => !!repo.build) ?? [],
    [data],
  );

  useEffect(() => {
    if (syncError || viewerError) {
      setContext({ ...context, isAccSyncing: false });
      showError('Sync error has occurred, please, try again');
      console.error('Sync error:', syncError?.message || viewerError?.message); // eslint-disable-line no-console
    }
  }, [syncError, viewerError]);

  useEffect(() => {
    if (isSynced) {
      setShouldStartSync(false);
      reload();
      if (context.isAccSyncing) {
        setContext({ ...context, isAccSyncing: false });
      }
    }
  }, [isSynced]);

  const handleSyncClick = () => setShouldStartSync(true);

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
        {!!recent.length ? (
          <>
            <h2 className={cx('section-title', 'section-title-recent')}>Recent Activity</h2>
            <ReposRecent repos={recent} />
          </>
        ) : !isLoading ? (
          <ZeroState
            title="No Recent Builds"
            message="No repositories with recent builds found."
          />
        ) : null}
      </section>
    </>
  );
}
