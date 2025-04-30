import React, { useState } from 'react';

interface Props {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

const DashboardThumbnail: React.FC<Props> = ({
  src,
  alt = 'Dashboard thumbnail',
  width = 100,
  height = 60,
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#ddd',
          borderRadius: 4,
        }}
        title="No preview available"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={() => setError(true)}
      style={{
        objectFit: 'cover',
        borderRadius: 4,
        display: 'block',
      }}
    />
  );
};

export default DashboardThumbnail;
