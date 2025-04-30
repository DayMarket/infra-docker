import React, { useEffect, useState } from 'react';
import { styled } from '@superset-ui/core';

interface Props {
  url?: string;
  alt?: string;
}

const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  border-radius: ${({ theme }) => theme.gridUnit}px;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const FallbackIcon = styled.div`
  font-size: 28px;
  color: #ccc;
`;

const DashboardThumbnail: React.FC<Props> = ({ url, alt = 'Dashboard thumbnail' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url || hasError) {
    return (
      <ThumbnailWrapper>
        <FallbackIcon>📄</FallbackIcon>
      </ThumbnailWrapper>
    );
  }

  return (
    <ThumbnailWrapper>
      <StyledImage
        src={url}
        alt={alt}
        onError={e => {
          console.warn('DashboardThumbnail failed to load:', url, e);
          setHasError(true);
        }}
      />
    </ThumbnailWrapper>
  );
};

export default DashboardThumbnail;
