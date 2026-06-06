import lrtIcon from '../assets/icons/lrt_icon.png';
import ewlIcon from '../assets/icons/ewl_icon.png';
import cclIcon from '../assets/icons/ccl_icon.png';
import telIcon from '../assets/icons/tel_icon.png';
import nslIcon from '../assets/icons/nsl_icon.png';
import nelIcon from '../assets/icons/nel_icon.png';

export const iconMap: { [key: string]: string } = {
  ccl: cclIcon,
  tel: telIcon,
  nsl: nslIcon,
  nel: nelIcon,
  ewl: ewlIcon,
  lrt: lrtIcon
};

export const stationOrder = [
  { code: 'DT1', name: 'Bukit Panjang', icon: 'lrt' },
  { code: 'DT2', name: 'Cashew' },
  { code: 'DT3', name: 'Hillview' },
  { code: 'DT4', name: 'Hume' },
  { code: 'DT5', name: 'Beauty World' },
  { code: 'DT6', name: 'King Albert Park' },
  { code: 'DT7', name: 'Sixth Avenue' },
  { code: 'DT8', name: 'Tan Kah Kee' },
  { code: 'DT9', name: 'Botanic Gardens', icon: 'ccl' },
  { code: 'DT10', name: 'Stevens', icon: 'tel' },
  { code: 'DT11', name: 'Newton', icon: 'nsl' },
  { code: 'DT12', name: 'Little India', icon: 'nel' },
  { code: 'DT13', name: 'Rochor' },
  { code: 'DT14', name: 'Bugis', icon: 'ewl' },
  { code: 'DT15', name: 'Promenade', icon: 'ccl' },
  { code: 'DT16', name: 'Bayfront', icon: 'ccl' },
  { code: 'DT17', name: 'Downtown' },
  { code: 'DT18', name: 'Telok Ayer' },
  { code: 'DT19', name: 'Chinatown', icon: 'nel' },
  { code: 'DT20', name: 'Fort Canning' },
  { code: 'DT21', name: 'Bencoolen' },
  { code: 'DT22', name: 'Jalan Besar' },
  { code: 'DT23', name: 'Bendemeer' },
  { code: 'DT24', name: 'Geylang Bahru' },
  { code: 'DT25', name: 'Mattar' },
  { code: 'DT26', name: 'MacPherson', icon: 'ccl' },
  { code: 'DT27', name: 'Ubi' },
  { code: 'DT28', name: 'Kaki Bukit' },
  { code: 'DT29', name: 'Bedok North' },
  { code: 'DT30', name: 'Bedok Reservoir' },
  { code: 'DT31', name: 'Tampines West' },
  { code: 'DT32', name: 'Tampines', icon: 'ewl' },
  { code: 'DT33', name: 'Tampines East' },
  { code: 'DT34', name: 'Upper Changi' },
  { code: 'DT35', name: 'Expo', icon: 'ewl' }
];

// Get all station codes between two station codes, inclusive
export const getRange = (start: string, end: string): string[] => {
  const i1 = stationOrder.findIndex(s => s.code === start);
  const i2 = stationOrder.findIndex(s => s.code === end);
  if (i1 === -1 || i2 === -1) return [];
  const sliced = i1 <= i2
    ? stationOrder.slice(i1, i2 + 1)
    : stationOrder.slice(i2, i1 + 1).reverse();
  return sliced.map(s => s.code);
};

export type Point = { x: number; y: number };

export const getBezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
  const x = Math.pow(1 - t, 3) * p0.x +
            3 * Math.pow(1 - t, 2) * t * p1.x +
            3 * (1 - t) * t * t * p2.x +
            t * t * t * p3.x;
  const y = Math.pow(1 - t, 3) * p0.y +
            3 * Math.pow(1 - t, 2) * t * p1.y +
            3 * (1 - t) * t * t * p2.y +
            t * t * t * p3.y;
  return { x, y };
};

export const bezierPathString = ([p0, p1, p2, p3]: [Point, Point, Point, Point]): string =>
  `M${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

// Curve geometry (for U-shape)
const leftTopY = 386;
const curveDepth = 60;

export const P0: Point = { x: 63, y: leftTopY };
export const P1: Point = { x: 100, y: leftTopY + curveDepth };
export const P2: Point = { x: 210, y: leftTopY + curveDepth };
export const P3: Point = { x: 247, y: leftTopY };

const innerYOffset = 20;
export const P0_inner: Point = { x: P0.x + 25, y: P0.y - innerYOffset + 20 };
export const P1_inner: Point = { x: P1.x + 8, y: P1.y - innerYOffset - 2 };
export const P2_inner: Point = { x: P2.x - 8, y: P2.y - innerYOffset - 2 };
export const P3_inner: Point = { x: P3.x - 25, y: P3.y - innerYOffset + 20 };

export const stationLabelOffsets: Record<string, { offsetX: number; offsetY: number }> = {
  DT17: { offsetX: -90, offsetY: -5 },
  DT18: { offsetX: -35, offsetY: 8 },
  DT19: { offsetX: 20, offsetY: -5 }
};
