import React, { useState, useMemo } from 'react';
import type { PathNode } from '../../types/mars';
import { TrendingUp, Radio } from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface ElevationProfileChartProps {
  path: PathNode[];
  progress: number;
  onSeekProgress?: (progress: number) => void;
}

export const ElevationProfileChart: React.FC<ElevationProfileChartProps> = ({
  path,
  progress,
  onSeekProgress,
}) => {
  const [viewMode, setViewMode] = useState<'surface' | 'rimfax'>('surface');

  const { minElev, maxElev, pointsString, warningSegments } = useMemo(() => {
    if (!path || path.length < 2) {
      return { minElev: 0, maxElev: 0, pointsString: '', warningSegments: [] };
    }

    let min = Infinity;
    let max = -Infinity;

    path.forEach((n) => {
      if (n.z < min) min = n.z;
      if (n.z > max) max = n.z;
    });

    const range = Math.max(20, max - min);
    const width = 340;
    const height = 75;
    const paddingY = 10;

    const pts = path.map((n, i) => {
      const x = (i / (path.length - 1)) * width;
      const y = height - paddingY - ((n.z - min) / range) * (height - 2 * paddingY);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const segments: { x1: number; x2: number; type: 'warning' | 'danger' }[] = [];
    let currentSeg: { startIdx: number; type: 'warning' | 'danger' } | null = null;

    path.forEach((n, i) => {
      if (n.slopeDeg > 20.0) {
        if (!currentSeg) currentSeg = { startIdx: i, type: 'danger' };
        else if (currentSeg.type !== 'danger') {
          segments.push({
            x1: (currentSeg.startIdx / (path.length - 1)) * width,
            x2: (i / (path.length - 1)) * width,
            type: currentSeg.type,
          });
          currentSeg = { startIdx: i, type: 'danger' };
        }
      } else if (n.slopeDeg > 12.0) {
        if (!currentSeg) currentSeg = { startIdx: i, type: 'warning' };
      } else {
        if (currentSeg) {
          segments.push({
            x1: (currentSeg.startIdx / (path.length - 1)) * width,
            x2: (i / (path.length - 1)) * width,
            type: currentSeg.type,
          });
          currentSeg = null;
        }
      }
    });

    if (currentSeg) {
      const activeSeg = currentSeg as { startIdx: number; type: 'warning' | 'danger' };
      segments.push({
        x1: (activeSeg.startIdx / (path.length - 1)) * width,
        x2: width,
        type: activeSeg.type,
      });
    }

    return {
      minElev: Math.round(min),
      maxElev: Math.round(max),
      pointsString: pts.join(' '),
      warningSegments: segments,
    };
  }, [path]);

  if (!path || path.length < 2) {
    return (
      <div className="w-full h-28 glass-card flex items-center justify-center text-sm text-[var(--text-tertiary)] font-semibold">
        No elevation profile data
      </div>
    );
  }

  const currentIdx = Math.min(path.length - 1, Math.floor(progress * (path.length - 1)));
  const currentNode = path[currentIdx];
  const scrubberX = (progress * 340).toFixed(1);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onSeekProgress) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeekProgress(newProgress);
  };

  return (
    <div className="w-full glass-card p-4 flex flex-col gap-3 font-sans">
      {/* Title & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="glass-segmented-container !p-0.5">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setViewMode('surface');
            }}
            className={`glass-segmented-item !py-1.5 !px-3 !text-xs flex items-center gap-1.5 ${
              viewMode === 'surface' ? 'active' : ''
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span>Elevation</span>
          </button>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setViewMode('rimfax');
            }}
            className={`glass-segmented-item !py-1.5 !px-3 !text-xs flex items-center gap-1.5 ${
              viewMode === 'rimfax' ? 'active' : ''
            }`}
          >
            <Radio className="w-3.5 h-3.5" style={{ color: 'var(--science)' }} />
            <span>RIMFAX Radar</span>
          </button>
        </div>

        {viewMode === 'surface' ? (
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
            <span>{minElev}m</span>
            <span>→</span>
            <strong className="text-[var(--text-primary)]">{maxElev}m</strong>
          </div>
        ) : (
          <div className="text-xs font-mono font-bold" style={{ color: 'var(--science)' }}>
            0–10m Sounder
          </div>
        )}
      </div>

      {/* SVG Visualization Area */}
      <div className="relative w-full h-[88px] cursor-pointer" title="Click or scrub traverse position">
        {viewMode === 'surface' ? (
          <svg
            viewBox="0 0 340 75"
            className="w-full h-full overflow-visible"
            onClick={handleSvgClick}
          >
            <defs>
              <linearGradient id="appleElevationFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071E3" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0071E3" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Reference Grid lines */}
            <line x1="0" y1="15" x2="340" y2="15" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
            <line x1="0" y1="40" x2="340" y2="40" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
            <line x1="0" y1="65" x2="340" y2="65" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />

            {/* Fill Area below line */}
            {pointsString && (
              <polygon
                points={`0,75 ${pointsString} 340,75`}
                fill="url(#appleElevationFill)"
              />
            )}

            {/* Smooth Line */}
            {pointsString && (
              <polyline
                points={pointsString}
                fill="none"
                stroke="#0071E3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Danger/Warning Highlight segments */}
            {warningSegments.map((seg, idx) => (
              <line
                key={idx}
                x1={seg.x1}
                y1="73"
                x2={seg.x2}
                y2="73"
                stroke={seg.type === 'danger' ? '#FF3B30' : '#FF9500'}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ))}

            {/* Interactive Rover Scrubber Bar */}
            <line
              x1={scrubberX}
              y1="0"
              x2={scrubberX}
              y2="75"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={scrubberX}
              cy={
                75 - 10 -
                ((currentNode?.z - minElev) / Math.max(1, maxElev - minElev)) * (75 - 20)
              }
              r="5"
              fill="#0071E3"
              stroke="#ffffff"
              strokeWidth="2.2"
            />
          </svg>
        ) : (
          /* RIMFAX Ground Penetrating Radar Echogram Cross-Section */
          <svg
            viewBox="0 0 340 75"
            className="w-full h-full overflow-hidden rounded-xl border border-[var(--border-subtle)]"
            onClick={handleSvgClick}
          >
            <defs>
              <linearGradient id="rimfaxRegolith" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="rimfaxLacustrine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="rimfaxBasement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="340" height="18" fill="url(#rimfaxRegolith)" />
            <text x="8" y="12" fill="#f1f5f9" fontSize="8.5" fontFamily="monospace" fontWeight="bold">0m Regolith (ε ≈ 3.1)</text>

            <rect x="0" y="18" width="340" height="32" fill="url(#rimfaxLacustrine)" />
            <line x1="0" y1="28" x2="340" y2="28" stroke="#7dd3fc" strokeWidth="0.9" strokeDasharray="5 3" opacity="0.75" />
            <line x1="0" y1="38" x2="340" y2="38" stroke="#7dd3fc" strokeWidth="0.9" strokeDasharray="8 4" opacity="0.65" />
            <text x="8" y="43" fill="#bae6fd" fontSize="8.5" fontFamily="monospace" fontWeight="bold">Deltaic Sediments (ε ≈ 4.8)</text>

            <rect x="0" y="50" width="340" height="25" fill="url(#rimfaxBasement)" />
            <line x1="0" y1="50" x2="340" y2="50" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="4 2" opacity="0.9" />
            <text x="8" y="65" fill="#fde68a" fontSize="8.5" fontFamily="monospace" fontWeight="bold">-10m Volcanic Bedrock (ε ≈ 7.2)</text>

            <line x1={scrubberX} y1="0" x2={scrubberX} y2="75" stroke="#c084fc" strokeWidth="2.2" />
            <circle cx={scrubberX} cy="28" r="4" fill="#c084fc" stroke="#ffffff" strokeWidth="1.8" />
          </svg>
        )}
      </div>

      {/* Real-time Telemetry readouts (Bigger & Easier to scan) */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)] font-mono">
        {viewMode === 'surface' ? (
          <>
            <span className="text-[var(--text-secondary)]">
              Dist: <strong className="text-[var(--text-primary)]">{currentNode?.distanceFromStartKm.toFixed(2)} km</strong>
            </span>
            <span className="text-[var(--text-secondary)]">
              Elev: <strong className="text-[var(--text-primary)]">{currentNode?.z.toFixed(0)}m</strong>
            </span>
            <span className="text-[var(--text-secondary)]">
              Slope:{' '}
              <strong style={{ color: currentNode?.slopeDeg > 15 ? 'var(--danger)' : 'var(--primary)' }}>
                {currentNode?.slopeDeg.toFixed(1)}°
              </strong>
            </span>
          </>
        ) : (
          <>
            <span className="font-bold" style={{ color: 'var(--science)' }}>150–1200 MHz</span>
            <span className="text-[var(--text-secondary)]"><strong>ε ≈ 4.8</strong></span>
            <span className="font-bold" style={{ color: 'var(--safe)' }}>+3.2m Reflector</span>
          </>
        )}
      </div>
    </div>
  );
};
