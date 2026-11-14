import React, { useState } from 'react';
import type { ActiveLayers, CameraMode, TerrainSource } from '../../types/mars';
import {
  Layers,
  Sparkles,
  Mountain,
  Sliders,
  Box,
  Flame,
  Radio,
  Grid,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface LayerControlsProps {
  activeLayers: ActiveLayers;
  onToggleLayer: (layerKey: keyof ActiveLayers) => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  terrainSource: TerrainSource;
  onToggleTerrainSource: () => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  activeLayers,
  onToggleLayer,
  cameraMode,
  onSetCameraMode,
  terrainSource,
  onToggleTerrainSource,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLayerClick = (key: keyof ActiveLayers) => {
    tacticalAudio.playBlip();
    onToggleLayer(key);
  };

  const handleCameraClick = (mode: CameraMode) => {
    tacticalAudio.playBlip();
    onSetCameraMode(mode);
  };

  if (isCollapsed) {
    return (
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setIsCollapsed(false);
          }}
          className="apple-glass px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium text-white shadow-xl hover:bg-white/15 transition cursor-pointer active:scale-95"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Map Styles</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <nav
      aria-label="Map style and layer drawer"
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-2rem)] flex flex-col items-center gap-1 select-none"
    >
      <div className="apple-glass px-3 py-2 rounded-2xl flex flex-wrap items-center justify-center gap-2 shadow-2xl">
        {/* Collapse button */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setIsCollapsed(true);
          }}
          title="Minimize bar"
          className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 3D Model Source Toggle */}
        <div className="flex items-center pr-2 border-r border-white/10">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleTerrainSource();
            }}
            title="Toggle between NASA 3D OBJ, STL file and DEM plane"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              terrainSource === 'nasa-obj'
                ? 'bg-purple-600 text-white shadow-md'
                : terrainSource === 'nasa-stl'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>
              {terrainSource === 'nasa-obj'
                ? 'NASA OBJ (1M)'
                : terrainSource === 'nasa-stl'
                ? 'NASA STL'
                : 'DEM Plane'}
            </span>
          </button>
        </div>

        {/* Map Styles Segmented Controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
          {/* Satellite */}
          <button
            onClick={() => handleLayerClick('satellite')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              activeLayers.satellite
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Satellite</span>
          </button>

          {/* Slope Safety */}
          <button
            onClick={() => handleLayerClick('slopeHazard')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              activeLayers.slopeHazard
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <span>Slope Safety</span>
          </button>

          {/* CRISM Minerals */}
          <button
            onClick={() => handleLayerClick('crismMinerals')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              activeLayers.crismMinerals
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Minerals</span>
          </button>

          {/* THEMIS Thermal */}
          <button
            onClick={() => handleLayerClick('themisThermal')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              activeLayers.themisThermal
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">Thermal</span>
          </button>

          {/* Contours */}
          <button
            onClick={() => handleLayerClick('contours')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
              activeLayers.contours
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Contours</span>
          </button>
        </div>

        {/* Overlays */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
          <button
            onClick={() => handleLayerClick('commsLoS')}
            title="Toggle Orbiter Comms Line of Sight"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              activeLayers.commsLoS
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleLayerClick('gridOverlay')}
            title="Toggle Coordinate Grid"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              activeLayers.gridOverlay
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Chips */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCameraClick('orbit')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              cameraMode === 'orbit'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Orbit
          </button>

          <button
            onClick={() => handleCameraClick('topdown')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              cameraMode === 'topdown'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2D Map
          </button>

          <button
            onClick={() => handleCameraClick('globe')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              cameraMode === 'globe'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Globe
          </button>
        </div>
      </div>
    </nav>
  );
};
