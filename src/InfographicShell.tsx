// InfographicShell.tsx
import React from 'react';
import { useAutoExport } from './useAutoExport';

export const InfographicShell: React.FC<{
  filename?: string;
  selectorId?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ filename = 'infographic.png', selectorId = 'infographic', className, style, children }) => {
  useAutoExport(`#${selectorId}`, filename);
  return (
    <div id={selectorId} className={className} style={style}>
      {children}
    </div>
  );
};
