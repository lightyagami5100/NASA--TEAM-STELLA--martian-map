// High-Fidelity 3D Mars Planetary Globe Generator
// Scientifically authentic Martian cartography: Physiographic provinces, Albedo features,
// Topographical Bump maps, Multi-layer Atmospheric Limb scattering, Translucent Cloud veils,
// and 3D Radial Landing Site pins for active & historic NASA missions.

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface MarsLandingSite {
  id: string;
  name: string;
  mission: string;
  agency: string;
  year: number;
  lat: number;
  lon: number;
  elevation: string;
  status: 'ACTIVE' | 'COMPLETED' | 'HISTORIC';
  color: string;
  badgeBg: string;
  description: string;
}

export const MARS_LANDING_SITES: MarsLandingSite[] = [
  {
    id: 'perseverance',
    name: 'Perseverance & Ingenuity',
    mission: 'Mars 2020',
    agency: 'NASA / JPL',
    year: 2021,
    lat: 18.38,
    lon: 77.58,
    elevation: '-2,540 m',
    status: 'ACTIVE',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    description: 'Western Jezero delta astrobiology & sample caching depot. Primary active EVA target.',
  },
  {
    id: 'curiosity',
    name: 'Curiosity (MSL)',
    mission: 'Mars Science Lab',
    agency: 'NASA / JPL',
    year: 2012,
    lat: -4.59,
    lon: 137.44,
    elevation: '-4,450 m',
    status: 'ACTIVE',
    color: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.25)',
    description: 'Gale Crater & Mount Sharp (Aeolis Mons) ancient lacustrine mudstone exploration.',
  },
  {
    id: 'opportunity',
    name: 'Opportunity (MER-B)',
    mission: 'Mars Exploration Rover',
    agency: 'NASA / JPL',
    year: 2004,
    lat: -1.95,
    lon: 354.47,
    elevation: '-1,440 m',
    status: 'COMPLETED',
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.2)',
    description: 'Meridiani Planum hematite spherules (blueberries) & 45.16 km marathon traverse.',
  },
  {
    id: 'spirit',
    name: 'Spirit (MER-A)',
    mission: 'Mars Exploration Rover',
    agency: 'NASA / JPL',
    year: 2004,
    lat: -14.57,
    lon: 175.47,
    elevation: '-1,920 m',
    status: 'COMPLETED',
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.2)',
    description: 'Gusev Crater & Columbia Hills. Discovered ancient hydrothermal silica volcanism.',
  },
  {
    id: 'insight',
    name: 'InSight Lander',
    mission: 'Discovery 12',
    agency: 'NASA / JPL',
    year: 2018,
    lat: 4.50,
    lon: 135.62,
    elevation: '-2,613 m',
    status: 'COMPLETED',
    color: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.2)',
    description: 'Elysium Planitia. Internal seismic probing & core structure detection via SEIS.',
  },
  {
    id: 'viking1',
    name: 'Viking 1 Lander',
    mission: 'Viking Project',
    agency: 'NASA / Langley',
    year: 1976,
    lat: 22.70,
    lon: 312.05,
    elevation: '-2,690 m',
    status: 'HISTORIC',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    description: 'Chryse Planitia. First successful American soft landing & panoramic surface imaging.',
  },
  {
    id: 'viking2',
    name: 'Viking 2 Lander',
    mission: 'Viking Project',
    agency: 'NASA / Langley',
    year: 1976,
    lat: 48.27,
    lon: 134.01,
    elevation: '-4,230 m',
    status: 'HISTORIC',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    description: 'Utopia Planitia boulder plain & Martian atmospheric gas chromatography analysis.',
  },
  {
    id: 'pathfinder',
    name: 'Mars Pathfinder & Sojourner',
    mission: 'Discovery 2',
    agency: 'NASA / JPL',
    year: 1997,
    lat: 19.33,
    lon: 326.45,
    elevation: '-3,655 m',
    status: 'HISTORIC',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    description: 'Ares Vallis catastrophic outflow flood plain. First mobile robotic micro-rover.',
  },
  {
    id: 'zhurong',
    name: 'Zhurong (Tianwen-1)',
    mission: 'Tianwen-1',
    agency: 'CNSA',
    year: 2021,
    lat: 25.07,
    lon: 109.93,
    elevation: '-4,100 m',
    status: 'COMPLETED',
    color: '#f87171',
    badgeBg: 'rgba(248, 113, 113, 0.2)',
    description: 'Southern Utopia Planitia subsurface ground-penetrating radar investigation.',
  },
];

export interface MarsGeographicLandmark {
  name: string;
  type: string;
  lat: number;
  lon: number;
  elevation: string;
  note: string;
}

export const MARS_LANDMARKS: MarsGeographicLandmark[] = [
  { name: 'Jezero Crater', type: 'Primary Expedition Site', lat: 18.38, lon: 77.58, elevation: '-2,540 m', note: 'Delta fan & Perseverance base' },
  { name: 'Olympus Mons', type: 'Shield Volcano', lat: 18.65, lon: 226.2, elevation: '+21,287 m', note: 'Largest volcano in Solar System' },
  { name: 'Valles Marineris', type: 'Rift Canyon System', lat: -10.0, lon: 285.0, elevation: '-7,000 m', note: '4,000 km grand canyon' },
  { name: 'Syrtis Major', type: 'Basaltic Province', lat: 10.0, lon: 70.0, elevation: '+1,000 m', note: 'Dark volcanic shield discovered 1659' },
  { name: 'Hellas Planitia', type: 'Impact Basin', lat: -42.0, lon: 70.0, elevation: '-7,152 m', note: '2,300 km basin, deepest on Mars' },
  { name: 'Planum Boreum', type: 'North Polar Cap', lat: 85.0, lon: 0.0, elevation: '-2,000 m', note: 'Perennial spiral water-ice cap' },
  { name: 'Planum Australe', type: 'South Polar Cap', lat: -85.0, lon: 0.0, elevation: '+3,000 m', note: 'CO2 dry-ice cap & frost Mensae' },
];

export function latLonToVector3(lat: number, lon: number, radius = 180): THREE.Vector3 {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  const phi = ((90 - lat) * Math.PI) / 180;
  const u = (l + 180) / 360;
  const theta = u * 2 * Math.PI;

  const x = -radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(theta) * Math.sin(phi);

  return new THREE.Vector3(x, y, z);
}

// 1. Procedural 2048x1024 Mars Equirectangular Albedo Map
export function createDetailedMarsAlbedoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const W = 2048;
  const H = 1024;

  const toX = (lon: number) => {
    let l = lon;
    while (l < -180) l += 360;
    while (l > 180) l -= 360;
    return ((l + 180) / 360) * W;
  };
  const toY = (lat: number) => ((90 - lat) / 180) * H;

  // 1.1 Base Planetary Regolith Dichotomy Gradient (North lowlands vs South highlands)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
  baseGrad.addColorStop(0.00, '#b86d47'); // North polar perimeter
  baseGrad.addColorStop(0.12, '#c96f3e'); // Northern lowlands (Vastitas Borealis)
  baseGrad.addColorStop(0.32, '#d67946'); // Utopia & Arcadia plains
  baseGrad.addColorStop(0.48, '#bd5d2b'); // Equatorial crustal transition
  baseGrad.addColorStop(0.68, '#8c3518'); // Southern cratered highlands
  baseGrad.addColorStop(0.88, '#73260f'); // Southern mid-latitudes
  baseGrad.addColorStop(1.00, '#9e4e2a'); // South polar perimeter
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // 1.2 Fine Geological Sand Flecks & Regolith Granularity
  ctx.fillStyle = 'rgba(40, 12, 6, 0.05)';
  for (let i = 0; i < 6000; i++) {
    const nx = Math.random() * W;
    const ny = Math.random() * H;
    const nw = Math.random() * 4 + 1;
    const nh = Math.random() * 2 + 1;
    ctx.fillRect(nx, ny, nw, nh);
  }
  ctx.fillStyle = 'rgba(255, 195, 140, 0.04)';
  for (let i = 0; i < 4500; i++) {
    const nx = Math.random() * W;
    const ny = Math.random() * H;
    const nw = Math.random() * 3 + 1;
    ctx.fillRect(nx, ny, nw, 1.5);
  }

  // 1.3 Major Basaltic Low-Albedo Provinces (Volcanic Seas & Highlands)
  // Syrtis Major Planum (Iconic triangular basaltic shield volcano)
  ctx.save();
  ctx.fillStyle = 'rgba(32, 10, 6, 0.90)';
  ctx.beginPath();
  ctx.moveTo(toX(70), toY(24));
  ctx.bezierCurveTo(toX(62), toY(18), toX(56), toY(8), toX(58), toY(0));
  ctx.bezierCurveTo(toX(68), toY(-3), toX(76), toY(-2), toX(84), toY(2));
  ctx.bezierCurveTo(toX(82), toY(11), toX(76), toY(18), toX(70), toY(24));
  ctx.fill();
  // Central Caldera Core (Nili Patera & Meroe Patera)
  ctx.fillStyle = 'rgba(16, 4, 2, 0.95)';
  ctx.beginPath();
  ctx.ellipse(toX(67), toY(9), 20, 14, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Southern Dark Albedo Belt: Mare Tyrrhenum & Mare Cimmerium
  ctx.save();
  ctx.fillStyle = 'rgba(36, 12, 7, 0.85)';
  ctx.beginPath();
  ctx.ellipse(toX(110), toY(-24), 160, 48, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(150), toY(-28), 180, 52, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mare Sirenum & Mare Erythraeum
  ctx.save();
  ctx.fillStyle = 'rgba(40, 14, 8, 0.82)';
  ctx.beginPath();
  ctx.ellipse(toX(-145), toY(-32), 190, 50, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(-55), toY(-25), 150, 45, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sinus Sabaeus & Meridiani Planum (Connecting to Prime Meridian)
  ctx.save();
  ctx.fillStyle = 'rgba(34, 11, 6, 0.88)';
  ctx.beginPath();
  ctx.ellipse(toX(-12), toY(-10), 120, 32, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(15), toY(-12), 110, 30, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Acidalia Planitia & Chryse Outflow Lowlands (North of Valles Marineris)
  ctx.save();
  ctx.fillStyle = 'rgba(42, 16, 9, 0.78)';
  ctx.beginPath();
  ctx.ellipse(toX(-35), toY(38), 110, 65, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1.4 Giant Sedimentary & Impact Basins
  // Hellas Planitia (Massive 2,300 km basin, deepest on Mars)
  ctx.save();
  // Mountainous rim (Hellespontus Montes)
  ctx.strokeStyle = 'rgba(45, 14, 8, 0.85)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 125, 95, 0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Pale dusty orange basin floor
  const hellasGrad = ctx.createRadialGradient(toX(70), toY(-42), 10, toX(70), toY(-42), 115);
  hellasGrad.addColorStop(0, '#e58f55');
  hellasGrad.addColorStop(0.8, '#d47b42');
  hellasGrad.addColorStop(1, '#9e4620');
  ctx.fillStyle = hellasGrad;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 115, 88, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Argyre Planitia (Deep circular impact basin in southern highlands)
  ctx.save();
  ctx.strokeStyle = 'rgba(50, 16, 9, 0.8)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(toX(-44), toY(-50), 62, 0, Math.PI * 2);
  ctx.stroke();
  const argyreGrad = ctx.createRadialGradient(toX(-44), toY(-50), 5, toX(-44), toY(-50), 56);
  argyreGrad.addColorStop(0, '#d9804b');
  argyreGrad.addColorStop(1, '#9e431d');
  ctx.fillStyle = argyreGrad;
  ctx.beginPath();
  ctx.arc(toX(-44), toY(-50), 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Isidis Planitia (Sedimentary basin east of Syrtis Major)
  ctx.save();
  const isidisGrad = ctx.createRadialGradient(toX(87), toY(13), 10, toX(87), toY(13), 80);
  isidisGrad.addColorStop(0, '#cf733e');
  isidisGrad.addColorStop(1, '#963f1d');
  ctx.fillStyle = isidisGrad;
  ctx.beginPath();
  ctx.ellipse(toX(87), toY(13), 80, 68, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1.5 Valles Marineris (4,000 km Grand Canyon Rift System)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Canyon Rim Highlight
  ctx.strokeStyle = 'rgba(255, 175, 125, 0.35)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.lineTo(toX(-84), toY(-8));
  ctx.lineTo(toX(-70), toY(-9));
  ctx.lineTo(toX(-55), toY(-12));
  ctx.lineTo(toX(-40), toY(-15));
  ctx.stroke();

  // Deep Canyon Rift Floor (Noctis Labyrinthus -> Melas -> Coprates Chasma)
  ctx.strokeStyle = 'rgba(18, 5, 2, 0.96)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.bezierCurveTo(toX(-88), toY(-7), toX(-78), toY(-11), toX(-68), toY(-10));
  ctx.bezierCurveTo(toX(-58), toY(-9), toX(-48), toY(-14), toX(-36), toY(-15));
  ctx.stroke();

  // Tributary Chasms (Candor, Ophir, Hebes Chasma)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(toX(-75), toY(-6));
  ctx.lineTo(toX(-68), toY(-10));
  ctx.moveTo(toX(-60), toY(-8));
  ctx.lineTo(toX(-54), toY(-13));
  ctx.stroke();

  // Noctis Labyrinthus Canyon Maze (Head of Valles Marineris)
  ctx.strokeStyle = 'rgba(25, 7, 3, 0.88)';
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 7; i++) {
    const lx = toX(-102 + (i % 3) * 3);
    const ly = toY(-8 + Math.floor(i / 3) * 3);
    ctx.strokeRect(lx, ly, 14, 10);
  }
  ctx.restore();

  // 1.6 Colossal Shield Volcanoes (Tharsis Montes & Olympus Mons)
  // Olympus Mons (21.3 km summit - largest volcano in Solar System)
  ctx.save();
  const oX = toX(-133.8);
  const oY = toY(18.65);
  // Basal Scarp Rim (6 km drop cliff)
  ctx.strokeStyle = 'rgba(48, 14, 7, 0.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(oX, oY, 40, 0, Math.PI * 2);
  ctx.stroke();
  // Radial Lava Flow Shield
  const oShield = ctx.createRadialGradient(oX, oY, 5, oX, oY, 38);
  oShield.addColorStop(0, '#e28450');
  oShield.addColorStop(0.7, '#c66632');
  oShield.addColorStop(1, '#8f3917');
  ctx.fillStyle = oShield;
  ctx.beginPath();
  ctx.arc(oX, oY, 38, 0, Math.PI * 2);
  ctx.fill();
  // Triple-Nested Summit Caldera
  ctx.fillStyle = 'rgba(20, 5, 2, 0.95)';
  ctx.beginPath();
  ctx.arc(oX - 2, oY - 1, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(oX + 3, oY + 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tharsis Montes Trio (Ascraeus, Pavonis, Arsia Mons aligned diagonally)
  const drawShieldVolcano = (lon: number, lat: number, r: number, name: string) => {
    ctx.save();
    const vx = toX(lon);
    const vy = toY(lat);
    ctx.strokeStyle = 'rgba(45, 12, 6, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(vx, vy, r, 0, Math.PI * 2);
    ctx.stroke();

    const vGrad = ctx.createRadialGradient(vx, vy, 2, vx, vy, r - 1);
    vGrad.addColorStop(0, '#df7f4c');
    vGrad.addColorStop(0.8, '#b85827');
    vGrad.addColorStop(1, '#7e2d12');
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(vx, vy, r - 1, 0, Math.PI * 2);
    ctx.fill();

    // Caldera
    ctx.fillStyle = 'rgba(18, 4, 2, 0.92)';
    ctx.beginPath();
    ctx.arc(vx, vy, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Volcano Name Annotation
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillText(name.toUpperCase(), vx + r + 6, vy + 4);
    ctx.restore();
  };

  drawShieldVolcano(-104.5, 11.9, 24, 'Ascraeus Mons');
  drawShieldVolcano(-113.0, 0.8, 22, 'Pavonis Mons');
  drawShieldVolcano(-121.0, -8.4, 24, 'Arsia Mons');
  drawShieldVolcano(147.2, 25.0, 26, 'Elysium Mons');

  // 1.7 Procedural Impact Craters Across Southern Highlands
  const craters = [
    { lon: 16.0, lat: -2.7, r: 18, name: 'Schiaparelli' },
    { lon: 55.0, lat: -14.0, r: 24, name: 'Huygens' },
    { lon: 32.0, lat: 23.0, r: 16, name: 'Cassini' },
    { lon: 137.4, lat: -4.6, r: 14, name: 'Gale' },
    { lon: 175.5, lat: -14.6, r: 15, name: 'Gusev' },
    { lon: -150.0, lat: -35.0, r: 12 },
    { lon: -80.0, lat: -48.0, r: 14 },
    { lon: 2.0, lat: -38.0, r: 16 },
    { lon: 95.0, lat: -52.0, r: 13 },
    { lon: 160.0, lat: -40.0, r: 11 },
    { lon: -110.0, lat: -55.0, r: 15 },
    { lon: -15.0, lat: -58.0, r: 13 },
  ];

  craters.forEach((c) => {
    const cx = toX(c.lon);
    const cy = toY(c.lat);
    ctx.save();
    // Sunlit west rim (assuming sunlight from west)
    ctx.strokeStyle = 'rgba(255, 190, 140, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    // Shadowed east rim and floor
    ctx.strokeStyle = 'rgba(25, 7, 3, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    // Dark floor
    ctx.fillStyle = 'rgba(30, 9, 4, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, c.r - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 1.8 Polar Ice Caps (Planum Boreum & Planum Australe)
  // North Polar Ice Cap (Planum Boreum - Perennial Water Ice with Spirals)
  ctx.save();
  const northCapY = toY(80);
  // Dark circumferential sand sea (Olympia Undae)
  ctx.fillStyle = 'rgba(35, 12, 6, 0.85)';
  ctx.fillRect(0, northCapY - 12, W, 18);

  // Brilliant layered glacial ice cap
  const northGrad = ctx.createLinearGradient(0, 0, 0, northCapY);
  northGrad.addColorStop(0, '#ffffff');
  northGrad.addColorStop(0.65, '#f0f9ff');
  northGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = northGrad;
  ctx.fillRect(0, 0, W, northCapY);

  // Spiral dark chasmata (Chasma Boreale)
  ctx.strokeStyle = 'rgba(38, 14, 7, 0.75)';
  ctx.lineWidth = 4;
  for (let s = 0; s < 12; s++) {
    const sx = (s / 12) * W;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(sx + 35, northCapY * 0.4, sx + 70, northCapY * 0.7, sx + 110, northCapY);
    ctx.stroke();
  }
  ctx.restore();

  // South Polar Ice Cap (Planum Australe - CO2 Dry Ice & Frost)
  ctx.save();
  const southCapY = toY(-82);
  const southGrad = ctx.createLinearGradient(0, southCapY, 0, H);
  southGrad.addColorStop(0, '#bae6fd');
  southGrad.addColorStop(0.35, '#f8fafc');
  southGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = southGrad;
  ctx.fillRect(0, southCapY, W, H - southCapY);

  // Scalloped glacial margin
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 24; i++) {
    const px = (i / 24) * W;
    ctx.beginPath();
    ctx.arc(px, southCapY, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 1.9 Target Jezero Crater Location Indicator on Texture
  const jX = toX(77.58);
  const jY = toY(18.38);
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(jX, jY, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(jX, jY, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(jX - 30, jY);
  ctx.lineTo(jX + 30, jY);
  ctx.moveTo(jX, jY - 30);
  ctx.lineTo(jX, jY + 30);
  ctx.stroke();
  ctx.restore();

  // 1.10 Scientific Cartographic Graticule (Subtle coordinate lines & labels)
  ctx.save();
  ctx.setLineDash([8, 8]);

  // Equator 0°
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, toY(0));
  ctx.lineTo(W, toY(0));
  ctx.stroke();

  // Parallels at ±30° and ±60°
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  [-60, -30, 30, 60].forEach((lat) => {
    ctx.beginPath();
    ctx.moveTo(0, toY(lat));
    ctx.lineTo(W, toY(lat));
    ctx.stroke();
  });

  // Prime Meridian 0° [Airy-0]
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(toX(0), 0);
  ctx.lineTo(toX(0), H);
  ctx.stroke();

  // Meridians at ±90° and 180°
  [-90, 90, 180, -180].forEach((lon) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toX(lon), 0);
    ctx.lineTo(toX(lon), H);
    ctx.stroke();
  });

  // Typography Annotations on the Globe Surface
  ctx.setLineDash([]);
  ctx.font = 'bold 16px "SF Pro Display", -apple-system, monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
  ctx.fillText('JEZERO CRATER [18.38° N, 77.58° E]', jX + 28, jY - 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '13px monospace';
  ctx.fillText('Ares Human Landing Site & Perseverance Base', jX + 28, jY + 8);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('OLYMPUS MONS [21.3 km]', oX + 44, oY + 5);
  ctx.fillText('VALLES MARINERIS [4,000 km]', toX(-68), toY(-18));
  ctx.fillText('SYRTIS MAJOR PLANUM', toX(52), toY(26));
  ctx.fillText('HELLAS PLANITIA [-7,152 m]', toX(48), toY(-42));
  ctx.fillText('PLANUM BOREUM [NORTH POLE]', toX(-20), toY(86));
  ctx.fillText('PLANUM AUSTRALE [SOUTH POLE]', toX(-20), toY(-86));
  ctx.fillText('EQUATOR 0°', toX(120), toY(0) - 6);
  ctx.fillText('PRIME MERIDIAN 0° [AIRY-0]', toX(0) + 8, toY(35));
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// 2. Procedural Elevation Bump Map (Creates 3D Surface Relief & Scarp Shadows)
export function createDetailedMarsBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const W = 2048;
  const H = 1024;

  const toX = (lon: number) => {
    let l = lon;
    while (l < -180) l += 360;
    while (l > 180) l -= 360;
    return ((l + 180) / 360) * W;
  };
  const toY = (lat: number) => ((90 - lat) / 180) * H;

  // Base neutral datum elevation (gray 128)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);

  // Olympus Mons Peak (21 km high -> Bright White 255)
  const oX = toX(-133.8);
  const oY = toY(18.65);
  const oGrad = ctx.createRadialGradient(oX, oY, 2, oX, oY, 40);
  oGrad.addColorStop(0, '#ffffff');
  oGrad.addColorStop(0.85, '#d0d0d0');
  oGrad.addColorStop(1, '#808080');
  ctx.fillStyle = oGrad;
  ctx.beginPath();
  ctx.arc(oX, oY, 40, 0, Math.PI * 2);
  ctx.fill();

  // Tharsis Montes Trio
  [-104.5, -113.0, -121.0].forEach((lon, i) => {
    const lat = [11.9, 0.8, -8.4][i];
    const vx = toX(lon);
    const vy = toY(lat);
    const grad = ctx.createRadialGradient(vx, vy, 2, vx, vy, 24);
    grad.addColorStop(0, '#f5f5f5');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(vx, vy, 24, 0, Math.PI * 2);
    ctx.fill();
  });

  // Valles Marineris (Deep canyon depressions -> Dark 20)
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.lineTo(toX(-36), toY(-15));
  ctx.stroke();

  // Hellas Basin (Deepest impact depression -> Dark 25)
  const hGrad = ctx.createRadialGradient(toX(70), toY(-42), 5, toX(70), toY(-42), 115);
  hGrad.addColorStop(0, '#252525');
  hGrad.addColorStop(0.8, '#454545');
  hGrad.addColorStop(1, '#808080');
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 115, 88, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Southern Highlands Rough Elevation
  ctx.fillStyle = 'rgba(180, 180, 180, 0.12)';
  ctx.fillRect(0, toY(0), W, H - toY(0));

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// 3. Procedural Cloud & Water-Ice Haze Layer
export function createMarsCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const W = 2048;
  const H = 1024;
  ctx.clearRect(0, 0, W, H);

  const toX = (lon: number) => {
    let l = lon;
    while (l < -180) l += 360;
    while (l > 180) l -= 360;
    return ((l + 180) / 360) * W;
  };
  const toY = (lat: number) => ((90 - lat) / 180) * H;

  // Orographic Water-Ice Clouds over Olympus Mons and Tharsis (Hubble/MRO observed)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  const oX = toX(-133.8);
  const oY = toY(18.65);
  ctx.beginPath();
  ctx.ellipse(oX - 15, oY - 5, 55, 24, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(toX(-108), toY(4), 70, 30, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Equatorial High-Altitude Cirrus Cloud Bands (Wispy streaks)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * W;
    const cy = toY(-10 + Math.random() * 20);
    const cw = Math.random() * 140 + 60;
    const ch = Math.random() * 12 + 4;
    ctx.fillRect(cx, cy, cw, ch);
  }

  // Polar Hood Hazes
  ctx.fillStyle = 'rgba(240, 248, 255, 0.35)';
  ctx.fillRect(0, 0, W, toY(72));
  ctx.fillRect(0, toY(-75), W, H - toY(-75));

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// 4. Create 3D Standing Mission Pin & Billboard Badge
function createMissionLandingPin(site: MarsLandingSite, radius: number): THREE.Group {
  const pinGroup = new THREE.Group();
  const pos = latLonToVector3(site.lat, site.lon, radius);
  const normal = pos.clone().normalize();

  pinGroup.position.copy(pos);
  pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  // Standing Mast Cylinder
  const mastHeight = site.status === 'ACTIVE' ? 18 : 12;
  const mastGeo = new THREE.CylinderGeometry(0.6, 1.0, mastHeight, 16);
  mastGeo.translate(0, mastHeight / 2, 0);
  const mastMat = new THREE.MeshStandardMaterial({
    color: site.color,
    roughness: 0.3,
    metalness: 0.8,
  });
  const mastMesh = new THREE.Mesh(mastGeo, mastMat);
  pinGroup.add(mastMesh);

  // Top Beacon Sphere
  const beaconRadius = site.status === 'ACTIVE' ? 3.0 : 1.8;
  const beaconGeo = new THREE.SphereGeometry(beaconRadius, 16, 16);
  beaconGeo.translate(0, mastHeight + beaconRadius * 0.8, 0);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: site.color,
    emissive: site.color,
    emissiveIntensity: site.status === 'ACTIVE' ? 1.4 : 0.6,
  });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  pinGroup.add(beaconMesh);

  // Concentric Surface Target Rings
  const groundRingGeo = new THREE.RingGeometry(2.5, 3.8, 32);
  groundRingGeo.rotateX(-Math.PI / 2);
  const groundRingMat = new THREE.MeshBasicMaterial({
    color: site.color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
  groundRing.position.y = 0.2;
  pinGroup.add(groundRing);

  if (site.status === 'ACTIVE') {
    // Outer Pulsing Ring for Perseverance
    const pulseRingGeo = new THREE.RingGeometry(5.0, 6.4, 32);
    pulseRingGeo.rotateX(-Math.PI / 2);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.name = 'pulseRing';
    pulseRing.position.y = 0.25;
    pinGroup.add(pulseRing);
  }

  // 3D Billboard Sprite Badge
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 384;
  badgeCanvas.height = 96;
  const bCtx = badgeCanvas.getContext('2d')!;

  bCtx.fillStyle = 'rgba(8, 14, 24, 0.85)';
  bCtx.roundRect(4, 4, 376, 88, 12);
  bCtx.fill();
  bCtx.strokeStyle = site.color;
  bCtx.lineWidth = 2.5;
  bCtx.stroke();

  // Status indicator dot
  bCtx.fillStyle = site.color;
  bCtx.beginPath();
  bCtx.arc(28, 32, 8, 0, Math.PI * 2);
  bCtx.fill();

  // Mission Name & Agency
  bCtx.font = 'bold 22px "SF Pro Display", -apple-system, sans-serif';
  bCtx.fillStyle = '#f8fafc';
  bCtx.fillText(site.name, 48, 38);

  // Coordinates & Year
  bCtx.font = '16px monospace';
  bCtx.fillStyle = '#94a3b8';
  bCtx.fillText(`${site.lat >= 0 ? '+' : ''}${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}° · ${site.elevation}`, 24, 72);

  bCtx.font = 'bold 15px monospace';
  bCtx.fillStyle = site.color;
  bCtx.fillText(site.status, 305, 38);

  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  const spriteMat = new THREE.SpriteMaterial({
    map: badgeTex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, mastHeight + beaconRadius + 14, 0);
  sprite.scale.set(40, 10, 1);
  pinGroup.add(sprite);

  return pinGroup;
}

export interface GlobeController {
  tiltGroup: THREE.Group;
  planetSpinGroup: THREE.Group;
  cloudSpinGroup: THREE.Group;
  pulseRings: THREE.Mesh[];
  focusOnTarget: (lat: number, lon: number, camera: THREE.Camera, controls: OrbitControls) => void;
  dispose: () => void;
}

// 5. Complete 3D Mars Planetary System Builder
export function buildDetailedMarsGlobe(parentGroup: THREE.Group): GlobeController {
  parentGroup.clear();

  // 5.1 Real Mars Axial Tilt (25.19° obliquity to orbit)
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = -0.4396; // 25.19 degrees
  parentGroup.add(tiltGroup);

  // 5.2 Rotating Planetary Surface & Landing Sites Group
  const planetSpinGroup = new THREE.Group();
  tiltGroup.add(planetSpinGroup);

  const R = 180;
  const marsSphereGeo = new THREE.SphereGeometry(R, 128, 128);

  const albedoTexture = createDetailedMarsAlbedoTexture();
  const bumpTexture = createDetailedMarsBumpTexture();

  const marsMat = new THREE.MeshStandardMaterial({
    map: albedoTexture,
    bumpMap: bumpTexture,
    bumpScale: 3.8,
    roughness: 0.84,
    metalness: 0.04,
  });

  const marsMesh = new THREE.Mesh(marsSphereGeo, marsMat);
  marsMesh.name = 'marsSphere';
  planetSpinGroup.add(marsMesh);

  // 5.3 3D Landing Site Pins
  const pulseRings: THREE.Mesh[] = [];
  MARS_LANDING_SITES.forEach((site) => {
    const pin = createMissionLandingPin(site, R);
    planetSpinGroup.add(pin);
    const pRing = pin.getObjectByName('pulseRing') as THREE.Mesh;
    if (pRing) pulseRings.push(pRing);
  });

  // 5.4 Rotating Cloud & Water-Ice Veil
  const cloudSpinGroup = new THREE.Group();
  tiltGroup.add(cloudSpinGroup);

  const cloudGeo = new THREE.SphereGeometry(R + 1.2, 96, 96);
  const cloudTexture = createMarsCloudTexture();
  const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.44,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    roughness: 1.0,
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  cloudSpinGroup.add(cloudMesh);

  // 5.5 Multi-Layer Atmospheric Limb Scattering Halos (Camera-concentric)
  // Inner Rayleigh Scattering Limb (Pale Cyan Glow)
  const innerLimbGeo = new THREE.SphereGeometry(R + 2.8, 64, 64);
  const innerLimbMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  const innerLimbMesh = new THREE.Mesh(innerLimbGeo, innerLimbMat);
  tiltGroup.add(innerLimbMesh);

  // Outer Ferric Dust Exosphere Limb (Warm Martian Amber)
  const outerLimbGeo = new THREE.SphereGeometry(R + 6.5, 64, 64);
  const outerLimbMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.22,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  const outerLimbMesh = new THREE.Mesh(outerLimbGeo, outerLimbMat);
  tiltGroup.add(outerLimbMesh);

  // Camera Target Focus Helper
  const focusOnTarget = (lat: number, lon: number, camera: THREE.Camera, controls: OrbitControls) => {
    // 1. Calculate local coordinates on the sphere
    const localPos = latLonToVector3(lat, lon, R);
    // 2. Transform local position through planet spin, tilt, and parent transforms into World Space
    parentGroup.updateMatrixWorld(true);
    const worldPos = localPos.clone().applyMatrix4(planetSpinGroup.matrixWorld);

    // 3. Position camera looking face-on at target from orbital height (420 units)
    const viewDir = worldPos.clone().normalize();
    const camPos = viewDir.multiplyScalar(420);

    controls.target.set(0, 0, 0);
    camera.position.copy(camPos);
    controls.update();
  };

  const dispose = () => {
    marsSphereGeo.dispose();
    albedoTexture.dispose();
    bumpTexture.dispose();
    marsMat.dispose();
    cloudGeo.dispose();
    cloudTexture.dispose();
    cloudMat.dispose();
    innerLimbGeo.dispose();
    innerLimbMat.dispose();
    outerLimbGeo.dispose();
    outerLimbMat.dispose();
  };

  return {
    tiltGroup,
    planetSpinGroup,
    cloudSpinGroup,
    pulseRings,
    focusOnTarget,
    dispose,
  };
}
