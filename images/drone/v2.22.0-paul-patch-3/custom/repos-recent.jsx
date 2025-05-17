// custom/repos-recent.jsx

import React from 'react';
import timeago from 'timeago.js';

export default function ReposRecent({ repos }) {
  return (
    <div className="recent-repos">
      <h2 className="recent-repos-title">Recent Repositories</h2>
      <ul className="recent-repos-list">
        {repos.map(repo => (
          <li key={repo.slug} className="recent-repos-item">
            <a href={`/${repo.slug}`} className="recent-repos-link">
              {repo.name}
              {' '}
              ({repo.build.status})
            </a>
            <span className="recent-repos-meta">
              {repo.build.event} — {timeago().format(repo.updated)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
