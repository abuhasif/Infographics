import React from 'react';
import disruptiontrainIcon from '../assets/icons/train.png';
import delaytrainIcon from '../assets/icons/delaytrain.jpeg';
import { useLocation } from 'react-router-dom';


type HeaderProps = {
  type: string;
  from: string;
  to: string;
  time?: string; // optional override
  date?: string; // optional override
};

const formatNow = (d: Date) => {
  const hour12 = d.getHours() % 12 || 12;
  const minute = d.getMinutes().toString().padStart(2, '0');
  const amPm = d.getHours() >= 12 ? 'PM' : 'AM';
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  return {
    time: `${hour12}:${minute} ${amPm}`,
    date: `${day} ${month} ${year}`,
  };
};

const Header: React.FC<HeaderProps> = ({ type, from, to, time, date }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const urlTime = params.get('time') ?? undefined;

  const isDelay = type === 'Delay';

  // Internal ticking time only if no explicit overrides are provided
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    if (time || date) return; // props are controlling the display; don't tick
    const id = setInterval(() => setNow(new Date()), 30_000); // update every 30s
    return () => clearInterval(id);
  }, [time, date]);

  const { time: fallbackTime, date: fallbackDate } = React.useMemo(
    () => formatNow(now),
    [now]
  );

  const displayTime = time ?? urlTime ?? fallbackTime;
  const displayDate = date ?? fallbackDate;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          backgroundColor: '#FFC72C',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={isDelay ? delaytrainIcon : disruptiontrainIcon}
          alt="Train Notice Icon"
          width={80}
          height={80}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '28px' }}>
            {isDelay ? 'TRAIN DELAY' : 'TRAIN DISRUPTION'}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
            {isDelay ? 'Additional travel time between' : 'No train service between'}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {from} and {to}
          </div>

          {/* Right-aligned timestamp */}
          <div
            style={{
              fontSize: '12px',
              marginTop: '5px',
              marginRight: '-8px',
              opacity: 0.9,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            As at {displayTime} on {displayDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
