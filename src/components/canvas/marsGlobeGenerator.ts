// High-Fidelity 3D Mars Planetary Globe Generator
// Scientifically authentic Martian cartography: Physiographic provinces, Albedo features,
// Topographical Bump maps, Multi-layer Atmospheric Limb scattering, Translucent Cloud veils,
// Deep-Space Starfield, 3D Orbiting Satellites (MRO), Moons (Phobos & Deimos),
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
  for (let i = 0; i < 7000; i++) {
    const nx = Math.random() * W;
    const ny = Math.random() * H;
    const nw = Math.random() * 4 + 1;
    const nh = Math.random() * 2 + 1;
    ctx.fillRect(nx, ny, nw, nh);
  }
  ctx.fillStyle = 'rgba(255, 195, 140, 0.04)';
  for (let i = 0; i < 5000; i++) {
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
  ctx.ellipse(toX(67), toY(9), 24, 16, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Southern Dark Albedo Belt: Mare Tyrrhenum & Mare Cimmerium
  ctx.save();
  ctx.fillStyle = 'rgba(36, 12, 7, 0.85)';
  ctx.beginPath();
  ctx.ellipse(toX(110), toY(-24), 180, 52, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(150), toY(-28), 200, 56, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mare Sirenum & Mare Erythraeum
  ctx.save();
  ctx.fillStyle = 'rgba(40, 14, 8, 0.82)';
  ctx.beginPath();
  ctx.ellipse(toX(-145), toY(-32), 210, 54, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(-55), toY(-25), 160, 48, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sinus Sabaeus & Meridiani Planum (Connecting to Prime Meridian)
  ctx.save();
  ctx.fillStyle = 'rgba(34, 11, 6, 0.88)';
  ctx.beginPath();
  ctx.ellipse(toX(-12), toY(-10), 130, 36, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(toX(15), toY(-12), 120, 32, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Acidalia Planitia & Chryse Outflow Lowlands (North of Valles Marineris)
  ctx.save();
  ctx.fillStyle = 'rgba(42, 16, 9, 0.78)';
  ctx.beginPath();
  ctx.ellipse(toX(-35), toY(38), 120, 70, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1.4 Giant Sedimentary & Impact Basins
  // Hellas Planitia (Massive 2,300 km basin, deepest on Mars)
  ctx.save();
  ctx.strokeStyle = 'rgba(45, 14, 8, 0.85)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 135, 102, 0.05, 0, Math.PI * 2);
  ctx.stroke();
  const hellasGrad = ctx.createRadialGradient(toX(70), toY(-42), 10, toX(70), toY(-42), 125);
  hellasGrad.addColorStop(0, '#e58f55');
  hellasGrad.addColorStop(0.8, '#d47b42');
  hellasGrad.addColorStop(1, '#9e4620');
  ctx.fillStyle = hellasGrad;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 125, 94, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Argyre Planitia
  ctx.save();
  ctx.strokeStyle = 'rgba(50, 16, 9, 0.8)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(toX(-44), toY(-50), 68, 0, Math.PI * 2);
  ctx.stroke();
  const argyreGrad = ctx.createRadialGradient(toX(-44), toY(-50), 5, toX(-44), toY(-50), 62);
  argyreGrad.addColorStop(0, '#d9804b');
  argyreGrad.addColorStop(1, '#9e431d');
  ctx.fillStyle = argyreGrad;
  ctx.beginPath();
  ctx.arc(toX(-44), toY(-50), 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Isidis Planitia (Sedimentary basin east of Syrtis Major, home to Jezero)
  ctx.save();
  const isidisGrad = ctx.createRadialGradient(toX(87), toY(13), 10, toX(87), toY(13), 90);
  isidisGrad.addColorStop(0, '#cf733e');
  isidisGrad.addColorStop(1, '#963f1d');
  ctx.fillStyle = isidisGrad;
  ctx.beginPath();
  ctx.ellipse(toX(87), toY(13), 90, 75, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1.5 Valles Marineris (4,000 km Grand Canyon Rift System)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255, 175, 125, 0.35)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.lineTo(toX(-84), toY(-8));
  ctx.lineTo(toX(-70), toY(-9));
  ctx.lineTo(toX(-55), toY(-12));
  ctx.lineTo(toX(-40), toY(-15));
  ctx.stroke();

  ctx.strokeStyle = 'rgba(18, 5, 2, 0.96)';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.bezierCurveTo(toX(-88), toY(-7), toX(-78), toY(-11), toX(-68), toY(-10));
  ctx.bezierCurveTo(toX(-58), toY(-9), toX(-48), toY(-14), toX(-36), toY(-15));
  ctx.stroke();

  // Tributary Chasms
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(toX(-75), toY(-6));
  ctx.lineTo(toX(-68), toY(-10));
  ctx.moveTo(toX(-60), toY(-8));
  ctx.lineTo(toX(-54), toY(-13));
  ctx.stroke();

  // Noctis Labyrinthus Canyon Maze
  ctx.strokeStyle = 'rgba(25, 7, 3, 0.88)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 9; i++) {
    const lx = toX(-103 + (i % 3) * 3);
    const ly = toY(-8 + Math.floor(i / 3) * 3);
    ctx.strokeRect(lx, ly, 16, 12);
  }
  ctx.restore();

  // 1.6 Colossal Shield Volcanoes
  // Olympus Mons
  ctx.save();
  const oX = toX(-133.8);
  const oY = toY(18.65);
  ctx.strokeStyle = 'rgba(48, 14, 7, 0.9)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(oX, oY, 44, 0, Math.PI * 2);
  ctx.stroke();
  const oShield = ctx.createRadialGradient(oX, oY, 5, oX, oY, 42);
  oShield.addColorStop(0, '#e28450');
  oShield.addColorStop(0.7, '#c66632');
  oShield.addColorStop(1, '#8f3917');
  ctx.fillStyle = oShield;
  ctx.beginPath();
  ctx.arc(oX, oY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20, 5, 2, 0.95)';
  ctx.beginPath();
  ctx.arc(oX - 2, oY - 1, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(oX + 3, oY + 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tharsis Montes Trio
  const drawShieldVolcano = (lon: number, lat: number, r: number, name: string) => {
    ctx.save();
    const vx = toX(lon);
    const vy = toY(lat);
    ctx.strokeStyle = 'rgba(45, 12, 6, 0.85)';
    ctx.lineWidth = 4.5;
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

    ctx.fillStyle = 'rgba(18, 4, 2, 0.92)';
    ctx.beginPath();
    ctx.arc(vx, vy, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText(name.toUpperCase(), vx + r + 6, vy + 4);
    ctx.restore();
  };

  drawShieldVolcano(-104.5, 11.9, 26, 'Ascraeus Mons');
  drawShieldVolcano(-113.0, 0.8, 24, 'Pavonis Mons');
  drawShieldVolcano(-121.0, -8.4, 26, 'Arsia Mons');
  drawShieldVolcano(147.2, 25.0, 28, 'Elysium Mons');

  // 1.7 Procedural Impact Craters
  const craters = [
    { lon: 16.0, lat: -2.7, r: 20, name: 'Schiaparelli' },
    { lon: 55.0, lat: -14.0, r: 26, name: 'Huygens' },
    { lon: 32.0, lat: 23.0, r: 18, name: 'Cassini' },
    { lon: 137.4, lat: -4.6, r: 16, name: 'Gale' },
    { lon: 175.5, lat: -14.6, r: 17, name: 'Gusev' },
    { lon: -150.0, lat: -35.0, r: 14 },
    { lon: -80.0, lat: -48.0, r: 16 },
    { lon: 2.0, lat: -38.0, r: 18 },
    { lon: 95.0, lat: -52.0, r: 15 },
    { lon: 160.0, lat: -40.0, r: 13 },
  ];

  craters.forEach((c) => {
    const cx = toX(c.lon);
    const cy = toY(c.lat);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 190, 140, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(25, 7, 3, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(30, 9, 4, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, c.r - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 1.8 Polar Ice Caps
  // North Polar Ice Cap (Planum Boreum)
  ctx.save();
  const northCapY = toY(80);
  ctx.fillStyle = 'rgba(35, 12, 6, 0.85)';
  ctx.fillRect(0, northCapY - 14, W, 20);

  const northGrad = ctx.createLinearGradient(0, 0, 0, northCapY);
  northGrad.addColorStop(0, '#ffffff');
  northGrad.addColorStop(0.65, '#f0f9ff');
  northGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = northGrad;
  ctx.fillRect(0, 0, W, northCapY);

  ctx.strokeStyle = 'rgba(38, 14, 7, 0.75)';
  ctx.lineWidth = 4.5;
  for (let s = 0; s < 14; s++) {
    const sx = (s / 14) * W;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(sx + 40, northCapY * 0.4, sx + 80, northCapY * 0.7, sx + 120, northCapY);
    ctx.stroke();
  }
  ctx.restore();

  // South Polar Ice Cap (Planum Australe)
  ctx.save();
  const southCapY = toY(-82);
  const southGrad = ctx.createLinearGradient(0, southCapY, 0, H);
  southGrad.addColorStop(0, '#bae6fd');
  southGrad.addColorStop(0.35, '#f8fafc');
  southGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = southGrad;
  ctx.fillRect(0, southCapY, W, H - southCapY);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 28; i++) {
    const px = (i / 28) * W;
    ctx.beginPath();
    ctx.arc(px, southCapY, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 1.9 Jezero Crater Target Indicator
  const jX = toX(77.58);
  const jY = toY(18.38);
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(jX, jY, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(jX, jY, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(jX - 35, jY);
  ctx.lineTo(jX + 35, jY);
  ctx.moveTo(jX, jY - 35);
  ctx.lineTo(jX, jY + 35);
  ctx.stroke();
  ctx.restore();

  // 1.10 Graticule & Typography
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, toY(0));
  ctx.lineTo(W, toY(0));
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  [-60, -30, 30, 60].forEach((lat) => {
    ctx.beginPath();
    ctx.moveTo(0, toY(lat));
    ctx.lineTo(W, toY(lat));
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(toX(0), 0);
  ctx.lineTo(toX(0), H);
  ctx.stroke();

  [-90, 90, 180, -180].forEach((lon) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toX(lon), 0);
    ctx.lineTo(toX(lon), H);
    ctx.stroke();
  });

  ctx.setLineDash([]);
  ctx.font = 'bold 16px "SF Pro Display", -apple-system, monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
  ctx.fillText('JEZERO CRATER [18.38° N, 77.58° E]', jX + 32, jY - 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '13px monospace';
  ctx.fillText('Ares Expedition Landing Site & Perseverance Base', jX + 32, jY + 8);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('OLYMPUS MONS [21.3 km]', oX + 48, oY + 5);
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

// 2. Procedural Elevation Bump Map
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

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);

  // Olympus Mons
  const oX = toX(-133.8);
  const oY = toY(18.65);
  const oGrad = ctx.createRadialGradient(oX, oY, 2, oX, oY, 44);
  oGrad.addColorStop(0, '#ffffff');
  oGrad.addColorStop(0.85, '#d0d0d0');
  oGrad.addColorStop(1, '#808080');
  ctx.fillStyle = oGrad;
  ctx.beginPath();
  ctx.arc(oX, oY, 44, 0, Math.PI * 2);
  ctx.fill();

  // Tharsis Montes Trio
  [-104.5, -113.0, -121.0].forEach((lon, i) => {
    const lat = [11.9, 0.8, -8.4][i];
    const vx = toX(lon);
    const vy = toY(lat);
    const grad = ctx.createRadialGradient(vx, vy, 2, vx, vy, 26);
    grad.addColorStop(0, '#f5f5f5');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(vx, vy, 26, 0, Math.PI * 2);
    ctx.fill();
  });

  // Valles Marineris
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(toX(-96), toY(-6));
  ctx.lineTo(toX(-36), toY(-15));
  ctx.stroke();

  // Hellas Basin
  const hGrad = ctx.createRadialGradient(toX(70), toY(-42), 5, toX(70), toY(-42), 125);
  hGrad.addColorStop(0, '#252525');
  hGrad.addColorStop(0.8, '#454545');
  hGrad.addColorStop(1, '#808080');
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.ellipse(toX(70), toY(-42), 125, 94, 0.05, 0, Math.PI * 2);
  ctx.fill();

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

  // Orographic Water-Ice Clouds over Olympus Mons and Tharsis
  ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
  const oX = toX(-133.8);
  const oY = toY(18.65);
  ctx.beginPath();
  ctx.ellipse(oX - 15, oY - 5, 60, 26, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(toX(-108), toY(4), 75, 32, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Equatorial High-Altitude Cirrus Cloud Bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  for (let i = 0; i < 48; i++) {
    const cx = Math.random() * W;
    const cy = toY(-10 + Math.random() * 20);
    const cw = Math.random() * 160 + 70;
    const ch = Math.random() * 14 + 4;
    ctx.fillRect(cx, cy, cw, ch);
  }

  // Polar Hood Hazes
  ctx.fillStyle = 'rgba(240, 248, 255, 0.38)';
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

  bCtx.fillStyle = 'rgba(8, 14, 24, 0.88)';
  bCtx.roundRect(4, 4, 376, 88, 12);
  bCtx.fill();
  bCtx.strokeStyle = site.color;
  bCtx.lineWidth = 2.5;
  bCtx.stroke();

  bCtx.fillStyle = site.color;
  bCtx.beginPath();
  bCtx.arc(28, 32, 8, 0, Math.PI * 2);
  bCtx.fill();

  bCtx.font = 'bold 22px "SF Pro Display", -apple-system, sans-serif';
  bCtx.fillStyle = '#f8fafc';
  bCtx.fillText(site.name, 48, 38);

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

// 5. Deep Space Starfield & Milky Way Galaxy Generator
export function createDeepSpaceStarfield(radius = 3500): THREE.Group {
  const spaceGroup = new THREE.Group();
  spaceGroup.name = 'deepSpaceStarfield';

  // 5.1 4,000 Multi-Spectral Stars on Celestial Sphere
  const starCount = 4000;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const colorPalette = [
    new THREE.Color(0xffffff), // Diamond White (60%)
    new THREE.Color(0xdbeafe), // O/B Pale Blue (20%)
    new THREE.Color(0xfef08a), // G-type Yellow/Gold (15%)
    new THREE.Color(0xfca5a5), // M-type Crimson Haze (5%)
  ];

  for (let i = 0; i < starCount; i++) {
    // Uniform spherical point picking
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius + (Math.random() - 0.5) * 400;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;

    // Pick spectral color
    const randColor = Math.random();
    let col = colorPalette[0];
    if (randColor < 0.20) col = colorPalette[1];
    else if (randColor < 0.35) col = colorPalette[2];
    else if (randColor < 0.40) col = colorPalette[3];

    // Brightness factor
    const lum = 0.55 + Math.random() * 0.45;
    starColors[i * 3] = col.r * lum;
    starColors[i * 3 + 1] = col.g * lum;
    starColors[i * 3 + 2] = col.b * lum;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 4.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
  });

  const starPoints = new THREE.Points(starGeo, starMat);
  spaceGroup.add(starPoints);

  // 5.2 Milky Way Galaxy Cosmic Dust Band
  const mwCount = 1800;
  const mwGeo = new THREE.BufferGeometry();
  const mwPositions = new Float32Array(mwCount * 3);
  const mwColors = new Float32Array(mwCount * 3);

  for (let i = 0; i < mwCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * 300;
    const spread = (Math.random() - 0.5) * 450;

    // Plane tilted at ~62 degrees to galactic equator
    const x = r * Math.cos(angle);
    const y = spread * Math.cos(0.9) - r * Math.sin(angle) * Math.sin(0.9);
    const z = spread * Math.sin(0.9) + r * Math.sin(angle) * Math.cos(0.9);

    mwPositions[i * 3] = x;
    mwPositions[i * 3 + 1] = y;
    mwPositions[i * 3 + 2] = z;

    const b = 0.6 + Math.random() * 0.4;
    mwColors[i * 3] = 0.65 * b;
    mwColors[i * 3 + 1] = 0.75 * b;
    mwColors[i * 3 + 2] = 0.95 * b;
  }

  mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
  mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));

  const mwMat = new THREE.PointsMaterial({
    size: 7.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
  });

  const mwPoints = new THREE.Points(mwGeo, mwMat);
  spaceGroup.add(mwPoints);

  return spaceGroup;
}

// 6. 3D Model of Mars Reconnaissance Orbiter (MRO)
export function buildMroSatellite(): THREE.Group {
  const mro = new THREE.Group();
  mro.name = 'MRO_Satellite';

  // 6.1 Gold Foil Central Bus
  const busGeo = new THREE.BoxGeometry(4.2, 5.0, 3.6);
  const busMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });
  const bus = new THREE.Mesh(busGeo, busMat);
  mro.add(bus);

  // 6.2 Dual Silicon Solar Array Wings
  const wingGeo = new THREE.BoxGeometry(18, 0.25, 4.5);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.6,
    roughness: 0.3,
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, 0, 0);
  mro.add(wings);

  // Solar panel gold border frame
  const frameGeo = new THREE.BoxGeometry(18.4, 0.15, 4.8);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  mro.add(frame);

  // 6.3 3.0-meter High-Gain Parabolic Dish Antenna (HGA)
  const dishGeo = new THREE.CylinderGeometry(3.0, 0.4, 0.8, 24, 1, true);
  dishGeo.rotateX(Math.PI / 2);
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.4,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.set(0, 3.8, 2.2);
  dish.rotation.x = 0.35;
  mro.add(dish);

  // Antenna Feed Horn
  const hornGeo = new THREE.ConeGeometry(0.3, 1.4, 12);
  hornGeo.rotateX(Math.PI / 2);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  const horn = new THREE.Mesh(hornGeo, hornMat);
  horn.position.set(0, 3.8, 3.2);
  mro.add(horn);

  // 6.4 HiRISE Optical Camera Telescope Barrel
  const hiriseGeo = new THREE.CylinderGeometry(1.0, 1.3, 4.5, 20);
  hiriseGeo.rotateZ(Math.PI / 2);
  const hiriseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });
  const hirise = new THREE.Mesh(hiriseGeo, hiriseMat);
  hirise.position.set(0, -3.2, 0);
  mro.add(hirise);

  // Optical Lens Aperture
  const lensGeo = new THREE.CircleGeometry(0.9, 20);
  lensGeo.rotateY(Math.PI / 2);
  const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.set(2.26, -3.2, 0);
  mro.add(lens);

  // Billboard Identification Label
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 64;
  const lCtx = labelCanvas.getContext('2d')!;
  lCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  lCtx.roundRect(4, 4, 248, 56, 8);
  lCtx.fill();
  lCtx.strokeStyle = '#38bdf8';
  lCtx.lineWidth = 2;
  lCtx.stroke();
  lCtx.font = 'bold 20px monospace';
  lCtx.fillStyle = '#38bdf8';
  lCtx.fillText('NASA MRO [UHF RELAY]', 12, 38);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, 7.5, 0);
  sprite.scale.set(16, 4, 1);
  mro.add(sprite);

  return mro;
}

// 7. 3D Model of Irregular Potato-Shaped Moon Phobos
export function buildPhobosMoon(): THREE.Group {
  const phobosGroup = new THREE.Group();
  phobosGroup.name = 'Phobos_Moon';

  const phobosGeo = new THREE.DodecahedronGeometry(7.2, 2);
  const pos = phobosGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const noise = 1 + Math.sin(vx * 0.4) * Math.cos(vy * 0.4) * Math.sin(vz * 0.4) * 0.28;
    pos.setXYZ(i, vx * noise * 1.35, vy * noise * 0.85, vz * noise);
  }
  phobosGeo.computeVertexNormals();

  const phobosMat = new THREE.MeshStandardMaterial({
    color: 0x645e54,
    roughness: 0.94,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(phobosGeo, phobosMat);
  phobosGroup.add(mesh);

  // Label
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 192;
  labelCanvas.height = 48;
  const lCtx = labelCanvas.getContext('2d')!;
  lCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  lCtx.roundRect(4, 4, 184, 40, 8);
  lCtx.fill();
  lCtx.strokeStyle = '#fbbf24';
  lCtx.lineWidth = 1.5;
  lCtx.stroke();
  lCtx.font = 'bold 16px monospace';
  lCtx.fillStyle = '#fbbf24';
  lCtx.fillText('PHOBOS [MOON]', 16, 28);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false }));
  sprite.position.set(0, 11, 0);
  sprite.scale.set(14, 3.5, 1);
  phobosGroup.add(sprite);

  return phobosGroup;
}

// 8. 3D Model of Outer Moon Deimos
export function buildDeimosMoon(): THREE.Group {
  const deimosGroup = new THREE.Group();
  deimosGroup.name = 'Deimos_Moon';

  const deimosGeo = new THREE.DodecahedronGeometry(4.4, 2);
  const pos = deimosGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const noise = 1 + Math.cos(vx * 0.5) * Math.sin(vz * 0.5) * 0.22;
    pos.setXYZ(i, vx * noise * 1.2, vy * noise, vz * noise * 0.9);
  }
  deimosGeo.computeVertexNormals();

  const deimosMat = new THREE.MeshStandardMaterial({
    color: 0x7c7365,
    roughness: 0.96,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(deimosGeo, deimosMat);
  deimosGroup.add(mesh);

  // Label
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 192;
  labelCanvas.height = 48;
  const lCtx = labelCanvas.getContext('2d')!;
  lCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  lCtx.roundRect(4, 4, 184, 40, 8);
  lCtx.fill();
  lCtx.strokeStyle = '#94a3b8';
  lCtx.lineWidth = 1.5;
  lCtx.stroke();
  lCtx.font = 'bold 16px monospace';
  lCtx.fillStyle = '#cbd5e1';
  lCtx.fillText('DEIMOS [MOON]', 16, 28);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false }));
  sprite.position.set(0, 8, 0);
  sprite.scale.set(14, 3.5, 1);
  deimosGroup.add(sprite);

  return deimosGroup;
}

// 9. Orbital Trajectory Ring Generator
function createOrbitLine(radius: number, color: number, opacity = 0.35, segments = 128): THREE.LineLoop {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  return new THREE.LineLoop(geo, mat);
}

export interface GlobeController {
  tiltGroup: THREE.Group;
  planetSpinGroup: THREE.Group;
  cloudSpinGroup: THREE.Group;
  pulseRings: THREE.Mesh[];
  mroGroup: THREE.Group;
  phobosGroup: THREE.Group;
  deimosGroup: THREE.Group;
  focusOnTarget: (lat: number, lon: number, camera: THREE.Camera, controls: OrbitControls) => void;
  update: (elapsed: number) => void;
  dispose: () => void;
}

// 10. Complete 3D Mars Planetary System Builder
export function buildDetailedMarsGlobe(parentGroup: THREE.Group): GlobeController {
  parentGroup.clear();

  // 10.1 Deep Space Cosmic Celestial Sphere & Stars
  const starfield = createDeepSpaceStarfield(3400);
  parentGroup.add(starfield);

  // 10.2 Real Mars Axial Tilt (25.19° obliquity to orbit)
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = -0.4396; // 25.19 degrees
  parentGroup.add(tiltGroup);

  // 10.3 Rotating Planetary Surface & Landing Sites Group
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

  // 10.4 3D Landing Site Pins
  const pulseRings: THREE.Mesh[] = [];
  MARS_LANDING_SITES.forEach((site) => {
    const pin = createMissionLandingPin(site, R);
    planetSpinGroup.add(pin);
    const pRing = pin.getObjectByName('pulseRing') as THREE.Mesh;
    if (pRing) pulseRings.push(pRing);
  });

  // 10.5 Rotating Cloud & Water-Ice Veil
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

  // 10.6 Google Earth-Style Atmospheric Limb Scattering Shaders
  // Inner Rayleigh Surface Grazing Blue Limb Glow (R + 1.5)
  const innerAtmosphereGeo = new THREE.SphereGeometry(R + 1.5, 96, 96);
  const innerAtmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
        float alpha = pow(rim, uPower) * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    uniforms: {
      uColor: { value: new THREE.Color(0x60a5fa) }, // Pale blue Rayleigh scattering
      uPower: { value: 3.2 },
      uIntensity: { value: 0.85 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const innerAtmosphereMesh = new THREE.Mesh(innerAtmosphereGeo, innerAtmosphereMat);
  tiltGroup.add(innerAtmosphereMesh);

  // Outer Exosphere Atmospheric Halo (Google Earth Space Aura, R + 10.5)
  const outerHaloGeo = new THREE.SphereGeometry(R + 10.5, 96, 96);
  const outerHaloMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = max(0.0, dot(-vNormal, viewDir));
        float alpha = pow(rim, uPower) * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    uniforms: {
      uColor: { value: new THREE.Color(0x38bdf8) }, // Radiant atmospheric blue
      uPower: { value: 2.8 },
      uIntensity: { value: 0.95 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const outerHaloMesh = new THREE.Mesh(outerHaloGeo, outerHaloMat);
  tiltGroup.add(outerHaloMesh);

  // Warm Amber Ferric Dust Silhouette Exosphere (R + 15.0)
  const dustHaloGeo = new THREE.SphereGeometry(R + 15.0, 96, 96);
  const dustHaloMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = max(0.0, dot(-vNormal, viewDir));
        float alpha = pow(rim, uPower) * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    uniforms: {
      uColor: { value: new THREE.Color(0xf97316) }, // Warm Martian amber exosphere
      uPower: { value: 3.6 },
      uIntensity: { value: 0.55 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const dustHaloMesh = new THREE.Mesh(dustHaloGeo, dustHaloMat);
  tiltGroup.add(dustHaloMesh);

  // 10.7 3D Orbiting Models & Orbital Lines
  // A. MRO Polar Sun-Synchronous Orbit (Radius: 222, inclined 92.8°)
  const mroOrbitGroup = new THREE.Group();
  mroOrbitGroup.rotation.x = Math.PI * 0.48; // Near-polar inclination
  tiltGroup.add(mroOrbitGroup);

  const mroOrbitLine = createOrbitLine(222, 0x38bdf8, 0.45);
  mroOrbitGroup.add(mroOrbitLine);

  const mroGroup = buildMroSatellite();
  mroOrbitGroup.add(mroGroup);

  // B. Phobos Moon Orbit (Radius: 275, equatorial inclination 1.08°)
  const phobosOrbitGroup = new THREE.Group();
  phobosOrbitGroup.rotation.x = 0.02;
  tiltGroup.add(phobosOrbitGroup);

  const phobosOrbitLine = createOrbitLine(275, 0xfbbf24, 0.35);
  phobosOrbitGroup.add(phobosOrbitLine);

  const phobosGroup = buildPhobosMoon();
  phobosOrbitGroup.add(phobosGroup);

  // C. Deimos Moon Orbit (Radius: 355, equatorial inclination 1.79°)
  const deimosOrbitGroup = new THREE.Group();
  deimosOrbitGroup.rotation.x = 0.03;
  tiltGroup.add(deimosOrbitGroup);

  const deimosOrbitLine = createOrbitLine(355, 0x94a3b8, 0.28);
  deimosOrbitGroup.add(deimosOrbitLine);

  const deimosGroup = buildDeimosMoon();
  deimosOrbitGroup.add(deimosGroup);

  // Real-Time Orbit & Spin Physics Update Loop
  const update = (elapsed: number) => {
    // 1. Planet axial rotation
    planetSpinGroup.rotation.y += 0.0006;
    cloudSpinGroup.rotation.y += 0.00085;

    // 2. MRO satellite in polar orbit
    const mroTheta = elapsed * 0.35;
    mroGroup.position.set(Math.cos(mroTheta) * 222, Math.sin(mroTheta) * 222, 0);
    mroGroup.rotation.z = mroTheta + Math.PI / 2;

    // 3. Phobos in low orbit (7.6h period)
    const phobosTheta = elapsed * 0.18;
    phobosGroup.position.set(Math.cos(phobosTheta) * 275, 0, Math.sin(phobosTheta) * 275);
    phobosGroup.rotation.y += 0.005;

    // 4. Deimos in high orbit (30.3h period)
    const deimosTheta = elapsed * 0.07;
    deimosGroup.position.set(Math.cos(deimosTheta) * 355, 0, Math.sin(deimosTheta) * 355);
    deimosGroup.rotation.y += 0.002;

    // 5. Active landing beacon pulsing
    const pulseFactor = (Math.sin(elapsed * 3.5) + 1.0) * 0.5;
    pulseRings.forEach((ring) => {
      ring.scale.setScalar(1.0 + pulseFactor * 0.6);
      if (ring.material instanceof THREE.MeshBasicMaterial) {
        ring.material.opacity = 0.9 - pulseFactor * 0.5;
      }
    });
  };

  // Camera Target Focus Helper
  const focusOnTarget = (lat: number, lon: number, camera: THREE.Camera, controls: OrbitControls) => {
    const localPos = latLonToVector3(lat, lon, R);
    parentGroup.updateMatrixWorld(true);
    const worldPos = localPos.clone().applyMatrix4(planetSpinGroup.matrixWorld);

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
    innerAtmosphereGeo.dispose();
    innerAtmosphereMat.dispose();
    outerHaloGeo.dispose();
    outerHaloMat.dispose();
    dustHaloGeo.dispose();
    dustHaloMat.dispose();
  };

  return {
    tiltGroup,
    planetSpinGroup,
    cloudSpinGroup,
    pulseRings,
    mroGroup,
    phobosGroup,
    deimosGroup,
    focusOnTarget,
    update,
    dispose,
  };
}
