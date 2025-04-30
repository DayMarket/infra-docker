import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

interface Props {
  url: string;
}

const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FallbackIcon = styled.div`
  font-size: 24px;
  color: #999;
`;

const DashboardThumbnail: React.FC<Props> = ({ url }) => {
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
          onError={e => {
            console.error('Error loading thumbnail:', e);
            setHasError(true);
          }}
          onLoad={() => setLoaded(true)}
          alt="Dashboard thumbnail"
        />
      ) : (
        <FallbackIcon>📄</FallbackIcon>
      )}
    </ThumbnailWrapper>
  );
};

export default DashboardThumbnail;
