// NASA Mars Extravehicular Activity (EVA) Flight Rules & Tactical Safety Envelope
// Sources: NASA-STD-3001 (Human Integration Design Standards), NASA EVA-FR-101/108,
// NASA Mars Exploration Program Perseverance Sample Caching Protocol.

export interface EvaFlightRule {
  id: string;
  code: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  condition: string;
  threshold: string;
  crewAction: string;
  source: string;
}

export const NASA_EVA_FLIGHT_RULES: EvaFlightRule[] = [
  {
    id: 'fr-101',
    code: 'EVA-FR-101',
    title: 'Walkback Limit & Point of No Return (PNR)',
    severity: 'CRITICAL',
    condition: 'Remaining unassisted walking range <= distance to Pressurized Rover/Hab + 30 min O2 reserve',
    threshold: 'Walkback margin <= 30 min (unassisted pace 2.5 km/h)',
    crewAction: 'IMMEDIATE TERMINATION of EVA. Reverse traverse along nominal return path.',
    source: 'NASA EVA Consumables Flight Rule 101.4'
  },
  {
    id: 'fr-102',
    code: 'EVA-FR-102',
    title: 'EV-1 / EV-2 Buddy Separation Constraint',
    severity: 'WARNING',
    condition: 'Separation between crew members exceeds visual and direct UHF comms radius',
    threshold: 'Max allowable separation: 100m nominal, 150m hard redline',
    crewAction: 'Halt traverse. EV-2 closes distance to EV-1 until visual contact confirmed.',
    source: 'NASA EVA Buddy Protocol 202.1'
  },
  {
    id: 'fr-103',
    code: 'EVA-FR-103',
    title: 'Terrain Slope & Rollover Limit',
    severity: 'CRITICAL',
    condition: 'Local terrain slope exceeds safe foot traction or pressurized rover static rollover angle',
    threshold: 'Foot EVA slope > 15.0° (scree hazard); Rover slope > 20.0°',
    crewAction: 'Bypass terrain feature. Reroute via calculated minimum-energy contour corridor.',
    source: 'NASA Planetary Surface Traverse Manual SP-8030'
  },
  {
    id: 'fr-104',
    code: 'EVA-FR-104',
    title: 'Space Radiation Dose Limit (ALARA)',
    severity: 'CRITICAL',
    condition: 'Solar Particle Event (SPE) or elevated Galactic Cosmic Ray (GCR) flux detected by RAD sensor',
    threshold: 'Instantaneous dose rate > 50 µSv/h or Sol accumulation > 1.0 mSv',
    crewAction: 'Seek topographic rock shelter or return to rover radiation-shielded cabin.',
    source: 'NASA Radiation Health Working Group STD-3001 Vol 1'
  },
  {
    id: 'fr-105',
    code: 'EVA-FR-105',
    title: 'Convective Atmospheric Dust Vortex (Dust Devil)',
    severity: 'WARNING',
    condition: 'MEDA pressure drop > 4.0 Pa and wind gust > 15.0 m/s within 500m radius',
    threshold: 'Optical opacity tau > 0.65; pressure rate of change dp/dt > 1.2 Pa/s',
    crewAction: 'Maintain structural tether. Face away from prevailing vortex trajectory.',
    source: 'Mars 2020 MEDA Science Operations Protocol'
  },
  {
    id: 'fr-106',
    code: 'EVA-FR-106',
    title: 'Sample Return Chain of Custody & Sealing',
    severity: 'ADVISORY',
    condition: 'Core drilling or regolith sample collection into NASA titanium sample tube',
    threshold: 'Tube hermetic seal confirmed; core length >= 50mm; witness tube check logged',
    crewAction: 'Register serial number in sample ledger. Store in rover carousel depot.',
    source: 'NASA MSR Sample Depot Protocol M2020-SMP-09'
  }
];

export interface SampleTubeLogEntry {
  tubeSerial: string;
  siteName: string;
  formation: string;
  lithology: string;
  coreLengthMm: number;
  sol: number;
  lmst: string;
  lat: number;
  lon: number;
  sealed: boolean;
  witnessBlank: boolean;
  xrfPrimaryElements: string[];
}
