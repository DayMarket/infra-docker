import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

interface Props {
  url: string;
  alt?: string;
}

const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 140px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Fallback = styled.div`
  font-size: 24px;
  color: #999;
`;

const DashboardThumbnail: React.FC<Props> = ({ url, alt = 'Dashboard thumbnail' }) => {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setLoaded(false);
  }, [url]);

  return (
    <ThumbnailWrapper>
      {!hasError && url ? (
        <StyledImage
          src={url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <Fallback>📄</Fallback>
      )}
    </ThumbnailWrapper>
  );
};

export default DashboardThumbnail;
