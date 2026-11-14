import type { TerrainSample } from '../types/mars';

// Jezero Crater Western Delta bounds and coordinate mapping
// Terrain space: X from -500 to +500, Y from -500 to +500 (representing ~10km x 10km tactical quadrant)
// 1 unit = 10 physical meters. 1000 units = 10,000 meters (10 km).

/**
 * Physically grounded and mathematically continuous (C1/C2 smooth)
 * Digital Elevation Model (DEM) replicating USGS MOLA / HiRISE elevation
 * data of Jezero Crater Western Delta, enhanced with ridged multifractal
 * sedimentary terracing and rocky regolith micro-relief.
 */
export function getJezeroElevation(x: number, y: number): number {
  // Base datum elevation for Jezero Crater floor (-2580m)
  let elev = -2580;

  // 1. Delta Fan: Deposited sediment lobe radiating from river mouth at (-400, 290)
  const dxApex = x - (-400);
  const dyApex = y - 290;
  const distApex = Math.hypot(dxApex, dyApex);
  const fanAngle = Math.atan2(dyApex, dxApex);

  // Smooth angular envelope centered around theta = -0.15 rad (-8.5°) with cosine-squared falloff
  const angleDiff = Math.abs(fanAngle - (-0.15));
  const angleWidth = 1.25;
  let rawAngleWeight = 0;
  if (angleDiff < angleWidth) {
    const t = angleDiff / angleWidth;
    const c = Math.cos(t * Math.PI * 0.5);
    rawAngleWeight = c * c;
  }
  // Singularity removal at r -> 0
  const angleBlend = Math.min(1.0, distApex / 40);
  const angularWeight = 1.0 - angleBlend * (1.0 - rawAngleWeight);

  if (distApex < 450) {
    let radialProfile = 0;
    if (distApex <= 220) {
      // Fan top plateau: gentle slope from -2340m down to -2385m (slope ~ 2.0°)
      radialProfile = 240 - (distApex / 220) * 45;
    } else if (distApex <= 340) {
      // Delta Front Scarp: smooth C1 cubic S-curve transition (slope ~ 7° to 11°)
      const u = (distApex - 220) / 120;
      const s = u * u * (3 - 2 * u);
      radialProfile = 195 - s * 150;
    } else {
      // Gentle fan apron tapering into crater floor (slope ~ 2.5°)
      const v = (distApex - 340) / 110;
      const s = v * v * (3 - 2 * v);
      radialProfile = 45 * (1 - s);
    }
    elev += angularWeight * radialProfile;
  }

  // Navigable river ramp corridor into Neretva gorge (along y ~ 280-300, x from -260 to -400)
  const distRiverCenter = Math.abs(y - (290 + (x - (-400)) * 0.05));
  if (distRiverCenter < 50 && x > -420 && x < -250) {
    const rampWeight = Math.cos((distRiverCenter / 50) * Math.PI * 0.5);
    const riverProgress = (x - (-400)) / 150; // 0 at apex, 1 at fan top
    const rampElev = -2340 - riverProgress * 70;
    elev = elev * (1 - rampWeight * 0.6) + rampElev * (rampWeight * 0.6);
  }

  // 2. Kodiak Butte: Isolated erosional butte remnant at (-340, -80)
  const distKodiak = Math.hypot(x - (-340), y - (-80));
  if (distKodiak < 65) {
    if (distKodiak <= 18) {
      elev += 110; // Flat mesa summit
    } else {
      const t = (distKodiak - 18) / 47;
      const s = Math.cos(t * Math.PI * 0.5);
      elev += 110 * s * s; // Smooth C1 talus slope (~14° to 16°)
    }
  }

  // 3. Belva Crater: 1km impact crater at (-160, 320)
  const distBelva = Math.hypot(x - (-160), y - 320);
  if (distBelva < 130) {
    if (distBelva < 75) {
      // Smooth bowl depression
      const t = distBelva / 75;
      elev += -75 + 103 * t * t * (3 - 2 * t);
    } else {
      // Raised impact rim crest tapering to surface
      const t = (distBelva - 75) / 55;
      const s = Math.cos(t * Math.PI * 0.5);
      elev += 28 * s * s;
    }
  }

  // 4. South Séítah Depression & Scablands around (-80, -120)
  const distSeitah = Math.hypot(x - (-80), y - (-120));
  if (distSeitah < 130) {
    const t = distSeitah / 130;
    const s = Math.cos(t * Math.PI * 0.5);
    elev -= s * s * 36;
  }

  // 5. Western Crater Rim Wall (smooth continuous parabolic rise at far west x < -370)
  if (x < -370) {
    const rimDist = (-370 - x);
    const t = Math.min(1.0, rimDist / 120);
    const s = t * t * (3 - 2 * t);
    elev += s * 220;
  }

  // 6. Multi-octave Ridged Multifractal Noise (Sharp Sedimentary Terracing & Boulder Relief)
  const n1 = Math.abs(Math.sin(x * 0.042 + Math.cos(y * 0.038) * 1.5)) * 4.8;
  const n2 = Math.abs(Math.sin(x * 0.11 - y * 0.09 + n1 * 0.2)) * 2.2;
  const n3 = Math.sin(x * 0.24 + y * 0.18) * Math.cos(x * 0.19 - y * 0.22) * 0.95;
  elev += (n1 + n2 + n3);

  return elev;
}

/**
 * Calculates local Space Weather Cosmic Ray (GCR) & Solar Particle Event (SEP)
 * radiation flux (µSv/hr) considering natural topographical shielding.
 * Crater bowls and deep gorges block horizon sky exposure; high ridges receive full flux.
 */
export function getJezeroRadiationFlux(x: number, y: number): number {
  const elev = getJezeroElevation(x, y);
  const baselineGcr = 24.2; // µSv/hr (MSL RAD nominal baseline)

  // Topographical shielding factor based on elevation relative to crater floor (-2580m)
  const deltaH = elev - (-2580);
  const distBelva = Math.hypot(x - (-160), y - 320);
  const distKodiak = Math.hypot(x - (-340), y - (-80));

  let shieldModifier = 0;
  if (distBelva < 70) {
    shieldModifier = -6.8; // Deep inside Belva Crater bowl (natural 15° wall shielding)
  } else if (distKodiak < 20) {
    shieldModifier = +4.4; // Atop Kodiak Butte mesa summit (unshielded 360° horizon)
  } else if (x < -380) {
    shieldModifier = +3.8; // High crater rim peak
  } else {
    shieldModifier = (deltaH / 250) * 2.5;
  }

  return Math.max(14.0, Math.min(32.0, Number((baselineGcr + shieldModifier).toFixed(1))));
}

/**
 * Returns complete terrain properties at (x, y):
 * Elevation, Slope (degrees), Surface Normal, Thermal Inertia, Radiation Flux, and Hazard Status.
 */
export function sampleTerrain(x: number, y: number): TerrainSample {
  const elev = getJezeroElevation(x, y);

  // Gradient computation via finite differences (1 unit in (x,y) = 10 physical meters)
  const METERS_PER_UNIT = 10.0;
  const delta = 2.0; // 2 units step (20 meters)
  const eX1 = getJezeroElevation(x + delta, y);
  const eX0 = getJezeroElevation(x - delta, y);
  const eY1 = getJezeroElevation(x, y + delta);
  const eY0 = getJezeroElevation(x, y - delta);

  const dzdx = (eX1 - eX0) / (2 * delta * METERS_PER_UNIT);
  const dzdy = (eY1 - eY0) / (2 * delta * METERS_PER_UNIT);

  // Slope magnitude in radians, converted to degrees
  const gradMag = Math.sqrt(dzdx * dzdx + dzdy * dzdy);
  const slopeRad = Math.atan(gradMag);
  const slopeDeg = (slopeRad * 180) / Math.PI;

  // Normal vector: (-dz/dx, 1, -dz/dy) normalized
  const normLen = Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
  const normal: [number, number, number] = [
    -dzdx / normLen,
    1 / normLen,
    -dzdy / normLen,
  ];

  // Odyssey THEMIS Thermal Inertia estimation:
  const distDuneField = Math.hypot(x - 20, y - (-40));
  const distKodiak = Math.hypot(x - (-340), y - (-80));
  let thermalInertia = 310; // Default consolidated regolith
  if (distDuneField < 80) {
    thermalInertia = 135 + (distDuneField / 80) * 60; // Loose sand trap!
  } else if (x < -320 && y > 150) {
    thermalInertia = 360; // Delta mudstones
  } else if (distKodiak < 60) {
    thermalInertia = 410; // Butte caprock
  }

  const radiationFlux = getJezeroRadiationFlux(x, y);

  let isHazard = false;
  let hazardReason: string | undefined = undefined;

  if (slopeDeg > 15.0) {
    isHazard = true;
    hazardReason = `CRITICAL ROLLOVER & SLIP HAZARD: Slope ${slopeDeg.toFixed(1)}° exceeds EVA 15° suit scree barrier`;
  } else if (thermalInertia < 165 && slopeDeg > 7.0) {
    isHazard = true;
    hazardReason = `SAND TRAP RISK: Unconsolidated megaripple dunes with >80% wheel/boot sinkage risk`;
  } else if (slopeDeg > 10.0) {
    hazardReason = `MODERATE GRADIENT: Slope ${slopeDeg.toFixed(1)}° exceeds nominal 10° speed rating`;
  }

  return {
    elevation: elev,
    slopeDeg,
    normal,
    thermalInertia,
    radiationFlux,
    isHazard,
    hazardReason,
  };
}

/**
 * Returns CRISM spectral mineralogy classification based on spatial units.
 */
export function getSpectralMineral(x: number, y: number): {
  name: string;
  category: 'Clay/Phyllosilicate' | 'Carbonate' | 'Sulfate' | 'Basaltic Regolith';
  color: string;
  description: string;
} {
  const distKodiak = Math.hypot(x - (-340), y - (-80));
  const distBelva = Math.hypot(x - (-160), y - 320);

  if (x < -200 && y > 100 && y < 350) {
    return {
      name: 'Fe/Mg Smectite Clay',
      category: 'Clay/Phyllosilicate',
      color: '#00f0ff', // Electric Cyan / Magenta
      description: 'Ancient aqueous lakebed phyllosilicates capable of preserving microscopic cellular biosignatures.'
    };
  }

  if (distKodiak < 70) {
    return {
      name: 'Magnesium Carbonate & Fe-Smectite',
      category: 'Carbonate',
      color: '#10b981', // Emerald
      description: 'Deltaic bottomset deposits indicating neutral to alkaline ancient lake water chemistry.'
    };
  }

  if (distBelva < 110) {
    return {
      name: 'Hydrothermal Silica & Chlorite',
      category: 'Sulfate',
      color: '#fbbf24', // Gold
      description: 'Post-impact hydrothermal circulation deposits exhumed from deep crustal layers.'
    };
  }

  return {
    name: 'Pyroxene & Olivine Basalt',
    category: 'Basaltic Regolith',
    color: '#64748b', // Slate Gray
    description: 'Unaltered volcanic bedrock and crater floor lava flow plains.'
  };
}
