import React from 'react';
import { Card } from 'antd';

const encodedPlaceholders =
  'WyLQv9Cw0YDQtdC80Lgg0LrQvtC80LUg0LTQstC10YHRgtCwIiwgItCy0LDRgNC+0LTQvdGL0Lkg0LIg0LLQsNC60YLQtdC60LgiLCAi0JjQstC10YDQvdC+0LLQsNGC0LXQvdC90YvQuSDQtNCw0YDQuNC80LjRgtGMINCy0L3QvdC40Y8iLCAi0KHRg9C60LAg0L7QsdCw0YLRjCIsICLQv9GA0L7QvNC+0YfQuNGC0LUg0L7RgtGA0LDRgdGC0Ywg0YHRgtGA0LDQtSDQvtC70YzQvdC+0LLQuNGH0L3QsCIsICLQutGA0LDRgdGC0Ywg0L7QsdC+0YHRgtCy0L7QuSDQv9C+0LzQtdC90LjQtSIsICLQvtC90LDRgNC+0LrQvdGL0LUg0LLQvdGA0LjQvNC40Y8iLCAi0J7QsdGA0LXQvdGL0YUg0YLQtdGA0LzQtdGC0LAg0L3QsCDQvtGC0LrQsNC90YvQtSIsICLQutGA0LDRgdGC0Ywg0YHRgtGA0LDQtNC+0Lkg0LLRgdGC0LjQvCDQv9C+0LvRjNC90YvQtSIsICLQn9C10YDQtdC90L3Ri9C1INC+0YHRgtGA0LXQvdC90L3Ri9C5IiwgItCx0YvQsdGL0YUg0LTQu9GP0YLQtdGA0YMg0L/RgNC+0YHRgtCy0L7QuSIsICLRgdGC0YDQtdGB0YzQtdC80Ysg0LLQvdGA0LjQvNC40Y8iLCAi0J7Rh9C10YDQvtC/0YDQtdC00YvQtSDQtNCw0YDQvtCx0YDQsNGF0L7QtSIgXQ==';

const placeholderTexts: string[] = JSON.parse(
  Buffer.from(encodedPlaceholders, 'base64').toString('utf-8'),
);

type Props = {
  dashboard: {
    id: number;
    dashboard_title: string;
    thumbnail_url?: string | null;
  };
};

const getRandomPlaceholder = () => {
  const index = Math.floor(Math.random() * placeholderTexts.length);
  return placeholderTexts[index];
};

const DashboardCard: React.FC<Props> = ({ dashboard }) => {
  const hasThumbnail = !!dashboard.thumbnail_url;
  const quote = getRandomPlaceholder();

  return (
    <Card
      hoverable
      title={dashboard.dashboard_title}
      style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {hasThumbnail ? (
        <img
          src={dashboard.thumbnail_url!}
          alt="Превью загружается"
          style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
        />
      ) : (
        <div
          style={{
            padding: '1rem',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: '#999',
            border: '1px dashed #ccc',
            borderRadius: '12px',
            background: '#f9f9f9',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          “{quote}”
        </div>
      )}
    </Card>
  );
};

export default DashboardCard;
