//lrtinfo.tsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Unavailable artwork
const SKDown   = new URL('./assets/icons/SKDown.png',   import.meta.url).href;
const PGDown   = new URL('./assets/icons/PGDown.png',   import.meta.url).href;

const SKWDown  = new URL('./assets/icons/SKWDown.png',  import.meta.url).href;
const SKEDown  = new URL('./assets/icons/SKEDown.png',  import.meta.url).href;
const PGWDown  = new URL('./assets/icons/PGWDown.png',  import.meta.url).href;
const PGEDown  = new URL('./assets/icons/PGEDown.png',  import.meta.url).href;

const SKW1 = new URL('./assets/icons/SKW1.png', import.meta.url).href;
const SKW8 = new URL('./assets/icons/SKW8.png', import.meta.url).href;
const SKE1 = new URL('./assets/icons/SKE1.png', import.meta.url).href;
const SKE5 = new URL('./assets/icons/SKE5.png', import.meta.url).href;

const PGW1 = new URL('./assets/icons/PGW1.png', import.meta.url).href;
const PGW7 = new URL('./assets/icons/PGW7.png', import.meta.url).href;
const PGE1 = new URL('./assets/icons/PGE1.png', import.meta.url).href;
const PGE7 = new URL('./assets/icons/PGE7.png', import.meta.url).href;

const sklrtImg = new URL('./assets/icons/SKLRT.png', import.meta.url).href;
const pglrtImg = new URL('./assets/icons/PunggolLRT.png', import.meta.url).href;
// Sengkang (East then West: CW/CCW)
const SK_CWCW   = new URL('./assets/icons/SKCWCW.png',   import.meta.url).href;
const SK_CWCCW  = new URL('./assets/icons/SKCWCCW.png',  import.meta.url).href;
const SK_CCWCW  = new URL('./assets/icons/SKCCWCW.png',  import.meta.url).href;
const SK_CCWCCW = new URL('./assets/icons/SKCCWCCW.png', import.meta.url).href;

// Punggol (East then West: CW/CCW)
const PG_CWCW   = new URL('./assets/icons/PGCWCW.png',   import.meta.url).href;
const PG_CWCCW  = new URL('./assets/icons/PGCWCCW.png',  import.meta.url).href;
const PG_CCWCW  = new URL('./assets/icons/PGCCWCW.png',  import.meta.url).href;
const PG_CCWCCW = new URL('./assets/icons/PGCCWCCW.png', import.meta.url).href;

import sbsLogo from './assets/icons/sbs_logo.png';

type VariantKey = 'CWCW' | 'CWCCW' | 'CCWCW' | 'CCWCCW';

const SK_VARIANTS: Record<VariantKey, string> = {
  CWCW: SK_CWCW,  CWCCW: SK_CWCCW,
  CCWCW: SK_CCWCW, CCWCCW: SK_CCWCCW,
};
const PG_VARIANTS: Record<VariantKey, string> = {
  CWCW: PG_CWCW,  CWCCW: PG_CWCCW,
  CCWCW: PG_CCWCW, CCWCCW: PG_CCWCCW,
};

const toKey = (east?: string, west?: string): VariantKey | null => {
  const e = east === 'Counterclockwise' ? 'CCW' : east === 'Clockwise' ? 'CW' : null;
  const w = west === 'Counterclockwise' ? 'CCW' : west === 'Clockwise' ? 'CW' : null;
  return e && w ? ((e + w) as VariantKey) : null;
};

function minsText(minutes: string | number): string {
  const val = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  if (!val || isNaN(val) || val <= 0) return 'every 6–9 minutes';
  return `about ${val} minutes`;
}

type QueryText = {
  title?: string;
  subtitle?: string;
  note?: string;
  freq?: string;
};

type Status =
  | 'unavailable'
  | 'singletrack';

type Scope =
  | 'Both'
  | 'Sengkang' | 'Punggol'
  | 'SengkangEast' | 'SengkangWest'
  | 'PunggolEast'  | 'PunggolWest';

const TOWARDS_LABEL: Record<string, string> = {
  PW1: 'PW1 Sam Kee',  PW7: 'PW7 Soo Teck',
  PE1: 'PE1 Cove',     PE7: 'PE7 Damai',
  SW1: 'SW1 Cheng Lim',SW8: 'SW8 Renjong',
  SE1: 'SE1 Compassvale', SE5: 'SE5 Ranggung',
};

const OPP: Record<string, string> = {
  PW1: 'PW7', PW7: 'PW1',
  PE1: 'PE7', PE7: 'PE1',
  SW1: 'SW8', SW8: 'SW1',
  SE1: 'SE5', SE5: 'SE1',
};

const labelFor = (code?: string) =>
  code && TOWARDS_LABEL[code] ? `Towards ${TOWARDS_LABEL[code]}` : '';

function imagesForUnavailable(
  scope: Scope,
  towards: string,
  line: 'Sengkang'|'Punggol'|'Both'
): string[] {
  // 1️⃣ Whole-line scenarios
  if (scope === 'Both')     return [SKDown, PGDown];
  if (scope === 'Punggol')  return [PGDown];
  if (scope === 'Sengkang') return [SKDown];

  // 2️⃣ Punggol loops
  if (scope === 'PunggolWest') {
    if (towards === 'PW1') return [PGWDown, PGW7];
    if (towards === 'PW7') return [PGW1, PGWDown];
  }
  if (scope === 'PunggolEast') {
    if (towards === 'PE7') return [PGE1, PGEDown];
    if (towards === 'PE1') return [PGEDown, PGE7];
  }

  // 3️⃣ Sengkang loops
  if (scope === 'SengkangWest') {
    if (towards === 'SW1') return [SKWDown, SKW8];
    if (towards === 'SW8') return [SKW1, SKWDown];
  }
  if (scope === 'SengkangEast') {
    if (towards === 'SE1') return [SKEDown, SKE5];
    if (towards === 'SE5') return [SKE1, SKEDown];
  }

  // Fallbacks (safety)
  if (line === 'Both') return [SKDown, PGDown];
  if (line === 'Sengkang') return [SKDown];
  return [PGDown];
}

const LOOP_TITLE: Partial<Record<Scope, string>> = {
  SengkangWest: 'Sengkang West Loop LRT',
  SengkangEast: 'Sengkang East Loop LRT',
  PunggolWest:  'Punggol West Loop LRT',
  PunggolEast:  'Punggol East Loop LRT',
};

function buildUnavailableTitle(scope: Scope, towards: string): string {
  // Whole-line scopes
  if (scope === 'Both')     return 'Services on the Sengkang–Punggol LRT are currently unavailable.';
  if (scope === 'Sengkang') return 'Services on the Sengkang LRT are currently unavailable.';
  if (scope === 'Punggol')  return 'Services on the Punggol LRT are currently unavailable.';

  // Loop leaves (West/East with optional "towards …")
  const loop = LOOP_TITLE[scope];
  if (loop) {
    const tw = towards && TOWARDS_LABEL[towards] ? ` (towards ${TOWARDS_LABEL[towards]})` : '';
    return `Services on the ${loop}${tw} are currently unavailable.`;
  }

  // Fallback
  return 'LRT service is currently unavailable.';
}

const LRTInfo: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // From Home
  const line = (params.get('lrtLine') as 'Sengkang' | 'Punggol' | 'Both') || 'Both';
  const busType = (params.get('busType') as 'regular' | 'both') || 'regular';

  // NEW: read status/scope/towards
  const status = (params.get('status') as 'unavailable' | 'singletrack') || 'singletrack';
  const scope  = (params.get('scope')  as Scope) || 'Both';
  const towards = params.get('towards') || '';

  const ske = params.get('lrtSKEDir') || ''; // Sengkang East
  const skw = params.get('lrtSKWDir') || ''; // Sengkang West
  const pge = params.get('lrtPGEDir') || ''; // Punggol East
  const pgw = params.get('lrtPGWDir') || ''; // Punggol West
  const additionalTime = params.get('additionalTime') ?? '';
  const minutes = Number(additionalTime) || 0;

  // Header copy
  const computedTitle =
    status === 'singletrack'
      ? (line === 'Both'
          ? 'Sengkang–Punggol LRT will be running only on one track'
          : `${line} LRT will be running only on one track`)
      : buildUnavailableTitle(scope, towards);


  const computedSubtitle = (() => {
    const override = params.get('timeband');
    if (override) return override;
    // Only show peak-period subtitle for single-track; keep quiet for unavailable
    if (status === 'unavailable') return '';
    const now = new Date();
    const h = now.getHours();
    if (h >= 6 && h < 12) return 'for the morning peak period.';
    if (h >= 12 && h < 18) return 'for the afternoon peak period.';
    return 'for the evening peak period.';
  })();

  const lrtStationsPhrase = line === 'Both' ? 'Sengkang–Punggol LRT stations' : `${line} LRT stations`;

  const freqText = minsText(minutes);
  const noteByBusType =
    busType === 'both'
      ? `Free regular and bridging bus services will be available at affected ${lrtStationsPhrase}.`
      : busType === 'regular'
        ? `Free regular bus services will be available at affected ${lrtStationsPhrase}.`
        : `Please follow station signs and staff directions for alternative travel options at ${lrtStationsPhrase}.`;

  const q: QueryText = {
    title: params.get('title') || computedTitle,
    subtitle: params.get('subtitle') ?? computedSubtitle,
    freq: params.get('freq') || freqText,
    note: params.get('note') || noteByBusType,
  };

  const showSK = line === 'Sengkang' || line === 'Both';
  const showPG = line === 'Punggol' || line === 'Both';

  const asAt = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const hour12 = h % 12 || 12;
    const minute = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    return { time: `${hour12}:${minute} ${ampm}`, date: `${day} ${month} ${year}` };
  }, []);

  // Build image selection
  const skKey = toKey(ske, skw);
  const pgKey = toKey(pge, pgw);

  // defaults (single-track visuals)
  let skImgSrc = skKey ? SK_VARIANTS[skKey] : sklrtImg;
  let pgImgSrc = pgKey ? PG_VARIANTS[pgKey] : pglrtImg;

  let skCaps: string[] = [];
  let pgCaps: string[] = [];

  let skImgs: string[] = [];
  let pgImgs: string[] = [];

  const sortDownFirst = (arr: string[]) =>
  arr.length === 2
    ? [...arr].sort((a, b) => {
        const aDown = /Down/i.test(a) ? 0 : 1;
        const bDown = /Down/i.test(b) ? 0 : 1;
        return aDown - bDown;
      })
    : arr;

  if (status === 'unavailable') {
    const arr = imagesForUnavailable(scope, towards, line);

    // Split into Sengkang vs Punggol buckets by filename
    skImgs = arr.filter(u => /\/SK/i.test(u)); // SKDown, SKWDown, SKE*...
    pgImgs = arr.filter(u => /\/PG/i.test(u)); // PGDown, PGWDown, PGE*...

    // If you want to *replace* the single image even for whole-line cases:
    // (not required, but harmless)
    skImgs = sortDownFirst(skImgs);
    pgImgs = sortDownFirst(pgImgs);
  }

  if (status === 'unavailable' && towards) {
    const opp = OPP[towards];

    // Punggol leaf scopes
    if ((scope === 'PunggolWest' || scope === 'PunggolEast') && pgImgs.length === 2) {
      pgCaps = [labelFor(towards), labelFor(opp)];
    }

    // Sengkang leaf scopes
    if ((scope === 'SengkangWest' || scope === 'SengkangEast') && skImgs.length === 2) {
      skCaps = [labelFor(towards), labelFor(opp)];
    }
  }
  // Direction one-liner only for single-track
  const dirBits: string[] = [];
  if (status === 'singletrack') {
    if (showSK && ske) dirBits.push(`Sengkang East runs ${ske.toLowerCase()}`);
    if (showSK && skw) dirBits.push(`Sengkang West runs ${skw.toLowerCase()}`);
    if (showPG && pge) dirBits.push(`Punggol East runs ${pge.toLowerCase()}`);
    if (showPG && pgw) dirBits.push(`Punggol West runs ${pgw.toLowerCase()}`);
  }
  const dirLine = dirBits.join(' • ');

  return (
    <div style={{ width: 420, height: 840, position: 'relative', background: '#fff' }}>
      {/* Header banner */}
      <div
        style={{
          background: '#FFC72C',
          padding: '16px 5px 28px',   // more bottom padding for the timestamp
          display: 'grid',
          gridTemplateColumns: '1fr',  // grid still fine for title/subtitle
          rowGap: 6,
          position: 'relative',        // <— key
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 25, lineHeight: 1.2, textAlign: 'center' }}>
          {q.title}
        </div>

        {q.subtitle ? (
          <div style={{ fontSize: 20, textAlign: 'center', marginTop:'-5px'  }}>{q.subtitle}</div>
        ) : null}

        {/* timestamp pinned */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 8,
            fontSize: 12,
            opacity: 0.85,
          }}
        >
          As at {asAt.time} on {asAt.date}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: 16, marginBottom: 10 }}>
          {status === 'singletrack'
            ? 'Please note the direction of travel for each loop:'
            : 'Train services are unavailable in the affected loop(s).'}
        </div>

      {/* Sengkang */}
      {showSK && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 21, marginBottom: 8 }}>Sengkang LRT</div>
            {status === 'unavailable' && skImgs.length > 0 ? (
              <div style={{ display: 'grid', rowGap: 10, marginLeft: -17 }}>
                {skImgs.map((src, i) => {
                  const align =
                    scope === 'SengkangWest' ? 'left' :
                    scope === 'SengkangEast' ? 'right' : 'center';
                  return (
                    <div key={i}>
                      {skCaps[i] && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            margin: '6px 0 4px',
                            marginRight:'-10px',
                            marginLeft:'10px',
                            textAlign: align,
                          }}
                        >
                          {skCaps[i]}
                        </div>
                      )}
                      <img
                        src={src}
                        alt="Sengkang LRT"
                        style={{
                          width: '104%',
                          height: 'auto',
                          borderRadius: 10,
                          display: 'block',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <img
                src={skImgSrc}
                alt="Sengkang LRT"
                style={{
                  width: '108%',
                  height: 'auto',
                  borderRadius: 10,
                  marginLeft: -17,
                  display: 'block',
                }}
              />
            )}
          </div>
        )}

        {/* Punggol */}
        {showPG && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 21, marginBottom: 8 }}>Punggol LRT</div>
            {status === 'unavailable' && pgImgs.length > 0 ? (
              <div style={{ display: 'grid', rowGap: 10, marginLeft: -18 }}>
                {pgImgs.map((src, i) => {
                  const align =
                    scope === 'PunggolWest' ? 'left' :
                    scope === 'PunggolEast' ? 'right' : 'center';
                  return (
                    <div key={i}>
                      {pgCaps[i] && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            margin: '6px 0 4px',
                            textAlign: align,
                          }}
                        >
                          {pgCaps[i]}
                        </div>
                      )}
                      <img
                        src={src}
                        alt="Punggol LRT"
                        style={{
                          width: '104.5%',
                          height: 'auto',
                          borderRadius: 10,
                          display: 'block',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <img
                src={pgImgSrc}
                alt="Punggol LRT"
                style={{
                  width: '109%',
                  height: 'auto',
                  borderRadius: 10,
                  marginLeft: -18,
                  display: 'block',
                }}
              />
            )}
          </div>
        )}

        {/* Footnote */}
        <div style={{ fontSize: 14, lineHeight: 1.35, marginTop: 6 }}>
          {status === 'singletrack'
            ? <>Do expect a frequency of <b>{q.freq}</b> for the train services. {q.note}</>
            : <>{q.note}</>}
        </div>

        {/* SBS Logo */}
        <img
          src={sbsLogo}
          alt="SBS Transit"
          style={{ position: 'absolute', bottom: '0px', right: '10px', width: '80px', opacity: 0.8 }}
        />
      </div>
    </div>
  );
};

export default LRTInfo;