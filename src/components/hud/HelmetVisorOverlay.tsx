import React, { useState } from 'react';
import type { Waypoint, PathResult } from '../../types/mars';
import {
  Activity,
  Heart,
  ShieldAlert,
  Radio,
  Crosshair,
  AlertTriangle,
  Monitor,
  Tablet,
  Mic,
  Sun,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface HelmetVisorOverlayProps {
  active: boolean;
  onExitVisor: () => void;
  onSwitchToTablet?: () => void;
  onSwitchToScreen?: () => void;
  targetWaypoint: Waypoint | null;
  activePath: PathResult | null;
  simulationProgress: number;
  cameraTheta: number; // radians
}

export const HelmetVisorOverlay: React.FC<HelmetVisorOverlayProps> = ({
  active,
  onExitVisor,
  onSwitchToTablet,
  onSwitchToScreen,
  targetWaypoint,
  activePath,
  simulationProgress,
  cameraTheta,
}) => {
  const [isGoldVisorDown, setIsGoldVisorDown] = useState(false);
  const [voiceQueryStatus, setVoiceQueryStatus] = useState<'standby' | 'listening' | 'acknowledged'>('standby');
  if (!active) return null;

  // Normalized heading in degrees [0, 360)
  const headingDeg = Math.round(((-cameraTheta * 180) / Math.PI + 360) % 360);

  // Compass tape ticks: every 15 degrees from (heading - 60) to (heading + 60)
  const tapeTicks: { deg: number; label: string }[] = [];
  for (let offset = -60; offset <= 60; offset += 15) {
    const raw = (headingDeg + offset + 360) % 360;
    let label = `${raw.toString().padStart(3, '0')}°`;
    if (raw === 0) label = 'N';
    else if (raw === 45) label = 'NE';
    else if (raw === 90) label = 'E';
    else if (raw === 135) label = 'SE';
    else if (raw === 180) label = 'S';
    else if (raw === 225) label = 'SW';
    else if (raw === 270) label = 'W';
    else if (raw === 315) label = 'NW';

    tapeTicks.push({ deg: offset, label });
  }

  // Calculate distance remaining to target along path
  const totalDist = activePath?.totalDistanceKm ?? 0;
  const distWalked = totalDist * simulationProgress;
  const distRemainingM = Math.max(0, Math.round((totalDist - distWalked) * 1000));

  // Current node slope & metabolic rate
  const pathNodes = activePath?.path ?? [];
  const currIdx = Math.min(pathNodes.length - 1, Math.floor(simulationProgress * (pathNodes.length - 1)));
  const currentNode = pathNodes[currIdx];
  const localSlope = currentNode?.slopeDeg ?? 4.2;
  const metabolicRate = currentNode?.metabolicBurnRate ?? 1.18;

  return (
    <div data-theme="dark" className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. Curved Astronaut Spacesuit Helmet Glass Visor Distortion & Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(5, 5, 8, 0.45) 85%, rgba(5, 5, 8, 0.88) 100%),
            linear-gradient(180deg, rgba(200, 138, 101, 0.05) 0%, transparent 15%, transparent 85%, rgba(0, 113, 227, 0.04) 100%)
          `,
          boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.85)',
        }}
      />

      {/* Visor Glare Arc & HUD Horizon Level Lines */}
      <div className="absolute inset-x-0 top-0 h-24 border-b border-white/5 opacity-50" />
      <div className="absolute inset-x-12 bottom-10 h-1 border-t border-[#0A84FF]/20" />

      {/* 2. Top Heading Tape (AR Compass HUD) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        {/* Active Heading Center Caret */}
        <div className="flex flex-col items-center text-[#0A84FF]">
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-[#0A84FF] drop-shadow-[0_0_8px_rgba(10,132,255,0.8)]" />
          <div className="text-[11px] font-mono tabular-nums font-semibold bg-black/80 px-2.5 py-0.5 rounded-full border border-[#0A84FF]/40 mt-1 shadow-md">
            {headingDeg.toString().padStart(3, '0')}° MAG
          </div>
        </div>

        {/* Sliding Compass Ticks Bar */}
        <div className="relative w-80 h-8 flex items-center justify-center overflow-hidden border-b border-white/10 mt-1">
          <div className="flex items-center gap-6">
            {tapeTicks.map((tick, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center transition-all duration-75"
                style={{
                  transform: `translateX(${-tick.deg * 1.8}px)`,
                  opacity: Math.max(0.15, 1 - Math.abs(tick.deg) / 65),
                }}
              >
                <div className={`h-2.5 w-[1.5px] ${tick.label.includes('°') ? 'bg-white/30' : 'bg-[#0A84FF] h-3.5'}`} />
                <span className={`text-[9px] mt-0.5 font-medium ${tick.label.includes('°') ? 'text-white/40' : 'text-[#0A84FF] font-semibold'}`}>
                  {tick.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Central AR Crosshairs & Target Waypoint Reticle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {/* Reticle Circle */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Subtle Outer Rotating Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#0A84FF]/30 animate-[spin_24s_linear_infinite]" />

          {/* Precision Crosshair Marks */}
          <div className="absolute w-full h-[1px] bg-[#0A84FF]/40" />
          <div className="absolute h-full w-[1px] bg-[#0A84FF]/40" />

          {/* Central Aiming Diamond */}
          <div className="w-5 h-5 border border-[#0A84FF]/80 rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(10,132,255,0.5)]">
            <div className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full" />
          </div>

          {/* Range Pitch Ladder Ticks */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 text-[8px] font-mono text-[#0A84FF]/60 text-right">
            <span>+10°</span>
            <span>0°</span>
            <span>-10°</span>
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 text-[8px] font-mono text-[#0A84FF]/60 text-left">
            <span>+10°</span>
            <span>0°</span>
            <span>-10°</span>
          </div>
        </div>

        {/* Target Tag Below Crosshair */}
        {targetWaypoint && (
          <div className="mt-3 px-3 py-1.5 glass-panel rounded-xl border border-[#0A84FF]/40 flex flex-col items-center text-center shadow-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-[#0A84FF] font-semibold">
              <Crosshair className="w-3.5 h-3.5 text-[#0A84FF] animate-pulse" />
              <span>{targetWaypoint.name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-mono text-white/70 mt-0.5">
              <span>RNG: <strong className="text-[#30D158]">{distRemainingM}m</strong></span>
              <span>·</span>
              <span>SLOPE: <strong className={localSlope > 15 ? 'text-[#FF453A]' : 'text-[#FF9F0A]'}>{localSlope.toFixed(1)}°</strong></span>
              <span>·</span>
              <span>ELEV: <strong className="text-white">{targetWaypoint.elevation}m</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Left HUD: Astronaut Suit PLSS Telemetry (EV-1 Commander) */}
      <div className="absolute left-6 top-24 w-68 glass-panel rounded-2xl p-3.5 text-xs flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
            <span className="font-semibold text-xs text-white">EV-1 Commander</span>
          </div>
          <span className="text-[10px] text-white/50 font-medium">PLSS-04 Nominal</span>
        </div>

        {/* Biometrics */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="glass-card p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-white/60 mb-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Heart className="w-3 h-3 text-[#FF453A] animate-pulse" />
                <span>Heart Rate</span>
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              112 <span className="text-[10px] font-normal text-white/50">BPM</span>
            </div>
          </div>

          <div className="glass-card p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-white/60 mb-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Activity className="w-3 h-3 text-[#0A84FF]" />
                <span>Suit Pressure</span>
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              4.3 <span className="text-[10px] font-normal text-white/50">PSI</span>
            </div>
          </div>
        </div>

        {/* Consumables Progress Bars */}
        <div className="flex flex-col gap-2.5 text-[10px]">
          <div>
            <div className="flex justify-between text-white/70 mb-1">
              <span className="font-medium">Primary O₂ Supply</span>
              <span className="text-[#30D158] font-mono font-semibold">94% · 4.2 hrs</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#30D158] rounded-full" style={{ width: '94%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white/70 mb-1">
              <span className="font-medium">CO₂ Scrubber (LiOH)</span>
              <span className="text-[#0A84FF] font-mono font-semibold">98% Nominal</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: '98%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white/70 mb-1">
              <span className="font-medium">Metabolic O₂ Burn</span>
              <span className={`font-mono font-semibold ${metabolicRate > 1.6 ? 'text-[#FF453A]' : 'text-[#FF9F0A]'}`}>
                {metabolicRate.toFixed(2)} L/min
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${metabolicRate > 1.6 ? 'bg-[#FF453A]' : 'bg-[#FF9F0A]'}`}
                style={{ width: `${Math.min(100, (metabolicRate / 2.4) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Suit Thermal & Cooling */}
        <div className="flex items-center justify-between text-[10px] text-white/50 pt-1.5 border-t border-white/10">
          <span>LCVG Cooling Temp</span>
          <span className="text-white/80 font-mono font-medium">18.4°C (Nominal)</span>
        </div>
      </div>

      {/* 5. Right HUD: Environmental & Radiation Radiation Safety */}
      <div className="absolute right-6 top-24 w-68 glass-panel rounded-2xl p-3.5 text-xs flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 text-[#FF9F0A]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs text-white">Mars Environment</span>
          </div>
          <span className="text-[10px] text-white/50 font-mono">SOL 1320</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="glass-card p-2.5 rounded-xl border border-white/10">
            <span className="text-white/50 block mb-0.5">Ambient Temp</span>
            <span className="text-white font-mono font-bold text-sm">-29°C</span>
          </div>
          <div className="glass-card p-2.5 rounded-xl border border-white/10">
            <span className="text-white/50 block mb-0.5">Atm Pressure</span>
            <span className="text-white font-mono font-bold text-sm">724 Pa</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-[#FF9F0A]/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#FF9F0A] font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-[#FF9F0A]" />
              <span>GCR Radiation Flux</span>
            </span>
            <span className="text-white font-mono font-semibold">24.2 µSv/hr</span>
          </div>
          <div className="text-[10px] text-white/50">
            SEP Status: <span className="text-[#30D158] font-medium">Nominal</span> · Dose: <span className="text-white/80 font-mono">0.14 mSv</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/50 pt-1.5 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#30D158]" />
            <span>MRO UHF Relay</span>
          </span>
          <span className="text-[#30D158] font-medium">Direct LOS (94%)</span>
        </div>
      </div>

      {/* Gold Anti-Glare Visor Layer */}
      {isGoldVisorDown && (
        <div className="absolute inset-0 bg-amber-500/20 mix-blend-color-burn pointer-events-none transition-all duration-500" />
      )}

      {/* Top Right Quick Controls: Gold Visor Toggle */}
      <div className="absolute top-14 right-8 flex items-center gap-2 pointer-events-auto z-10">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setIsGoldVisorDown(!isGoldVisorDown);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-lg border ${
            isGoldVisorDown
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/30'
              : 'bg-black/60 text-amber-300 border-amber-500/40 hover:bg-black/80'
          }`}
          title="Lower/Raise NASA Gold Anti-Glare Visor Shade"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>{isGoldVisorDown ? 'Gold Visor Active' : 'Gold Shade'}</span>
        </button>
      </div>

      {/* 6. Bottom Center: Voice Simulator, Mode Switchers & Mission Status */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-2.5 pointer-events-auto">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setVoiceQueryStatus((prev) =>
              prev === 'standby' ? 'listening' : prev === 'listening' ? 'acknowledged' : 'standby'
            );
          }}
          className={`px-3.5 py-1.5 glass-panel rounded-full text-[11px] font-mono flex items-center gap-2 shadow-lg border transition-all cursor-pointer ${
            voiceQueryStatus === 'listening'
              ? 'border-sky-400 bg-sky-950/60 text-sky-200 ring-2 ring-sky-400/40'
              : voiceQueryStatus === 'acknowledged'
              ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
              : 'border-white/10 text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Click to toggle xEMU Voice Radio Comm"
        >
          <Mic className={`w-3.5 h-3.5 ${voiceQueryStatus === 'listening' ? 'text-sky-300 animate-ping' : 'text-sky-400'}`} />
          <span>
            {voiceQueryStatus === 'listening'
              ? 'VOICE RECOGNIZING... ("Nav to Kodiak")'
              : voiceQueryStatus === 'acknowledged'
              ? 'EVA COMM: COURSE PLOTTED TO TARGET'
              : 'VOICE: "Nav to Kodiak" · "Abort EVA"'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {onSwitchToTablet && (
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                onSwitchToTablet();
              }}
              className="px-3.5 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet Mode</span>
            </button>
          )}

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              if (onSwitchToScreen) onSwitchToScreen();
              else onExitVisor();
            }}
            className="apple-btn-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Console Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
