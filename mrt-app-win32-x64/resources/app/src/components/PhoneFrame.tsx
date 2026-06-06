import React, { useMemo } from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  dynamicTime?: boolean;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, dynamicTime = true }) => {
  const timeString = useMemo(() => {
    if (!dynamicTime) return '4:05';

    const now = new Date();
    const hour12 = now.getHours() % 12 || 12;
    const minute = now.getMinutes().toString().padStart(2, '0');
    const amPm = now.getHours() >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${amPm}`;
  }, [dynamicTime]);

  return (
    <div
      style={{
        width: '420px',
        height: '880px',
        border: '1px solid black',
        borderRadius: '48px',
        padding: '10px',
        backgroundColor: '#333',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Status bar */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '30px',
        color: 'black',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
      }}>
        {timeString}
      </div>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '20px',
        color: 'black',
        fontSize: '10px',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      }}>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '8px',
        backgroundColor: 'black',
        borderRadius: '50px',
        zIndex: 999,
      }} />

      {/* Infographic */}
      <div
        id="infographic"
        style={{
          backgroundColor: 'white',
          borderRadius: '36px',
          padding: '5px 0px',
          overflowY: 'hidden',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;
