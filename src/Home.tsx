// src/Home.tsx
import React, { useState } from 'react';
import Dropdown from './components/Dropdown';
import { useNavigate } from 'react-router-dom';
import { exportInfographic } from './components/Screenshot';
import minnova from './assets/icons/MINNOVA.png';

const SENGKANG_SINGLETRACKS = [
  { key: 'SK_SW8_SE1', west: 'SW8 Renjong', east: 'SE1 Compassvale' },
  { key: 'SK_SW1_SE1', west: 'SW1 Cheng Lim', east: 'SE1 Compassvale' },
  { key: 'SK_SW8_SE5', west: 'SW8 Renjong', east: 'SE5 Ranggung' },
  { key: 'SK_SW1_SE5', west: 'SW1 Cheng Lim', east: 'SE5 Ranggung' },
] as const;

const PUNGGOL_SINGLETRACKS = [
  { key: 'PG_PW7_PE7', west: 'PW7 Soo Teck', east: 'PE7 Damai' },
  { key: 'PG_PW1_PE7', west: 'PW1 Sam Kee', east: 'PE7 Damai' },
  { key: 'PG_PW7_PE1', west: 'PW7 Soo Teck', east: 'PE1 Cove' },
  { key: 'PG_PW1_PE1', west: 'PW1 Sam Kee', east: 'PE1 Cove' },
] as const;

// Base
type Line = 'NEL' | 'DTL' | 'LRT';
type LRTLine = 'Sengkang' | 'Punggol' | 'Both';
type Status = 'unavailable' | 'singletrack';
type Scope =
  | 'Both'
  | 'Sengkang' | 'Punggol'
  | 'SengkangEast' | 'SengkangWest'
  | 'PunggolEast' | 'PunggolWest';

type SE = 'SE1' | 'SE5';
type SW = 'SW1' | 'SW8';
type PE = 'PE1' | 'PE7';
type PW = 'PW1' | 'PW7';

type Timeband = 'morning' | 'afternoon' | 'evening';

type ScenarioKey =
  | 'Both_Unavailable'
  | 'Punggol_Unavailable'
  | 'PunggolWest_PW1_Unavailable'
  | 'PunggolWest_PW7_Unavailable'
  | 'PunggolEast_PE7_Unavailable'
  | 'PunggolEast_PE1_Unavailable'
  | 'Sengkang_Unavailable'
  | 'SengkangWest_SW1_Unavailable'
  | 'SengkangWest_SW8_Unavailable'
  | 'SengkangEast_SE1_Unavailable'
  | 'SengkangEast_SE5_Unavailable'

  // Single-track (Sengkang)
  | 'Sengkang_SW8_SE1'
  | 'Sengkang_SW1_SE1'
  | 'Sengkang_SW8_SE5'
  | 'Sengkang_SW1_SE5'

  // Single-track (Punggol)
  | 'Punggol_PW7_PE7'
  | 'Punggol_PW1_PE7'
  | 'Punggol_PW7_PE1'
  | 'Punggol_PW1_PE1'

  // Combined Single-track (Both)
  | 'Both_SW8_SE1_PW7_PE7'
  | 'Both_SW1_SE1_PW7_PE7'
  | 'Both_SW8_SE5_PW7_PE7'
  | 'Both_SW1_SE5_PW7_PE7'
  | 'Both_SW8_SE1_PW1_PE7'
  | 'Both_SW1_SE1_PW1_PE7'
  | 'Both_SW8_SE5_PW1_PE7'
  | 'Both_SW1_SE5_PW1_PE7'
  | 'Both_SW8_SE1_PW7_PE1'
  | 'Both_SW1_SE1_PW7_PE1'
  | 'Both_SW8_SE5_PW7_PE1'
  | 'Both_SW1_SE5_PW7_PE1'
  | 'Both_SW8_SE1_PW1_PE1'
  | 'Both_SW1_SE1_PW1_PE1'
  | 'Both_SW8_SE5_PW1_PE1'
  | 'Both_SW1_SE5_PW1_PE1';

// Union of all possible towards values
type Towards = SE | SW | PE | PW;
type SingleTrackDirs = {
  sk?: { west: SW; east: SE }; // Sengkang pair
  pg?: { west: PW; east: PE }; // Punggol pair
};
type ScenarioPreset = {
  status: Status;
  scope: Scope;
  lrtLine: LRTLine;
  // For ‘unavailable’ this is undefined; for ‘singletrack’, this carries the pairs
  single?: SingleTrackDirs;
  towards?: Towards;
};

type DisruptionType = 'Disruption' | 'Delay';
type BusType = 'regular' | 'both';
type Range = { from: string; to: string };

const nelStationOrder = [
  "None", "NE1 HarbourFront", "NE3 Outram Park", "NE4 Chinatown", "NE5 Clarke Quay",
  "NE6 Dhoby Ghaut", "NE7 Little India", "NE8 Farrer Park", "NE9 Boon Keng",
  "NE10 Potong Pasir", "NE11 Woodleigh", "NE12 Serangoon", "NE13 Kovan",
  "NE14 Hougang", "NE15 Buangkok", "NE16 Sengkang", "NE17 Punggol", "NE18 Punggol Coast"
];

const baseDTLStations = [
  "None",
  "DT1 Bukit Panjang", "DT2 Cashew", "DT3 Hillview", "DT4 Hume",
  "DT5 Beauty World", "DT6 King Albert Park", "DT7 Sixth Avenue",
  "DT8 Tan Kah Kee", "DT9 Botanic Gardens", "DT10 Stevens",
  "DT11 Newton", "DT12 Little India", "DT13 Rochor", "DT14 Bugis",
  "DT15 Promenade", "DT16 Bayfront", "DT17 Downtown",
  "DT18 Telok Ayer", "DT19 Chinatown", "DT20 Fort Canning",
  "DT21 Bencoolen", "DT22 Jalan Besar", "DT23 Bendemeer",
  "DT24 Geylang Bahru", "DT25 Mattar", "DT26 MacPherson",
  "DT27 Ubi", "DT28 Kaki Bukit", "DT29 Bedok North",
  "DT30 Bedok Reservoir", "DT31 Tampines West", "DT32 Tampines",
  "DT33 Tampines East", "DT34 Upper Changi", "DT35 Expo",
];

const newDTLStations = [
  "DT36 Xilin",
  "DT37 Sungei Bedok",
];


export const DIRECTIONS = ['Clockwise', 'Counterclockwise'] as const;
export const LRT_LINES  = ['Sengkang', 'Punggol', 'Both'] as const;
export const STATUSES   = ['unavailable', 'singletrack'] as const;
export const SCOPES     = ['Both','Sengkang','Punggol','SengkangEast','SengkangWest','PunggolEast','PunggolWest'] as const;

export const TOWARDS_OPTIONS: Record<Scope, readonly string[]> = {
  Both: [],
  Sengkang: [],
  Punggol: [],
  SengkangEast: ['','SE1','SE5'],
  SengkangWest: ['','SW1','SW8'],
  PunggolEast: ['','PE1','PE7'],
  PunggolWest: ['','PW1','PW7'],
} as const;

const TIMEBAND_LABEL: Record<Timeband, string> = {
  morning: 'for the morning peak period.',
  afternoon: 'for the afternoon peak period.',
  evening: 'for the evening peak period.',
};

const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioPreset> = {
  // --- Unavailable ---
  Both_Unavailable:             { status: 'unavailable', scope: 'Both',        lrtLine: 'Both' },
  Punggol_Unavailable:          { status: 'unavailable', scope: 'Punggol',     lrtLine: 'Punggol' },

  // Punggol leaves (add towards)
  PunggolWest_PW1_Unavailable:  { status: 'unavailable', scope: 'PunggolWest', lrtLine: 'Punggol', towards: 'PW1' },
  PunggolWest_PW7_Unavailable:  { status: 'unavailable', scope: 'PunggolWest', lrtLine: 'Punggol', towards: 'PW7' },
  PunggolEast_PE7_Unavailable:  { status: 'unavailable', scope: 'PunggolEast', lrtLine: 'Punggol', towards: 'PE7' },
  PunggolEast_PE1_Unavailable:  { status: 'unavailable', scope: 'PunggolEast', lrtLine: 'Punggol', towards: 'PE1' },

  // Sengkang (add towards)
  Sengkang_Unavailable:         { status: 'unavailable', scope: 'Sengkang',    lrtLine: 'Sengkang' },
  SengkangWest_SW1_Unavailable: { status: 'unavailable', scope: 'SengkangWest',lrtLine: 'Sengkang', towards: 'SW1' },
  SengkangWest_SW8_Unavailable: { status: 'unavailable', scope: 'SengkangWest',lrtLine: 'Sengkang', towards: 'SW8' },
  SengkangEast_SE1_Unavailable: { status: 'unavailable', scope: 'SengkangEast',lrtLine: 'Sengkang', towards: 'SE1' },
  SengkangEast_SE5_Unavailable: { status: 'unavailable', scope: 'SengkangEast',lrtLine: 'Sengkang', towards: 'SE5' },

  // --- Single-track: Sengkang ---
  Sengkang_SW8_SE1: { status: 'singletrack', scope: 'Sengkang', lrtLine: 'Sengkang',
    single: { sk: { west: 'SW8', east: 'SE1' } } },
  Sengkang_SW1_SE1: { status: 'singletrack', scope: 'Sengkang', lrtLine: 'Sengkang',
    single: { sk: { west: 'SW1', east: 'SE1' } } },
  Sengkang_SW8_SE5: { status: 'singletrack', scope: 'Sengkang', lrtLine: 'Sengkang',
    single: { sk: { west: 'SW8', east: 'SE5' } } },
  Sengkang_SW1_SE5: { status: 'singletrack', scope: 'Sengkang', lrtLine: 'Sengkang',
    single: { sk: { west: 'SW1', east: 'SE5' } } },

  // --- Single-track: Punggol ---
  Punggol_PW7_PE7: { status: 'singletrack', scope: 'Punggol', lrtLine: 'Punggol',
    single: { pg: { west: 'PW7', east: 'PE7' } } },
  Punggol_PW1_PE7: { status: 'singletrack', scope: 'Punggol', lrtLine: 'Punggol',
    single: { pg: { west: 'PW1', east: 'PE7' } } },
  Punggol_PW7_PE1: { status: 'singletrack', scope: 'Punggol', lrtLine: 'Punggol',
    single: { pg: { west: 'PW7', east: 'PE1' } } },
  Punggol_PW1_PE1: { status: 'singletrack', scope: 'Punggol', lrtLine: 'Punggol',
    single: { pg: { west: 'PW1', east: 'PE1' } } },

  // --- Single-track: Combined (Sengkang + Punggol) ---
  Both_SW8_SE1_PW7_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE1' }, pg: { west: 'PW7', east: 'PE7' } } },
  Both_SW1_SE1_PW7_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE1' }, pg: { west: 'PW7', east: 'PE7' } } },
  Both_SW8_SE5_PW7_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE5' }, pg: { west: 'PW7', east: 'PE7' } } },
  Both_SW1_SE5_PW7_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE5' }, pg: { west: 'PW7', east: 'PE7' } } },

  Both_SW8_SE1_PW1_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE1' }, pg: { west: 'PW1', east: 'PE7' } } },
  Both_SW1_SE1_PW1_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE1' }, pg: { west: 'PW1', east: 'PE7' } } },
  Both_SW8_SE5_PW1_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE5' }, pg: { west: 'PW1', east: 'PE7' } } },
  Both_SW1_SE5_PW1_PE7: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE5' }, pg: { west: 'PW1', east: 'PE7' } } },

  Both_SW8_SE1_PW7_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE1' }, pg: { west: 'PW7', east: 'PE1' } } },
  Both_SW1_SE1_PW7_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE1' }, pg: { west: 'PW7', east: 'PE1' } } },
  Both_SW8_SE5_PW7_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE5' }, pg: { west: 'PW7', east: 'PE1' } } },
  Both_SW1_SE5_PW7_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE5' }, pg: { west: 'PW7', east: 'PE1' } } },

  Both_SW8_SE1_PW1_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE1' }, pg: { west: 'PW1', east: 'PE1' } } },
  Both_SW1_SE1_PW1_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE1' }, pg: { west: 'PW1', east: 'PE1' } } },
  Both_SW8_SE5_PW1_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW8', east: 'SE5' }, pg: { west: 'PW1', east: 'PE1' } } },
  Both_SW1_SE5_PW1_PE1: { status: 'singletrack', scope: 'Both', lrtLine: 'Both',
    single: { sk: { west: 'SW1', east: 'SE5' }, pg: { west: 'PW1', east: 'PE1' } } },
};

type Direction = 'Clockwise' | 'Counterclockwise'; // if removed, add back

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [enableDTLNewStations, setEnableDTLNewStations] = useState(false);
  const dtlStationOrder = enableDTLNewStations
  ? [...baseDTLStations, ...newDTLStations]
  : baseDTLStations;

  const [enableAdditionalTime, setEnableAdditionalTime] = useState(false);

  const [line, setLine] = useState<Line>('NEL');
  const [LRTLine, setLRTLine] = useState<LRTLine>('Sengkang');
  const [status, setStatus] = useState<Status>('unavailable');
  const [scope, setScope]   = useState<Scope>('Both');
  const [towards, setTowards] = useState<'' | Towards>('');
  const [scenarioKey, setScenarioKey] = useState<'' | ScenarioKey>('');

  const [LRTSKEDir, setLRTSKEDir] = useState<Direction>('Clockwise'); // Sengkang East
  const [LRTSKWDir, setLRTSKWDir] = useState<Direction>('Clockwise'); // Sengkang West
  const [LRTPGEDir, setLRTPGEDir] = useState<Direction>('Clockwise'); // Punggol East
  const [LRTPGWDir, setLRTPGWDir] = useState<Direction>('Clockwise'); // Punggol West
  
  const [enableManualTime, setEnableManualTime] = useState(false);
  const [manualHour, setManualHour] = useState('12');
  const [manualMinute, setManualMinute] = useState('00');
  const [manualAmPm, setManualAmPm] = useState<'AM' | 'PM'>('AM');

  const applyScenario = (key: ScenarioKey) => {
    const p = SCENARIO_PRESETS[key];
    if (!p) return;
    
    setStatus(p.status);
    onScopeChange(p.scope);
    setLRTLine(p.lrtLine);
    setLine('LRT');

    // ⬇ keep this
    setTowards('');

    // ⬅ NEW: if preset carries a towards (for Unavailable leaves), set it
    if (p.towards) setTowards(p.towards);

    // Map single-track codes to directions
    if (p.status === 'singletrack' && p.single) {
      if (p.single.sk) {
        // East loop: SE1 ⇒ CW, SE5 ⇒ CCW
        setLRTSKEDir(p.single.sk.east === 'SE1' ? 'Clockwise' : 'Counterclockwise');
        // West loop: SW8 ⇒ CW, SW1 ⇒ CCW
        setLRTSKWDir(p.single.sk.west === 'SW8' ? 'Clockwise' : 'Counterclockwise');
      }
      if (p.single.pg) {
        // East loop: PE7 ⇒ CW, PE1 ⇒ CCW
        setLRTPGEDir(p.single.pg.east === 'PE7' ? 'Clockwise' : 'Counterclockwise');
        // West loop: PW7 ⇒ CW, PW1 ⇒ CCW
        setLRTPGWDir(p.single.pg.west === 'PW7' ? 'Clockwise' : 'Counterclockwise');
      }
    }
  };

  const onScopeChange = (s: Scope) => {
    setScope(s);
    setTowards('');
    if (s.startsWith('Sengkang')) setLRTLine('Sengkang');
    else if (s.startsWith('Punggol')) setLRTLine('Punggol');
    else setLRTLine('Both');
  };

  const defaultTimeband = (() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
  })() as Timeband;
  const [timeband, setTimeband] = useState<Timeband>(defaultTimeband);

  const [type, setType] = useState<DisruptionType>('Disruption');
  const [additionalTime, setAdditionalTime] = useState<string>('5');
  const [busType, setBusType] = useState<BusType>('regular');

  // Station options only used for NEL/DTL
  const fullStationOrder = line === 'NEL' ? nelStationOrder : dtlStationOrder;

  // Separate states for each line
  const [nelDisrupted, setNelDisrupted] = useState<Range[]>([{ from: "NE13 Kovan", to: "NE15 Buangkok" }]);
  const [dtlDisrupted, setDtlDisrupted] = useState<Range[]>([{ from: "DT14 Bugis", to: "DT19 Chinatown" }]);

  const [nelBus, setNelBus] = useState<Range[]>([{ from: "NE12 Serangoon", to: "NE18 Punggol Coast" }]);
  const [dtlBus, setDtlBus] = useState<Range[]>([{ from: "DT9 Botanic Gardens", to: "DT26 MacPherson" }]);

  const [nelShuttle, setNelShuttle] = useState<Range[]>([{ from: "NE16 Sengkang", to: "NE18 Punggol Coast" }]);
  const [dtlShuttle, setDtlShuttle] = useState<Range[]>([{ from: "None", to: "None" }]);

  const [nelAddTime, setNelAddTime] = useState<Range[]>([{ from: "NE9 Boon Keng", to: "NE18 Punggol Coast" }]);
  const [dtlAddTime, setDtlAddTime] = useState<Range[]>([{ from: "DT5 Beauty World", to: "DT30 Bedok Reservoir" }]);

  const disruptedRanges = line === 'NEL' ? nelDisrupted : dtlDisrupted;
  const setDisruptedRanges = line === 'NEL' ? setNelDisrupted : setDtlDisrupted;

  const shuttleRanges = line === 'NEL' ? nelShuttle : dtlShuttle;
  const setShuttleRanges = line === 'NEL' ? setNelShuttle : setDtlShuttle;

  const busRanges = line === 'NEL' ? nelBus : dtlBus;
  const setBusRanges = line === 'NEL' ? setNelBus : setDtlBus;

  const additionalTimes = Array.from({ length: 12 }, (_, i) => String((i + 1) * 5));

  const addTimeRanges = line === 'NEL' ? nelAddTime : dtlAddTime;
  const setAddTimeRanges = line === 'NEL' ? setNelAddTime : setDtlAddTime;

  const onContinue = () => {
    // Base query always includes these
    const query = new URLSearchParams({
      type,
      line,
      busType,
    });

    // For LRT, no extra sections/params — just go
    if (line === 'LRT') {
      query.set('lrtLine', LRTLine);
      query.set('status', status);
      query.set('scope', scope);
      if (towards) query.set('towards', towards);
      if (status === 'singletrack') query.set('timeband', TIMEBAND_LABEL[timeband]);

      // pass loop directions so LRTInfo can render correct CW/CCW variants
      query.set('lrtSKEDir', LRTSKEDir);
      query.set('lrtSKWDir', LRTSKWDir);
      query.set('lrtPGEDir', LRTPGEDir);
      query.set('lrtPGWDir', LRTPGWDir);

      navigate(`/infographic-LRT?${query.toString()}`);
      return;
    }

    // NEL / DTL behavior (unchanged)
    disruptedRanges.forEach((r, i) => {
      query.append(`disruptedStart${i}`, r.from);
      query.append(`disruptedEnd${i}`, r.to);
    });
    shuttleRanges.forEach((r, i) => {
      query.append(`shuttleFrom${i}`, r.from);
      query.append(`shuttleTo${i}`, r.to);
    });
    busRanges.forEach((r, i) => {
      query.append(`busFrom${i}`, r.from);
      query.append(`busTo${i}`, r.to);
    });
    
    if (type === 'Delay') {
      addTimeRanges.forEach((r, i) => {
        query.append(`attFrom${i}`, r.from);
        query.append(`attTo${i}`, r.to);
      });
    }

    if (type === 'Delay' && enableAdditionalTime) {
      query.set('additionalTime', additionalTime);
    }

    if (enableManualTime) {
      query.set('time', `${manualHour}:${manualMinute} ${manualAmPm}`);
    }

    if (line === 'DTL' && enableDTLNewStations) {
      query.set('dtlNew', '1');
    }
    
    navigate(`/infographic-${line}${type.toLowerCase()}?${query.toString()}`);
  };

  const renderRangeSection = (label: string, ranges: Range[], setRanges: (v: Range[]) => void) => (
    <>
      <h3>{label}</h3>
      {ranges.map((range, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <Dropdown
            label="From"
            options={fullStationOrder}
            selected={range.from}
            onChange={(val) => {
              const updated = [...ranges];
              updated[i] = { ...updated[i], from: val };
              setRanges(updated);
            }}
          />
          <Dropdown
            label="To"
            options={fullStationOrder}
            selected={range.to}
            onChange={(val) => {
              const updated = [...ranges];
              updated[i] = { ...updated[i], to: val };
              setRanges(updated);
            }}
          />
        </div>
      ))}
      <button onClick={() => setRanges([...ranges, { from: "None", to: "None" }])}>
        Add More
      </button>
    </>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ display: 'inline-block' }}>Infographic Generator</h1>
      <img
        src={minnova}
        alt="SBS Transit"
        style={{ float: 'right', width: '200px' }}
      />
      <div style={{ clear: 'both' }} />

      <h3>Choose Line</h3>
      <div>
        <label>
          <input type="radio" value="NEL" checked={line === 'NEL'} onChange={() => setLine('NEL')} /> NEL
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input type="radio" value="DTL" checked={line === 'DTL'} onChange={() => {setLine('DTL'); setScenarioKey('');} }/> DTL
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input type="radio" value="LRT" checked={line === 'LRT'} onChange={() => {setLine('LRT');setScenarioKey('');} }/> LRT
        </label>
        {line === 'DTL' && (
          <label style={{ display: 'block', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={enableDTLNewStations}
              onChange={(e) => setEnableDTLNewStations(e.target.checked)}
            />
            Enable new DTL stations (DT36 Xilin, DT37 Sungei Bedok)
          </label>
        )}
      </div>

      {line === 'LRT' && (
        <>
          <h3>Bus Type</h3>
          <div>
            <label>
              <input
                type="radio"
                name="busType"
                value="regular"
                checked={busType === 'regular'}
                onChange={() => setBusType('regular')}
              />{' '}
              Regular
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="busType"
                value="both"
                checked={busType === 'both'}
                onChange={() => setBusType('both')}
              />{' '}
              Regular &amp; Bridging Bus
            </label>
          </div>

          <h3>Scenario Preset</h3>
          <select
            value={scenarioKey}
            onChange={e => {
              const v = e.target.value as '' | ScenarioKey;
              setScenarioKey(v);
              if (v) applyScenario(v);
            }}
            style={{
              width: '70%',
              marginBottom: 10,
              padding: '6px',
              fontSize: '18px',
              lineHeight: 1.4,
            }}
          >
            <option value="">— Select a scenario —</option>

            <optgroup label="Unavailable">
              <option value="Both_Unavailable">• Sengkang–Punggol LRT</option>

              <option disabled>── Punggol ──</option>
              <option value="Punggol_Unavailable">Punggol LRT (entire line)</option>
              <option value="PunggolWest_PW1_Unavailable">↳ West Loop → PW1 Sam Kee</option>
              <option value="PunggolWest_PW7_Unavailable">↳ West Loop → PW7 Soo Teck</option>
              <option value="PunggolEast_PE1_Unavailable">↳ East Loop → PE1 Cove</option>
              <option value="PunggolEast_PE7_Unavailable">↳ East Loop → PE7 Damai</option>

              <option disabled>── Sengkang ──</option>
              <option value="Sengkang_Unavailable">Sengkang LRT (entire line)</option>
              <option value="SengkangWest_SW1_Unavailable">↳ West Loop → SW1 Cheng Lim</option>
              <option value="SengkangWest_SW8_Unavailable">↳ West Loop → SW8 Renjong</option>
              <option value="SengkangEast_SE1_Unavailable">↳ East Loop → SE1 Compassvale</option>
              <option value="SengkangEast_SE5_Unavailable">↳ East Loop → SE5 Ranggung</option>
            </optgroup>

            <optgroup label="Single-track (Peak Period)">
              <option disabled>── Sengkang ──</option>
              <option value="Sengkang_SW8_SE1">Sengkang → SW8 Renjong + SE1 Compassvale</option>
              <option value="Sengkang_SW1_SE1">Sengkang → SW1 Cheng Lim + SE1 Compassvale</option>
              <option value="Sengkang_SW8_SE5">Sengkang → SW8 Renjong + SE5 Ranggung</option>
              <option value="Sengkang_SW1_SE5">Sengkang → SW1 Cheng Lim + SE5 Ranggung</option>

              <option disabled>── Punggol ──</option>
              <option value="Punggol_PW7_PE7">Punggol → PW7 Soo Teck + PE7 Damai</option>
              <option value="Punggol_PW1_PE7">Punggol → PW1 Sam Kee + PE7 Damai</option>
              <option value="Punggol_PW7_PE1">Punggol → PW7 Soo Teck + PE1 Cove</option>
              <option value="Punggol_PW1_PE1">Punggol → PW1 Sam Kee + PE1 Cove</option>

              <option disabled>── Combined (Both) ──</option>
              <option value="Both_SW8_SE1_PW7_PE7">Both → SW8+SE1 & PW7+PE7</option>
              <option value="Both_SW1_SE1_PW7_PE7">Both → SW1+SE1 & PW7+PE7</option>
              <option value="Both_SW8_SE5_PW7_PE7">Both → SW8+SE5 & PW7+PE7</option>
              <option value="Both_SW1_SE5_PW7_PE7">Both → SW1+SE5 & PW7+PE7</option>
              <option value="Both_SW8_SE1_PW1_PE7">Both → SW8+SE1 & PW1+PE7</option>
              <option value="Both_SW1_SE1_PW1_PE7">Both → SW1+SE1 & PW1+PE7</option>
              <option value="Both_SW8_SE5_PW1_PE7">Both → SW8+SE5 & PW1+PE7</option>
              <option value="Both_SW1_SE5_PW1_PE7">Both → SW1+SE5 & PW1+PE7</option>
              <option value="Both_SW8_SE1_PW7_PE1">Both → SW8+SE1 & PW7+PE1</option>
              <option value="Both_SW1_SE1_PW7_PE1">Both → SW1+SE1 & PW7+PE1</option>
              <option value="Both_SW8_SE5_PW7_PE1">Both → SW8+SE5 & PW7+PE1</option>
              <option value="Both_SW1_SE5_PW7_PE1">Both → SW1+SE5 & PW7+PE1</option>
              <option value="Both_SW8_SE1_PW1_PE1">Both → SW8+SE1 & PW1+PE1</option>
              <option value="Both_SW1_SE1_PW1_PE1">Both → SW1+SE1 & PW1+PE1</option>
              <option value="Both_SW8_SE5_PW1_PE1">Both → SW8+SE5 & PW1+PE1</option>
              <option value="Both_SW1_SE5_PW1_PE1">Both → SW1+SE5 & PW1+PE1</option>
            </optgroup>
          </select>

          {status === 'singletrack' && (
            <>
              <h3>Timeband</h3>
              <select
                value={timeband}
                onChange={e => setTimeband(e.target.value as Timeband)}
                style={{
                width: '20%',
                marginBottom: 10,
                padding: '10px',
                fontSize: '18px',
              }}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </>
          )}

          <h3>Additional Travel Time</h3>
          <Dropdown
            label="Minutes"
            options={additionalTimes}
            selected={additionalTime}
            onChange={setAdditionalTime}

          />
        </>
      )}

      {/* When LRT is chosen, hide all the NEL/DTL-specific sections */}
      {line !== 'LRT' && (
        <>
        <h3>Choose Type</h3>
          <div>
            <label>
              <input
                type="radio"
                value="Disruption"
                checked={type === 'Disruption'}
                onChange={() => setType('Disruption')}
              /> Disruption
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                value="Delay"
                checked={type === 'Delay'}
                onChange={() => setType('Delay')}
              /> Delay
            </label>
          </div>
          
          <h3>Header Time</h3>
          <label>
            <input
              type="checkbox"
              checked={enableManualTime}
              onChange={(e) => setEnableManualTime(e.target.checked)}
            />
            Use custom time/date
          </label>

          {enableManualTime && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  value={manualHour}
                  onChange={(e) => setManualHour(e.target.value)}
                  placeholder="HH"
                  style={{ width: '50px' }}
                />
                :
                <input
                  type="text"
                  value={manualMinute}
                  onChange={(e) => setManualMinute(e.target.value)}
                  placeholder="MM"
                  style={{ width: '50px' }}
                />

                <select
                  value={manualAmPm}
                  onChange={(e) => setManualAmPm(e.target.value as 'AM' | 'PM')}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </>
          )}

          {type === 'Delay' && (
            <>
              <h3>Additional Travel Time</h3>

              {/* Timing toggle */}
              <label>
                <input
                  type="checkbox"
                  checked={enableAdditionalTime}
                  onChange={(e) => setEnableAdditionalTime(e.target.checked)}
                />
                Show additional travel time (minutes)
              </label>

              {/* Minutes dropdown ONLY controls text */}
              {enableAdditionalTime && (
                <Dropdown
                  label="Minutes"
                  options={additionalTimes}
                  selected={additionalTime}
                  onChange={setAdditionalTime}
                />
              )}

              {/* ATT line ranges are ALWAYS visible for Delay */}
              {renderRangeSection(
                "Additional Travel Time Line",
                addTimeRanges,
                setAddTimeRanges
              )}
            </>
          )}


          <h3>Bus Type</h3>
          <div>
            <label>
              <input
                type="radio"
                name="busType"
                value="regular"
                checked={busType === 'regular'}
                onChange={() => setBusType('regular')}
              />{' '}
              Regular
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="busType"
                value="both"
                checked={busType === 'both'}
                onChange={() => setBusType('both')}
              />{' '}
              Regular &amp; Bridging Bus
            </label>
          </div>

          {type === "Disruption" && renderRangeSection("Affected Stations", disruptedRanges, setDisruptedRanges)}
          {renderRangeSection("Bus Route", busRanges, setBusRanges)}
          {type === "Disruption" && renderRangeSection("Shuttle Train Route", shuttleRanges, setShuttleRanges)}
        </>
      )}
      
      <button onClick={onContinue} style={{ marginTop: '20px', padding: '12px', width: '100%' }}>
        Generate Infographic
      </button>
      <button onClick={() => exportInfographic('#infographic')}>
        📸 Export Infographic
      </button>
    </div>
  );
};

export default Home;
