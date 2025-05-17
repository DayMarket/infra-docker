import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const ReposRecent = ({ repos, fetchNextPage, hasMore }) => (
  <div style={{ padding: '1rem' }}>
    <h3 style={{ marginBottom: '1rem' }}>Recent Repositories</h3>
    <InfiniteScroll
      dataLength={repos.length}
      next={fetchNextPage}
      hasMore={hasMore}
      loader={<p>Loading...</p>}
      scrollableTarget="scroll-container"
    >
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {repos.map(repo => (
          <li
            key={repo.id}
            style={{
              marginBottom: '1rem',
              borderBottom: '1px solid #ccc',
              paddingBottom: '0.5rem',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {repo.owner}
              {' / '}
              {repo.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {repo.build ? (
                <>
                  Last build: #
                  {repo.build.number}
                  {' '}
                  (
                  {repo.build.status}
                  )
                </>
              ) : (
                <>No recent builds</>
              )}
              <span>{' — '}</span>
              <span>Updated:</span>
              {' '}
              {new Date(repo.last_activity_at || repo.updated).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  </div>
);

export default ReposRecent;
