import React, { useState, useEffect, useRef } from 'react';
import type { Waypoint, PathResult, TimeOfDayPreset, OperationUiMode } from '../../types/mars';
import {
  Volume2,
  VolumeX,
  Info,
  Radio,
  Eye,
  ShieldAlert,
  Wind,
  PanelLeftClose,
  PanelRightClose,
  Sun,
  Moon,
  Sunset,
  MapPin,
  Search,
  X,
  Monitor,
  Tablet,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface MissionHeaderProps {
  onOpenBrief: () => void;
  onOpenWeather: () => void;
  onOpenLiveFeed?: () => void;
  timeOfDay?: TimeOfDayPreset;
  onChangeTimeOfDay?: (time: TimeOfDayPreset) => void;
  commsLoS: boolean;
  isVisorFilter?: boolean;
  onToggleVisorFilter?: () => void;
  dockSide: 'left' | 'right';
  onToggleDockSide: () => void;
  isSidebarCollapsed?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  waypoints?: Waypoint[];
  onSelectWaypoint?: (wp: Waypoint) => void;
  startWp?: Waypoint | null;
  goalWp?: Waypoint | null;
  activePath?: PathResult | null;
  operationMode?: OperationUiMode;
  onChangeOperationMode?: (mode: OperationUiMode) => void;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  onOpenBrief,
  onOpenWeather,
  onOpenLiveFeed,
  timeOfDay = 'day',
  onChangeTimeOfDay,
  commsLoS,
  isVisorFilter = false,
  onToggleVisorFilter,
  dockSide,
  onToggleDockSide,
  isSidebarCollapsed = false,
  theme = 'light',
  onToggleTheme,
  waypoints = [],
  onSelectWaypoint,
  startWp,
  goalWp,
  activePath,
  operationMode = 'screen',
  onChangeOperationMode,
}) => {
  const [isMuted, setIsMuted] = useState(tacticalAudio.getMuted());
  const [lmstSeconds, setLmstSeconds] = useState(14 * 3600 + 39 * 60 + 19);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showRoutePill, setShowRoutePill] = useState(true);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setLmstSeconds((prev) => (prev + 1) % 86400);
    }, 1027);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeOfDay === 'sunset') {
      setLmstSeconds(18 * 3600 + 15 * 60 + 45);
    } else if (timeOfDay === 'night') {
      setLmstSeconds(22 * 3600 + 45 * 60 + 10);
    } else {
      setLmstSeconds(14 * 3600 + 39 * 60 + 20);
    }
  }, [timeOfDay]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const toggleSound = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) tacticalAudio.playBlip();
  };

  // Position top island cleanly BESIDE the expanded sidebar (Flux layout) so panels never collide
  let horizontalBounds = 'left-4 right-4';
  let subPillAlign = 'left-4';
  if (!isSidebarCollapsed) {
    if (dockSide === 'left') {
      horizontalBounds = 'left-4 lg:left-[472px] right-4';
      subPillAlign = 'left-4 lg:left-[472px]';
    } else {
      horizontalBounds = 'left-4 right-4 lg:right-[472px]';
      subPillAlign = 'left-4';
    }
  }

  const matchingWaypoints = waypoints.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header
        className={`absolute top-4 ${horizontalBounds} h-16 z-30 glass-panel rounded-[22px] px-4 flex items-center justify-between gap-3 pointer-events-auto select-none font-sans transition-all duration-300 ease-out`}
      >
        {/* Left Telemetry Cluster: Live Sol Badge + Search Capsule */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Live Status Badge */}
          <div
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border"
            style={{
              background: 'var(--safe-bg)',
              color: 'var(--safe)',
              borderColor: 'var(--safe-border)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--safe-bright)' }}
            />
            <span className="font-mono">SOL 1320 · {formatTime(lmstSeconds)}</span>
          </div>

          {/* Search Waypoint Capsule (Flux signature) */}
          <div ref={searchWrapRef} className="relative flex-1 max-w-xs min-w-[150px]">
            <div className="glass-card rounded-full px-3 h-9 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[var(--primary)]">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Jump to Jezero site..."
                className="bg-transparent border-none outline-none w-full text-xs font-semibold placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Clear site search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 shrink-0 text-[var(--text-tertiary)]" />
              )}
            </div>

            {searchFocused && matchingWaypoints.length > 0 && (
              <div className="absolute top-11 left-0 right-0 glass-panel-elevated rounded-2xl p-1.5 max-h-64 overflow-y-auto z-50 flex flex-col gap-0.5 shadow-2xl">
                {matchingWaypoints.slice(0, 6).map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      tacticalAudio.playBlip();
                      onSelectWaypoint?.(wp);
                      setSearchFocused(false);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--primary-bg)] transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {wp.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {wp.type} · {wp.elevation}m
                      </div>
                    </div>
                    {wp.sampleTube && (
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}
                      >
                        {wp.sampleTube.tubeId}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action & Safety Telemetry Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Weather & Dust Devil Alert Pill */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onOpenWeather();
            }}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition hover:-translate-y-0.5 border"
            style={{
              background: 'var(--warn-bg)',
              color: 'var(--warn)',
              borderColor: 'var(--warn-border)',
            }}
            title="Open NASA MEDA Atmospheric & Dust Devil Suite"
          >
            <Wind className="w-3.5 h-3.5 animate-soft-pulse" />
            <span className="font-mono">-29°C · 8.4 m/s</span>
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: 'var(--danger-bright)' }}
            />
          </button>

          {/* Radiation + MRO Relay Pill */}
          <div
            className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-card text-xs font-semibold"
            title="MSL RAD Flux & Mars Reconnaissance Orbiter Link"
          >
            <span className="flex items-center gap-1 font-mono text-[var(--text-primary)]">
              <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
              <span>24.2 µSv/h</span>
            </span>
            <span className="w-px h-3.5 bg-[var(--border-subtle)]" />
            <span
              className="flex items-center gap-1 font-bold"
              style={{ color: commsLoS ? 'var(--safe)' : 'var(--danger)' }}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{commsLoS ? 'MRO Link' : 'Occluded'}</span>
            </span>
          </div>

          {/* 3 Operational UI Modes Switcher (Screen / Tablet / Visor) */}
          {onChangeOperationMode && (
            <div className="flex items-center gap-1 p-1 rounded-2xl glass-card border border-[var(--border-subtle)] shadow-sm">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('screen');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'screen'
                    ? 'apple-btn-primary text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Habitat Workstation / Mission Console [Key: 1]"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Screen</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('tablet');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'tablet'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Astronaut EVA Field Slate / PDU [Key: 2]"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('visor');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'visor'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="xEMU Helmet Visor Heads-Up Display (1.8m Eye-Level) [Key: 3]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visor</span>
              </button>
            </div>
          )}

          {/* Visor HUD Filter Pill */}
          {onToggleVisorFilter && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onToggleVisorFilter();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border ${
                isVisorFilter
                  ? 'apple-btn-primary text-white border-transparent'
                  : 'glass-card text-[var(--text-primary)]'
              }`}
              title="Toggle Polarized Helmet Visor Filter"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isVisorFilter ? 'Visor On' : 'Visor'}</span>
            </button>
          )}

          {/* Live Rover Telemetry & Hazcam Feed Pill */}
          {onOpenLiveFeed && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onOpenLiveFeed();
              }}
              className="px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer transition border border-blue-500/20 hover:border-blue-500/40"
              title="Open Perseverance Live DSN Telemetry & Hazcam Feed"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-500" />
              <span className="hidden lg:inline">Live Rover</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </button>
          )}

          {/* Diurnal Lighting Mode (Day / Sunset / Night) */}
          {onChangeTimeOfDay && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl glass-card text-xs border border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeTimeOfDay('day');
                }}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  timeOfDay === 'day' ? 'apple-btn-primary text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Martian Midday (14:39 LMST) - High Sun"
              >
                <Sun className="w-3 h-3" />
                <span className="hidden xl:inline">Day</span>
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeTimeOfDay('sunset');
                }}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  timeOfDay === 'sunset' ? 'apple-btn-primary text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Martian Twilight (18:15 LMST) - Blue Sunset"
              >
                <Sunset className="w-3 h-3" />
                <span className="hidden xl:inline">Dusk</span>
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeTimeOfDay('night');
                }}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  timeOfDay === 'night' ? 'apple-btn-primary text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Martian Night (22:45 LMST) - Phobos Moon & Stars"
              >
                <Moon className="w-3 h-3" />
                <span className="hidden xl:inline">Night</span>
              </button>
            </div>
          )}

          {/* Mission Guide Pill */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onOpenBrief();
            }}
            className="px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition"
            title="Open NASA Mission Brief & Datasets"
          >
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span className="hidden sm:inline">Mission Guide</span>
          </button>

          {/* Left/Right Handedness Dock Switcher */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleDockSide();
            }}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)]"
            title={dockSide === 'left' ? 'Move Dashboard to Right Side' : 'Move Dashboard to Left Side'}
            aria-label="Switch dashboard side"
          >
            {dockSide === 'left' ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Light / Dark Liquid Glass Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onToggleTheme();
              }}
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)]"
              title={theme === 'light' ? 'Switch to Space Dark Glass' : 'Switch to Quartz Light Glass'}
              aria-label="Toggle Glass Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)]"
            title={isMuted ? 'Unmute Telemetry Audio' : 'Mute Telemetry Audio'}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[var(--text-tertiary)]" />
            ) : (
              <Volume2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            )}
          </button>
        </div>
      </header>

      {/* Active Route Monitoring Floating Capsule (Mirrors Flux active-monitor-hud) */}
      {showRoutePill && activePath && startWp && goalWp && (
        <div
          className={`hidden md:flex fixed top-[88px] ${subPillAlign} z-20 glass-panel-elevated rounded-full px-4 py-2 items-center gap-3 pointer-events-auto transition-all duration-300 ease-out max-w-[440px]`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{
              backgroundColor: activePath.isViable ? 'var(--primary)' : 'var(--danger-bright)',
              boxShadow: `0 0 10px ${activePath.isViable ? 'var(--primary)' : 'var(--danger-bright)'}`,
            }}
          />
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
              Corridor: {startWp.name} → {goalWp.name}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
              {activePath.totalDistanceKm.toFixed(2)} km · Safety {activePath.safetyScore}/100 · Max {activePath.maxSlopeDeg.toFixed(1)}°
            </div>
          </div>
          <button
            onClick={() => setShowRoutePill(false)}
            className="w-5 h-5 rounded-full glass-inset flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition cursor-pointer shrink-0"
            aria-label="Dismiss corridor banner"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
};
