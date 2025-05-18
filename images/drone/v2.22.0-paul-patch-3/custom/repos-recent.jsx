import React from 'react';
import PropTypes from 'prop-types';
import './repos-recent.scss';

import Button from 'components/shared/button';

export default function ReposRecent({ repos }) {
  return (
    <div className="repos-recent">
      {repos.map((repo) => (
        <div key={repo.uid} className="repo-card">
          <div className="repo-header">
            <div className="repo-meta">
              <span className="repo-owner">{repo.namespace}</span>
              <span className="repo-name">{repo.name}</span>
            </div>
            <div className="repo-action">
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
