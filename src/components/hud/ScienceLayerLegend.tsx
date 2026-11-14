import React, { useState } from 'react';
import type { LayerSettings, ActiveLayers } from '../../types/mars';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Mountain,
  Wind,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface ScienceLayerLegendProps {
  layerSettings?: LayerSettings;
  activeLayers?: ActiveLayers;
  dockSide?: 'left' | 'right';
  hasInspector?: boolean;
}

export const ScienceLayerLegend: React.FC<ScienceLayerLegendProps> = ({
  layerSettings,
  activeLayers,
  dockSide = 'left',
  hasInspector = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSlope = layerSettings?.slopeHazard ?? activeLayers?.slopeHazard ?? false;
  const isThemis = layerSettings?.themisThermal ?? activeLayers?.themisThermal ?? false;
  const isCrism = layerSettings?.crismMinerals ?? activeLayers?.crismMinerals ?? false;
  const isRad = layerSettings?.radiationFlux ?? false;
  const isContours = layerSettings?.contours ?? activeLayers?.contours ?? false;

  const hasAnyActiveOverlay = isSlope || isThemis || isCrism || isRad || isContours;

  if (!hasAnyActiveOverlay) return null;

  // Position mirrors Flux's bottom-right spatial-legend-card, moving safely away when Inspector opens
  let positionClass = '';
  if (dockSide === 'left') {
    positionClass = hasInspector ? 'bottom-4 left-[472px]' : 'bottom-4 right-4';
  } else {
    positionClass = hasInspector ? 'bottom-4 right-[472px]' : 'bottom-4 left-4';
  }

  return (
    <div
      id="science-layer-legend"
      aria-label="Active scientific layer legend"
      className={`fixed ${positionClass} z-20 w-[330px] max-w-[calc(100vw-2rem)] select-none pointer-events-auto font-sans text-xs transition-all duration-300 ease-out`}
    >
      <div className="glass-panel-elevated rounded-2xl p-4 flex flex-col gap-2.5 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Science Fusion Scale
              </span>
              <h4 className="font-extrabold text-[var(--text-primary)] text-xs">
                Active Overlay Legend
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setIsCollapsed(!isCollapsed);
            }}
            className="w-7 h-7 rounded-full glass-inset flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title={isCollapsed ? 'Expand Scales' : 'Collapse Scales'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-0.5">
            {isSlope && (
              <div className="glass-card p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--danger)' }}>
                    <Mountain className="w-3.5 h-3.5" />
                    <span>HiRISE Slope Hazard</span>
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono">&lt;20° Limit</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                  <div className="glass-inset p-1.5 text-center">
                    <span className="block font-mono" style={{ color: 'var(--safe)' }}>&lt; 10°</span>
                    <span className="text-[var(--text-secondary)] text-[10px]">Safe</span>
                  </div>
                  <div className="glass-inset p-1.5 text-center">
                    <span className="block font-mono" style={{ color: 'var(--warn)' }}>10°–15°</span>
                    <span className="text-[var(--text-secondary)] text-[10px]">Scree</span>
                  </div>
                  <div className="glass-inset p-1.5 text-center">
                    <span className="block font-mono" style={{ color: 'var(--danger)' }}>&gt; 15°</span>
                    <span className="text-[var(--text-secondary)] text-[10px]">Rollover</span>
                  </div>
                </div>
              </div>
            )}

            {isThemis && (
              <div className="glass-card p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                    <Wind className="w-3.5 h-3.5" />
                    <span>THEMIS Sand Traps</span>
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-[10px]">TIU</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="glass-inset p-2">
                    <span className="font-extrabold block font-mono" style={{ color: 'var(--primary)' }}>
                      &lt; 150 TIU
                    </span>
                    <span className="text-[var(--text-secondary)]">Drift Sand</span>
                  </div>
                  <div className="glass-inset p-2">
                    <span className="font-extrabold block font-mono text-[var(--text-primary)]">
                      &gt; 300 TIU
                    </span>
                    <span className="text-[var(--text-secondary)]">Bedrock</span>
                  </div>
                </div>
              </div>
            )}

            {isCrism && (
              <div className="glass-card p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--science)' }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CRISM Mineralogy</span>
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-[10px]">VNIR</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="glass-inset p-2">
                    <span className="font-extrabold block" style={{ color: 'var(--science)' }}>Carbonates</span>
                    <span className="text-[var(--text-secondary)]">Lake strata</span>
                  </div>
                  <div className="glass-inset p-2">
                    <span className="font-extrabold block" style={{ color: 'var(--safe)' }}>Smectite Clays</span>
                    <span className="text-[var(--text-secondary)]">Mudstones</span>
                  </div>
                </div>
              </div>
            )}

            {isRad && (
              <div className="glass-card p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--warn)' }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>RAD Dose Exposure</span>
                  </span>
                  <span className="font-bold font-mono" style={{ color: 'var(--warn)' }}>14–32 µSv/hr</span>
                </div>
                <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-700 via-amber-500 to-red-600 border border-[var(--border-subtle)]" />
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] font-mono">
                  <span>14 Shielded</span>
                  <span>24 Nominal</span>
                  <span style={{ color: 'var(--danger)' }}>32 Ridge</span>
                </div>
              </div>
            )}

            {isContours && (
              <div className="glass-card p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--warn)' }}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>USGS Contours</span>
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-[10px]">fwidth</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono">
                  <span>Minor: <strong className="text-[var(--text-primary)]">10m</strong></span>
                  <span>Index: <strong className="text-[var(--text-primary)]">50m</strong></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
