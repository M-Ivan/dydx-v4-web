import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { STRING_KEYS } from '@/constants/localization';

import { useStringGetter } from '@/hooks/useStringGetter';

const LAST_UPDATED_REFRESH_MS = 60000; // 60 seconds
// Styled component for the container
const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  font-family: 'Inter', sans-serif;
`;

interface IProps {
  lastUpdatedDate: Date;
}

const LastUpdated = ({ lastUpdatedDate }: IProps) => {
  const stringGetter = useStringGetter();

  // State to hold the current time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update the current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, LAST_UPDATED_REFRESH_MS); // Update every 60 seconds

    return () => clearInterval(timer); // Cleanup the timer
  }, []);

  function timeAgo(currentDate: Date, timestamp: Date): string {
    const diffInSeconds = Math.floor((currentDate.getTime() - timestamp.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (diffInSeconds === 3600) {
      return stringGetter({ key: STRING_KEYS['1_HOUR_AGO'] });
    }
    if (diffInSeconds === 86400) return stringGetter({ key: STRING_KEYS['1_DAY_AGO'] });
    if (diffInSeconds === 60) {
      return stringGetter({ key: STRING_KEYS['1_MIN_AGO'] });
    }

    if (diffInSeconds < 60) {
      return 'updated just now';
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);

      return stringGetter({
        key: STRING_KEYS.X_MIN_AGO,
        params: {
          X: rtf.format(-minutes, 'minute'),
        },
      });
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);

      return stringGetter({
        key: STRING_KEYS.X_HOUR_AGO,
        params: {
          X: rtf.format(-hours, 'hour'),
        },
      });
    }

    const days = Math.floor(diffInSeconds / 86400);

    if (days == 1) {
      return stringGetter({ key: STRING_KEYS['1_DAY_AGO'] });
    }

    return stringGetter({
      key: STRING_KEYS.X_DAY_AGO,
      params: {
        X: rtf.format(-days, 'day'),
      },
    });
  }

  return (
    <Container>
      <span className="text-color-text-1">
        {stringGetter({ key: STRING_KEYS.UPDATED })} {timeAgo(currentTime, lastUpdatedDate)}
      </span>
    </Container>
  );
};

export default LastUpdated;
