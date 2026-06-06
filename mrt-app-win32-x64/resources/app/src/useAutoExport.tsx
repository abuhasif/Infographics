// useAutoExport.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { exportInfographic } from './components/Screenshot';

export function useAutoExport(selector = '#infographic', filename = 'infographic.png') {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoExport') === '1') {
      (async () => {
        await (document as any).fonts?.ready?.catch(() => {});
        await exportInfographic(selector, filename);
      })();
    }
  }, [location.search, selector, filename]);
}
