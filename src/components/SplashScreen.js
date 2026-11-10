import React, { useEffect, useMemo, useState } from 'react';
import './SplashScreen.css';

const BRAND_NAME = 'Printing Press';
const BRAND_TAGLINE = 'Quality Printing Services';

const stages = [
  'Preparing artwork',
  'Checking finishes',
  'Warming up the press',
  'Almost ready',
];

const highlights = ['Custom Boxes', 'Wedding Cards', 'Brand Stationery'];

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        const step = prev < 40 ? 2 : prev < 75 ? 1.5 : 1;
        return Math.min(100, prev + step);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const currentStage = useMemo(() => {
    if (progress < 30) return stages[0];
    if (progress < 55) return stages[1];
    if (progress < 85) return stages[2];
    return stages[3];
  }, [progress]);

  return (
    <div className="splash-screen" role="status" aria-live="polite" aria-label="Loading website">
      <div className="splash-orb splash-orb-left" aria-hidden="true" />
      <div className="splash-orb splash-orb-right" aria-hidden="true" />

      <div className="splash-shell">
        <div className="splash-brand-panel">
          <div className="splash-brand-lockup">
            <div className="splash-brand-mark" aria-hidden="true">
              <img src="/logo.jpeg" alt="" className="splash-brand-logo" />
            </div>
            <div>
              <p className="splash-eyebrow">Premium Print Studio</p>
              <h1 className="splash-brand-name">{BRAND_NAME}</h1>
              <p className="splash-brand-tagline">{BRAND_TAGLINE}</p>
            </div>
          </div>

          <div className="splash-progress-card">
            <div className="splash-progress-meta">
              <span>{currentStage}</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className="splash-progress-track" aria-hidden="true">
              <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
              <div className="splash-progress-sheen" />
            </div>
            <div className="splash-stage-list" aria-hidden="true">
              {stages.map((stage, index) => {
                const isActive =
                  (index === 0 && progress >= 10) ||
                  (index === 1 && progress >= 35) ||
                  (index === 2 && progress >= 65) ||
                  (index === 3 && progress >= 90);

                return (
                  <span key={stage} className={`splash-stage-pill ${isActive ? 'is-active' : ''}`}>
                    {stage}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="splash-highlights" aria-hidden="true">
            {highlights.map((item) => (
              <span key={item} className="splash-highlight-pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="splash-visual-panel" aria-hidden="true">
          <div className="print-stage">
            <div className="print-stage-grid" />
            <div className="print-machine-top">
              <span className="machine-dot" />
              <span className="machine-dot" />
              <span className="machine-dot" />
            </div>

            <div className="print-output">
              <div className="paper-sheet paper-sheet-back" />
              <div className="paper-sheet paper-sheet-middle" />
              <div className="paper-sheet paper-sheet-front">
                <div className="sheet-header" />
                <div className="sheet-line sheet-line-strong" />
                <div className="sheet-line" />
                <div className="sheet-line" />
                <div className="sheet-swatch-row">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="scan-bar" />
            </div>

            <div className="ink-track">
              <div className="ink-pill cyan" />
              <div className="ink-pill magenta" />
              <div className="ink-pill amber" />
              <div className="ink-pill navy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
