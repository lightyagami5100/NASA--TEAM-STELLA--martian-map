// NASA Mars Jezero Crater Surface Navigation & Science System Types

export interface SampleTube {
  tubeId: string;
  name: string;
  rockType: string;
  biosignatureRating: string;
  collectionSol: number;
  coreLengthMm: number;
}

export interface RamanXrfSpectrum {
  instrument: 'SHERLOC (UV Raman)' | 'PIXL (Micro-XRF)' | 'SuperCam (LIBS)';
  targetName: string;
  peaks: { label: string; xVal: number; unit: string; intensity: number }[];
  elementsDetected: string[];
  mineralMatch: string;
  confidenceScore: number;
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  x: number; // 3D coordinates on terrain plane (meters/scaled)
  y: number;
  elevation: number; // in meters relative to Mars datum (MOLA DEM)
  type: 'Habitat / Base Camp' | 'Primary Science Target' | 'Geological Target' | 'Hazard Zone' | 'Sample Cache Depot' | 'Secondary Impact Ejecta' | 'Inflow Channel Breach';
  status: 'Operational' | 'High Priority' | 'Analyzed' | 'Restricted' | 'Active Cache' | 'Survey Site' | 'Challenging';
  commsLoS: boolean;
  description: string;
  sampleTube: SampleTube | null;
  spectralSignature: string;
  thermalInertia: number; // J m^-2 K^-1 s^-1/2 (Odyssey THEMIS)
  hazardRating: string;
  instruments?: string[]; // NASA Perseverance science payload (SuperCam, Mastcam-Z, PIXL, SHERLOC, RIMFAX, etc.)
  surfacePov?: {
    camera: string;
    caption: string;
    visualNotes: string;
    imageUrl?: string;
  };
  scienceData?: {
    lithology: string;
    grainSize: string;
    hardnessMohs: number;
    densityGCm3: number;
    spectrum: RamanXrfSpectrum;
  };
}

export type TraverseMode = 'foot' | 'rover';

export interface TerrainSample {
  elevation: number;
  slopeDeg: number;
  normal: [number, number, number];
  thermalInertia: number;
  radiationFlux: number; // µSv/hr
  isHazard: boolean;
  hazardReason?: string;
}

export interface PathNode {
  x: number;
  y: number;
  z: number;
  slopeDeg: number;
  distanceFromStartKm: number;
  cumulativeElevationM: number;
  batteryKwh: number;
  oxygenLiters: number;
  metabolicBurnRate: number; // L/min (0.8 - 2.4)
  commsLoS: boolean;
  warning?: 'slope' | 'hazard' | 'rollover';
}

export interface PathResult {
  path: PathNode[];
  rawCoordinates: [number, number, number][];
  totalDistanceKm: number;
  estimatedDurationHours: number;
  batteryRequiredKwh: number;
  oxygenRequiredLiters: number;
  elevationGainM: number;
  elevationLossM: number;
  maxSlopeDeg: number;
  avgSlopeDeg: number;
  hazardPassCount: number;
  isViable: boolean;
  safetyScore: number; // 0 - 100
  traverseMode?: TraverseMode;
  summary: string;
}

export interface RoverTelemetry {
  currentDistanceKm: number;
  speedKmh: number;
  batteryPercent: number;
  o2Percent: number;
  currentSlopeDeg: number;
  rollDeg: number;
  pitchDeg: number;
  elevationM: number;
  commsStrengthPercent: number;
  activeTargetName: string;
  isMoving: boolean;
  progressPercent: number;
}

export interface CrewVitals {
  id: 'ev1' | 'ev2';
  callsign: string;
  role: string;
  heartRateBpm: number;
  suitPressurePsi: number;
  primaryO2Percent: number;
  co2ScrubberPercent: number;
  batteryPercent: number;
  coolingLoopTempC: number;
  metabolicRateWatts: number;
  radiationDoseRateMicroSvHr: number;
}

export interface SpaceWeatherTelemetry {
  gcrFluxMicroSvHr: number;
  sepAlert: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  cumulativeEvaDoseMsv: number;
  solarFluxWPerM2: number;
  atmosphericTau: number;
}

// Multi-Layer Compositing Stack (Layer toggles and independent 0-100% opacities)
export interface ActiveLayers {
  satellite?: boolean;
  animeGraphic?: boolean;
  slopeHazard?: boolean;
  crismMinerals?: boolean;
  themisThermal?: boolean;
  contours?: boolean;
  commsLoS?: boolean;
  gridOverlay?: boolean;
}

export interface LayerSettings {
  baseOptical: boolean; // Always active high-res MRO CTX / HiRISE regolith
  slopeHazard: boolean;
  slopeOpacity: number;
  themisThermal: boolean;
  themisOpacity: number;
  crismMinerals: boolean;
  crismOpacity: number;
  radiationFlux: boolean;
  radiationOpacity: number;
  contours: boolean;
  contoursOpacity: number;
  walkbackCircle: boolean;
  dustDevils: boolean;
  commsLoS: boolean;
  gridOverlay: boolean;
}

export type CameraMode = 'orbit' | 'rover' | 'topdown' | 'globe' | 'visor';

export type OperationUiMode = 'screen' | 'tablet' | 'visor';

export type TerrainSource = 'nasa-stl' | 'nasa-obj' | 'dem-plane';

export type TimeOfDayPreset = 'day' | 'sunset' | 'night';

export interface LiveRoverFeedData {
  sol: number;
  lmst: string;
  batteryPercent: number;
  batteryTempC: number;
  driveCurrentAmps: number;
  wheelSlipPercent: number;
  pitchDeg: number;
  rollDeg: number;
  hazcamStatus: 'nominal' | 'dust-detected' | 'standby';
  autonavStatus: 'active' | 'evaluating' | 'stopped';
  dsnSignalDbm: number;
  downlinkKbps: number;
  roundtripLatencySec: number;
  activeTarget: string;
}
