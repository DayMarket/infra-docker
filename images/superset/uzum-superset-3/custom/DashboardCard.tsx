/**
 * UZUM CUSTOM: DashboardCard with placeholder support
 */
import React from 'react';

type DashboardCardProps = {
  dashboard: {
    id: number;
    dashboard_title: string;
    thumbnail_url?: string;
  };
  url: string;
  title: string;
  thumbnailUrl?: string;
  altText?: string;
  fallbackContent?: React.ReactNode;
};

export default function DashboardCard({
  dashboard,
  url,
  title,
  thumbnailUrl,
  altText = 'Превью недоступно',
  fallbackContent,
}: DashboardCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <a
      href={url}
      style={{
        display: 'block',
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '8px',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#fafafa',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '120px',
          backgroundColor: '#f0f0f0',
          border: '1px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      >
        {thumbnailUrl && !imgError ? (
          <img
            src={thumbnailUrl}
            alt={altText}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          fallbackContent || (
            <span
              style={{
                fontStyle: 'italic',
                color: '#999',
                fontSize: '12px',
              }}
            >
              {altText}
            </span>
          )
        )}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={title}
      >
        {title}
      </div>
    </a>
  );
}
