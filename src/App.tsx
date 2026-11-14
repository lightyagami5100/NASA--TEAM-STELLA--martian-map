// NASA Mars Jezero Crater Surface Navigation & Human EVA Tactical Control
import { useState, useEffect, useRef, useCallback } from 'react';
import waypointsData from './data/waypoints.json';
import type {
  Waypoint,
  PathResult,
  CameraMode,
  LayerSettings,
  TerrainSource,
  TraverseMode,
  TimeOfDayPreset,
  LiveRoverFeedData,
  OperationUiMode
} from './types/mars';
import { findOptimalMarsPath } from './utils/pathfinding';
import { MarsCanvas, type CameraNavAction } from './components/canvas/MarsCanvas';
import { MissionHeader } from './components/hud/MissionHeader';
import { TacticalSidebar } from './components/hud/TacticalSidebar';
import { WaypointInspector } from './components/hud/WaypointInspector';
import { GoogleEarthNavControls } from './components/hud/GoogleEarthNavControls';
import { PitchBriefModal } from './components/hud/PitchBriefModal';
import { ScienceLayerLegend } from './components/hud/ScienceLayerLegend';
import { HelmetVisorOverlay } from './components/hud/HelmetVisorOverlay';
import { WeatherStationModal } from './components/hud/WeatherStationModal';
import { LiveRoverFeedModal } from './components/hud/LiveRoverFeedModal';
import { EvaTabletHud } from './components/hud/EvaTabletHud';
import { tacticalAudio } from './utils/audio';

export default function App() {
  const waypoints: Waypoint[] = waypointsData as Waypoint[];

  const [operationMode, setOperationMode] = useState<OperationUiMode>('screen');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [startWp, setStartWp] = useState<Waypoint | null>(waypoints[0]);
  const [goalWp, setGoalWp] = useState<Waypoint | null>(waypoints[4]);
  const [activePath, setActivePath] = useState<PathResult | null>(() =>
    findOptimalMarsPath(waypoints[0].x, waypoints[0].y, waypoints[4].x, waypoints[4].y, 'foot')
  );

  // Multi-Layer Compositing Fusion Stack Settings
  const [layerSettings, setLayerSettings] = useState<LayerSettings>({
    baseOptical: true,
    slopeHazard: false,
    slopeOpacity: 0.8,
    themisThermal: false,
    themisOpacity: 0.8,
    crismMinerals: false,
    crismOpacity: 0.85,
    radiationFlux: false,
    radiationOpacity: 0.75,
    contours: false,
    contoursOpacity: 0.8,
    walkbackCircle: true,
    dustDevils: true,
    commsLoS: true,
    gridOverlay: false,
  });

  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [terrainSource, setTerrainSource] = useState<TerrainSource>('dem-plane');
  const [traverseMode, setTraverseMode] = useState<TraverseMode>('foot');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayPreset>('day');
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [roverTelemetry] = useState<LiveRoverFeedData>({
    sol: 1320,
    lmst: '14:39:34',
    batteryPercent: 87.4,
    batteryTempC: -18.4,
    driveCurrentAmps: 4.8,
    wheelSlipPercent: 6.2,
    pitchDeg: 2.4,
    rollDeg: -1.1,
    hazcamStatus: 'nominal',
    autonavStatus: 'active',
    dsnSignalDbm: -94,
    downlinkKbps: 2048,
    roundtripLatencySec: 864,
    activeTarget: 'Three Forks Sample Depot',
  });

  // Ergonomic Tablet Handedness Docking (Left vs Right Handed)
  const [dockSide, setDockSide] = useState<'left' | 'right'>('left');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Apple visionOS Liquid Glass Theme ('light' = Liquid Quartz Glass, 'dark' = Obsidian Space Glass)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // MEDA Atmospheric & Weather Hazard Modal
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  // Camera azimuth & tilt tracking for Google Earth navigation widgets
  const [cameraHeading, setCameraHeading] = useState({ theta: Math.PI * 0.25, phi: Math.PI * 0.32 });
  const [navAction, setNavAction] = useState<CameraNavAction | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);

  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isVisorFilter, setIsVisorFilter] = useState(false);

  const isInitialMount = useRef(true);

  // Operational UI Mode Switcher (Screen vs Tablet vs Visor)
  const handleSetOperationMode = useCallback((newMode: OperationUiMode) => {
    tacticalAudio.playBlip();
    setOperationMode(newMode);
    if (newMode === 'visor') {
      setCameraMode('visor');
    } else if (cameraMode === 'visor') {
      setCameraMode('orbit');
    }
  }, [cameraMode]);

  // Global Keyboard Shortcuts (Key 1: Screen, Key 2: Tablet, Key 3: Visor, Escape: Screen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '1') {
        handleSetOperationMode('screen');
      } else if (e.key === '2') {
        handleSetOperationMode('tablet');
      } else if (e.key === '3') {
        handleSetOperationMode('visor');
      } else if (e.key === 'Escape') {
        if (operationMode !== 'screen') {
          handleSetOperationMode('screen');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSetOperationMode, operationMode]);

  const computeRoute = useCallback((modeOverride?: TraverseMode) => {
    if (!startWp || !goalWp) return;
    const mode = modeOverride ?? traverseMode;
    const result = findOptimalMarsPath(startWp.x, startWp.y, goalWp.x, goalWp.y, mode);
    setActivePath(result);
    setSimulationProgress(0);
    setIsSimulating(false);
  }, [startWp, goalWp, traverseMode]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    computeRoute();
  }, [computeRoute]);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSimulating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
      return;
    }

    const updateSimulation = (time: number) => {
      if (lastTimeRef.current !== null && activePath) {
        const delta = (time - lastTimeRef.current) / 1000;
        const rate = (1 / 28) * simSpeed;
        setSimulationProgress((prev) => {
          const next = prev + delta * rate;
          if (next >= 1) {
            setIsSimulating(false);
            return 1;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(updateSimulation);
    };

    requestRef.current = requestAnimationFrame(updateSimulation);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSimulating, simSpeed, activePath]);

  const handleTerrainClick = (coords: { x: number; y: number; elevation: number }) => {
    const customWp: Waypoint = {
      id: `custom_${Date.now()}`,
      name: `Survey Point (${coords.x}, ${coords.y})`,
      lat: Number((18.38 + coords.y * 0.0003).toFixed(4)),
      lon: Number((77.58 + coords.x * 0.0003).toFixed(4)),
      x: coords.x,
      y: coords.y,
      elevation: coords.elevation,
      type: 'Primary Science Target',
      status: 'Survey Site',
      commsLoS: true,
      description: `Surveyed terrain point on Jezero Crater Western Delta. Elevation: ${coords.elevation}m.`,
      sampleTube: null,
      spectralSignature: 'Silicate Regolith',
      thermalInertia: 290,
      hazardRating: 'Terrain Survey',
    };
    setSelectedWaypoint(customWp);
  };

  const triggerNav = (type: CameraNavAction['type'], payload?: number) => {
    setNavAction({ type, payload, id: Date.now() });
  };

  return (
    <main className={`relative w-screen h-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans select-none ${isVisorFilter ? 'visor-hud-filter' : ''}`}>
      {/* 1. Apple Liquid Glass Top Command Island */}
      <MissionHeader
        onOpenBrief={() => setIsBriefOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenLiveFeed={() => setIsLiveFeedOpen(true)}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        commsLoS={activePath?.path[Math.floor(simulationProgress * (activePath.path.length - 1))]?.commsLoS ?? true}
        isVisorFilter={isVisorFilter}
        onToggleVisorFilter={() => setIsVisorFilter(!isVisorFilter)}
        dockSide={dockSide}
        onToggleDockSide={() => setDockSide((prev) => (prev === 'left' ? 'right' : 'left'))}
        isSidebarCollapsed={isSidebarCollapsed}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        waypoints={waypoints}
        onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
        startWp={startWp}
        goalWp={goalWp}
        activePath={activePath}
        operationMode={operationMode}
        onChangeOperationMode={handleSetOperationMode}
      />

      {/* 2. 3D Martian Surface Canvas */}
      <MarsCanvas
        waypoints={waypoints}
        selectedWaypoint={selectedWaypoint}
        onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
        activePath={activePath}
        layerSettings={layerSettings}
        cameraMode={cameraMode}
        onSetCameraMode={(mode) => setCameraMode(mode)}
        terrainSource={terrainSource}
        simulationProgress={simulationProgress}
        timeOfDay={timeOfDay}
        onTerrainClick={handleTerrainClick}
        onCameraHeadingChange={(theta, phi) => setCameraHeading({ theta, phi })}
        navAction={navAction}
      />

      {/* 3. First-Person Astronaut Helmet Visor HUD Overlay (Eye-level 1.8m) */}
      <HelmetVisorOverlay
        active={operationMode === 'visor' || cameraMode === 'visor'}
        onExitVisor={() => handleSetOperationMode('screen')}
        onSwitchToTablet={() => handleSetOperationMode('tablet')}
        onSwitchToScreen={() => handleSetOperationMode('screen')}
        targetWaypoint={goalWp}
        activePath={activePath}
        simulationProgress={simulationProgress}
        cameraTheta={cameraHeading.theta}
      />

      {/* 4. Astronaut EVA Tactical Field Slate / PDU (Tablet Mode) */}
      {operationMode === 'tablet' && (
        <EvaTabletHud
          waypoints={waypoints}
          selectedWaypoint={selectedWaypoint}
          onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
          startWp={startWp}
          goalWp={goalWp}
          onSelectGoal={(wp) => {
            setGoalWp(wp);
            computeRoute();
          }}
          activePath={activePath}
          simulationProgress={simulationProgress}
          onToggleSimulation={() => {
            tacticalAudio.playBlip();
            if (simulationProgress >= 1) setSimulationProgress(0);
            setIsSimulating(!isSimulating);
          }}
          isSimulating={isSimulating}
          dockSide={dockSide}
          onToggleDockSide={() => setDockSide((prev) => (prev === 'left' ? 'right' : 'left'))}
          onSwitchToVisor={() => handleSetOperationMode('visor')}
          onSwitchToScreen={() => handleSetOperationMode('screen')}
        />
      )}

      {/* 5. Desktop Workstation Console Panels (Screen Mode) */}
      {operationMode === 'screen' && (
        <>
          <TacticalSidebar
            waypoints={waypoints}
            selectedWaypoint={selectedWaypoint}
            onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
            startWp={startWp}
            goalWp={goalWp}
            onSelectStart={(wp) => setStartWp(wp)}
            onSelectGoal={(wp) => setGoalWp(wp)}
            onComputePath={computeRoute}
            activePath={activePath}
            traverseMode={traverseMode}
            onSetTraverseMode={(mode) => {
              setTraverseMode(mode);
              computeRoute(mode);
            }}
            isSimulating={isSimulating}
            onToggleSimulation={() => {
              tacticalAudio.playBlip();
              if (simulationProgress >= 1) setSimulationProgress(0);
              setIsSimulating(!isSimulating);
            }}
            onResetSimulation={() => {
              tacticalAudio.playBlip();
              setIsSimulating(false);
              setSimulationProgress(0);
            }}
            simSpeed={simSpeed}
            onSetSimSpeed={(spd) => {
              tacticalAudio.playBlip();
              setSimSpeed(spd);
            }}
            simulationProgress={simulationProgress}
            onSeekProgress={(p) => setSimulationProgress(p)}
            cameraMode={cameraMode}
            onSetCameraMode={(m) => setCameraMode(m)}
            layerSettings={layerSettings}
            onUpdateLayerSettings={setLayerSettings}
            terrainSource={terrainSource}
            onToggleTerrainSource={() =>
              setTerrainSource((prev) => {
                if (prev === 'dem-plane') return 'nasa-stl';
                if (prev === 'nasa-stl') return 'nasa-obj';
                return 'dem-plane';
              })
            }
            onSelectTerrainSource={(src: TerrainSource) => setTerrainSource(src)}
            dockSide={dockSide}
            onToggleDockSide={() => setDockSide((prev) => (prev === 'left' ? 'right' : 'left'))}
            onOpenWeather={() => setIsWeatherOpen(true)}
            onOpenLiveFeed={() => setIsLiveFeedOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onSetCollapsed={setIsSidebarCollapsed}
          />

          <WaypointInspector
            waypoint={selectedWaypoint}
            onClose={() => setSelectedWaypoint(null)}
            onSetStart={(wp) => {
              setStartWp(wp);
              computeRoute();
            }}
            onSetGoal={(wp) => {
              setGoalWp(wp);
              computeRoute();
            }}
            dockSide={dockSide}
          />

          <GoogleEarthNavControls
            cameraMode={cameraMode}
            onSetCameraMode={(m) => setCameraMode(m)}
            onZoomIn={() => triggerNav('zoomIn')}
            onZoomOut={() => triggerNav('zoomOut')}
            onTiltUp={() => triggerNav('tiltUp')}
            onTiltDown={() => triggerNav('tiltDown')}
            onResetNorth={() => triggerNav('resetNorth')}
            onRecenter={() => triggerNav('recenter')}
            cameraTheta={cameraHeading.theta}
            cameraPhi={cameraHeading.phi}
            dockSide={dockSide}
            hasInspector={selectedWaypoint !== null}
          />

          <ScienceLayerLegend
            layerSettings={layerSettings}
            dockSide={dockSide}
            hasInspector={selectedWaypoint !== null}
          />
        </>
      )}

      {/* 8. Mission Info & Award Rubrics Modal */}
      <PitchBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />

      {/* 9. NASA MEDA Atmospheric & Dust Devil Weather Suite Modal */}
      <WeatherStationModal
        isOpen={isWeatherOpen}
        onClose={() => setIsWeatherOpen(false)}
      />

      {/* 10. NASA Perseverance Live DSN Telemetry & Hazcam Feed Modal */}
      <LiveRoverFeedModal
        isOpen={isLiveFeedOpen}
        onClose={() => setIsLiveFeedOpen(false)}
        telemetry={roverTelemetry}
      />
    </main>
  );
}
