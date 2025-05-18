import React from 'react';
import { format } from 'timeago.js';
import classNames from 'classnames/bind';
import styles from './repos-recent.module.scss';

const cx = classNames.bind(styles);

export default function ReposRecent({ repos }) {
  return (
    <div className={cx('recent-repos')}>
      <h2 className={cx('recent-repos-title')}>Recent Repositories</h2>
      <ul className={cx('recent-repos-list')}>
        {repos.map(repo => (
          <li key={repo.slug} className={cx('recent-repos-item')}>
            <a href={`/${repo.slug}`} className={cx('recent-repos-link')}>
              {repo.name}
            </a>
            <div className={cx('recent-repos-meta')}>
              {repo.build ? (
                <>
                  <span>Last build:</span>
                  <span> </span>
                  <span>#</span>
                  <span>{repo.build.number}</span>
                  <span> </span>
                  <span>(</span>
                  <span>{repo.build.status}</span>
                  <span>)</span>
                </>
              ) : (
                <span>No recent builds</span>
              )}
              <span> </span>
              <span>—</span>
              <span> </span>
              <span>{format(repo.updated)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
