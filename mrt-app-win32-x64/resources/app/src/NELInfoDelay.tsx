// src/NELInfoDisruption.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/header';

import shuttleIcon from './assets/icons/shuttle_icon.png';
import busIcon from './assets/icons/busicon.png';
import cclIcon from './assets/icons/ccl_icon.png';
import dtlIcon from './assets/icons/dtl_icon.png';
import ewlIcon from './assets/icons/ewl_icon.png';
import telIcon from './assets/icons/tel_icon.png';
import nslIcon from './assets/icons/nsl_icon.png';
import lrtIcon from './assets/icons/lrt_icon.png';
import disruptiontrainIcon from './assets/icons/delaytrain.jpeg';
import sbsLogo from './assets/icons/sbs_logo.png';

// Build absolute URL so html2canvas can fetch images reliably
const abs = (p: string) => new URL(p, window.location.href).toString();

const lineIcons: Record<string, string> = {
  'ccl_icon.png': cclIcon,
  'dtl_icon.png': dtlIcon,
  'ewl_icon.png': ewlIcon,
  'tel_icon.png': telIcon,
  'nsl_icon.png': nslIcon,
  'lrt_icon.png': lrtIcon,
};

const stationLineIcons: Record<string, string[]> = {
  'NE1 HarbourFront': ['ccl_icon.png'],
  'NE3 Outram Park': ['ewl_icon.png', 'tel_icon.png'],
  'NE4 Chinatown': ['dtl_icon.png'],
  'NE6 Dhoby Ghaut': ['nsl_icon.png', 'ccl_icon.png'],
  'NE7 Little India': ['dtl_icon.png'],
  'NE12 Serangoon': ['ccl_icon.png'],
  'NE16 Sengkang': ['lrt_icon.png'],
  'NE17 Punggol': ['lrt_icon.png'],
};

const stationOrder = [
  'NE1 HarbourFront',
  'NE3 Outram Park',
  'NE4 Chinatown',
  'NE5 Clarke Quay',
  'NE6 Dhoby Ghaut',
  'NE7 Little India',
  'NE8 Farrer Park',
  'NE9 Boon Keng',
  'NE10 Potong Pasir',
  'NE11 Woodleigh',
  'NE12 Serangoon',
  'NE13 Kovan',
  'NE14 Hougang',
  'NE15 Buangkok',
  'NE16 Sengkang',
  'NE17 Punggol',
  'NE18 Punggol Coast',
];

const getRange = (start: string, end: string): string[] => {
  const i1 = stationOrder.indexOf(start);
  const i2 = stationOrder.indexOf(end);
  if (i1 === -1 || i2 === -1) return [];
  return i1 <= i2
    ? stationOrder.slice(i1, i2 + 1)
    : stationOrder.slice(i2, i1 + 1).reverse();
};

const wrapText = (text: string, max = 14): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const w of words) {
    if (!line.length) {
      // start a new line
      if (w.length <= max) {
        line = w;
      } else {
        // hard-wrap very long single word
        let rest = w;
        while (rest.length > max) {
          lines.push(rest.slice(0, max));
          rest = rest.slice(max);
        }
        line = rest;
      }
      continue;
    }

    if ((line + ' ' + w).length <= max) {
      line += ' ' + w;
    } else {
      lines.push(line);
      if (w.length <= max) {
        line = w;
      } else {
        // hard-wrap very long single word
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

// Helper: draw a round image given TOP-LEFT coordinates
const roundImgTL = (xTL: number, yTL: number, src: string, size = 24) => {
  const cx = xTL + size / 2;
  const cy = yTL + size / 2;
  const url = abs(src);
  return (
    <g>
      <circle cx={cx} cy={cy} r={size / 2} fill="#fff" />
      <image
        x={xTL}
        y={yTL}
        width={size}
        height={size}
        href={url}
        xlinkHref={url}
        clipPath="url(#roundNEL)"
      />
      <circle cx={cx} cy={cy} r={size / 2} fill="none" stroke="#fff" strokeWidth="0.5" />
    </g>
  );
};

const Infographic: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const getMultipleRanges = (
    prefixStart: string,
    prefixEnd: string
  ): { from: string; to: string }[] => {
    const ranges: { from: string; to: string }[] = [];
    let i = 0;
    while (true) {
      const from = params.get(`${prefixStart}${i}`);
      const to = params.get(`${prefixEnd}${i}`);
      if (!from || !to || from === 'None' || to === 'None') break;
      ranges.push({ from, to });
      i++;
    }
    return ranges;
  };

  const busRanges = getMultipleRanges('busFrom', 'busTo');

  const hasBus = busRanges.length > 0;
  const busSet = new Set(busRanges.flatMap(r => getRange(r.from, r.to)));

  const busType = params.get('busType') ?? 'regular';
  const busRailText = busType === 'both' ? 'Free Regular and Bridging Bus Service' : 'Free Regular Bus Service';
  const busLegendText = busType === 'both' ? 'Free Regular and Bridging Bus Service' : 'Free Regular Bus Service';

  const additionalTime = params.get('additionalTime') ?? '';
  const attRanges = getMultipleRanges('attFrom', 'attTo');
  const attSet = new Set(attRanges.flatMap(r => getRange(r.from, r.to)));
  const addStart = attRanges[0]?.from ?? '';
  const addEnd = attRanges[0]?.to ?? '';
  const hasAtt = attRanges.length > 0;

  const addtext = `Additional Travel Time of ${additionalTime} minutes`;
  // Layout
  const baseX = 242;
  const busX  = baseX - 35; // was bribusX previously
  const textX = baseX + 20;
  const stationSpacing = 34;
  const attX = busX - 85; // adjust to taste

  const rows =
  1 + // "No Train Service"
  (hasBus ? 1 : 0) +
  (hasAtt ? 1 : 0);

  // Tune these if you tweak font sizes/gaps
  const HEADER_H = 24;   // "Legend" title block height
  const ROW_H    = 20;   // each legend row height
  const ROW_GAP  = 10;    // CSS rowGap between rows
  const PAD_V    = 20;   // vertical padding total (top+bottom)

  // total height = header + rows + gaps + padding
  const legendHeight =
    HEADER_H + PAD_V + rows * ROW_H + Math.max(0, rows - 1) * ROW_GAP;

  return (
    <div style={{ paddingTop: '0px', width: '420px', height: '870px', position: 'relative' }}>
      <Header type="Delay" from={addStart} to={addEnd} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
        <svg
          viewBox="0 0 420 730"
          width="100%"
          height="100%"
          preserveAspectRatio="xMinYMin meet"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          {/* Reusable round clip for all images */}
          <defs>
            <clipPath id="roundNEL" clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.5" />
            </clipPath>
          </defs>

          {/* Base Purple Line — skip any segment touching a disrupted station unless it's a shuttle */}
          {stationOrder.map((station, index) => {
            if (index === stationOrder.length - 1) return null;
            const next = stationOrder[index + 1];

            const y1 = stationSpacing * index + 120;
            const y2 = stationSpacing * (index + 1) + 120;
            return (
              <line
                key={`base-line-${index}`}
                x1={baseX}
                y1={y1}
                x2={baseX}
                y2={y2}
                stroke="#800080"
                strokeWidth="6"
              />
            );
          })}

          {/* Bus Line + vertical label */}
          {busRanges.map(({ from, to }, idx) => {
            const i1 = stationOrder.indexOf(from);
            const i2 = stationOrder.indexOf(to);
            if (i1 === -1 || i2 === -1) return null;
            const [startIdx, endIdx] = i1 <= i2 ? [i1, i2] : [i2, i1];
            const midY = ((startIdx + endIdx) / 2) * stationSpacing + 125;

            return (
              <g key={`bri-bus-group-${idx}`}>
                {stationOrder.map((_, index) => {
                  if (index === stationOrder.length - 1 || index < startIdx || index >= endIdx)
                    return null;
                  const y1 = stationSpacing * index + 120;
                  const y2 = stationSpacing * (index + 1) + 120;
                  return (
                    <line
                      key={`bri-bus-line-${idx}-${index}`}
                      x1={busX}
                      y1={y1}
                      x2={busX}
                      y2={y2}
                      stroke="#dd3063"
                      strokeWidth="5"
                    />
                  );
                })}
                <text
                  x={busX}
                  y={midY - 10}
                  textAnchor="end"
                  fontSize="11"
                  fill="#dd3063"
                >
                  {wrapText(busRailText, 14).map((line, i) => (
                    <tspan key={i} x={busX - 10} dy={i === 0 ? 0 : '1em'}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          {/* Stations: icons + labels */}
          {stationOrder.map((station, index) => {
            const y = stationSpacing * index + 120;

            const isBusStop = busRanges.some(r => r.from === station || r.to === station);
            const isAddStop = attRanges.some(r => r.from === station || r.to === station);

            return (
              <g key={`station-${station}`}>
                {/* Shuttle / Regular Bus / Bridging Bus badges (rounded) */}
                {isBusStop && roundImgTL(busX - 11, y - 11, busIcon, 23)}
                {isAddStop && <circle cx={attX} cy={y} r="8" fill="#000000ff" />}
                {/* Core station marker:
                   - Disrupted => round disruption icon
                   - Otherwise (and not part of shuttle-only area) => purple dot */}
                {(
                      <circle cx={baseX} cy={y} r="8" fill="#800080" />
                    )}

                {/* Station label */}
                <text x={textX} y={y + 5} fontSize="13">
                  {station}
                </text>

                {/* Interchange line icons next to label (rounded) */}
                {stationLineIcons[station]?.map((iconFile, idx) =>
                  roundImgTL(textX + 108 + idx * 25, y - 10, lineIcons[iconFile], 22)
                )}
              </g>
            );
          })}

          {/* Additional Travel Time line (orange dashed) */}
          {attRanges.map(({ from, to }, idx) => {
            const i1 = stationOrder.indexOf(from);
            const i2 = stationOrder.indexOf(to);
            if (i1 === -1 || i2 === -1) return null;
            const [startIdx, endIdx] = i1 <= i2 ? [i1, i2] : [i2, i1];
            const midY = ((startIdx + endIdx) / 2) * stationSpacing + 125;
            
            return (
              <g key={`att-group-${idx}`}>
                {stationOrder.map((_, index) => {
                  if (index === stationOrder.length - 1 || index < startIdx || index >= endIdx) return null;
                  const y1 = stationSpacing * index + 120;
                  const y2 = stationSpacing * (index + 1) + 120;
                  return (
                    <line
                      key={`att-line-${idx}-${index}`}
                      x1={attX}
                      y1={y1}
                      x2={attX}
                      y2={y2}
                      stroke="#000000ff"
                      strokeWidth="4"
                      strokeDasharray="6,4"
                    />
                  );
                })}

                {/* center label for +X mins */}
                {additionalTime && (
                  <text
                    x={attX - 12}
                    y={midY}
                    textAnchor="end"
                    fontSize="11"
                    fill="#000000ff"
                  >
                    {wrapText(addtext, 13).map((line, i) => (
                    <tspan key={i} x={attX - 10} dy={i === 0 ? 0 : '1.1em'}>
                      {line}
                    </tspan>
                  ))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend (square, top-left) */}
        <div
          style={{
            position: 'absolute',
            top: '130px',
            left: '10px',
            width: '400px',
            height: `85px`,
            fontSize: '12px',
            padding: '10px',
            backgroundColor: 'rgba(255, 204, 0, 0.35)',
            borderRadius: '12px',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
            zIndex: 20,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            boxSizing: 'border-box',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              margin: 0,
              marginBottom: '6px',
              lineHeight: 1.1,
            }}
          >
            Legend
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              columnGap: '30px',
              alignContent: 'start'
            }}
          >
            {hasBus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={busIcon} alt="Bus Service" width={16} height={16} />
                <span>{busLegendText}</span>
              </div>
            )}
            {hasAtt && (
              <div style={{ display: 'flex', alignItems: 'center', marginRight:'-30px' }}>
                <svg width="30" height="6">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="#000000ff" strokeWidth="3" strokeDasharray="4,3" />
                </svg>
                <span>Additional Travel Time</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="30" height="6">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="#800080" strokeWidth="5" />
                </svg>
                <span>Train Service Available</span>
            </div>
          </div>
        </div>
      </div>

      <img
        src={sbsLogo}
        alt="SBS Transit"
        style={{ position: 'absolute', bottom: '0px', right: '15px', width: '80px' }}
      />
    </div>
  );
};

export default Infographic;
