import { Routes, Route, useLocation } from 'react-router-dom';
import NELInfoDisruption from './NELInfoDisruption.tsx';
import NELInfoDelay from './NELInfoDelay.tsx';
import DTLInfoDisruption from './DTLInfoDisruption.tsx';
import DTLInfoDisruption2 from './DTLInfoDisruption2.tsx';
import DTLInfoDelay from './DTLInfoDelay.tsx';
import DTLInfoDelay2 from './DTLInfoDelay2.tsx';
import LRTInfo from './LRTInfo.tsx'; 
import Home from './Home';
import PhoneFrame from './components/PhoneFrame';

function useIsMixedDTLSpan(): boolean {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  let hasLeft = false;   // any DT <= 18
  let hasRight = false;  // any DT >= 19

  // Check ALL parameter values (works for "DT17 Downtown" or "DT17")
  for (const v of Array.from(params.values())) {
    const m = /DT\s*(\d+)/i.exec(v);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (Number.isNaN(n)) continue;

    if (n <= 18) hasLeft = true;
    if (n >= 19) hasRight = true;

    if (hasLeft && hasRight) return true; // mixed → early exit
  }

  // Not mixed if we only saw one side (or none)
  return false;
}

function DTLDisruptionSwitch() {
  const mixed = useIsMixedDTLSpan();
  return mixed ? <DTLInfoDisruption2 /> : <DTLInfoDisruption />;
}

function DTLDelaySwitch() {
  const mixed = useIsMixedDTLSpan();
  return mixed ? <DTLInfoDelay2 /> : <DTLInfoDelay />;
}

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Left panel: Form inputs */}
      <div
        style={{
          width: '650px',
          borderRight: '1px solid #ccc',
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9'
        }}
      >
        <Home />
      </div>

      {/* Right panel: Phone-styled infographic */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '16px',
          backgroundColor: '#f0f0f0',
          overflowY: 'auto',
        }}
      >
        <PhoneFrame>
          <Routes>
            <Route path="/infographic-NELdisruption" element={<NELInfoDisruption />} />
            <Route path="/infographic-NELdelay" element={<NELInfoDelay />} />
            <Route path="/infographic-DTLdisruption" element={<DTLDisruptionSwitch />} />
            <Route path="/infographic-DTLdelay" element={<DTLDelaySwitch />} />
            <Route path="/infographic-LRT" element={<LRTInfo />} />
            <Route
              path="/"
              element={
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  <p>Select a route to preview infographic.</p>
                </div>
              }
            />
          </Routes>
        </PhoneFrame>
      </div>
    </div>
  );
}

export default App;
