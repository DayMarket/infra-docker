import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './repos-recent.module.scss';

import Button from 'components/shared/button';
import RepoBuild from 'components/shared/repo-build';

const cx = classNames.bind(styles);

export default function ReposRecent({ repos }) {
  return (
    <div className={cx('repos-recent')}>
      {repos.map((repo) => (
        <div key={repo.uid} className={cx('repo-card')}>
          <div className={cx('repo-header')}>
            <div className={cx('repo-meta')}>
              <span className={cx('repo-owner')}>{repo.namespace}</span>
              <span className={cx('repo-name')}>{repo.name}</span>
            </div>
            <div className={cx('repo-action')}>
              <Button href={`/${repo.slug}`}>Details</Button>
            </div>
          </div>
          <RepoBuild repo={repo} />
        </div>
      ))}
    </div>
  );
}

ReposRecent.propTypes = {
  repos: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    namespace: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    build: PropTypes.object,
  })).isRequired,
};
