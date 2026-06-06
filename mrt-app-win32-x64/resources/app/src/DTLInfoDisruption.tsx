// src/DTLInfoDisruption.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/header';

import shuttleIcon from './assets/icons/shuttle_icon.png';
import busIcon from './assets/icons/busicon.png';

import cclIcon from './assets/icons/ccl_icon.png';
import ewlIcon from './assets/icons/ewl_icon.png';
import telIcon from './assets/icons/tel_icon.png';
import nslIcon from './assets/icons/nsl_icon.png';
import nelIcon from './assets/icons/nel_icon.png';
import lrtIcon from './assets/icons/lrt_icon.png';

import disruptiontrainIcon from './assets/icons/train.png'; // "No Train Service"
import sbsLogo from './assets/icons/sbs_logo.png';

// Build absolute URL so html2canvas can fetch images reliably
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

// Helper: draw a round image given TOP-LEFT coordinates
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

const DTLInfoDisruption: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Decide which half to render (router sends mixed spans to ...Disruption2)
  const dtNums = extractDTNums(params);
  const useLeftHalf = dtNums.length === 0 || dtNums.every(n => n <= 18); // default left if none
  const stationData = allDTLStations.filter(s => {
    const n = parseInt(s.code.slice(2), 10);
    return useLeftHalf ? n <= 18 : n >= 19;
  });
  const stationOrder = stationData.map(s => `${s.code} ${s.name}`);

  // Range helper uses the active stationOrder
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

  // Inputs
  const disruptedRanges = getMultipleRanges('disruptedStart', 'disruptedEnd');
  const shuttleRanges   = getMultipleRanges('shuttleFrom', 'shuttleTo');
  const busRanges       = getMultipleRanges('busFrom', 'busTo');
  const attRanges       = getMultipleRanges('attFrom', 'attTo');

  const hasShuttle = shuttleRanges.length > 0;
  const hasBus     = busRanges.length > 0;
  const hasAtt     = attRanges.length > 0;

  const disruptedSet = new Set(disruptedRanges.flatMap(r => getRange(r.from, r.to)));
  const shuttleSet   = new Set(shuttleRanges.flatMap(r => getRange(r.from, r.to)));
  // (busSet/attSet not needed)

  const disruptedStart = disruptedRanges[0]?.from ?? '';
  const disruptedEnd   = disruptedRanges[0]?.to ?? '';

  const additionalTime = params.get('additionalTime') ?? '';
  const addtext = `Additional Travel Time of ${additionalTime} minutes`;

  const busType = params.get('busType') ?? 'regular';
  const busLegendText =
    busType === 'both' ? 'Free Regular and Bridging Bus Service' : 'Free Regular Bus Service';

  // Layout
  const baseX = 242;
  const busX  = baseX - 80;
  const attX  = busX - 80;
  const textX = baseX + 20;
  const stationSpacing = 32;

  // Legend rows: No Train, Shuttle?, Bus?, ATT?
  const HEADER_H = 24;
  const ROW_H = 20;
  const ROW_GAP = 10;
  const PAD_V = 20;

  const rows =
    1 + (hasShuttle ? 1 : 0) + (hasBus ? 1 : 0) + (hasAtt ? 1 : 0);

  // 2-column legend → only grow height when > 2 items
  const visibleRows = Math.ceil(rows / 2);
  const legendHeight =
    HEADER_H +
    PAD_V +
    Math.max(1, visibleRows) * ROW_H +
    (visibleRows > 1 ? (visibleRows - 1) * ROW_GAP : 0);

  // Push full SVG content down to clear top legend
  const topOffset = legendHeight + 20;

  return (
    <div style={{ paddingTop: 0, width: 420, height: 840, position: 'relative' as const }}>
      <Header type="Disruption" from={disruptedStart} to={disruptedEnd} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg
          viewBox="0 0 420 730"
          width="100%"
          height="100%"
          preserveAspectRatio="xMinYMin meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shift everything below the legend */}
          <g transform={`translate(0, ${topOffset})`}>
            {/* Base Blue Line — skip disrupted segments unless covered by shuttle */}
            {stationOrder.map((station, i) => {
              if (i === stationOrder.length - 1) return null;
              const next = stationOrder[i + 1];
              const isDisruptedSeg = disruptedSet.has(station) || disruptedSet.has(next);
              const isShuttleSeg = shuttleSet.has(station) && shuttleSet.has(next);
              if (isDisruptedSeg && !isShuttleSeg) return null;

              const y1 = stationSpacing * i + 10;
              const y2 = stationSpacing * (i + 1) + 10;
              return (
                <line
                  key={`base-${i}`}
                  x1={baseX}
                  y1={y1}
                  x2={baseX}
                  y2={y2}
                  stroke="#0070c0"
                  strokeWidth="6"
                />
              );
            })}

            {/* Shuttle Line overlay */}
            {stationOrder.map((station, i) => {
              if (i === stationOrder.length - 1) return null;
              const next = stationOrder[i + 1];
              if (!(shuttleSet.has(station) && shuttleSet.has(next))) return null;

              const y1 = stationSpacing * i + 10;
              const y2 = stationSpacing * (i + 1) + 10;
              return (
                <line
                  key={`shuttle-${i}`}
                  x1={baseX}
                  y1={y1}
                  x2={baseX}
                  y2={y2}
                  stroke="#e87e26"
                  strokeWidth="6"
                />
              );
            })}

            {/* Shuttle labels */}
            {shuttleRanges.map(({ from, to }, i) => {
              const i1 = stationOrder.indexOf(from);
              const i2 = stationOrder.indexOf(to);
              if (i1 === -1 || i2 === -1) return null;
              const [startIdx, endIdx] = i1 <= i2 ? [i1, i2] : [i2, i1];
              const midY = ((startIdx + endIdx) / 2) * stationSpacing + 15;
              const shuttleLabelX = baseX - 8;
              return (
                <text
                  key={`shuttle-label-${i}`}
                  x={shuttleLabelX}
                  y={midY - 7}
                  textAnchor="end"
                  fontSize="11"
                  fill="#e87e26"
                >
                  <tspan x={shuttleLabelX} dy="0">Shuttle</tspan>
                  <tspan x={shuttleLabelX} dy="1.1em">Train Service</tspan>
                </text>
              );
            })}

            {/* Bus Line + label */}
            {busRanges.map(({ from, to }, idx) => {
              const i1 = stationOrder.indexOf(from);
              const i2 = stationOrder.indexOf(to);
              if (i1 === -1 || i2 === -1) return null;
              const [startIdx, endIdx] = i1 <= i2 ? [i1, i2] : [i2, i1];
              const midY = ((startIdx + endIdx) / 2) * stationSpacing + 15;

              return (
                <g key={`bus-${idx}`}>
                  {stationOrder.map((_, i) => {
                    if (i === stationOrder.length - 1 || i < startIdx || i >= endIdx) return null;
                    const y1 = stationSpacing * i + 10;
                    const y2 = stationSpacing * (i + 1) + 10;
                    return (
                      <line
                        key={`bus-line-${idx}-${i}`}
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
                    {wrapText(busLegendText, 14).map((line, i) => (
                      <tspan key={i} x={busX - 10} dy={i === 0 ? 0 : '1em'}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {/* Stations (icons + labels) */}
            {stationOrder.map((station, i) => {
              const y = stationSpacing * i + 10;

              const isDisrupted = disruptedSet.has(station);
              const isShuttleStop = shuttleRanges.some(r => r.from === station || r.to === station);
              const isBusStop = busRanges.some(r => r.from === station || r.to === station);
              const isAddStop = attRanges.some(r => r.from === station || r.to === station);
              const info = stationData.find(s => `${s.code} ${s.name}` === station);

              return (
                <g key={`st-${station}`}>
                  {isShuttleStop && roundImgTL(baseX - 12, y - 11, shuttleIcon, 24)}
                  {isBusStop && roundImgTL(busX - 11, y - 11, busIcon, 23)}
                  {isAddStop && <circle cx={attX} cy={y} r="8" fill="#000000ff" />}

                  {isDisrupted
                    ? roundImgTL(baseX - 12, y - 12, disruptiontrainIcon, 24)
                    : !(shuttleSet.has(station)) && (
                        <circle cx={baseX} cy={y} r="8" fill="#0070c0" />
                      )}

                  <text x={textX} y={y + 5} fontSize="13">
                    {station}
                  </text>

                  {info?.icon && roundImgTL(textX + 125, y - 10, lineIcons[`${info.icon}_icon.png`], 22)}
                </g>
              );
            })}

            {/* Additional Travel Time (dashed) */}
            {attRanges.map(({ from, to }, idx) => {
              const i1 = stationOrder.indexOf(from);
              const i2 = stationOrder.indexOf(to);
              if (i1 === -1 || i2 === -1) return null;
              const [startIdx, endIdx] = i1 <= i2 ? [i1, i2] : [i2, i1];
              const midY = ((startIdx + endIdx) / 2) * stationSpacing + 15;

              return (
                <g key={`att-${idx}`}>
                  {stationOrder.map((_, i) => {
                    if (i === stationOrder.length - 1 || i < startIdx || i >= endIdx) return null;
                    const y1 = stationSpacing * i + 10;
                    const y2 = stationSpacing * (i + 1) + 10;
                    return (
                      <line
                        key={`att-line-${idx}-${i}`}
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
          </g>
        </svg>

        {/* Legend (top-left) */}
        <div
          style={{
            position: 'absolute',
            top: '130px',
            left: '10px',
            width: '400px',
            height: `${legendHeight}px`,
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
          <h3 style={{ fontSize: '18px', margin: 0, marginBottom: '6px', lineHeight: 1.1 }}>
            Legend
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: '8px',
              columnGap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={disruptiontrainIcon} alt="No Train Service" width={16} height={16} />
              <span>No Train Service</span>
            </div>

            {hasShuttle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={shuttleIcon} alt="Shuttle Train Service" width={16} height={16} />
                <span>Shuttle Train Service</span>
              </div>
            )}

            {hasBus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={busIcon} alt="Bus Service" width={16} height={16} />
                <span>{busLegendText}</span>
              </div>
            )}

            {hasAtt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="30" height="6">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="#000000ff" strokeWidth="3" strokeDasharray="4,3" />
                </svg>
                <span>Additional Travel Time</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <img
        src={sbsLogo}
        alt="SBS Transit"
        style={{ position: 'absolute', bottom: 0, right: 15, width: 80 }}
      />
    </div>
  );
};

export default DTLInfoDisruption;
