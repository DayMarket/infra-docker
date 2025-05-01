import React from 'react';
import { Card } from 'antd';
import { styled } from '@superset-ui/core';
import { DashboardInfo } from 'src/views/DashboardList/types';
import Icons from 'src/components/Icons';

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PreviewWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background-color: #f0f0f0;
  border: 1px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #888;
  font-style: italic;
  text-align: center;
  line-height: 1.4;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: white;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
`;

// base64-закодированный массив шуток
const base64 = "WyJQcmV2aXUgYnVkZXQgdSBzbmFja2JvdGUiLCJVdHJvbSBkYXR5bmllIC0gdmVjaGVyYW0gZGFzaGJvcmR5IiwidmFjYW50aSBhcHBsaWVkIC0gc2hvcnRseSIsIkRhdGEgbm90IGZvdW5kIC0gcGFuaWMiLCJTY29ybwptb3RoZXIgd2lsbCBmaW4gaXQiLCJDb21pbmcgc29vbjogKiouKiIsIlJldmlld3MgaW4gcHJvZ3Jlc3MiLCJEYXNoYm9hcmQgaW4gcHJlcCIsIlJlcG9ydHMgdW5kZXIgY29uc3RydWN0aW9uIiwid2lsbCBiZSBhZGRlZCBsYXRlciIsIkNvZGUgaW4gdHJhaW5pbmciLCJHb2luZyBsaXZlOiBsb2FkaW5nIiwic2F2ZWQgdG8gZHJpdmUiLCJEYXRhIHRyaWFuZ2xlIHN0YXJ0ZWQiXQ==";

let fallback = 'Превью в процессе обработки';
let phrases: string[] = [];

try {
  const decoded = atob(base64);
  phrases = JSON.parse(decoded);
} catch {
  phrases = [fallback];
}

const getRandomPlaceholder = () => {
  return phrases[Math.floor(Math.random() * phrases.length)] || fallback;
};

interface Props {
  dashboard: DashboardInfo;
}

export default function DashboardCard({ dashboard }: Props) {
  const { dashboard_title, thumbnail_url } = dashboard;
  const placeholder = getRandomPlaceholder();

  return (
    <CardContainer>
      <Card title={dashboard_title} hoverable>
        <PreviewWrapper>
          {thumbnail_url ? (
            <PreviewImage
              src={thumbnail_url}
              alt="Превью в процессе обработки"
            />
          ) : (
            <PlaceholderText>{`“${placeholder}”`}</PlaceholderText>
          )}
        </PreviewWrapper>
      </Card>
    </CardContainer>
  );
}
