import React, { useState, useEffect } from 'react';
import type { CameraMode } from '../../types/mars';
import {
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  Globe2,
  Compass,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface GoogleEarthNavControlsProps {
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTiltUp: () => void;
  onTiltDown: () => void;
  onResetNorth: () => void;
  onRotateHeading?: (delta: number) => void;
  onRecenter: () => void;
  onPanNorth?: () => void;
  onPanSouth?: () => void;
  onPanWest?: () => void;
  onPanEast?: () => void;
  onOrbitLeft?: () => void;
  onOrbitRight?: () => void;
  cameraTheta: number;
  cameraPhi: number;
  dockSide?: 'left' | 'right';
  hasInspector?: boolean;
}

export const GoogleEarthNavControls: React.FC<GoogleEarthNavControlsProps> = ({
  cameraMode,
  onSetCameraMode,
  onZoomIn,
  onZoomOut,
  onTiltUp,
  onTiltDown,
  onResetNorth,
  onRecenter,
  onPanNorth,
  onPanSouth,
  onPanWest,
  onPanEast,
  onOrbitLeft,
  onOrbitRight,
  cameraTheta,
  dockSide = 'left',
  hasInspector = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDpad, setShowDpad] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    tacticalAudio.playBlip();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const compassDeg = Math.round((-cameraTheta * 180) / Math.PI) % 360;
  const normalizedAzimuth = (compassDeg + 360) % 360;

  // Dynamic Flux-style top-right position, sliding aside cleanly whenever WaypointInspector opens
  let positionClass = '';
  if (dockSide === 'left') {
    positionClass = hasInspector ? 'right-[448px] top-[92px]' : 'right-4 top-[92px]';
  } else {
    positionClass = hasInspector ? 'left-[448px] top-[92px]' : 'left-4 top-[92px]';
  }

  return (
    <aside
      aria-label="Map navigation & compass controls"
      className={`fixed ${positionClass} z-20 flex flex-col items-center gap-2 select-none font-sans transition-all duration-300 ease-out`}
    >
      {/* 1. Compact Liquid Glass Compass Dial + Heading Pill */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onResetNorth();
          }}
          title="Reset Heading to North"
          className="w-12 h-12 rounded-full glass-panel-elevated flex items-center justify-center transition-transform cursor-pointer hover:scale-105 active:scale-95 relative"
        >
          <div
            className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${normalizedAzimuth}deg)` }}
          >
            <span className="text-[8px] font-extrabold text-[#FF3B30] absolute top-1">N</span>
            <span className="text-[7px] font-bold text-[var(--text-tertiary)] absolute bottom-1">S</span>
            <div className="w-1.5 h-3.5 bg-[#FF3B30] rounded-t-full absolute top-2 shadow-sm" />
            <div className="w-1.5 h-3.5 bg-[var(--text-tertiary)] opacity-45 rounded-b-full absolute bottom-2" />
            <div className="w-2 h-2 rounded-full bg-[var(--text-primary)] z-10" />
          </div>
        </button>
        <div className="px-2 py-0.5 rounded-full glass-panel-elevated text-[10px] font-mono font-bold text-[var(--text-primary)] mt-1">
          {normalizedAzimuth.toString().padStart(3, '0')}°
        </div>
      </div>

      {/* 2. Floating Map Tool Stack (Flux floating-map-tools style, compact for generous vertical clearance) */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSetCameraMode(cameraMode === 'topdown' ? 'orbit' : 'topdown');
          }}
          title={cameraMode === 'topdown' ? 'Switch to 3D Orbit' : 'Switch to 2D Top-Down'}
          className={`glass-control-btn !w-10 !h-9 text-xs font-extrabold ${
            cameraMode === 'topdown' ? 'active' : ''
          }`}
        >
          {cameraMode === 'topdown' ? '2D' : '3D'}
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSetCameraMode(cameraMode === 'visor' ? 'orbit' : 'visor');
          }}
          title={cameraMode === 'visor' ? 'Exit Helmet Visor HUD' : 'First-Person Helmet Visor POV (1.8m)'}
          className={`glass-control-btn !w-10 !h-9 ${
            cameraMode === 'visor' ? '!bg-[#FF9500] !text-white !border-[#FF9500]' : ''
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSetCameraMode(cameraMode === 'globe' ? 'orbit' : 'globe');
          }}
          title={cameraMode === 'globe' ? 'Exit Globe View' : 'Mars Planetary Globe View'}
          className={`glass-control-btn !w-10 !h-9 ${cameraMode === 'globe' ? 'active' : ''}`}
        >
          <Globe2 className="w-4 h-4" />
        </button>

        <div className="w-5 h-px bg-[var(--border-subtle)] my-0.5" />

        {/* Orbit Left / Right Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              if (onOrbitLeft) onOrbitLeft();
            }}
            title="Orbit Counter-Clockwise [Key: Q]"
            aria-label="Orbit left counter-clockwise"
            className="glass-control-btn !w-5 !h-8 text-[10px]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              if (onOrbitRight) onOrbitRight();
            }}
            title="Orbit Clockwise [Key: E]"
            aria-label="Orbit right clockwise"
            className="glass-control-btn !w-5 !h-8 text-[10px]"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        {/* Zoom In & Out */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onZoomIn();
          }}
          title="Zoom In [Key: R / +]"
          aria-label="Zoom camera in"
          className="glass-control-btn !w-10 !h-8"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onZoomOut();
          }}
          title="Zoom Out [Key: F / -]"
          aria-label="Zoom camera out"
          className="glass-control-btn !w-10 !h-8"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Pan Directional D-Pad Toggle */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowDpad(!showDpad);
          }}
          title="Toggle On-Screen Pan D-Pad Buttons [Keys: WASD / Arrows]"
          aria-label="Toggle on-screen directional pan buttons"
          className={`glass-control-btn !w-10 !h-8 text-[11px] font-bold ${showDpad ? '!bg-[var(--primary)] !text-white' : ''}`}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        {/* On-Screen Directional Pan D-Pad (Touch & Mouse Support) */}
        {showDpad && (
          <div className="p-1.5 rounded-2xl glass-panel flex flex-col items-center gap-1 my-1 shadow-xl border border-[var(--border-subtle)] animate-fade-in">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                if (onPanNorth) onPanNorth();
              }}
              title="Pan North [Key: W / ↑]"
              aria-label="Pan camera north"
              className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  if (onPanWest) onPanWest();
                }}
                title="Pan West [Key: A / ←]"
                aria-label="Pan camera west"
                className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  onRecenter();
                }}
                title="Recenter [Key: Space]"
                aria-label="Recenter camera on site"
                className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary-bg)] transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  if (onPanEast) onPanEast();
                }}
                title="Pan East [Key: D / →]"
                aria-label="Pan camera east"
                className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                if (onPanSouth) onPanSouth();
              }}
              title="Pan South [Key: S / ↓]"
              aria-label="Pan camera south"
              className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onTiltUp();
          }}
          title="Tilt Horizon Up"
          className="glass-control-btn !w-10 !h-7.5"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onTiltDown();
          }}
          title="Tilt Horizon Down"
          className="glass-control-btn !w-10 !h-7.5"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onRecenter();
          }}
          title="Recenter Camera on Jezero Crater [Key: Space / Home]"
          className="glass-control-btn !w-10 !h-8"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="glass-control-btn !w-10 !h-8"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
