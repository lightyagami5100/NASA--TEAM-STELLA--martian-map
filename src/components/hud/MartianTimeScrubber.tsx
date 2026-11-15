import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Play,
  Pause,
  ShieldAlert,
  Thermometer,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface MartianTimeScrubberProps {
  solTimeHour: number; // 0.00 to 24.66 hours
  onChangeSolTimeHour: (hour: number) => void;
  dockSide?: 'left' | 'right';
  hasActiveModal?: boolean;
}

export const MartianTimeScrubber: React.FC<MartianTimeScrubberProps> = ({
  solTimeHour,
  onChangeSolTimeHour,
  dockSide: _dockSide = 'left',
  hasActiveModal = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeWarpSpeed, setTimeWarpSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Auto-play time progression loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const step = (now: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        // At 1x speed, 1 real second = 0.1 Martian hours (takes ~4 mins for full sol)
        // At 5x speed, takes ~50s for full sol
        const advance = deltaSec * 0.15 * timeWarpSpeed;
        const nextHour = (solTimeHour + advance) % 24.66;
        onChangeSolTimeHour(Number(nextHour.toFixed(2)));
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, timeWarpSpeed, solTimeHour, onChangeSolTimeHour]);

  if (hasActiveModal) return null;

  // Formatting hours into LMST string
  const totalMinutes = Math.floor(solTimeHour * 60);
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor(totalMinutes % 60)
    .toString()
    .padStart(2, '0');
  const lmstString = `${h}:${m} LMST`;

  // Solar angle & elevation
  const solFraction = (solTimeHour % 24.66) / 24.66;
  const solarElevationAngle = Math.sin((solFraction - 0.25) * Math.PI * 2);
  const solarElevationDeg = Math.round(solarElevationAngle * 65);

  // Atmospheric Temperature based on NASA Perseverance MEDA diurnal thermal cycle
  // Pre-dawn coldest: -82°C at 04:00, midday peak: -29°C at 14:00
  const estimatedTemp = Math.round(-55 + 26 * Math.sin(((solTimeHour - 9.0) / 24.66) * Math.PI * 2));

  // Estimated Surface Radiation based on MSL RAD diurnal flux
  // GCR baseline ~22.5 µSv/h + direct solar UV/particle contribution
  const estimatedRad = Number((22.5 + Math.max(0, solarElevationAngle) * 3.4).toFixed(1));

  // Determine current lighting regime
  let solarPhase = 'Martian Midday (High Sun)';
  let phaseColor = 'var(--warn)';
  let PhaseIcon = Sun;
  if (solarElevationDeg > 20) {
    solarPhase = 'Martian Midday (High Sun)';
    phaseColor = '#f59e0b';
    PhaseIcon = Sun;
  } else if (solarElevationDeg > 0) {
    solarPhase = 'Afternoon Sun (Low Angle)';
    phaseColor = '#fb923c';
    PhaseIcon = Sun;
  } else if (solarElevationDeg > -12) {
    solarPhase = 'Blue Twilight (Atmospheric Rayleigh)';
    phaseColor = '#38bdf8';
    PhaseIcon = Sunset;
  } else {
    solarPhase = 'Night Sky (Phobos Moonlight & Stars)';
    phaseColor = '#818cf8';
    PhaseIcon = Moon;
  }

  return (
    <aside
      aria-label="Martian Sol Solar Timeline and Shadow Forecaster"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none font-sans transition-all duration-300 w-[94vw] max-w-2xl"
    >
      <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-2xl border border-[var(--border-subtle)] flex flex-col gap-2.5 backdrop-blur-2xl">
        {/* Top Row: Clock, Phase & Live Forecasting Telemetry */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all"
              style={{
                background: 'var(--primary-bg)',
                borderColor: 'var(--primary-border)',
                color: phaseColor,
              }}
            >
              <PhaseIcon className="w-4 h-4 animate-soft-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                  {lmstString}
                </span>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-mono"
                  style={{
                    background: 'var(--safe-bg)',
                    color: 'var(--safe)',
                    borderColor: 'var(--safe-border)',
                  }}
                >
                  SOL 1320
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] truncate flex items-center gap-1.5">
                <span style={{ color: phaseColor }}>{solarPhase}</span>
                <span>·</span>
                <span>Sun: {solarElevationDeg > 0 ? `+${solarElevationDeg}°` : `${solarElevationDeg}°`}</span>
              </div>
            </div>
          </div>

          {/* Right Forecasting Pills: Estimated Temp & Radiation */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Temp Forecast */}
            <div
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-mono font-bold"
              title="Estimated Martian Surface Temperature (NASA MEDA Model)"
            >
              <Thermometer className="w-3.5 h-3.5 text-sky-400" />
              <span>{estimatedTemp}°C</span>
            </div>

            {/* Radiation Forecast */}
            <div
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-mono font-bold"
              title="Estimated Cosmic Ray & Solar UV Radiation (MSL RAD Model)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{estimatedRad} µSv/h</span>
            </div>

            {/* Play / Pause Time Warp */}
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setIsPlaying(!isPlaying);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition shadow-sm ${
                isPlaying
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'apple-btn-primary text-white'
              }`}
              title={isPlaying ? 'Pause Sun Movement' : 'Play Solar Lighting Movement'}
              aria-label={isPlaying ? 'Pause time movement' : 'Play time movement'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Speed Toggle */}
            {isPlaying && (
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setTimeWarpSpeed((s) => (s === 1 ? 4 : s === 4 ? 12 : 1));
                }}
                className="px-2 py-1.5 rounded-xl glass-card text-xs font-bold font-mono text-[var(--text-primary)] cursor-pointer"
                title="Change Solar Advance Speed"
              >
                {timeWarpSpeed}x
              </button>
            )}
          </div>
        </div>

        {/* Middle Row: Continuous Slider Scrubber */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] shrink-0">00:00</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="24.66"
              step="0.05"
              value={solTimeHour}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeSolTimeHour(val);
              }}
              aria-label="Martian Solar Time Scrubber (0 to 24.66 hours LMST)"
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border-subtle)] accent-[var(--primary)] focus:outline-none"
              style={{
                background: `linear-gradient(to right, #818cf8 0%, #fb923c 25%, #f59e0b 50%, #38bdf8 74%, #0f172a 100%)`,
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] shrink-0">24:39</span>
        </div>

        {/* Bottom Row: Quick Ephemeris Presets */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
            Quick Ephemeris:
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onChangeSolTimeHour(6.25);
              }}
              className="px-2 py-0.5 rounded-lg hover:bg-[var(--primary-bg)] transition cursor-pointer text-[10px] font-mono"
            >
              06:15 Dawn
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onChangeSolTimeHour(14.65);
              }}
              className="px-2 py-0.5 rounded-lg hover:bg-[var(--primary-bg)] transition cursor-pointer text-[10px] font-mono font-bold text-amber-500"
            >
              14:39 Midday
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onChangeSolTimeHour(18.25);
              }}
              className="px-2 py-0.5 rounded-lg hover:bg-[var(--primary-bg)] transition cursor-pointer text-[10px] font-mono text-sky-400"
            >
              18:15 Dusk
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onChangeSolTimeHour(22.75);
              }}
              className="px-2 py-0.5 rounded-lg hover:bg-[var(--primary-bg)] transition cursor-pointer text-[10px] font-mono text-indigo-400"
            >
              22:45 Night
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
