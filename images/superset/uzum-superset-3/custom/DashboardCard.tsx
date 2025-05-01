import React from 'react';
import { t } from '@superset-ui/core';
import { Card as AntCard } from 'antd';
import { styled } from '@superset-ui/core';

export interface DashboardCardProps {
  title: string;
  url: string;
  thumbnail_url?: string;
}

const StyledCard = styled.div`
  width: 100%;
  .ant-card {
    height: 100%;
  }
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 150px;
    background: #f0f0f0;
    border: 1px dashed #ccc;
    border-radius: 4px;
    font-size: 12px;
    padding: 10px;
    position: relative;
  }
  .quote {
    position: relative;
    font-style: italic;
    line-height: 1.4;
  }
  .quote:before,
  .quote:after {
    content: '"';
    font-size: 24px;
    position: absolute;
    color: #999;
  }
  .quote:before {
    left: -10px;
    top: -10px;
  }
  .quote:after {
    right: -10px;
    bottom: -10px;
  }
`;

const phrases = [
  "0J/RgNC40LLQtdGCLCDQv9C+0LrQvtC70YzRidC1INC/0L7QtNC+0L3QvdC+0LLQtdGA0LDRgtGM0LrQuNC5",
  "0JfQsNCz0L7QstC40Y8g0YLQtdC80LXQvdC90YvRhQ==",
  "0JzQsNC60LDQvNC+0L3QvdC+0LLQviDRg9C/0LjRgtC+",
  "0JHQtdGC0YDQvtCz0L4g0LfQsNC60L7QtNC90LjQuQ==",
  "0JrQuNC10L3QtdGB0YLQstCw0YLRjNGB0Y8g0L/QvtC00L7QvdC+0LLQtdGA",
  "0JrQvtCz0L7RgNC80YPRgA==",
  "0JrQsNC30LAg0YPRgNCw0LLQvdC10YHRgtCy0LjRgtGMINCyINC/0L7QtNC90LjRjy4=",
  "0JfQsNCy0LXRgNC+0L3QvdGL0YUg0L/RgNC+0LTQsNC90LjQtQ==",
  "0KHQvtC/0L7QvNC10L3QsCDRgNC+0LHRgNC40YHRjA==",
  "0KHRgtC+0YDQvtC00LXRgNGB0Y8g0L/QvtC00LzQtdGA",
  "0J/QtdGA0LjQvdGB0YLQuNC1INC/0L7QtNC90LjQtQ==",
  "0JzQsNGA0YHRgtCy0YDQvtCz0L4g0LLRi9C/0LXRgtGA",
  "0JLQtdGA0YDQtdGB0LrQuCDQv9C+0LTQvtC90L7QstCw",
  "0JrQvtC30LAg0LLQtdGA0L7QtNC+0LzQvdCw",
  "0JrQsNGD0YHRgtCw0L3QuNGC0Ywg0L/RgNC+0LTQvNC10YAg0YfQtdGA",
  "0JPQttC10YIg0Y/RgNC+0LLQtdGA0YHRjCDQvNC10YLRgNCw",
  "0KfQtdGA0LjQu9GM0YHRjCDQt9Cw0L3QviDQv9C+0LTQvdC40L0=",
  "0JPQsNCz0L7Qs9GA0YHRjyDQvNC10L3QuNC1",
  "0JLQtdGA0LjQu9GM0YHRjyDQvNCw0L3QvdC+",
  "0J7QsNC60L7Qu9GM0YHRjyDQv9C+0LTQvtC90YvQuSDRgdC+0LrRgNCw",
  "0JrRg9C30YvQvNC+INC30LDRgdGC0YHRjyDQv9C+0LTQvtC90YvQuQ==",
  "0JrQsNC60YLQvtC8INGA0LXQvdC40L3QsNGPINGA0LDQvNCw",
  "0JrQsNC30LAg0L7QsdC+0LrQvtCz0L4g0YDQtdC00LXQuQ==",
  "0JrQsNCy0LTRgNCw0L3QvdC+INGA0LDQvNCw",
  "0J/QtdC80LXRgNCw0YLRjNGB0Y8g0L7RgtC/0YDQsNC90L3Ri9C5",
  "0JLQtdC/0L7RgdGC0Ywg0LfQsNC80LXRgtCw",
  "0KHQtdC90YLRjCDQv9GA0L7QtNC90L7QstGL",
  "0JzQsNC60YHRjCDRgNC10LTQtdGA0L3QsA==",
  "0JLQsNC70YzQvdC+INC00LXRgNC+0LLQtdGA",
  "0JrQsNC60YLQtdGA0L3QuNC1INC00LXRgNC+0LLQvtC8",
  "0J/QsNGA0LDQvdC40YHRgtCy0LDRjtGC0LXQvQ==",
  "0JfQsNC70L7RgtC+0LLQtdGA0LDRgtGMINCyINC40LzQvdCw",
  "0KHQsNGA0LDQvdC40YHRgtCy0LjRgtGMINGA0LDQvNCw",
  "0JLQsNC90YPRgiDQv9GA0L7QtNC90L7QstCw",
  "0KHQtdGB0L7QstC+0YHRgtCy0Ywg0L/QvtC00L3QsA==",
  "0JzQvtC+0L3QvtCy0L7QtNC+0LzQvdCw",
  "0JzQsNGC0LXQvdC40LUg0L/QvtC00LzQtdC90LjRjw==",
  "0J/QtdGA0LDRgtC10YDQtdC90YvQtQ==",
  "0KHQvtC+0LzQtdC90LjQvdCw0LrQuNC5",
  "0JzQsNC60YLQtdGA0L3QuNGPINGC0LXQvdC+0YHRjCDQvdCw",
  "0JzQsNC60Lgg0LLQtdGA0L3QsCDQvNC10L3QuNC1",
  "0JrQvtGC0LXRgNCw0YLRjCDQvdC+0YHRgtCw",
  "0JLQtdC70YzQvdC+0LLQviDQv9C+0LTQvdC40Y8=",
  "0KHQtdGA0LXQvdC40LzQvtC5",
  "0JzQsNCy0L7QttC10YIg0LzQvtC60YHRjNC60LjQvQ==",
  "0JzQsNC30LAg0LTQtdGA0L7QstC+0YHRjA==",
  "0JzQsNCy0LTRgNC+0LLQtdGA0YHRjyDQtNC10YDQvtCy0L7RgdGMINCy0LXRgNCw0L3QvdC+",
  "0JLQsNC90LjRgtC+0YHRjyDQvNCw0L3QvdGL0Lkg0L7QsdC+0YHRjA==",
  "0KHQsNGD0YHRjCDRgtC10YHRjNC60LAg0YHRgtGA0LjRgtCw0Y8=",
  "0JrQsNCy0LDRgNC40YHRjCDRgNC10LzQtdC90LjRjw==",
  "0KHQsNC+0LzQtdC90LjQvdCw0LrQuNC5",
  "0JfQsNGA0LDQvdC40YHRjCDRgdGC0YPQvNC1"
];

const getRandomPhrase = (): string => {
  try {
    const index = Math.floor(Math.random() * phrases.length);
    return decodeURIComponent(escape(window.atob(phrases[index])));
  } catch {
    return t('Превью недоступно');
  }
};

export const DashboardCard = ({ title, url, thumbnail_url }: DashboardCardProps) => (
  <StyledCard>
    <a href={url} title={title}>
      <AntCard
        hoverable
        cover={
          thumbnail_url ? (
            <img src={thumbnail_url} alt="" />
          ) : (
            <div className="placeholder">
              <div className="quote">{getRandomPhrase()}</div>
            </div>
          )
        }
      >
        <AntCard.Meta title={title} />
      </AntCard>
    </a>
  </StyledCard>
);

export default DashboardCard;
