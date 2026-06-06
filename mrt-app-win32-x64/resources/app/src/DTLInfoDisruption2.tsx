// src/DTLInfoDisruption2.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/header.tsx';
import lrtIcon from './assets/icons/lrt_icon.png';
import ewlIcon from './assets/icons/ewl_icon.png';
import cclIcon from './assets/icons/ccl_icon.png';
import telIcon from './assets/icons/tel_icon.png';
import nslIcon from './assets/icons/nsl_icon.png';
import nelIcon from './assets/icons/nel_icon.png';
import disruptiontrainIcon from './assets/icons/train.png';
import sbsLogo from './assets/icons/sbs_logo.png';
import shuttleIcon from './assets/icons/shuttle_icon.png';
import busIcon from './assets/icons/busicon.png';

type Station = {
  code: string;
  name: string;
  icon?: keyof typeof iconMap;
};

const baseStations: Station[] = [
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

const newStations: Station[] = [
  { code: 'DT36', name: 'Xilin' },
  { code: 'DT37', name: 'Sungei Bedok', icon: 'tel' },
];

// Build absolute URL for reliable image fetches (html2canvas etc.)
const abs = (p: string) => new URL(p, window.location.href).toString();

const wrapText = (text: string, max = 14): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (!line.length) {
      if (w.length <= max) line = w;
      else {
        let rest = w;
        while (rest.length > max) {
          lines.push(rest.slice(0, max));
          rest = rest.slice(max);
        }
        line = rest;
      }
      continue;
    }
    if ((line + ' ' + w).length <= max) line += ' ' + w;
    else {
      lines.push(line);
      if (w.length <= max) line = w;
      else {
        let rest = w;
        while (rest.length > max) {
          lines.push(rest.slice(0, max));
          rest = rest.slice(max);
        }
        line = rest || '';
      }
    }
  }
  if (line) lines.push(line);
  return lines;
};

const minsText = (n: string) => {
  const v = parseInt(n, 10);
  if (Number.isFinite(v)) return `Additional Travel Time of ${v} ${v === 1 ? 'minute' : 'minutes'}`;
  return `Additional Travel Time of ${n} minutes`;
};

const iconMap: { [key: string]: string } = {
  ccl: cclIcon,
  tel: telIcon,
  nsl: nslIcon,
  nel: nelIcon,
  ewl: ewlIcon,
  lrt: lrtIcon
};

type Point = { x: number; y: number };


const getBezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
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

const bezierPathString = ([p0, p1, p2, p3]: [Point, Point, Point, Point]): string =>
  `M${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

const stationLabelOffsetsOld: Record<string, { offsetX: number; offsetY: number }> = {
  DT17: { offsetX: -90, offsetY: -5 },
  DT18: { offsetX: -35, offsetY: 8 },
  DT19: { offsetX: 20, offsetY: -5 },
};

const stationLabelOffsetsNew: Record<string, { offsetX: number; offsetY: number }> = {
  DT18: { offsetX: -80, offsetY: -5 },
  DT19: { offsetX: -35, offsetY: 8 },
  DT20: { offsetX: 15, offsetY: -5 },
};

const DTLInfoDisruption2: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const enableDTLNewStations = params.get('dtlNew') === '1';

  const stationOrder = enableDTLNewStations
  ? [...baseStations, ...newStations]
  : baseStations;

  const stationLabelOffsets = enableDTLNewStations
    ? stationLabelOffsetsNew
    : stationLabelOffsetsOld;
    
  let stationsLeft: typeof stationOrder;
  let uStations: typeof stationOrder;
  let stationsRight: typeof stationOrder;

  if (enableDTLNewStations) {
    // ✅ New balanced layout (DT36/DT37 enabled)
    stationsLeft  = stationOrder.slice(0, 17);   // DT1–DT17
    uStations     = stationOrder.slice(17, 20);  // DT18–DT20
    stationsRight = stationOrder.slice(20).reverse(); // DT21–DT37
  } else {
    // ✅ Original layout (DT1–DT35 only)
    stationsLeft  = stationOrder.slice(0, 16);   // DT1–DT16
    uStations     = stationOrder.slice(16, 19);  // DT17–DT19
    stationsRight = stationOrder.slice(19, 35).reverse(); // DT20–DT35
  }
  const stationGap = 20;

  const uStartCode = stationsLeft.at(-1)!.code;   // DT16 or DT17
  const uEndCode   = stationsRight.at(-1)!.code;  // DT20 or DT21
  
  // 🔵 Utility: get range between station codes
  const getRange = (start: string, end: string): string[] => {
    const i1 = stationOrder.findIndex(s => s.code === start);
    const i2 = stationOrder.findIndex(s => s.code === end);
    if (i1 === -1 || i2 === -1) return [];
    const sliced = i1 <= i2 ? stationOrder.slice(i1, i2 + 1) : stationOrder.slice(i2, i1 + 1).reverse();
    return sliced.map(s => s.code);
  };
  
  const getMultipleRanges = (prefixStart: string, prefixEnd: string) => {
    const result: { from: string; to: string }[] = [];
    let i = 0;
    while (true) {
      const from = params.get(`${prefixStart}${i}`);
      const to = params.get(`${prefixEnd}${i}`);
      if (!from || !to || from === 'None' || to === 'None') break;
      result.push({ from, to });
      i++;
    }
    return result;
  };

  const CIRCLE = 10;
  const GAP = stationGap; // already 20
  const ROW_H = CIRCLE + GAP;

  const leftHeight  = stationsLeft.length * ROW_H;
  const rightHeight = stationsRight.length * ROW_H;

  const tValues = [0, 0.22, 0.5, 0.78, 1];

  const baseTopY = 100; // your addtop
  const maxColumnHeight = Math.max(leftHeight, rightHeight);

  // place U-shape slightly below columns
  const leftTopY = baseTopY + maxColumnHeight - 145;
  const curveDepth = 80;
  const svgHeight = leftTopY + curveDepth + 50;

  const P0 = { x: 65, y: leftTopY - 1};
  const P1 = { x: 70, y: leftTopY + curveDepth };
  const P2 = { x: 240, y: leftTopY + curveDepth };
  const P3 = { x: 243, y: leftTopY - 1 };

  const P0_inner = { x: P0.x + 15.2, y: P0.y + 1 };
  const P1_inner = { x: P1.x + 15, y: P1.y - 20};
  const P2_inner = { x: P2.x - 18, y: P2.y - 20};
  const P3_inner = { x: P3.x - 14.2, y: P3.y + 1 };

  const P0_add = { x: P0.x + 15, y: P0.y - 0 };
  const P1_add = { x: P1.x + 15, y: P1.y - 10};
  const P2_add = { x: P2.x - 18, y: P2.y - 10};
  const P3_add = { x: P3.x - 13, y: P3.y - 5 };

  const P0_bus = { x: P0.x + 28, y: P0.y - 0 };
  const P1_bus = { x: P1.x + 15, y: P1.y - 29};
  const P2_bus = { x: P2.x - 20, y: P2.y - 29};
  const P3_bus = { x: P3.x - 26.9, y: P3.y - 0 };

  const disruptedRanges = getMultipleRanges('disruptedStart', 'disruptedEnd');
  const shuttleRanges = getMultipleRanges('shuttleFrom', 'shuttleTo');
  const attRanges = getMultipleRanges('attFrom', 'attTo'); 
  const busRanges = getMultipleRanges('busFrom', 'busTo');

  const additionalTime = params.get('additionalTime'); // e.g. "5"
  const attLabel = additionalTime ? minsText(additionalTime) : ''; // empty if not provided
  const attLines = attLabel ? wrapText(attLabel, 12) : [];

  const busType = params.get('busType') ?? 'regular'; 
  const busRailText = busType === 'both' ? 'Free Regular and Bridging Bus Service' : 'Free Regular Bus Service'; 
  const busLegendText = busType === 'both' ? 'Free Regular and Bridging Bus Service' : 'Free Regular Bus Service';
  const busLabelLines = wrapText(busRailText, 12);
  const busEnds = busRanges.map(r => r.to.split(' ')[0]);

  const disruptedSet = new Set(disruptedRanges.flatMap(r =>
    getRange(r.from.split(" ")[0], r.to.split(" ")[0])
  ));

  const shuttleSet = new Set(shuttleRanges.flatMap(r =>
    getRange(r.from.split(" ")[0], r.to.split(" ")[0])
  ));

  const busSet = new Set(busRanges.flatMap(r =>
    getRange(r.from.split(" ")[0], r.to.split(" ")[0])
  ));

  const attSet = new Set(attRanges.flatMap(r =>
    getRange(r.from.split(" ")[0], r.to.split(" ")[0])
  ));
  
  const nonEmptyGroups =
  (shuttleRanges.length > 0 ? 1 : 0) +
  (busRanges.length > 0 ? 1 : 0) +
  (attRanges.length > 0 ? 1 : 0);

  const addtop = nonEmptyGroups >= 2 ? 138 : 100;


  const busEndpoints = new Set(
    busRanges.flatMap(r => {
      const a = r.from.split(" ")[0];
      const b = r.to.split(" ")[0];
      return [a, b];
    })
  );

  const attEndpoints = new Set(
    attRanges.flatMap(r => {
      const a = r.from.split(" ")[0];
      const b = r.to.split(" ")[0];
      return [a, b];
    })
  );

  const attEnds = attRanges.map(r => r.to.split(' ')[0]); // e.g. "DT20"

  const leftCodes  = new Set(stationsLeft.map(s => s.code));     // DT1..DT16
  const uCodes     = new Set(uStations.map(s => s.code));        // DT17..DT19
  const rightCodes = new Set(stationsRight.map(s => s.code));    // DT20..DT35 (reversed in your array, but codes are fine)

  const getSide = (code: string): 'left' | 'u' | 'right' | 'none' => {
    if (leftCodes.has(code)) return 'left';
    if (uCodes.has(code)) return 'u';
    if (rightCodes.has(code)) return 'right';
    return 'none';
  };

  const renderLeftBusLabels = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    // Match the column used by renderLeftInnerBusLine
    const colOffset = busRanges.length > 0 && attRanges.length > 0 ? -22 : -10;

    // End codes that actually land on the left side
    const leftEndCodes = busEnds.filter(c => getSide(c) === 'left');

    return leftEndCodes.map((code, i) => {
      const row = stationsLeft.findIndex(s => s.code === code);
      if (row < 0) return null;

      const endY = row * totalSpacing + circleSize / 2;

      return (
        <div
          key={`bus-left-label-${code}-${i}`}
          style={{
            position: 'absolute',
            top: endY - 6,
            right: 12 + colOffset + 8,    // a bit right of the pink bus line
            transform: 'translateX(0)',
            zIndex: 7,
            pointerEvents: 'none',
            fontSize: 10,
            color:'#dd3063',
            lineHeight: '11px',
            textAlign: 'left',
            whiteSpace: 'pre',
          }}
        >
          {busLabelLines.map((ln, j) => <div key={j}>{ln}</div>)}
        </div>
      );
    });
  };

  const renderRightBusLabels = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    const colOffset = busRanges.length > 0 && attRanges.length > 0 ? -10 : -20;

    const rightEndCodes = busEnds.filter(c => getSide(c) === 'right');

    return rightEndCodes.map((code, i) => {
      const row = stationsRight.findIndex(s => s.code === code);
      if (row < 0) return null;

      const endY = row * totalSpacing + circleSize / 2;

      return (
        <div
          key={`bus-right-label-${code}-${i}`}
          style={{
            position: 'absolute',
            top: endY - 6,
            marginLeft: colOffset + 8,   // a bit right of the pink bus line
            zIndex: 7,
            pointerEvents: 'none',
            fontSize: 10,
            color:'#dd3063',
            lineHeight: '11px',
            textAlign: 'right',
            whiteSpace: 'pre',
          }}
        >
          {busLabelLines.map((ln, j) => <div key={j}>{ln}</div>)}
        </div>
      );
    });
  };

  const renderUShapeBusLabels = () => {
    const uEndCodes = busEnds.filter(c => getSide(c) === 'u');
    if (uEndCodes.length === 0) return null;

    const both = busRanges.length > 0 && attRanges.length > 0;
    const [C0, C1, C2, C3]: [Point, Point, Point, Point] = both
      ? [P0_bus, P1_bus, P2_bus, P3_bus]
      : [P0_inner, P1_inner, P2_inner, P3_inner];

      const uStartCode = stationsLeft.at(-1)?.code; // DT17 when enabled
      const uEndCode   = stationsRight.at(-1)?.code; // DT21 when enabled
      const nodes = uEndCodes.map((code, i) => {
      // Map end station code to a t along the U
      let t: number;
      if (code === uStartCode) {
        t = 0;
      } else if (code === uEndCode) {
        t = 1;
      } else {
        const idx = uStations.findIndex(s => s.code === code);
        if (idx < 0) return null;
        t = tValues[idx + 1];
      }

      const { x, y } = getBezierPoint(t, C0, C1, C2, C3);

      return (
        <g key={`bus-u-label-${code}-${i}`}>
          <foreignObject x={x + 8} y={y - 14} width={180} height={60}>
            <div style={{ fontSize: 10, lineHeight: '11px', pointerEvents: 'none', color:'#dd3063' }}>
              {busLabelLines.map((ln, j) => <div key={j}>{ln}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    });

    return (
      <svg
        width="100%"
        height={`${svgHeight}px`}
        viewBox={`0 0 300 ${svgHeight}`}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 7, overflow: 'visible' }}
      >
        {nodes}
      </svg>
    );
  };

  const renderLeftATTLabels = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    // All ATT range ends that land on the LEFT side
    const leftEndCodes = attEnds.filter(c => getSide(c) === 'left');

    return leftEndCodes.map((code, i) => {
      const row = stationsLeft.findIndex(s => s.code === code);
      if (row < 0) return null;

      const endY = row * totalSpacing + circleSize / 2;

      return (
        <div
          key={`att-left-label-${code}-${i}`}
          style={{
            position: 'absolute',
            right: 10,
            top: endY - 15,
            zIndex: 6,
            pointerEvents: 'none',
            whiteSpace: 'pre',
            textAlign: 'left',
            transform: 'translateX(-4px)',
            fontSize: 10,
          }}
        >
          {attLines.map((ln, j) => (
            <div key={j} style={{ lineHeight: '11px' }}>{ln}</div>
          ))}
        </div>
      );
    });
  };

  const renderRightATTLabels = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    const rightEndCodes = attEnds.filter(c => getSide(c) === 'right');

    return rightEndCodes.map((code, i) => {
      const row = stationsRight.findIndex(s => s.code === code);
      if (row < 0) return null;

      const endY = row * totalSpacing + circleSize / 2;

      return (
        <div
          key={`att-right-label-${code}-${i}`}
          style={{
            position: 'absolute',
            left: 12,
            top: endY - 10,
            zIndex: 6,
            pointerEvents: 'none',
            whiteSpace: 'pre',
            textAlign: 'right',
            fontSize: 10,
          }}
        >
          {attLines.map((ln, j) => (
            <div key={j} style={{ lineHeight: '11px' }}>{ln}</div>
          ))}
        </div>
      );
    });
  };

  const renderUShapeATTLabels = () => {
    const uEndCodes = attEnds.filter(c => getSide(c) === 'u');
    if (uEndCodes.length === 0) return null;

    // pick ATT curve (inner vs ATT lane when bus co-exists)
    const both = busRanges.length > 0 && attRanges.length > 0;
    const [A0, A1, A2, A3]: [Point, Point, Point, Point] = both
      ? [P0_add, P1_add, P2_add, P3_add]
      : [P0_inner, P1_inner, P2_inner, P3_inner];

    const nodes = uEndCodes.map((code, i) => {
      // find t for that U station
      const idx = uStations.findIndex(s => s.code === code);
      // If the endpoint is DT16 or DT20 (curve ends), map to t=0 or t=1 accordingly
      let t: number;
      if (code === 'DT16') t = 0;
      else if (code === 'DT20') t = 1;
      else if (idx >= 0) t = tValues[idx + 1];
      else return null;

      const { x, y } = getBezierPoint(t, A0, A1, A2, A3);

      return (
        <g key={`att-u-label-${code}-${i}`}>
          <foreignObject x={x + 8} y={y - 14} width={160} height={60}>
            <div style={{ fontSize: 10, lineHeight: '11px', pointerEvents: 'none' }}>
              {attLines.map((ln, j) => <div key={j}>{ln}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    });

    return (
      <svg width="100%" height={`${svgHeight}px`} viewBox={`0 0 300 ${svgHeight}`} style={{ position: 'absolute', top: 0, left: 0, zIndex: 6 }}>
        {nodes}
      </svg>
    );
  };

  // ATT visual tuning
  const ATT_WIDTH = 2;   // px thickness
  const ATT_DASH  = 11;  // px dash length
  const ATT_GAP   = 4;   // px gap length
  const DOT_R     = 5;   // px radius for the end dots

  function renderDashedVertical(
    keyBase: string,
    leftCSS: string,
    startY: number,
    endY: number,
    z = 4
  ) {
    const h = endY - startY;
    const segs: React.ReactNode[] = [];
    let y = startY;
    let i = 0;
    while (y < endY) {
      const segH = Math.min(ATT_DASH, endY - y);
      if (segH <= 0) break;
      segs.push(
        <div
          key={`${keyBase}-seg-${i}`}
          style={{
            position: 'absolute',
            left: leftCSS,
            top: Math.round(y),
            width: ATT_WIDTH,
            height: segH,
            background: '#000',
            zIndex: z,
            pointerEvents: 'none',
          }}
        />
      );
      y += ATT_DASH + ATT_GAP;
      i++;
    }
    return segs;
  }

  const renderLeftATTLine = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;
    const OFFSET_FROM_RIGHT = 75; // same visual placement as before

    return stationsLeft.slice(0, -1).flatMap((station, idx) => {
      const next = stationsLeft[idx + 1];
      const bothATT = attSet.has(station.code) && attSet.has(next.code);
      if (!bothATT) return [];

      const startY = idx * totalSpacing + circleSize / 2;
      const endY   = (idx + 1) * totalSpacing + circleSize / 2;

      const showStartDot = attEndpoints.has(station.code);
      const showEndDot   = attEndpoints.has(next.code);

      // center the line and dot consistently
      const lineLeft = `calc(100% - ${OFFSET_FROM_RIGHT + Math.ceil(ATT_WIDTH/2)}px)`;
      const dotLeft  = `calc(100% - ${OFFSET_FROM_RIGHT + DOT_R}px)`;

      return [
        ...renderDashedVertical(
          `att-left-${station.code}-${next.code}`,
          lineLeft,
          startY,
          endY,
          4
        ),
        showStartDot && (
          <div
            key={`att-left-dot-start-${station.code}-${next.code}`}
            style={{
              position: 'absolute',
              left: dotLeft,
              top: startY - DOT_R,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: '50%',
              background: '#000',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        ),
        showEndDot && (
          <div
            key={`att-left-dot-end-${station.code}-${next.code}`}
            style={{
              position: 'absolute',
              left: dotLeft,
              top: endY - DOT_R,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: '50%',
              background: '#000',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        ),
      ].filter(Boolean);
    });
  };

  const renderRightATTLine = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;
    const OFFSET_FROM_LEFT = 74; // same visual placement as before

    return stationsRight.slice(0, -1).flatMap((station, idx) => {
      const next = stationsRight[idx + 1];
      const bothATT = attSet.has(station.code) && attSet.has(next.code);
      if (!bothATT) return [];

      const startY = idx * totalSpacing + circleSize / 2;
      const endY   = (idx + 1) * totalSpacing + circleSize / 2;

      const showStartDot = attEndpoints.has(station.code);
      const showEndDot   = attEndpoints.has(next.code);

      const lineLeft = `${OFFSET_FROM_LEFT - Math.floor(ATT_WIDTH/2)}px`;
      const dotLeft  = `${OFFSET_FROM_LEFT - DOT_R}px`;

      return [
        ...renderDashedVertical(
          `att-right-${station.code}-${next.code}`,
          lineLeft,
          startY,
          endY,
          4
        ),
        showStartDot && (
          <div
            key={`att-right-dot-start-${station.code}-${next.code}`}
            style={{
              position: 'absolute',
              left: dotLeft,
              top: startY - DOT_R,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: '50%',
              background: '#000',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        ),
        showEndDot && (
          <div
            key={`att-right-dot-end-${station.code}-${next.code}`}
            style={{
              position: 'absolute',
              left: dotLeft,
              top: endY - DOT_R,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: '50%',
              background: '#000',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        ),
      ].filter(Boolean);
    });
  };

  const renderUShapeATTLine = () => {
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < 4; i++) {
      const from = i === 0 ? 'DT16' : uStations[i - 1].code;
      const to   = i === 3 ? 'DT20' : uStations[i].code;

      const bothATT = attSet.has(from) && attSet.has(to);
      if (!bothATT) continue;

      const t0 = tValues[i];
      const t1 = tValues[i + 1];

      const q0 = getBezierPoint(t0, P0_add, P1_add, P2_add, P3_add);
      const q1 = getBezierPoint(t0 + (t1 - t0) / 3, P0_add, P1_add, P2_add, P3_add);
      const q2 = getBezierPoint(t0 + 2 * (t1 - t0) / 3, P0_add, P1_add, P2_add, P3_add);
      const q3 = getBezierPoint(t1, P0_add, P1_add, P2_add, P3_add);

      const path = bezierPathString([q0, q1, q2, q3]);

      const showStartDot = attEndpoints.has(from);
      const showEndDot   = attEndpoints.has(to);

      segments.push(
        <g key={`att-u-${i}`}>
          <path
            d={path}
            fill="transparent"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="10,5"
          />
          {showStartDot && <circle cx={q0.x} cy={q0.y} r={3} fill="black" />}
          {showEndDot   && <circle cx={q3.x} cy={q3.y} r={3} fill="black" />}
        </g>
      );
    }

    return (
      <svg width="100%" height={`${svgHeight}px`} viewBox={`0 0 300 ${svgHeight}`}>
        {segments}
      </svg>
    );
  };

  const renderLeftInnerBusLine = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    return stationsLeft.slice(0, -1).map((station, idx) => {
      const next = stationsLeft[idx + 1];

      const lineColor = "#dd3063";
      if (!(busSet.has(station.code) && busSet.has(next.code))) return null;
      const right = busRanges.length > 0 && attRanges.length > 0? 48.5: 61;
      const startY = idx * totalSpacing + circleSize / 2;
      const endY = (idx + 1) * totalSpacing + circleSize / 2;
      const height = endY - startY;

      return (
        <div
          key={`bus-${station.code}-${next.code}`}
          style={{
            position: 'absolute',
            right: 12,
            marginRight: right,
            top: startY,
            height: 32,
            width: 3,          
            backgroundColor: lineColor, 
            borderRadius: 2
          }}
        />
      );
    });
  };

  const renderLeftInnerBusStations = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    return stationsLeft.map((station, idx) => {
      const topY = idx * totalSpacing;
      const right = busRanges.length > 0 && attRanges.length > 0? 0: 12;
      const isBusEndpoint = busEndpoints.has(station.code);
      
      return (
        <div
          key={`inner-bus-station-${station.code}`}
          style={{
            position: 'absolute',
            top: topY,
            right: right,
            marginRight: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {/* Bridging Bus Icon (left side) */}
          {isBusEndpoint && (
            <img
              src={busIcon}
              alt="Bridging Bus"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: 'white',
              }}
            />
          )}
        </div>
      );
    });
  };
  
  const renderLeftLines = () => {
    console.log("🟣 renderLeftLines called");
    console.log('🟠 ShuttleSet:', Array.from(shuttleSet));
    console.log('❌ DisruptedSet:', Array.from(disruptedSet));

    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    return stationsLeft.slice(0, -1).map((station, idx) => {
      const next = stationsLeft[idx + 1];

      const bothDisrupted = disruptedSet.has(station.code) && disruptedSet.has(next.code);
      const nextDisrupted = disruptedSet.has(next.code);
      const isShuttle = shuttleSet.has(station.code) && shuttleSet.has(next.code);

      // ❌ Skip if both disrupted
      if (bothDisrupted) {
        console.log(`❌ Skip ${station.code} → ${next.code}: both disrupted`);
        return null;
      }

      // ❌ Skip if next disrupted but no shuttle
      if (nextDisrupted && !isShuttle) {
        console.log(`❌ Skip ${station.code} → ${next.code}: next disrupted with no shuttle`);
        return null;
      }

      // ✅ Choose line type
      const lineType = isShuttle ? '🟠 Shuttle' : '🔵 Normal';
      console.log(`✅ Drawing ${lineType} line between ${station.code} → ${next.code}`);

      const startY = idx * totalSpacing + circleSize / 2;
      const endY = (idx + 1) * totalSpacing + circleSize / 2;
      const height = endY - startY;

      return (
        <div
          key={`${station.code}-${next.code}`}
          style={{
            position: 'absolute',
            right: 3,
            marginRight: 86,
            top: startY,
            height,
            width: 2,
            backgroundColor: isShuttle ? '#e87e26' : '#005ec4',
            borderRadius: 2
          }}
        />
      );
    });
  };

  const renderLeftStation = (station: any, idx: number) => {
    const circleSize = 10;
    const topY = idx * (stationGap + circleSize);

    console.log(`📍 Station ${station.code} positioned at Y: ${topY}px`);

    const isDisrupted = disruptedSet.has(station.code);
    const isShuttle = shuttleSet.has(station.code);

    return (
      <div
        style={{
          position: 'absolute',
          top: topY,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {station.icon && (
          <img
            src={iconMap[station.icon]}
            alt={`${station.icon} icon`}
            style={{ marginRight: 8, height: 12 }}
          />
        )}
        <span style={{ marginRight: 2, fontSize: '9px' }}>
          {station.code} {station.name}
        </span>

        {isDisrupted ? (
          <img
            src={disruptiontrainIcon}
            alt="Disruption icon"
            style={{
              width: 12,
              height: 12,
              marginRight: 84,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : isShuttle ? (
          // Shuttle icon
          <img
            src={shuttleIcon}
            alt="Shuttle icon"
            style={{
              width: 12,
              height: 12,
              marginRight: 84,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          // Normal circle
          <div
            style={{
              width: circleSize,
              height: circleSize,
              backgroundColor: '#005ec4',
              borderRadius: '100%',
              marginRight: 85,
            }}
          />
        )}
      </div>
    );
  };

  const renderRightLines = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    return stationsRight.slice(0, -1).map((station, idx) => {
      const next = stationsRight[idx + 1];

      const fromDisrupted = disruptedSet.has(station.code);
      const toDisrupted = disruptedSet.has(next.code);
      const bothDisrupted = fromDisrupted && toDisrupted;
      const isShuttle = shuttleSet.has(station.code) && shuttleSet.has(next.code);

      if (bothDisrupted) {
        console.log(`❌ Skip ${station.code} → ${next.code}: both disrupted`);
        return null;
      }

      // ❌ Skip if either disrupted and no shuttle bridging
      if ((fromDisrupted || toDisrupted) && !isShuttle) {
        console.log(`❌ Skip ${station.code} → ${next.code}: one side disrupted with no shuttle`);
        return null;
      }

      const lineColor = isShuttle ? '#9d6031' : '#005ec4';
      const lineType = isShuttle ? '🟠 Shuttle' : '🔵 Normal';
      console.log(`✅ Drawing ${lineType} line between ${station.code} → ${next.code}`);

      const startY = idx * totalSpacing + circleSize / 2;
      const endY = (idx + 1) * totalSpacing + circleSize / 2;
      const height = endY - startY;

      return (
        <div
          key={`${station.code}-${next.code}`}
          style={{
            position: 'absolute',
            marginLeft: 88,
            top: startY,
            height,
            width: 2,
            backgroundColor: lineColor,
            borderRadius: 2
          }}
        />
      );
    });
  };

  const renderRightInnerBusLine = () => {

    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;
    
    return stationsRight.slice(0, -1).map((station, idx) => {
      const next = stationsRight[idx + 1];

      const lineColor = "#dd3063";
      if (!(busSet.has(station.code) && busSet.has(next.code))) return null;
      const left = busRanges.length > 0 && attRanges.length > 0? 60.5: 71;
      const startY = idx * totalSpacing + circleSize / 2;
      const endY = (idx + 1) * totalSpacing + circleSize / 2;
      const height = endY - startY;

      return (
        <div
          key={`right-bus-${station.code}-${next.code}`}
          style={{
            position: 'absolute',
            marginLeft: left + 0.5,
            top: startY,
            height: 32,
            width: 3,          
            backgroundColor: lineColor, 
            borderRadius: 2
          }}
        />
      );
    });
  };

  const renderRightInnerBusStations = () => {
    const circleSize = 10;
    const totalSpacing = circleSize + stationGap;

    return stationsRight.map((station, idx) => {
      const topY = idx * totalSpacing;
      const isBusEndpoint = busEndpoints.has(station.code);
      const left = busRanges.length > 0 && attRanges.length > 0? 56: 66;
      return (
        <div
          key={`right-inner-bus-${station.code}`}
          style={{
            position: 'absolute',
            top: topY,
            marginLeft: left,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {isBusEndpoint && (
            <img
              src={busIcon}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: 'white'
              }}
            />
          )}
        </div>
      );
    });
  };


  const renderRightStation = (station: any, idx: number) => {
    const circleSize = 10;
    const topY = idx * (stationGap + circleSize);

    console.log(`📍 Station ${station.code} (Right) at Y: ${topY}px`);

    const isDisrupted = disruptedSet.has(station.code);
    const isShuttle = shuttleSet.has(station.code);

    return (
      <div
        key={station.code}
        style={{
          position: 'absolute',
          top: topY,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {/* Disruption or Shuttle Icon */}
        {isDisrupted ? (
          <img
            src={disruptiontrainIcon}
            alt="Disruption icon"
            style={{
              width: 12,
              height: 12,
              marginLeft: 83,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : isShuttle ? (
          <img
            src={shuttleIcon}
            alt="Shuttle icon"
            style={{
              width: 12,
              height: 12,
              marginLeft: 83,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: circleSize,
              height: circleSize,
              backgroundColor: '#005ec4',
              borderRadius: '100%',
              marginLeft: 84,
            }}
          />
        )}

        {/* Station label */}
        <span style={{ marginLeft: 8, fontSize: '9px' }}>
          {station.code} {station.name}
        </span>

        {/* Interchange Line Icon */}
        {station.icon && (
          <img
            src={iconMap[station.icon]}
            alt={`${station.icon} icon`}
            style={{ marginLeft: 8, height: 12 }}
          />
        )}
      </div>
    );
  };

  const renderUShapeInnerBusLine = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      const from = i === 0 ? 'DT16' : uStations[i - 1].code;
      const to = i === 3 ? 'DT20' : uStations[i].code;

      if (!(busSet.has(from) && busSet.has(to))) continue;

      const [C0, C1, C2, C3]: [Point, Point, Point, Point] = busRanges.length > 0 && attRanges.length > 0
      ? [P0_bus, P1_bus, P2_bus, P3_bus]
      : [P0_inner, P1_inner, P2_inner, P3_inner];

      const t0 = tValues[i];
      const t1 = tValues[i + 1];
      const q0 = getBezierPoint(t0, C0, C1, C2, C3);
      const q1 = getBezierPoint(t0 + (t1 - t0) / 3, C0, C1, C2, C3);
      const q2 = getBezierPoint(t0 + 2 * (t1 - t0) / 3, C0, C1, C2, C3);
      const q3 = getBezierPoint(t1, C0, C1, C2, C3);
      
      const path = bezierPathString([q0, q1, q2, q3]);
      segments.push(
        <path key={`inner-bus-${i}`} d={path} fill="transparent" stroke="#dd3063" strokeWidth="2.5" />
      );
    }

    return (
      <svg width="100%" height={`${svgHeight}px`} viewBox={`0 0 300 ${svgHeight}`}>
        {segments}
      </svg>
    );
  };

  const renderUShapeInnerBusStations = () => {
    const stationMarkers = uStations.map((station, idx) => {
      const t = tValues[idx + 1];
      const [C0, C1, C2, C3]: [Point, Point, Point, Point] = busRanges.length > 0 && attRanges.length > 0
      ? [P0_bus, P1_bus, P2_bus, P3_bus]
      : [P0_inner, P1_inner, P2_inner, P3_inner];
      const { x, y } = getBezierPoint(t, C0, C1, C2, C3);

      const isBusEndpoint = busEndpoints.has(station.code);

      if (!isBusEndpoint) return null;

      return (
        <g key={`inner-bribus-station-${station.code}`}>
          <foreignObject x={x - 5} y={y - 6} width={12} height={12}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '100%',
              overflow: 'visible',
            }}>
              <img
                src={busIcon}
                alt="Bridging Bus"
                style={{ width: 12, height: 12, display: 'block' }}
              />
            </div>
          </foreignObject>
        </g>
      );
    });

    return (
      <svg width="100%" height={`${svgHeight}px`} viewBox={`0 0 300 ${svgHeight}`}>
        {stationMarkers}
      </svg>
    );
  };
  
  const renderUShapeLines = () => {
    const segments = [];

    for (let i = 0; i < 4; i++) {
      const from = i === 0 ? uStartCode : uStations[i - 1].code;
      const to   = i === uStations.length ? uEndCode : uStations[i].code;


      const fromDisrupted = disruptedSet.has(from);
      const toDisrupted = disruptedSet.has(to);
      const bothDisrupted = fromDisrupted && toDisrupted;
      const isShuttle = shuttleSet.has(from) && shuttleSet.has(to);

      if (bothDisrupted) {
        console.log(`❌ Skip ${from} → ${to}: both disrupted`);
        continue;
      }

      if ((fromDisrupted || toDisrupted) && !isShuttle) {
        console.log(`❌ Skip ${from} → ${to}: next disrupted with no shuttle`);
        continue;
      }

      const lineColor = isShuttle ? '#9d6031' : '#005ec4';
      const lineType = isShuttle ? '🟠 Shuttle' : '🔵 Normal';
      console.log(`✅ Drawing ${lineType} line between ${from} → ${to}`);

      const t0 = tValues[i];
      const t1 = tValues[i + 1];

      const [q0, q1, q2, q3] = [
        getBezierPoint(t0, P0, P1, P2, P3),
        getBezierPoint(t0 + (t1 - t0) / 3, P0, P1, P2, P3),
        getBezierPoint(t0 + 2 * (t1 - t0) / 3, P0, P1, P2, P3),
        getBezierPoint(t1, P0, P1, P2, P3),
      ];

      const path = bezierPathString([q0, q1, q2, q3]);

      segments.push(
        <path
          key={`segment-${i}`}
          d={path}
          fill="transparent"
          stroke={lineColor}
          strokeWidth="2"
        />
      );
    }

    return (
      <svg width="100%" height={`${svgHeight}px`} viewBox={`0 0 300 ${svgHeight}`}>
        {segments}
      </svg>
    );
  };

  const renderUShapeStations = () => {
    const stationNodes = uStations.map((station, idx) => {
      const t = tValues[idx + 1];
      const { x, y } = getBezierPoint(t, P0, P1, P2, P3);
      const abs = (p: string) => new URL(p, window.location.href).toString();

      const { offsetX, offsetY } =
        stationLabelOffsets[station.code] || { offsetX: -30, offsetY: 12 };
      const labelX = x + offsetX;
      const labelY = y + offsetY;

      const isDisrupted = disruptedSet.has(station.code);
      const isShuttle = shuttleSet.has(station.code);

      const LINE_ICON_OFFSET_X = 88;
      const LINE_ICON_OFFSET_Y = -1;

      const lineIcon = station.icon ? iconMap[station.icon] : undefined;

      // convenience positions for the label-side icon
      const liX = labelX + LINE_ICON_OFFSET_X;
      const liY = labelY + LINE_ICON_OFFSET_Y;
      const ICON = isDisrupted? 13:10;
      const R = ICON / 2;
      return (
        <g key={station.code}>
          {/* station marker */}
          {isDisrupted || isShuttle ? (
            <>
              {/* blue dot background (same size as normal stations) */}
              <circle cx={x} cy={y} r={R} fill="#005ec4" />
              {/* icon clipped to a circle */}
              <image
                x={x - R}
                y={y - R}
                width={ICON}
                height={ICON}
                href={abs(isDisrupted ? disruptiontrainIcon : shuttleIcon)}
                xlinkHref={abs(isDisrupted ? disruptiontrainIcon : shuttleIcon)}
                clipPath="url(#roundIcon)"
              />
              {/* thin white ring for crisp edge (optional) */}
              <circle cx={x} cy={y} r={R} fill="none" stroke="#fff" strokeWidth="1" />
            </>
          ) : (
            <circle cx={x} cy={y} r={R} fill="#005ec4" />
          )}

          {/* label text */}
          <text x={labelX} y={labelY + 8} fontSize="9px" fill="#000">
            {station.code} {station.name}
          </text>

          {/* small line icon next to label, clipped round */}
          {lineIcon && (
            <>
              <circle cx={liX + R} cy={liY + R} r={R} fill="#fff" />
              <image
                x={liX}
                y={liY}
                width={ICON}
                height={ICON}
                href={abs(lineIcon)}
                xlinkHref={abs(lineIcon)}
                clipPath="url(#roundIcon)"
              />
              <circle cx={liX + R} cy={liY + R} r={R} fill="none" stroke="#fff" strokeWidth="0.5" />
            </>
          )}
        </g>
      );
    });

    return (
      <svg
        width="100%"
        height={`${svgHeight}px`}
        viewBox={`0 0 300 ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{ overflow: 'visible' }}
      >
        {/* one reusable circular clip for all <image> elements */}
        <defs>
          <clipPath id="roundIcon" clipPathUnits="objectBoundingBox">
            {/* circle that fills the image's bounding box */}
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>

        {stationNodes}
      </svg>
    );
  };
  
  const formatStationLabel = (code: string) => {
    const station = stationOrder.find(s => s.code === code);
    return station ? `${station.code} ${station.name}` : code;
  };

  return (
    <div style={{ paddingTop: 0, width: 420, minHeight: 870, position: 'relative' }}>
      <Header type="Disruption" from={formatStationLabel(disruptedRanges[0]?.from ?? '')} to={formatStationLabel(disruptedRanges.at(-1)?.to ?? '')} />

      <div style={{ position: 'relative', width: '100%'}}>
      {/* 🟣 U-Shape Lines (bottom layer) */}
      <div style={{ position: 'absolute', top: addtop + 31, left: 0, width: '100%' }}>
        {renderUShapeLines()}
      </div>

      {/* 🔵 Left and Right Lines (middle layer) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, width: '100%', padding: 5 }}>
        <div style={{ position: 'relative', top: addtop, width: '50%' }}>
          {renderLeftLines()}
          {renderLeftATTLine()} 
          {renderLeftATTLabels()}
          {renderLeftInnerBusLine()}
          {renderLeftBusLabels()}
        </div>
        <div style={{ position: 'relative', top: addtop, width: '50%' }}>
          {renderRightLines()}
          {renderRightATTLine()}
          {renderRightATTLabels()}
          {renderRightInnerBusLine()}
          {renderRightBusLabels()}
        </div>
      </div>

      {/* 🟢 Left and Right Stations (top layer) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, width: '100%', padding: 5 }}>
        <div style={{ position: 'relative', top: addtop, width: '50%', zIndex:1 }}>
          {stationsLeft.map(renderLeftStation)}
          {stationsLeft.map(renderLeftInnerBusStations)}
        </div>
        <div style={{ position: 'relative', top: addtop, width: '50%', zIndex:1 }}>
          {stationsRight.map(renderRightStation)}
          {stationsRight.map(renderRightInnerBusStations)}
        </div>
      </div>

      {/* 🟡 U-shape Stations (top layer) */}
      <div style={{ position: 'absolute', top: addtop + 31, left: 0, width: '100%' }}>
        {renderUShapeStations()}
      </div>
      {/* 🟢 Inner U-shape Bus Line (middle layer above normal U-shape line) */}
      <div style={{ position: 'absolute', top: addtop + 25, left: 0, width: '100%' }}>
        {renderUShapeInnerBusLine()}
      </div>

      <div style={{ position: 'absolute', top: addtop + 31, left: 0, width: '100%', zIndex: 7 }}>
        {renderUShapeBusLabels()}      
      </div>

      <div style={{ position: 'absolute', top: addtop + 26, left: 0, width: '100%' }}>
        {renderUShapeATTLine()}     
      </div>

      {/* U-shape ATT labels */}
      <div style={{ position: 'absolute', top: addtop + 31, left: 0, width: '100%', zIndex: 6 }}>
        {renderUShapeATTLabels()}
      </div>

      {/* 🟡 Inner U-shape Bus Stations (top layer for bus icons) */}
      <div style={{ position: 'absolute', top: addtop + 31, left: 0, width: '100%' }}>
        {renderUShapeInnerBusStations()}
      </div>

    </div>

      {/* Legend Box */}
      <div 
        style={{ 
          position: 'absolute',
          top: '135px',
          right: '20px',
          fontSize: '14px',
          padding: '6px',
          backgroundColor: 'rgba(255, 204, 0, 0.35)',
          borderRadius: '12px',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
          zIndex: 10,
          width: '370px'
        }}
      >
        <h3 style={{ fontSize: '20px', marginBottom: '8px', marginTop: '0px' }}>Legend</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: '20px',
          rowGap: '10px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={disruptiontrainIcon} width={14} height={14} />
              <span style={{ marginLeft: '6px' }}>No Train Service</span>
            </div>
          {shuttleRanges.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={shuttleIcon} width={14} height={14} />
              <span style={{ marginLeft: '6px' }}>Shuttle Train Service</span>
            </div>
          )}
          {busRanges.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={busIcon} width={14} height={14} />
              <span style={{ marginLeft: '6px' }}>{busLegendText}</span>
            </div>
          )}
          {attRanges.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="30" height="6">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="#000000ff" strokeWidth="3" strokeDasharray="4,3" />
                </svg>
                <span>Additional Travel Time</span>
              </div>
            )}
        </div>
      </div>

      {/* SBS Logo */}
      <img
        src={sbsLogo}
        alt="SBS Transit"
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '10px',
          width: '80px',
          opacity: 0.8
        }}
      />
    </div>
  );
};

export default DTLInfoDisruption2;
