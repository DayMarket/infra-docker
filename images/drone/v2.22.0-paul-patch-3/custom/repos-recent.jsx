import React from 'react';

export default function ReposRecent({ repos }) {
  return (
    <div className="recent-repos">
      {repos.length === 0 ? (
        <p>No recent repositories.</p>
      ) : (
        <ul className="repo-list">
          {repos.map(repo => (
            <li key={repo.id} className="repo-item">
              <div className="repo-name">
                <a href={`/${repo.namespace}/${repo.name}`}>
                  {repo.namespace}
                  {' / '}
                  {repo.name}
                </a>
              </div>
              <div className="repo-meta">
                {repo.build ? (
                  <>
                    {'Last build: #'}
                    {repo.build.number}
                    {' ('}
                    {repo.build.status}
                    {')'}
                  </>
                ) : (
                  'No recent builds'
                )}
                {' — '}
                <span>Updated:</span>
                {' '}
                {new Date(repo.last_activity_at || repo.updated).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
