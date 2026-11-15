// Astronaut EVA Tactical Field Slate / Portable Display Unit (PDU)
// Ergonomically engineered for pressurized spacesuit gloves (NASA-STD-3001 compliant).
// Oversized touch targets (>=48px), high-contrast outdoor solar glare mode,
// PLSS life support telemetry, real-time walkback safety envelope, and buddy proximity monitoring.

import React, { useState, useEffect } from 'react';
import type { Waypoint, PathResult } from '../../types/mars';
import {
  Activity,
  ShieldCheck,
  Radio,
  MapPin,
  Compass,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Sun,
  Battery,
  Wind,
  Navigation2,
  Users,
  TestTube,
  Maximize2,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';
import { NASA_EVA_FLIGHT_RULES, type SampleTubeLogEntry } from '../../data/astronautProtocols';
import { sanitizeInput } from '../../utils/security';

interface EvaTabletHudProps {
  waypoints: Waypoint[];
  selectedWaypoint?: Waypoint | null;
  onSelectWaypoint?: (wp: Waypoint) => void;
  startWp?: Waypoint | null;
  goalWp: Waypoint | null;
  onSelectGoal: (wp: Waypoint) => void;
  activePath: PathResult | null;
  simulationProgress: number;
  onToggleSimulation: () => void;
  isSimulating: boolean;
  dockSide: 'left' | 'right';
  onToggleDockSide: () => void;
  onSwitchToVisor: () => void;
  onSwitchToScreen: () => void;
}

export const EvaTabletHud: React.FC<EvaTabletHudProps> = ({
  waypoints,
  selectedWaypoint: _selectedWaypoint,
  onSelectWaypoint,
  startWp: _startWp,
  goalWp,
  onSelectGoal,
  activePath,
  simulationProgress,
  onToggleSimulation,
  isSimulating,
  dockSide,
  onToggleDockSide,
  onSwitchToVisor,
  onSwitchToScreen,
}) => {
  // Tablet Ergonomic States
  const [isGloveMode, setIsGloveMode] = useState(true);
  const [isHighGlareMode, setIsHighGlareMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'nav' | 'plss' | 'sample' | 'rules'>('nav');

  // Simulated Real-Time EVA Consumables (NASA PLSS)
  const o2PrimaryPsi = 4.28; // 4.3 psi nominal pure O2
  const o2PrimaryPercent = 86;
  const batteryKwh = 1.42;
  const suitWaterPercent = 79;
  const [metabolicWatts, setMetabolicWatts] = useState(245);
  const [buddyDistanceMeters, setBuddyDistanceMeters] = useState(48); // EV-1 to EV-2 separation
  const radiationDoseRate = 24.2; // µSv/h

  useEffect(() => {
    setMetabolicWatts(isSimulating ? 315 : 230);
  }, [isSimulating]);

  // Sample Logging Modal / Drawer
  const [sampleLogs, setSampleLogs] = useState<SampleTubeLogEntry[]>([
    {
      tubeSerial: 'ST-0262-08',
      siteName: 'Octavia E. Butler Base',
      formation: 'Máaz Formation',
      lithology: 'Vesicular Basaltic Lava Flow',
      coreLengthMm: 62,
      sol: 1320,
      lmst: '11:15:00',
      lat: 18.4447,
      lon: 77.4562,
      sealed: true,
      witnessBlank: false,
      xrfPrimaryElements: ['Si', 'Fe', 'Mg', 'Ca'],
    },
  ]);
  const [isSampleDrawerOpen, setIsSampleDrawerOpen] = useState(false);
  const [newSampleRock, setNewSampleRock] = useState('Delta Smectite Mudstone');
  const [isSealedConfirmed, setIsSealedConfirmed] = useState(true);
  const [isWitnessBlank, setIsWitnessBlank] = useState(false);

  // Dynamic Walkback Point-of-No-Return Calculations
  const currentPathIdx = Math.min(
    (activePath?.path.length ?? 1) - 1,
    Math.floor(simulationProgress * ((activePath?.path.length ?? 1) - 1))
  );
  const currentNode = activePath?.path[currentPathIdx];
  const totalDistanceKm = activePath?.totalDistanceKm ?? 3.68;
  const distanceCoveredKm = totalDistanceKm * simulationProgress;
  const distanceRemainingKm = Math.max(0, totalDistanceKm - distanceCoveredKm);

  // Unassisted walking pace on Martian gravity: 2.5 km/h
  const walkbackPaceKmh = 2.5;
  const walkbackTimeMinutes = Math.round((distanceCoveredKm / walkbackPaceKmh) * 60);
  // Remaining primary oxygen duration: at ~240W, 1% O2 corresponds to ~4.5 min
  const availableO2Minutes = Math.round(o2PrimaryPercent * 4.2);
  const mandatoryReserveMinutes = 30; // NASA EVA flight rule reserve
  const walkbackSafetyMarginMinutes = availableO2Minutes - walkbackTimeMinutes - mandatoryReserveMinutes;
  const isWalkbackCritical = walkbackSafetyMarginMinutes < 15;

  // Metabolic burn rate modulation based on terrain slope
  useEffect(() => {
    const slope = currentNode?.slopeDeg ?? 5;
    const baseW = 180;
    const slopeW = Math.min(220, slope * 18);
    setMetabolicWatts(Math.round(baseW + slopeW));
  }, [currentNode]);

  const handleCommitSample = () => {
    tacticalAudio.playRouteCalculated();
    const nextTubeNum = (sampleLogs.length + 9).toString().padStart(2, '0');
    const newEntry: SampleTubeLogEntry = {
      tubeSerial: `ST-0262-${nextTubeNum}`,
      siteName: goalWp?.name ?? 'Survey Target Delta',
      formation: 'Jezero Western Fan Delta Strata',
      lithology: sanitizeInput(newSampleRock),
      coreLengthMm: 58,
      sol: 1320,
      lmst: '14:46:12',
      lat: goalWp?.lat ?? 18.42,
      lon: goalWp?.lon ?? 77.55,
      sealed: isSealedConfirmed,
      witnessBlank: isWitnessBlank,
      xrfPrimaryElements: ['Si', 'Al', 'Fe', 'Mg', 'Mn'],
    };

    setSampleLogs((prev) => [newEntry, ...prev]);
    setIsSampleDrawerOpen(false);
  };

  return (
    <div
      data-theme="dark"
      className={`absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans transition-all duration-300 ${
        isHighGlareMode ? 'filter contrast-150 brightness-110 saturate-150' : ''
      }`}
    >
      {/* 1. Tactical Tablet Top Quick-Bar */}
      <header className="pointer-events-auto flex items-center justify-between gap-3 w-full max-w-5xl mx-auto hud-panel p-2.5 sm:p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-2xl bg-slate-950/85">
        {/* Left: EVA Identification & Mode Banner */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
            <Navigation2 className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-400 font-mono">
                EVA Slate · EV-1 Lead
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Glove Rdy
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>SOL 1320</span>
              <span>·</span>
              <span className="text-slate-200 font-semibold">LMST 14:46:12</span>
              <span>·</span>
              <span className="text-sky-300 font-mono">Three Forks Sector</span>
            </div>
          </div>
        </div>

        {/* Center: Walkback Point of No Return Countdown Indicator */}
        <div
          className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border font-mono transition-all ${
            isWalkbackCritical
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${isWalkbackCritical ? 'text-rose-400' : 'text-amber-400'}`}
          />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Walkback Margin
            </div>
            <div className="text-xs sm:text-sm font-bold tabular-nums">
              +{walkbackSafetyMarginMinutes}m (O₂ Buffer)
            </div>
          </div>
        </div>

        {/* Right: Mode Switchers & Ergonomics */}
        <div className="flex items-center gap-2">
            {/* Glove Mode Ergonomic Toggle */}
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setIsGloveMode(!isGloveMode);
              }}
              title="Toggle NASA Pressurized Glove Touch Mode (>=48px touch targets)"
              className={`px-3 h-11 rounded-xl flex items-center gap-1.5 border font-mono text-xs font-bold transition-all ${
                isGloveMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/80'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">{isGloveMode ? 'Glove 48px' : 'Standard'}</span>
            </button>

            {/* High-Glare Contrast Toggle */}
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setIsHighGlareMode(!isHighGlareMode);
              }}
              title="Toggle Solar Glare High-Contrast Mode"
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                isHighGlareMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800/80 text-amber-300 border-slate-700/80 hover:bg-slate-700/80'
              }`}
            >
              <Sun className="w-5 h-5" />
            </button>

          {/* Quick Switch to Visor AR View */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onSwitchToVisor();
            }}
            title="Switch to Helmet Visor HUD View"
            className="px-3 h-11 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Visor HUD</span>
          </button>

          {/* Return to Desktop/Workstation Screen Mode */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onSwitchToScreen();
            }}
            title="Switch to Mission Control / Workstation Console"
            className="px-3 h-11 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/60 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>Exit Tablet</span>
          </button>
        </div>
      </header>

      {/* 2. Main Tactical Field Slate Surface (Docked Left or Right) */}
      <div
        className={`pointer-events-auto flex items-end gap-4 w-full max-w-6xl mx-auto my-auto ${
          dockSide === 'right' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Main Tablet Surface Module */}
        <main className="w-full sm:w-[480px] lg:w-[520px] max-h-[76vh] flex flex-col hud-panel rounded-3xl border-2 border-amber-500/50 shadow-2xl bg-slate-950/90 backdrop-blur-2xl overflow-hidden">
          {/* Tablet Tab Bar (Glove-Friendly Touch Targets >= 48px) */}
          <nav className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-900/60 p-1.5 gap-1.5">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('nav');
              }}
              className={`min-h-[48px] rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'nav'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Traverse</span>
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('plss');
              }}
              className={`min-h-[48px] rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'plss'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>PLSS Life</span>
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('sample');
              }}
              className={`min-h-[48px] rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'sample'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TestTube className="w-4 h-4" />
              <span>Cache ({sampleLogs.length})</span>
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('rules');
              }}
              className={`min-h-[48px] rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Flight Rules</span>
            </button>
          </nav>

          {/* Tab Content Panes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-200">
            {/* TAB 1: TRAVERSE & TARGET NAVIGATION */}
            {activeTab === 'nav' && (
              <div className="space-y-4">
                {/* Active Waypoint Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                        Active Destination Target
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                        {goalWp?.name ?? 'Survey Target Delta'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        Elev: {goalWp?.elevation ?? -2540}m · Lat: {goalWp?.lat ?? 18.42}° · Lon: {goalWp?.lon ?? 77.55}°
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {goalWp?.type ?? 'Primary Science Target'}
                    </span>
                  </div>

                  {/* Traverse Metrics Big Numbers */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Dist Rem.</div>
                      <div className="text-base font-bold text-amber-300 font-mono">
                        {distanceRemainingKm.toFixed(2)} km
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Max Slope</div>
                      <div className="text-base font-bold text-emerald-300 font-mono">
                        {activePath?.maxSlopeDeg.toFixed(1) ?? '7.2'}°
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Est. Walk</div>
                      <div className="text-base font-bold text-sky-300 font-mono">
                        {Math.round((distanceRemainingKm / 2.5) * 60)} min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button: Traverse Simulation & Autonav */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      tacticalAudio.playBlip();
                      onToggleSimulation();
                    }}
                    className={`w-full min-h-[52px] rounded-2xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                      isSimulating
                        ? 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500'
                    }`}
                  >
                    <Navigation2 className="w-5 h-5" />
                    <span>{isSimulating ? 'Pause Traverse Walk' : 'Execute Step-by-Step Traverse'}</span>
                  </button>

                  <button
                    onClick={() => {
                      tacticalAudio.playWarning();
                      // Find base camp waypoint
                      const base = waypoints.find((w) => w.type === 'Habitat / Base Camp') || waypoints[0];
                      onSelectGoal(base);
                    }}
                    className="w-full min-h-[46px] rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>Reroute Direct to Habitat Base (Emergency Abort)</span>
                  </button>
                </div>

                {/* Quick Target Waypoint Selector Cards */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Field Waypoints (Jezero Western Delta)</span>
                    <span className="text-amber-400 font-bold">{waypoints.length} Targets</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {waypoints.map((wp) => (
                      <button
                        key={wp.id}
                        onClick={() => {
                          tacticalAudio.playBlip();
                          onSelectGoal(wp);
                          onSelectWaypoint?.(wp);
                        }}
                        className={`w-full min-h-[48px] p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                          goalWp?.id === wp.id
                            ? 'bg-amber-500/20 border-amber-400/80 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin
                            className={`w-4 h-4 shrink-0 ${
                              goalWp?.id === wp.id ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          />
                          <div className="truncate">
                            <div className="font-bold text-xs truncate">{wp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Elev: {wp.elevation}m · {wp.hazardRating}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                          Set Target
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLSS LIFE SUPPORT CONSUMABLES */}
            {activeTab === 'plss' && (
              <div className="space-y-4">
                {/* O2 Primary & Secondary Bars */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-sky-400" />
                      <span>Primary O₂ Bottle (NASA PLSS)</span>
                    </span>
                    <span className="font-mono font-bold text-sky-400 text-sm">
                      {o2PrimaryPercent}% ({o2PrimaryPsi.toFixed(2)} psi)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${o2PrimaryPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                    <span>Secondary O₂ Bottle: <strong className="text-emerald-400">100% STANDBY</strong></span>
                    <span>Suit Leak: <strong className="text-slate-200">14 sccm</strong></span>
                  </div>
                </div>

                {/* Thermal Sublimator & Battery */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>PLSS Battery</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {batteryKwh.toFixed(2)} kWh
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">84% · 5.8h reserve</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <span>Cooling Loop</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-sky-300 mt-1">
                      {suitWaterPercent}% H₂O
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Temp: 14.2°C nominal</div>
                  </div>
                </div>

                {/* Biometrics & Metabolic Burn */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Metabolic Burn</div>
                    <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{metabolicWatts} W</div>
                    <div className="text-[10px] text-slate-500 font-mono">EVA Limit: 400 W</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">ALARA Radiation</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{radiationDoseRate} µSv/h</div>
                    <div className="text-[10px] text-slate-500 font-mono">Nominal Topo Safe</div>
                  </div>
                </div>

                {/* Biometrics & Buddy Proximity Box */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>EV-1 / EV-2 Buddy Link</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>COMM NOMINAL</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">Separation Distance</div>
                      <div className="text-lg font-bold text-white">{buddyDistanceMeters}m</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400">NASA Limit (FR-102)</div>
                      <div className="text-sm font-bold text-slate-300">&lt; 100m nominal</div>
                    </div>
                  </div>

                  {/* 1-Tap Buddy Comms Check Button */}
                  <button
                    onClick={() => {
                      tacticalAudio.playBlip();
                      setBuddyDistanceMeters(Math.round(35 + Math.random() * 20));
                    }}
                    className="w-full min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-600 transition-all active:scale-95"
                  >
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span>Ping EV-2 Comms Radar Check</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: NASA SAMPLE RETURN CACHING */}
            {activeTab === 'sample' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-amber-400" />
                    <span>NASA MSR Sample Caching Registry</span>
                  </span>
                  <button
                    onClick={() => setIsSampleDrawerOpen(true)}
                    className="min-h-[40px] px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <span>+ Log Sample</span>
                  </button>
                </div>

                {/* Sample Registry List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {sampleLogs.map((log) => (
                    <div
                      key={log.tubeSerial}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {log.tubeSerial}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {log.sealed ? 'HERMETICALLY SEALED' : 'OPEN'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-100">{log.siteName}</div>
                      <div className="text-[11px] text-slate-300">
                        {log.formation} · {log.lithology}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
                        <span>Core: {log.coreLengthMm}mm</span>
                        <span>Sol {log.sol} ({log.lmst})</span>
                        <span>XRF: {log.xrfPrimaryElements.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Log New Sample Form Drawer */}
                {isSampleDrawerOpen && (
                  <div className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/80 space-y-3 animate-fade-in shadow-2xl">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Record Rock Core into Titanium Tube
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400">
                        Rock Lithology / Formation
                      </label>
                      <input
                        type="text"
                        value={newSampleRock}
                        onChange={(e) => setNewSampleRock(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSealedConfirmed}
                          onChange={(e) => setIsSealedConfirmed(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Confirm 100% Hermetic Seal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isWitnessBlank}
                          onChange={(e) => setIsWitnessBlank(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Witness Blank Tube</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleCommitSample}
                        className="flex-1 min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commit to NASA MSR Depot</span>
                      </button>
                      <button
                        onClick={() => setIsSampleDrawerOpen(false)}
                        className="min-h-[46px] px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: NASA EVA FLIGHT RULES & SAFETY THRESHOLDS */}
            {activeTab === 'rules' && (
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  NASA Mars EVA Flight Rules (EVA-FR-101 through 106)
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {NASA_EVA_FLIGHT_RULES.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">{rule.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            rule.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>
                      <div className="font-bold text-slate-100">{rule.title}</div>
                      <div className="text-[11px] text-slate-300 font-mono">
                        Threshold: {rule.threshold}
                      </div>
                      <div className="text-[11px] text-slate-400">Action: {rule.crewAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Tactical Forearm Hand Grip Rail Toggle */}
        <div className="hidden sm:flex flex-col gap-2">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleDockSide();
            }}
            title="Dock Slate to Left or Right Forearm Grip"
            className="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-xl transition-all active:scale-95"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
