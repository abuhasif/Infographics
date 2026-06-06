// src/DTLInfoDelay.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/header';

import busIcon from './assets/icons/busicon.png';
import sbsLogo from './assets/icons/sbs_logo.png';

import cclIcon from './assets/icons/ccl_icon.png';
import ewlIcon from './assets/icons/ewl_icon.png';
import telIcon from './assets/icons/tel_icon.png';
import nslIcon from './assets/icons/nsl_icon.png';
import nelIcon from './assets/icons/nel_icon.png';
import lrtIcon from './assets/icons/lrt_icon.png';

// Convert relative paths to absolute (for html2canvas)
const abs = (p: string) => new URL(p, window.location.href).toString();

const lineIcons: Record<string, string> = {
  'ccl_icon.png': cclIcon,
  'ewl_icon.png': ewlIcon,
  'tel_icon.png': telIcon,
  'nsl_icon.png': nslIcon,
  'nel_icon.png': nelIcon,
  'lrt_icon.png': lrtIcon,
};

// --- Full DTL Station Data (DT1–DT35) ---
const allDTLStations = [
  { code: 'DT1',  name: 'Bukit Panjang', icon: 'lrt' },
  { code: 'DT2',  name: 'Cashew' },
  { code: 'DT3',  name: 'Hillview' },
  { code: 'DT4',  name: 'Hume' },
  { code: 'DT5',  name: 'Beauty World' },
  { code: 'DT6',  name: 'King Albert Park' },
  { code: 'DT7',  name: 'Sixth Avenue' },
  { code: 'DT8',  name: 'Tan Kah Kee' },
  { code: 'DT9',  name: 'Botanic Gardens', icon: 'ccl' },
  { code: 'DT10', name: 'Stevens',         icon: 'tel' },
  { code: 'DT11', name: 'Newton',          icon: 'nsl' },
  { code: 'DT12', name: 'Little India',    icon: 'nel' },
  { code: 'DT13', name: 'Rochor' },
  { code: 'DT14', name: 'Bugis',           icon: 'ewl' },
  { code: 'DT15', name: 'Promenade',       icon: 'ccl' },
  { code: 'DT16', name: 'Bayfront',        icon: 'ccl' },
  { code: 'DT17', name: 'Downtown' },
  { code: 'DT18', name: 'Telok Ayer' },

  { code: 'DT19', name: 'Chinatown',       icon: 'nel' },
  { code: 'DT20', name: 'Fort Canning' },
  { code: 'DT21', name: 'Bencoolen' },
  { code: 'DT22', name: 'Jalan Besar' },
  { code: 'DT23', name: 'Bendemeer' },
  { code: 'DT24', name: 'Geylang Bahru' },
  { code: 'DT25', name: 'Mattar' },
  { code: 'DT26', name: 'MacPherson',      icon: 'ccl' },
  { code: 'DT27', name: 'Ubi' },
  { code: 'DT28', name: 'Kaki Bukit' },
  { code: 'DT29', name: 'Bedok North' },
  { code: 'DT30', name: 'Bedok Reservoir' },
  { code: 'DT31', name: 'Tampines West' },
  { code: 'DT32', name: 'Tampines',        icon: 'ewl' },
  { code: 'DT33', name: 'Tampines East' },
  { code: 'DT34', name: 'Upper Changi' },
  { code: 'DT35', name: 'Expo',            icon: 'ewl' },
];

// Pull DT numbers from any query value (works for "DT18 Telok Ayer" or "DT18")
const extractDTNums = (params: URLSearchParams): number[] => {
  const out: number[] = [];
  for (const v of Array.from(params.values())) {
    const m = /DT\s*(\d+)/i.exec(v);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (!Number.isNaN(n)) out.push(n);
  }
  return out;
};

// Word wrap for SVG text
const wrapText = (text: string, max = 14): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (!line.length) {
      line = w.length <= max ? w : w.slice(0, max);
      continue;
    }
    if ((line + ' ' + w).length <= max) line += ' ' + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
};

// Draw circular image helper
const roundImgTL = (xTL: number, yTL: number, src: string, size = 24) => {
  const cx = xTL + size / 2;
  const cy = yTL + size / 2;
  const url = abs(src);
  return (
    <g>
      <circle cx={cx} cy={cy} r={size / 2} fill="#fff" />
      <image x={xTL} y={yTL} width={size} height={size} href={url} />
      <circle cx={cx} cy={cy} r={size / 2} fill="none" stroke="#fff" strokeWidth="0.5" />
    </g>
  );
};

const DTLInfoDelay: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Decide which half to render (router sends mixed spans to ...Delay2)
  const dtNums = extractDTNums(params);
  const useLeftHalf = dtNums.length === 0 || dtNums.every(n => n <= 18); // default: left if none

  const stationData = allDTLStations.filter(s => {
    const n = parseInt(s.code.slice(2), 10);
    return useLeftHalf ? n <= 18 : n >= 19;
  });
  const stationOrder = stationData.map((s) => `${s.code} ${s.name}`);

  // Range helper uses active stationOrder
  const getRange = (start: string, end: string): string[] => {
    const i1 = stationOrder.indexOf(start);
    const i2 = stationOrder.indexOf(end);
    if (i1 === -1 || i2 === -1) return [];
    return i1 <= i2
      ? stationOrder.slice(i1, i2 + 1)
      : stationOrder.slice(i2, i1 + 1).reverse();
  };

  const getMultipleRanges = (prefixStart: string, prefixEnd: string) => {
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

  // Ranges
  const busRanges = getMultipleRanges('busFrom', 'busTo');
  const attRanges = getMultipleRanges('attFrom', 'attTo');

  const hasBus = busRanges.length > 0;
  const hasAtt = attRanges.length > 0;

  const addStart = attRanges[0]?.from ?? '';
  const addEnd = attRanges[0]?.to ?? '';
  const additionalTime = params.get('additionalTime') ?? '';
  const addtext = `Additional Travel Time of ${additionalTime} minutes`;

  const busType = params.get('busType') ?? 'regular';
  const busRailText =
    busType === 'both'
      ? 'Free Regular and Bridging Bus Service'
      : 'Free Regular Bus Service';
  const busLegendText = busRailText;

  // Layout constants
  const baseX = 242;
  const busX = baseX - 35;
  const textX = baseX + 20;
  const attX = busX - 85;
  const stationSpacing = 32;

  // Legend auto-height for 3-column layout (Train Service + Bus? + ATT?)
  const rows = 1 + (hasBus ? 1 : 0) + (hasAtt ? 1 : 0);
  const HEADER_H = 24;
  const ROW_H = 20;
  const ROW_GAP = 10;
  const PAD_V = 20;
  const visibleRows = Math.ceil(rows / 3);
  const legendHeight =
    HEADER_H +
    PAD_V +
    Math.max(1, visibleRows) * ROW_H +
    (visibleRows > 1 ? (visibleRows - 1) * ROW_GAP : 0);

  // Push SVG down to make room for the legend
  const topOffset = legendHeight + 20;

  return (
    <div style={{ paddingTop: '0px', width: '420px', height: '840px', position: 'relative' }}>
      <Header type="Delay" from={addStart} to={addEnd} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg viewBox="0 0 420 730" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <g transform={`translate(0, ${topOffset})`}>
            {/* Base DTL Blue Line */}
            {stationOrder.map((station, i) => {
              if (i === stationOrder.length - 1) return null;
              const y1 = stationSpacing * i + 20;
              const y2 = stationSpacing * (i + 1) + 20;
              return (
                <line key={i} x1={baseX} y1={y1} x2={baseX} y2={y2} stroke="#0070c0" strokeWidth="6" />
              );
            })}

            {/* Bus Lines */}
            {busRanges.map(({ from, to }, idx) => {
              const i1 = stationOrder.indexOf(from);
              const i2 = stationOrder.indexOf(to);
              if (i1 === -1 || i2 === -1) return null;
              const [start, end] = i1 <= i2 ? [i1, i2] : [i2, i1];
              const midY = ((start + end) / 2) * stationSpacing + 25;
              return (
                <g key={idx}>
                  {stationOrder.map((_, j) => {
                    if (j === stationOrder.length - 1 || j < start || j >= end) return null;
                    const y1 = stationSpacing * j + 20;
                    const y2 = stationSpacing * (j + 1) + 20;
                    return (
                      <line
                        key={j}
                        x1={busX}
                        y1={y1}
                        x2={busX}
                        y2={y2}
                        stroke="#dd3063"
                        strokeWidth="5"
                      />
                    );
                  })}
                  <text x={busX - 8} y={midY - 8} textAnchor="end" fontSize="11" fill="#dd3063">
                    {wrapText(busRailText, 15).map((l, i) => (
                      <tspan key={i} x={busX - 8} dy={i === 0 ? 0 : '1em'}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {/* Stations */}
            {stationOrder.map((station, i) => {
              const y = stationSpacing * i + 20;
              const isBusStop = busRanges.some((r) => r.from === station || r.to === station);
              const isAddStop = attRanges.some((r) => r.from === station || r.to === station);
              const stationInfo = stationData.find((s) => `${s.code} ${s.name}` === station);

              return (
                <g key={station}>
                  {isBusStop && roundImgTL(busX - 11, y - 11, busIcon, 23)}
                  {isAddStop && <circle cx={attX} cy={y} r="8" fill="#000000ff" />}
                  <circle cx={baseX} cy={y} r="8" fill="#0070c0" />
                  <text x={textX} y={y + 5} fontSize="13">
                    {station}
                  </text>

                  {stationInfo?.icon && (
                    <>{roundImgTL(textX + 125, y - 10, lineIcons[`${stationInfo.icon}_icon.png`], 22)}</>
                  )}
                </g>
              );
            })}

            {/* Additional Travel Time */}
            {attRanges.map(({ from, to }, idx) => {
              const i1 = stationOrder.indexOf(from);
              const i2 = stationOrder.indexOf(to);
              if (i1 === -1 || i2 === -1) return null;
              const [start, end] = i1 <= i2 ? [i1, i2] : [i2, i1];
              const midY = ((start + end) / 2) * stationSpacing + 25;

              return (
                <g key={`att-${idx}`}>
                  {stationOrder.map((_, j) => {
                    if (j === stationOrder.length - 1 || j < start || j >= end) return null;
                    const y1 = stationSpacing * j + 20;
                    const y2 = stationSpacing * (j + 1) + 20;
                    return (
                      <line
                        key={j}
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
                  {additionalTime && (
                    <text x={attX - 12} y={midY} textAnchor="end" fontSize="11" fill="#000000ff">
                      {wrapText(addtext, 13).map((l, i) => (
                        <tspan key={i} x={attX - 10} dy={i === 0 ? 0 : '1.1em'}>
                          {l}
                        </tspan>
                      ))}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            top: '125px',
            left: '10px',
            width: '380px',
            height: `${legendHeight}px`,
            fontSize: '12px',
            padding: '10px',
            backgroundColor: 'rgba(255, 204, 0, 0.35)',
            borderRadius: '12px',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
            zIndex: 20,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
          }}
        >
          <h3 style={{ fontSize: '18px', margin: 0, marginBottom: '6px', lineHeight: 1.1 }}>
            Legend
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              columnGap: '30px',
              alignContent: 'start',
            }}
          >
            {hasBus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={busIcon} alt="Bus Service" width={16} height={16} />
                <span>{busLegendText}</span>
              </div>
            )}
            {hasAtt && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="30" height="6">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="#000000ff" strokeWidth="3" strokeDasharray="4,3" />
                </svg>
                <span>Additional Travel Time</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="30" height="6">
                <line x1="0" y1="3" x2="20" y2="3" stroke="#0070c0" strokeWidth="5" />
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

export default DTLInfoDelay;
