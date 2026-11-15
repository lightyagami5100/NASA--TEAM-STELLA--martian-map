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
  Sliders,
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
  if (operationMode === 'screen' && !isSidebarCollapsed) {
    if (dockSide === 'left') {
      horizontalBounds = 'left-4 md:left-[412px] xl:left-[448px] 2xl:left-[472px] right-4';
      subPillAlign = 'left-4 md:left-[412px] xl:left-[448px] 2xl:left-[472px]';
    } else {
      horizontalBounds = 'left-4 right-4 md:right-[412px] xl:right-[448px] 2xl:right-[472px]';
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
        className={`absolute top-4 ${horizontalBounds} h-16 z-30 glass-panel rounded-[22px] px-2.5 sm:px-3.5 flex items-center justify-between gap-1.5 sm:gap-2.5 pointer-events-auto select-none font-sans transition-all duration-300 ease-out`}
      >
        {/* Left Telemetry Cluster: Live Sol Badge + Search Capsule */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          {/* Live Status Badge */}
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border"
            style={{
              background: 'var(--safe-bg)',
              color: 'var(--safe)',
              borderColor: 'var(--safe-border)',
            }}
            title="Martian Local Solar Time (LMST)"
            aria-label="Sol 1320 Mission Elapsed Time"
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: 'var(--safe-bright)' }}
            />
            <span className="font-mono whitespace-nowrap">
              SOL 1320
              <span className="hidden 2xl:inline"> · {formatTime(lmstSeconds)}</span>
            </span>
          </div>

          {/* Search Waypoint Capsule (Flux signature) */}
          <div ref={searchWrapRef} className="relative w-24 sm:w-28 md:w-36 lg:w-32 xl:w-44 min-w-[70px] sm:min-w-[90px] shrink">
            <div className="glass-card rounded-full px-2.5 sm:px-3 h-9 flex items-center gap-1.5 sm:gap-2 focus-within:ring-2 focus-within:ring-[var(--primary)]">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Jump site..."
                className="bg-transparent border-none outline-none w-full text-xs font-semibold placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] min-w-0"
                aria-label="Search Jezero crater waypoint"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
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
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0 shrink flex-nowrap overflow-x-auto scrollbar-none py-1">
          {/* Weather & Dust Devil Alert Pill */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onOpenWeather();
            }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition hover:-translate-y-0.5 border shrink-0"
            style={{
              background: 'var(--warn-bg)',
              color: 'var(--warn)',
              borderColor: 'var(--warn-border)',
            }}
            title="Open NASA MEDA Atmospheric & Dust Devil Suite (-29°C · Wind 8.4 m/s)"
            aria-label="Open NASA MEDA Atmospheric Weather Suite"
          >
            <Wind className="w-3.5 h-3.5 animate-soft-pulse shrink-0" />
            <span className="font-mono whitespace-nowrap">
              -29°C
              <span className="hidden 2xl:inline"> · 8.4 m/s</span>
            </span>
            <span
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-ping shrink-0"
              style={{ backgroundColor: 'var(--danger-bright)' }}
            />
          </button>

          {/* Radiation + MRO Relay Pill */}
          <div
            className="hidden 2xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-card text-xs font-semibold shrink-0"
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
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-2xl glass-card border border-[var(--border-subtle)] shadow-xs shrink-0" role="group" aria-label="Operational UI Modes">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('screen');
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'screen'
                    ? 'apple-btn-primary text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Habitat Workstation / Mission Console [Key: 1]"
                aria-label="Screen Mode: Mission Control Workstation (Key 1)"
                aria-pressed={operationMode === 'screen'}
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Screen</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('tablet');
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'tablet'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Astronaut EVA Field Slate / PDU [Key: 2]"
                aria-label="Tablet Mode: Astronaut EVA Field Slate (Key 2)"
                aria-pressed={operationMode === 'tablet'}
              >
                <Tablet className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Tablet</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeOperationMode('visor');
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  operationMode === 'visor'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="xEMU Helmet Visor Heads-Up Display (1.8m Eye-Level) [Key: 3]"
                aria-label="Visor Mode: Spacesuit Helmet HUD (Key 3)"
                aria-pressed={operationMode === 'visor'}
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Visor</span>
              </button>
            </div>
          )}

          {/* Polarized Optical Filter Toggle */}
          {onToggleVisorFilter && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onToggleVisorFilter();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border shrink-0 ${
                isVisorFilter
                  ? 'apple-btn-primary text-white border-transparent'
                  : 'glass-card text-[var(--text-primary)]'
              }`}
              title="Toggle Polarized Helmet Visor Scanlines & Glare Filter"
              aria-label="Toggle Polarized Filter"
              aria-pressed={isVisorFilter}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">{isVisorFilter ? 'Filter On' : 'Filter'}</span>
            </button>
          )}

          {/* Live Rover Telemetry & Hazcam Feed Pill */}
          {onOpenLiveFeed && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onOpenLiveFeed();
              }}
              className="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-blue-600 dark:text-blue-400 items-center gap-1.5 cursor-pointer transition border border-blue-500/20 hover:border-blue-500/40 shrink-0"
              title="Open Perseverance Live DSN Telemetry & Hazcam Feed"
              aria-label="Open Perseverance Live Telemetry and Hazcam Feed"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-500 shrink-0" />
              <span className="hidden 2xl:inline">Live Rover</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </button>
          )}

          {/* Diurnal Lighting Mode (Day / Sunset / Night) */}
          {onChangeTimeOfDay && (
            <div className="hidden md:flex items-center gap-0.5 p-0.5 rounded-xl glass-card text-xs border border-[var(--border-subtle)] shrink-0" role="group" aria-label="Sun and Sky Lighting">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onChangeTimeOfDay('day');
                }}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  timeOfDay === 'day' ? 'apple-btn-primary text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Martian Midday (14:39 LMST) - High Sun"
                aria-label="Set Midday Lighting"
                aria-pressed={timeOfDay === 'day'}
              >
                <Sun className="w-3 h-3 shrink-0" />
                <span className="hidden 2xl:inline">Day</span>
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
                aria-label="Set Sunset Lighting"
                aria-pressed={timeOfDay === 'sunset'}
              >
                <Sunset className="w-3 h-3 shrink-0" />
                <span className="hidden 2xl:inline">Dusk</span>
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
                aria-label="Set Night Lighting"
                aria-pressed={timeOfDay === 'night'}
              >
                <Moon className="w-3 h-3 shrink-0" />
                <span className="hidden 2xl:inline">Night</span>
              </button>
            </div>
          )}

          {/* Mission Guide Pill */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onOpenBrief();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition shrink-0"
            title="Open NASA Mission Guide & Challenge Rubrics"
            aria-label="Open NASA Mission Guide and Datasets"
          >
            <Info className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
            <span className="hidden xl:inline">Mission Guide</span>
          </button>

          {/* Left/Right Handedness Dock Switcher */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleDockSide();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)] shrink-0 transition hover:bg-[var(--primary-bg)]"
            title={dockSide === 'left' ? 'Dock Dashboard to Right' : 'Dock Dashboard to Left'}
            aria-label="Switch Dashboard Docking Side"
          >
            {dockSide === 'left' ? (
              <PanelRightClose className="w-4 h-4 shrink-0" />
            ) : (
              <PanelLeftClose className="w-4 h-4 shrink-0" />
            )}
          </button>

          {/* Light / Dark Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onToggleTheme();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)] shrink-0 transition hover:bg-[var(--primary-bg)]"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Color Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--text-primary)] shrink-0 transition hover:bg-[var(--primary-bg)]"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Mission Audio' : 'Mute Mission Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            )}
          </button>
        </div>
      </header>

      {/* Active Route Monitoring Floating Capsule (Mirrors Flux active-monitor-hud, screen mode only) */}
      {operationMode === 'screen' && isSidebarCollapsed && showRoutePill && activePath && startWp && goalWp && (
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
