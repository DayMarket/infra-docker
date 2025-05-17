import React from 'react';
import PropTypes from 'prop-types';
import styles from './repos-recent.module.scss';

export default function ReposRecent({ repos }) {
  return (
    <div className={styles.reposList}>
      {repos.map(repo => (
        <div key={repo.uid} className={styles.repoItem}>
          <div className={styles.repoName}>
            <a href={`/${repo.slug}`} target="_blank" rel="noopener noreferrer">
              {repo.slug}
            </a>
          </div>
          <div className={styles.repoMeta}>
            <div>
              {repo.build
                ? `Last build: #${repo.build.number} (${repo.build.status})`
                : 'No recent builds'}
            </div>
            <div>
              <span>Updated: </span>
              <span>{new Date(repo.last_activity_at || repo.updated).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

ReposRecent.propTypes = {
  repos: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    build: PropTypes.shape({
      number: PropTypes.number,
      status: PropTypes.string,
    }),
    last_activity_at: PropTypes.string,
    updated: PropTypes.string,
  })).isRequired,
};
