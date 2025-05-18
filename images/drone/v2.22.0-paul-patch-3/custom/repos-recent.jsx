import classNames from 'classnames/bind';
import React from 'react';

import Avatar from 'components/shared/avatar';
import Elapsed from 'components/shared/elapsed';
import Status from 'components/shared/status';
import ZeroState from 'components/shared/zero-state';
import { buildLink } from 'components/shared/utils';
import { useSortedRepos } from 'hooks';

import styles from './repos-recent.module.scss';

const cx = classNames.bind(styles);

export default function ReposRecent({ repos }) {
  const sorted = useSortedRepos(repos);

  if (!sorted || sorted.length === 0) {
    return (
      <ZeroState
        title="No Recent Builds"
        message="There are no repositories with recent build activity."
      />
    );
  }

  return (
    <div className={cx('recent')}>
      {sorted.map((repo) => {
        const { namespace, name, build } = repo;
        const path = buildLink(repo);

        return (
          <a href={path} className={cx('item')} key={`${namespace}/${name}`}>
            <div className={cx('header')}>
              <div className={cx('avatar')}>
                <Avatar user={build.author} size="medium" />
              </div>
              <div className={cx('meta')}>
                <h3 className={cx('title')}>
                  {namespace} / <strong>{name}</strong>
                </h3>
                <div className={cx('commit')}>
                  {build.message || 'No commit message'}
                </div>
              </div>
            </div>
            <div className={cx('info')}>
              <Status status={build.status} />
              <Elapsed time={build.started} />
            </div>
          </a>
        );
      })}
    </div>
  );
}
