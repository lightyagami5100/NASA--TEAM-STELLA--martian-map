import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import type { Waypoint, PathResult, CameraMode, LayerSettings, ActiveLayers, TerrainSource, TimeOfDayPreset, TraverseMode } from '../../types/mars';
import { getJezeroElevation } from '../../data/jezeroDemData';
import { generateBaseOpticalTexture } from './textureGenerator';
import { tacticalAudio } from '../../utils/audio';
import {
  buildDetailedMarsGlobe,
  type GlobeController,
  MARS_LANDMARKS,
} from './marsGlobeGenerator';
import { Globe, Crosshair, RotateCcw, ArrowDownRight } from 'lucide-react';

export interface CameraNavAction {
  type:
    | 'zoomIn'
    | 'zoomOut'
    | 'tiltUp'
    | 'tiltDown'
    | 'resetNorth'
    | 'recenter'
    | 'rotateHeading'
    | 'panNorth'
    | 'panSouth'
    | 'panWest'
    | 'panEast'
    | 'orbitLeft'
    | 'orbitRight';
  payload?: number;
  id: number;
}

interface MarsCanvasProps {
  waypoints: Waypoint[];
  selectedWaypoint: Waypoint | null;
  onSelectWaypoint: (wp: Waypoint) => void;
  activePath: PathResult | null;
  layerSettings?: LayerSettings;
  activeLayers?: ActiveLayers; // backward compatibility
  cameraMode: CameraMode;
  onSetCameraMode?: (mode: CameraMode) => void;
  terrainSource: TerrainSource;
  simulationProgress: number;
  traverseMode?: TraverseMode;
  timeOfDay?: TimeOfDayPreset;
  solTimeHour?: number;
  lmstClock?: string;
  onTerrainClick?: (coords: { x: number; y: number; elevation: number }) => void;
  onStlLoaded?: (triangleCount: number) => void;
  onCameraHeadingChange?: (theta: number, phi: number) => void;
  navAction?: CameraNavAction | null;
}

// Custom GLSL Multi-Layer Martian Compositing Shaders
const MartianTerrainShader = {
  vertexShader: `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform sampler2D uBaseTexture;
    uniform float uTime;
    uniform vec3 uSunDirection;

    // Multi-layer dataset toggles & opacities
    uniform float uSlopeActive;
    uniform float uSlopeOpacity;
    uniform float uThemisActive;
    uniform float uThemisOpacity;
    uniform float uCrismActive;
    uniform float uCrismOpacity;
    uniform float uRadiationActive;
    uniform float uRadiationOpacity;
    uniform float uContoursActive;
    uniform float uContoursOpacity;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      // 1. Base Optical Regolith Texture (MRO CTX / HiRISE Ferric Oxide)
      vec4 baseTexColor = texture2D(uBaseTexture, vUv);

      // 2. Physically Inspired Martian Lighting
      vec3 norm = normalize(vNormal);
      vec3 lightDir = normalize(uSunDirection);
      float nDotL = max(0.18, dot(norm, lightDir));

      // Butterscotch Rayleigh & dust scattering ambient illumination
      vec3 martianSkyColor = vec3(0.784, 0.541, 0.396);
      vec3 ambientBounce = martianSkyColor * 0.32;
      vec3 litColor = baseTexColor.rgb * (nDotL + ambientBounce);

      // Local slope in degrees
      float slopeDeg = acos(clamp(norm.y, -1.0, 1.0)) * 57.2957795;

      // 3. Overlay 1: Kinematic Slope & Boulder Hazard (HiRISE DTM)
      // Safe (<10°) is completely transparent so base rock shows through.
      // 10°-15° is subtle amber contour hatching.
      // >15° is high-visibility crimson hazard grid lines.
      if (uSlopeActive > 0.5) {
        if (slopeDeg >= 15.0) {
          // Steep scree / rollover barrier - high visibility crimson grid
          float gridX = fract(vWorldPos.x * 0.15);
          float gridZ = fract(vWorldPos.z * 0.15);
          float gridLine = (gridX < 0.18 || gridZ < 0.18) ? 1.0 : 0.4;
          float pulse = 0.85 + 0.15 * sin(uTime * 4.0);
          vec3 hazardCrimson = vec3(0.96, 0.12, 0.22) * pulse * gridLine;
          litColor = mix(litColor, hazardCrimson, clamp(uSlopeOpacity * 0.85, 0.0, 1.0));
        } else if (slopeDeg >= 10.0) {
          // Moderate suit scree slope (10°-15°) - amber hatching
          float hatch = fract((vWorldPos.x + vWorldPos.z) * 0.25) > 0.45 ? 0.85 : 0.2;
          vec3 amberHatch = vec3(0.95, 0.65, 0.15) * hatch;
          litColor = mix(litColor, amberHatch, clamp(uSlopeOpacity * 0.65, 0.0, 1.0));
        }
      }

      // 4. Overlay 2: THEMIS Thermal Inertia (Loose Sand / Drift Traps)
      // Low thermal inertia (<150 TIU, like Séítah dunes) rendered as animated stippled cyan/blue pattern
      if (uThemisActive > 0.5) {
        float distSeitah = length(vWorldPos.xz - vec2(-80.0, 120.0));
        if (distSeitah < 155.0) {
          float stipple = sin(vWorldPos.x * 0.9 + uTime * 2.2) * cos(vWorldPos.z * 0.9);
          if (stipple > 0.15) {
            vec3 cyanHazard = vec3(0.12, 0.78, 0.96);
            litColor = mix(litColor, cyanHazard, clamp(uThemisOpacity * 0.75, 0.0, 1.0));
          }
        }
      }

      // 5. Overlay 3: CRISM & PIXL Mineralogy
      // Aqueous carbonates (magenta) and phyllosilicates (emerald) in delta outcrops
      if (uCrismActive > 0.5) {
        float distApex = length(vWorldPos.xz - vec2(-400.0, -300.0));
        if (distApex < 360.0 && vWorldPos.x < 65.0) {
          float pattern = sin(distApex * 0.14 + vWorldPos.x * 0.04);
          if (pattern > 0.35) {
            // Magnesium / Iron Carbonates (glowing magenta)
            vec3 carbonateMagenta = vec3(0.92, 0.18, 0.82);
            litColor = mix(litColor, carbonateMagenta, clamp(uCrismOpacity * 0.85, 0.0, 1.0));
          } else if (pattern < -0.35) {
            // Smectite Clays & Phyllosilicates (glowing emerald)
            vec3 clayEmerald = vec3(0.12, 0.92, 0.55);
            litColor = mix(litColor, clayEmerald, clamp(uCrismOpacity * 0.85, 0.0, 1.0));
          }
        }
      }

      // 6. Overlay 4: RAD Radiation Flux & Shielding Heatmap (µSv/hr)
      // Higher exposure on exposed ridges / rims, natural shielding in low crater floors
      if (uRadiationActive > 0.5) {
        float radFlux = clamp((vWorldPos.y - 12.0) / 70.0, 0.0, 1.0);
        vec3 lowDose = vec3(0.12, 0.18, 0.48);  // 14 µSv/hr (Shielded Indigo)
        vec3 midDose = vec3(0.95, 0.62, 0.12);  // 24 µSv/hr (Nominal Amber)
        vec3 highDose = vec3(0.95, 0.14, 0.32); // 32 µSv/hr (Exposed Ridge Crimson)
        vec3 radHeat = radFlux < 0.5 ? mix(lowDose, midDose, radFlux * 2.0) : mix(midDose, highDose, (radFlux - 0.5) * 2.0);
        litColor = mix(litColor, radHeat, clamp(uRadiationOpacity * 0.68, 0.0, 1.0));
      }

      // 7. Topo Contours Mode: Anti-Aliased Screen-Space Derivative (fwidth) Isolines
      // Crisp 10m minor and 50m index contour lines that never blur
      if (uContoursActive > 0.5) {
        float elev = vWorldPos.y * (1.0 / 0.38) - 2580.0;
        float line10 = abs(fract(elev / 10.0 - 0.5) - 0.5) / max(fwidth(elev / 10.0), 0.0001);
        float c10 = 1.0 - clamp(line10, 0.0, 1.0);

        float line50 = abs(fract(elev / 50.0 - 0.5) - 0.5) / max(fwidth(elev / 50.0), 0.0001);
        float c50 = 1.0 - clamp(line50, 0.0, 1.0);

        vec3 contourColor = vec3(0.98, 0.94, 0.84);
        float contourAlpha = max(c10 * 0.35, c50 * 0.85) * uContoursOpacity;
        litColor = mix(litColor, contourColor, contourAlpha);
      }

      // 8. Exponential Butterscotch Atmospheric Dust Fog (#c88a65)
      float camDist = length(vWorldPos - cameraPosition);
      float fogFactor = 1.0 - exp(-camDist * camDist * 0.0000018);
      vec3 finalColor = mix(litColor, martianSkyColor, clamp(fogFactor, 0.0, 0.92));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// Build Suited Marswalk Astronaut (xEMU Spacesuit with PLSS Backpack & Gold Visor)
function buildAstronautModel(group: THREE.Group, callsign: 'EV-1' | 'EV-2', colorHex: number) {
  group.clear();

  const whiteSuitMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.2,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.5,
  });

  // Torso / Hard Upper Torso (HUT) with aerospace composite contouring
  const torsoGeo = new THREE.CylinderGeometry(1.15, 0.95, 2.5, 12);
  const torso = new THREE.Mesh(torsoGeo, whiteSuitMat);
  torso.position.y = 2.65;
  torso.castShadow = true;
  group.add(torso);

  // Chest Display & Control Module (DCM)
  const dcmGeo = new THREE.BoxGeometry(0.9, 0.75, 0.35);
  const dcmMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
  const dcm = new THREE.Mesh(dcmGeo, dcmMat);
  dcm.position.set(0, 2.75, 0.65);
  group.add(dcm);

  // DCM Status LED indicator
  const ledGeo = new THREE.BoxGeometry(0.15, 0.15, 0.08);
  const ledMat = new THREE.MeshBasicMaterial({ color: colorHex === 0x38bdf8 ? 0x10b981 : 0xf59e0b });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.25, 2.9, 0.82);
  group.add(led);

  // Helmet Dome
  const helmetGeo = new THREE.SphereGeometry(0.92, 20, 20);
  const helmet = new THREE.Mesh(helmetGeo, whiteSuitMat);
  helmet.position.y = 4.3;
  helmet.castShadow = true;
  group.add(helmet);

  // Reflective Gold Sun Visor (Gold vapor-deposited shield)
  const visorGeo = new THREE.SphereGeometry(0.95, 20, 20, 0, Math.PI, 0, Math.PI * 0.65);
  const goldVisorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.98,
    roughness: 0.04,
  });
  const visor = new THREE.Mesh(visorGeo, goldVisorMat);
  visor.position.set(0, 4.3, 0.08);
  visor.rotation.x = -0.15;
  group.add(visor);

  // Portable Life Support System (PLSS Backpack)
  const plssGeo = new THREE.BoxGeometry(1.8, 2.5, 1.25);
  const plssMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.45,
  });
  const plss = new THREE.Mesh(plssGeo, plssMat);
  plss.position.set(0, 2.9, -0.95);
  plss.castShadow = true;
  group.add(plss);

  // PLSS Dual Oxygen Purge Tubes
  const tubeGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.1, 8);
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const tubeL = new THREE.Mesh(tubeGeo, tubeMat);
  tubeL.position.set(-0.55, 2.9, -1.6);
  group.add(tubeL);
  const tubeR = tubeL.clone();
  tubeR.position.x = 0.55;
  group.add(tubeR);

  // PLSS Comms Whip Antenna
  const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6);
  const antMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
  const ant = new THREE.Mesh(antGeo, antMat);
  ant.position.set(0.7, 4.4, -1.4);
  ant.rotation.z = -0.15;
  group.add(ant);

  // Articulated Arms (Pivoting from Shoulders at y = 3.2)
  const armGeo = new THREE.CylinderGeometry(0.32, 0.28, 1.8, 8);

  const shoulderL = new THREE.Group();
  shoulderL.name = 'shoulderL';
  shoulderL.position.set(-1.45, 3.2, 0);
  const armL = new THREE.Mesh(armGeo, whiteSuitMat);
  armL.position.set(0, -0.8, 0);
  armL.rotation.z = 0.2;
  shoulderL.add(armL);
  group.add(shoulderL);

  const shoulderR = new THREE.Group();
  shoulderR.name = 'shoulderR';
  shoulderR.position.set(1.45, 3.2, 0);
  const armR = new THREE.Mesh(armGeo, whiteSuitMat);
  armR.position.set(0, -0.8, 0);
  armR.rotation.z = -0.2;
  shoulderR.add(armR);
  group.add(shoulderR);

  // Dual Articulated Legs (Pivoting from Hips at y = 2.1)
  const legGeo = new THREE.CylinderGeometry(0.42, 0.46, 2.1, 8);
  const bootGeo = new THREE.BoxGeometry(0.75, 0.45, 1.3);

  const hipL = new THREE.Group();
  hipL.name = 'hipL';
  hipL.position.set(-0.55, 2.1, 0);
  const legL = new THREE.Mesh(legGeo, whiteSuitMat);
  legL.position.set(0, -1.05, 0);
  legL.castShadow = true;
  hipL.add(legL);
  const bootL = new THREE.Mesh(bootGeo, darkTrimMat);
  bootL.position.set(0, -1.9, 0.2);
  hipL.add(bootL);
  group.add(hipL);

  const hipR = new THREE.Group();
  hipR.name = 'hipR';
  hipR.position.set(0.55, 2.1, 0);
  const legR = legL.clone();
  legR.position.set(0, -1.05, 0);
  legR.castShadow = true;
  hipR.add(legR);
  const bootR = bootL.clone();
  bootR.position.set(0, -1.9, 0.2);
  hipR.add(bootR);
  group.add(hipR);

  // Head-Mounted EVA Floodlight
  const headLight = new THREE.SpotLight(0xfff7ed, 3.5, 75, Math.PI * 0.25, 0.4, 1.6);
  headLight.position.set(0, 4.6, 0.8);
  headLight.target.position.set(0, 0, 25);
  group.add(headLight);
  group.add(headLight.target);

  // Ground Target Beacon Ring
  const ringGeo = new THREE.RingGeometry(2.4, 2.8, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.name = 'crewBeaconRing';
  ring.position.y = 0.2;
  group.add(ring);

  // Callsign Identifier Banner
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(6, 10, 16, 0.9)';
  ctx.fillRect(0, 0, 128, 48);
  ctx.strokeStyle = colorHex === 0x38bdf8 ? '#38bdf8' : '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 128, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(callsign, 64, 32);

  const labelTex = new THREE.CanvasTexture(canvas);
  const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
  const sprite = new THREE.Sprite(labelMat);
  sprite.position.y = 6.4;
  sprite.scale.set(4.5, 1.8, 1);
  group.add(sprite);
}

// Build Pressurized Support Rover (NASA Perseverance / SEV Multi-Role Exploration Vehicle)
function buildPressurizedRoverModel(group: THREE.Group) {
  group.clear();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.45,
    roughness: 0.3,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.75,
    roughness: 0.4,
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.15,
  });

  // 1. Aerodynamic Pressurized Cabin Body
  const cabinGeo = new THREE.BoxGeometry(9.6, 4.4, 14.2);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.y = 5.2;
  cabin.castShadow = true;
  group.add(cabin);

  // Lower Chassis Belly Pan & Science Bay
  const panGeo = new THREE.BoxGeometry(8.4, 1.8, 12.0);
  const pan = new THREE.Mesh(panGeo, darkMetalMat);
  pan.position.y = 2.6;
  group.add(pan);

  // 2. Curved Cockpit Observation Bubble (Gold Polarized Visor Glass)
  const windowGeo = new THREE.BoxGeometry(8.2, 2.4, 3.4);
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.9,
    roughness: 0.1,
  });
  const cockpitWindow = new THREE.Mesh(windowGeo, windowMat);
  cockpitWindow.position.set(0, 5.6, 5.7);
  group.add(cockpitWindow);

  // 3. Remote Sensing Mast (RSM) with twin Mastcam-Z & SuperCam
  const mastBaseGeo = new THREE.CylinderGeometry(0.35, 0.4, 4.2, 8);
  const mast = new THREE.Mesh(mastBaseGeo, darkMetalMat);
  mast.position.set(-2.4, 8.2, 4.2);
  mast.castShadow = true;
  group.add(mast);

  const mastHeadGeo = new THREE.BoxGeometry(2.0, 1.1, 1.3);
  const mastHead = new THREE.Mesh(mastHeadGeo, bodyMat);
  mastHead.position.set(-2.4, 10.4, 4.2);
  group.add(mastHead);

  // Mastcam-Z Twin Stereo Optics
  const lensGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 12);
  lensGeo.rotateX(Math.PI / 2);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
  const lensL = new THREE.Mesh(lensGeo, lensMat);
  lensL.position.set(-2.9, 10.4, 4.9);
  group.add(lensL);
  const lensR = lensL.clone();
  lensR.position.x = -1.9;
  group.add(lensR);

  // 4. Rear Nuclear MMRTG Power Generator with Heat-Radiating Fins
  const rtgGeo = new THREE.CylinderGeometry(1.6, 1.6, 4.2, 12);
  rtgGeo.rotateX(Math.PI / 2);
  const rtg = new THREE.Mesh(rtgGeo, darkMetalMat);
  rtg.position.set(0, 4.8, -7.8);
  group.add(rtg);

  // Gold Foil Heat Shield Accent
  const foilGeo = new THREE.BoxGeometry(4.2, 2.2, 1.4);
  const foil = new THREE.Mesh(foilGeo, goldFoilMat);
  foil.position.set(0, 5.2, -6.8);
  group.add(foil);

  // 5. High-Gain Parabolic Comms Antenna Dish
  const dishGeo = new THREE.CylinderGeometry(2.0, 0.4, 0.9, 16);
  dishGeo.rotateX(Math.PI / 3);
  const dish = new THREE.Mesh(dishGeo, goldFoilMat);
  dish.position.set(2.4, 8.8, -3.2);
  group.add(dish);

  // 6. Articulated 5-Axis Robotic Sample Arm
  const armSegmentGeo = new THREE.CylinderGeometry(0.22, 0.22, 3.8, 8);
  const armLower = new THREE.Mesh(armSegmentGeo, darkMetalMat);
  armLower.position.set(2.8, 3.8, 6.2);
  armLower.rotation.x = 0.5;
  armLower.rotation.z = -0.4;
  group.add(armLower);

  // Arm Turret Drill Head
  const turretGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 12);
  turretGeo.rotateZ(Math.PI / 2);
  const turret = new THREE.Mesh(turretGeo, darkMetalMat);
  turret.position.set(3.8, 3.0, 7.8);
  group.add(turret);

  // 7. Six Heavy-Duty Exploration Wheels with Rocker-Bogie Suspension Knuckles
  const wheelPositions = [
    [-5.4, 2.3, 5.2], [5.4, 2.3, 5.2],
    [-6.0, 2.3, 0.0], [6.0, 2.3, 0.0],
    [-5.4, 2.3, -5.2], [5.4, 2.3, -5.2],
  ];
  const wheelTireGeo = new THREE.CylinderGeometry(2.3, 2.3, 1.9, 16);
  wheelTireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.2 });

  const hubGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.0, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(wheelTireGeo, tireMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const hub = new THREE.Mesh(hubGeo, hubMat);
    wheelGroup.add(hub);

    // Rocker-Bogie Suspension Linkage Strut
    const strutGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.6, 8);
    const strut = new THREE.Mesh(strutGeo, darkMetalMat);
    strut.position.set(wx > 0 ? -1.0 : 1.0, 1.2, 0);
    strut.rotation.z = wx > 0 ? -0.4 : 0.4;
    wheelGroup.add(strut);

    group.add(wheelGroup);
  });

  // 8. Dual High-Lumen Forward LED Projectors
  const lightL = new THREE.SpotLight(0xfff7ed, 6.0, 180, Math.PI * 0.28, 0.4, 1.4);
  lightL.position.set(-3.2, 5.2, 7.2);
  lightL.target.position.set(-3.2, 0, 50);
  lightL.castShadow = false;
  group.add(lightL);
  group.add(lightL.target);

  const lightR = new THREE.SpotLight(0xfff7ed, 6.0, 180, Math.PI * 0.28, 0.4, 1.4);
  lightR.position.set(3.2, 5.2, 7.2);
  lightR.target.position.set(3.2, 0, 50);
  lightR.castShadow = false;
  group.add(lightR);
  group.add(lightR.target);

  // Ground Beacon Ring
  const ringGeo = new THREE.RingGeometry(8.0, 8.8, 36);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.3;
  group.add(ring);
}

// Build 3D Martian Night Sky with Starfield, Phobos Moon & Deimos
function buildMartianNightSky(scene: THREE.Scene): { skyGroup: THREE.Group; phobosMesh: THREE.Mesh } {
  const skyGroup = new THREE.Group();
  skyGroup.name = 'martianNightSky';

  // 1. 1,500 Twinkling Martian Stars
  const starCount = 1500;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 3200 + Math.random() * 800;

    starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 150; // Above horizon
    starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3.2,
    transparent: true,
    opacity: 0.85,
  });
  const starField = new THREE.Points(starGeo, starMat);
  skyGroup.add(starField);

  // 2. Irregular Potato-Shaped Moon Phobos (Orbits in low Martian orbit)
  const phobosGeo = new THREE.DodecahedronGeometry(14, 2);
  // Deform geometry slightly for potato-like astroidal morphology
  const pPos = phobosGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const vx = pPos.getX(i);
    const vy = pPos.getY(i);
    const vz = pPos.getZ(i);
    const noise = 1 + (Math.sin(vx * 0.4) * Math.cos(vy * 0.4) * Math.sin(vz * 0.4)) * 0.25;
    pPos.setXYZ(i, vx * noise * 1.35, vy * noise * 0.85, vz * noise);
  }
  phobosGeo.computeVertexNormals();

  const phobosMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.9,
    metalness: 0.1,
  });
  const phobos = new THREE.Mesh(phobosGeo, phobosMat);
  phobos.position.set(650, 1100, -850);
  skyGroup.add(phobos);

  // Phobos Label Sprite
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(0, 0, 160, 40);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PHOBOS (MOON)', 80, 26);
  const moonTex = new THREE.CanvasTexture(canvas);
  const moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true }));
  moonSprite.position.set(650, 1135, -850);
  moonSprite.scale.set(70, 18, 1);
  skyGroup.add(moonSprite);

  skyGroup.visible = false;
  scene.add(skyGroup);

  return { skyGroup, phobosMesh: phobos };
}

// High-resolution Mars Globe generated via marsGlobeGenerator.ts

// 3D Martian Dust Devil (Convective Vortex) Builder
interface DustDevilVortex {
  funnelMesh: THREE.Mesh;
  wireMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  swirlRing: THREE.Mesh;
  parentGroup: THREE.Group;
  baseX: number;
  baseZ: number;
  driftRadiusX: number;
  driftRadiusZ: number;
  driftSpeed: number;
  phase: number;
  height: number;
}

function buildDustDevils(group: THREE.Group): DustDevilVortex[] {
  group.clear();
  const vortices: DustDevilVortex[] = [];

  const configs = [
    {
      id: 'VORTEX-01',
      baseX: -85,
      baseZ: 45,
      driftRadiusX: 40,
      driftRadiusZ: 28,
      driftSpeed: 0.32,
      phase: 0.0,
      radiusTop: 18,
      radiusBottom: 3.0,
      height: 75,
      gust: '18.5 m/s',
      dp: '-4.8 Pa',
    },
    {
      id: 'VORTEX-02',
      baseX: 90,
      baseZ: -120,
      driftRadiusX: 45,
      driftRadiusZ: 32,
      driftSpeed: 0.26,
      phase: 2.2,
      radiusTop: 22,
      radiusBottom: 3.5,
      height: 90,
      gust: '14.2 m/s',
      dp: '-3.6 Pa',
    },
  ];

  configs.forEach((cfg) => {
    const vGroup = new THREE.Group();

    // 1. Outer Swirling Inverted Dust Funnel (Truncated Cone)
    const funnelGeo = new THREE.CylinderGeometry(cfg.radiusTop, cfg.radiusBottom, cfg.height, 24, 6, true);
    funnelGeo.translate(0, cfg.height / 2, 0);

    const funnelMat = new THREE.MeshBasicMaterial({
      color: 0xd97736,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const funnelMesh = new THREE.Mesh(funnelGeo, funnelMat);
    vGroup.add(funnelMesh);

    // 2. Wireframe swirl ribs for dynamic vortex texture
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
      depthWrite: false,
    });
    const wireMesh = new THREE.Mesh(funnelGeo, wireMat);
    vGroup.add(wireMesh);

    // 3. Inner Dense Core
    const coreGeo = new THREE.CylinderGeometry(cfg.radiusTop * 0.35, cfg.radiusBottom * 0.45, cfg.height * 0.95, 16, 4, true);
    coreGeo.translate(0, (cfg.height * 0.95) / 2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x9a3412,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    vGroup.add(coreMesh);

    // 4. Ground Sand Swirl Ring
    const ringGeo = new THREE.RingGeometry(cfg.radiusBottom * 0.8, cfg.radiusBottom * 3.8, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const swirlRing = new THREE.Mesh(ringGeo, ringMat);
    swirlRing.position.y = 0.5;
    vGroup.add(swirlRing);

    // 5. Floating AR Tactical HUD Marker Tag Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 76;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(0, 0, 320, 76, 12);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, 320, 76);
    }

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`🌪️ ${cfg.id}`, 18, 32);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '15px monospace';
    ctx.fillText(`ΔP ${cfg.dp} · Gust ${cfg.gust}`, 18, 58);

    const tagTex = new THREE.CanvasTexture(canvas);
    const tagMat = new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(tagMat);
    sprite.position.y = cfg.height + 8;
    sprite.scale.set(24, 5.7, 1);
    vGroup.add(sprite);

    group.add(vGroup);

    vortices.push({
      funnelMesh,
      wireMesh,
      coreMesh,
      swirlRing,
      parentGroup: vGroup,
      baseX: cfg.baseX,
      baseZ: cfg.baseZ,
      driftRadiusX: cfg.driftRadiusX,
      driftRadiusZ: cfg.driftRadiusZ,
      driftSpeed: cfg.driftSpeed,
      phase: cfg.phase,
      height: cfg.height,
    });
  });

  return vortices;
}

export const MarsCanvas: React.FC<MarsCanvasProps> = ({
  waypoints,
  selectedWaypoint,
  onSelectWaypoint,
  activePath,
  layerSettings,
  activeLayers,
  cameraMode,
  onSetCameraMode,
  terrainSource,
  simulationProgress,
  traverseMode = 'foot',
  timeOfDay = 'day',
  solTimeHour,
  onTerrainClick,
  onStlLoaded,
  onCameraHeadingChange,
  navAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const outerHorizonMeshRef = useRef<THREE.Mesh | null>(null);
  const terrainMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const stlMeshRef = useRef<THREE.Mesh | null>(null);
  const objMeshRef = useRef<THREE.Mesh | null>(null);
  const pathMeshRef = useRef<THREE.Mesh | null>(null);
  const roverGroupRef = useRef<THREE.Group | null>(null);
  const ev1GroupRef = useRef<THREE.Group | null>(null);
  const ev2GroupRef = useRef<THREE.Group | null>(null);
  const simProgressRef = useRef(simulationProgress);
  simProgressRef.current = simulationProgress;
  const walkbackRingRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const globeControllerRef = useRef<GlobeController | null>(null);
  const dustDevilsGroupRef = useRef<THREE.Group | null>(null);
  const dustDevilVorticesRef = useRef<DustDevilVortex[]>([]);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const nightSkyGroupRef = useRef<THREE.Group | null>(null);
  const phobosMeshRef = useRef<THREE.Mesh | null>(null);

  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const forwardHeadingVecRef = useRef(new THREE.Vector3());
  const lastReportedHeadingRef = useRef({ theta: 0, phi: 0 });

  const cameraModeRef = useRef(cameraMode);
  const onCameraHeadingChangeRef = useRef(onCameraHeadingChange);
  const onStlLoadedRef = useRef(onStlLoaded);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
    onCameraHeadingChangeRef.current = onCameraHeadingChange;
    onStlLoadedRef.current = onStlLoaded;
  }, [cameraMode, onCameraHeadingChange, onStlLoaded]);

  const [hoveredWaypoint, setHoveredWaypoint] = useState<Waypoint | null>(null);
  const [stlStatus, setStlStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [objStatus, setObjStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const ELEV_SCALE = 0.38;
  const ELEV_OFFSET = 2580;
  const to3DHeight = (elevM: number) => (elevM + ELEV_OFFSET) * ELEV_SCALE;

  // Dynamic Multi-Mesh Surface Elevation Raycaster
  const downRaycasterRef = useRef(new THREE.Raycaster());
  const getGroundElevationAt = (x: number, z: number): number => {
    if (terrainSource === 'nasa-obj' && objStatus === 'ready' && objMeshRef.current) {
      downRaycasterRef.current.set(new THREE.Vector3(x, 600, z), new THREE.Vector3(0, -1, 0));
      const hits = downRaycasterRef.current.intersectObject(objMeshRef.current);
      if (hits.length > 0) return hits[0].point.y;
    } else if (terrainSource === 'nasa-stl' && stlStatus === 'ready' && stlMeshRef.current) {
      downRaycasterRef.current.set(new THREE.Vector3(x, 600, z), new THREE.Vector3(0, -1, 0));
      const hits = downRaycasterRef.current.intersectObject(stlMeshRef.current);
      if (hits.length > 0) return hits[0].point.y;
    }
    return to3DHeight(getJezeroElevation(x, -z));
  };

  // Real-Time Keyboard Navigation Flight Physics
  const keysDownRef = useRef<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const panVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const orbitVelocityRef = useRef(0);
  const zoomVelocityRef = useRef(0);

  // Global Flight Keyboard Controls Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const validFlightKeys = [
        'w',
        'a',
        's',
        'd',
        'arrowup',
        'arrowdown',
        'arrowleft',
        'arrowright',
        'q',
        'e',
        'r',
        'f',
        '+',
        '=',
        '-',
        '_',
        ' ',
      ];

      if (validFlightKeys.includes(key)) {
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
          e.preventDefault();
        }
        keysDownRef.current.add(key);
        setActiveKeys(Array.from(keysDownRef.current));
      }

      // Space / Home Recenter Command
      if (key === ' ' || e.key === 'Home') {
        e.preventDefault();
        if (controlsRef.current && cameraRef.current) {
          const targetWp = selectedWaypoint || waypoints[0];
          if (targetWp) {
            const groundY = getGroundElevationAt(targetWp.x, -targetWp.y);
            controlsRef.current.target.set(targetWp.x, groundY, -targetWp.y);
            cameraRef.current.position.set(targetWp.x + 90, groundY + 95, -targetWp.y + 130);
            controlsRef.current.update();
            tacticalAudio.playBlip();
          } else {
            controlsRef.current.target.set(0, 30, 0);
            cameraRef.current.position.set(220, 260, 340);
            controlsRef.current.update();
            tacticalAudio.playBlip();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDownRef.current.delete(key);
      setActiveKeys(Array.from(keysDownRef.current));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedWaypoint, waypoints]);

  // 1. Scene, GLSL Material, Camera, Lighting & Terrain Setup
  useEffect(() => {
    if (!containerRef.current || !canvasMountRef.current) return;
    const container = containerRef.current;
    const canvasMount = canvasMountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Authentic Butterscotch Martian Rayleigh / Dust-Scattered Atmosphere
    const martianFogColor = new THREE.Color(0xc88a65);
    scene.background = martianFogColor;
    scene.fog = new THREE.FogExp2(0xc88a65, 0.00075);

    const camera = new THREE.PerspectiveCamera(48, width / height, 1, 7500);
    cameraRef.current = camera;
    camera.position.set(220, 260, 340);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    canvasMount.innerHTML = '';
    canvasMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 25;
    controls.maxDistance = 1500;
    controls.target.set(0, 30, 0);
    controls.update();

    // Natural Martian Lighting (Sun directional vector tied to LMST 14:39:19)
    const ambientLight = new THREE.AmbientLight(0xd49b78, 1.05);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const sunVector = new THREE.Vector3(-600, 750, -450).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    sunLight.position.set(-600, 750, -450);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 100;
    sunLight.shadow.camera.far = 2500;
    const shadowD = 650;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0004;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // Build 3D Martian Night Sky (Starfield & Phobos Moon)
    const { skyGroup, phobosMesh } = buildMartianNightSky(scene);
    nightSkyGroupRef.current = skyGroup;
    phobosMeshRef.current = phobosMesh;

    // High-Resolution DEM Plane Geometry with Sedimentary Micro-Relief
    const terrainGeo = new THREE.PlaneGeometry(1000, 1000, 220, 220);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const elev = getJezeroElevation(vx, -vz);
      posAttr.setY(i, to3DHeight(elev));
    }
    terrainGeo.computeVertexNormals();

    const baseTexture = generateBaseOpticalTexture();

    // Multi-Layer GLSL Shader Material
    const shaderMat = new THREE.ShaderMaterial({
      vertexShader: MartianTerrainShader.vertexShader,
      fragmentShader: MartianTerrainShader.fragmentShader,
      uniforms: {
        uBaseTexture: { value: baseTexture },
        uTime: { value: 0 },
        uSunDirection: { value: sunVector },
        uSlopeActive: { value: 0.0 },
        uSlopeOpacity: { value: 0.8 },
        uThemisActive: { value: 0.0 },
        uThemisOpacity: { value: 0.8 },
        uCrismActive: { value: 0.0 },
        uCrismOpacity: { value: 0.85 },
        uRadiationActive: { value: 0.0 },
        uRadiationOpacity: { value: 0.75 },
        uContoursActive: { value: 0.0 },
        uContoursOpacity: { value: 0.8 },
      },
    });
    terrainMaterialRef.current = shaderMat;

    const terrainMesh = new THREE.Mesh(terrainGeo, shaderMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = false;
    terrainMeshRef.current = terrainMesh;
    scene.add(terrainMesh);

    // Endless Outer Martian Horizon Terrain (Jezero Crater Caldera Rim & Isidis Planitia)
    // Extends from tactical perimeter r = 485 out to r = 4500 (76 physical km horizon)
    const outerHorizonGeo = new THREE.RingGeometry(485, 4500, 128, 48);
    outerHorizonGeo.rotateX(-Math.PI / 2);

    const outerPos = outerHorizonGeo.attributes.position;
    const outerUv = outerHorizonGeo.attributes.uv;

    for (let i = 0; i < outerPos.count; i++) {
      const vx = outerPos.getX(i);
      const vz = outerPos.getZ(i);
      const r = Math.hypot(vx, vz);
      const theta = Math.atan2(vz, vx);

      // Planar UV mapping for seamless texturing
      outerUv.setXY(i, vx / 500, vz / 500);

      // Transition factor from tactical inner edge (r=485) to outer horizon (r=4500)
      const baseFloorY = to3DHeight(-2560); // Crater floor level (~7.6)

      // 1. Jezero Crater Caldera Rim Mountains (r: 550 -> 1850)
      // Rim rises up to +220m to +380m above crater floor
      const rimEnvelope = Math.exp(-Math.pow((r - 1150) / 420, 2));

      // Breached canyon to the west (Neretva Vallis gorge at theta ~ PI, vx < 0)
      const westAngleDist = Math.abs(Math.atan2(Math.sin(theta - Math.PI), Math.cos(theta - Math.PI)));
      const breachFactor = Math.min(1.0, 0.25 + Math.pow(westAngleDist / 0.55, 2));

      // Mountain ridges and crags along the caldera rim
      const mountainHarmonics =
        Math.sin(theta * 3.0) * 14.0 +
        Math.cos(theta * 7.0 + 0.4) * 10.0 +
        Math.sin(theta * 13.0) * 6.0 +
        Math.sin(vx * 0.006) * Math.cos(vz * 0.006) * 18.0;

      const rimElevation = rimEnvelope * (52.0 + mountainHarmonics) * breachFactor;

      // 2. Rolling Isidis Planitia Plains beyond caldera rim (r > 1600)
      const plainsFactor = Math.min(1.0, Math.max(0.0, (r - 1600) / 1000));
      const plainsDunes =
        Math.sin(vx * 0.0016) * Math.cos(vz * 0.0016) * 14.0 +
        Math.sin(r * 0.0035) * 8.0;
      const plainsElevation = plainsFactor * (12.0 + plainsDunes);

      // 3. Subtle micro-relief across outer terrain
      const microNoise = Math.sin(vx * 0.04) * Math.cos(vz * 0.04) * 1.8;

      outerPos.setY(i, baseFloorY + rimElevation + plainsElevation + microNoise);
    }

    outerHorizonGeo.computeVertexNormals();
    outerUv.needsUpdate = true;

    const outerHorizonMat = new THREE.MeshStandardMaterial({
      map: baseTexture,
      roughness: 0.92,
      metalness: 0.04,
      color: new THREE.Color(0xb56338),
      flatShading: false,
    });

    const outerHorizonMesh = new THREE.Mesh(outerHorizonGeo, outerHorizonMat);
    outerHorizonMesh.name = 'outerHorizon';
    outerHorizonMesh.receiveShadow = false;
    outerHorizonMeshRef.current = outerHorizonMesh;
    scene.add(outerHorizonMesh);

    // Official NASA Mars Trek 3D STL Model Loader
    const stlLoader = new STLLoader();
    stlLoader.load(
      '/trekSTL.stl',
      (stlGeom) => {
        stlGeom.center();
        stlGeom.rotateX(-Math.PI / 2);

        const scaleFactor = 1000 / 399;
        // Calibrate vertical relief to 2.8x mission exaggeration (matching DEM plane)
        const scaleY = 24.17;
        stlGeom.scale(scaleFactor, scaleY, scaleFactor);

        const pos = stlGeom.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          uvs[i * 2] = (vx + 500) / 1000;
          uvs[i * 2 + 1] = (vz + 500) / 1000;
        }
        stlGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        stlGeom.computeVertexNormals();

        const stlMesh = new THREE.Mesh(stlGeom, shaderMat);
        stlMesh.receiveShadow = true;
        stlMesh.castShadow = false;
        // Aligned with DEM elevation datum so crater floor is at Y~7.6 and Kodiak Butte at Y~64.6
        stlMesh.position.set(0, -320.9, 0);
        stlMesh.visible = false;
        stlMeshRef.current = stlMesh;
        scene.add(stlMesh);

        setStlStatus('ready');
        tacticalAudio.playRouteCalculated();
        if (onStlLoadedRef.current) onStlLoadedRef.current(pos.count / 3);
      },
      undefined,
      (err) => {
        console.warn('NASA Mars Trek STL note:', err);
        setStlStatus('error');
      }
    );

    // Official NASA Mars Trek 3D OBJ Model Loader (970K Vertices, UV Albedo Support)
    const objLoader = new OBJLoader();
    objLoader.load(
      '/trek/model.obj',
      (objGroup) => {
        let targetMesh: THREE.Mesh | null = null;
        objGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && !targetMesh) {
            targetMesh = child as THREE.Mesh;
          }
        });

        if (targetMesh) {
          const objGeom = (targetMesh as THREE.Mesh).geometry;
          objGeom.center();
          objGeom.rotateX(-Math.PI / 2);

          const scaleFactor = 1000 / 399;
          // Calibrate vertical relief to match mission DEM plane
          const scaleY = 22.0;
          objGeom.scale(scaleFactor, scaleY, scaleFactor);

          // Compute normalized [0, 1] planar UV coordinates for GLSL multi-layer shader
          const pos = objGeom.attributes.position;
          const uvs = new Float32Array(pos.count * 2);
          for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vz = pos.getZ(i);
            uvs[i * 2] = (vx + 500) / 1000;
            uvs[i * 2 + 1] = (vz + 500) / 1000;
          }
          objGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          objGeom.computeVertexNormals();

          const objMesh = new THREE.Mesh(objGeom, shaderMat);
          objMesh.receiveShadow = true;
          objMesh.castShadow = false;
          // Calibrated elevation matching DEM crater floor (Y ~ 7.6) and Kodiak Butte (Y ~ 65)
          objMesh.position.set(0, -290.0, 0);
          objMesh.visible = false;
          objMeshRef.current = objMesh;
          scene.add(objMesh);

          setObjStatus('ready');
          tacticalAudio.playRouteCalculated();
        }
      },
      undefined,
      (err) => {
        console.warn('NASA Mars Trek OBJ note:', err);
        setObjStatus('error');
      }
    );

    // 3D Walkback Safety Envelope Circle (Dashed 2.5 km Radius Ring on Terrain)
    const walkbackGeo = new THREE.RingGeometry(245, 252, 64);
    walkbackGeo.rotateX(-Math.PI / 2);
    const walkbackMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      wireframe: true,
    });
    const walkbackRing = new THREE.Mesh(walkbackGeo, walkbackMat);
    walkbackRing.position.set(-177, to3DHeight(-2560) + 1.2, -122);
    walkbackRing.visible = true;
    walkbackRingRef.current = walkbackRing;
    scene.add(walkbackRing);

    // Dual Crew Pair Beacons
    const ev1Group = new THREE.Group();
    ev1GroupRef.current = ev1Group;
    buildAstronautModel(ev1Group, 'EV-1', 0x38bdf8);
    scene.add(ev1Group);

    const ev2Group = new THREE.Group();
    ev2GroupRef.current = ev2Group;
    buildAstronautModel(ev2Group, 'EV-2', 0xfbbf24);
    scene.add(ev2Group);

    // Pressurized Support Rover
    const roverGroup = new THREE.Group();
    roverGroupRef.current = roverGroup;
    buildPressurizedRoverModel(roverGroup);
    scene.add(roverGroup);

    // Markers & Globe Groups
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    scene.add(markersGroup);

    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    globeGroup.visible = false;
    scene.add(globeGroup);

    // 3D Martian Dust Devil (Convective Vortex) Group
    const dustDevilsGroup = new THREE.Group();
    dustDevilsGroupRef.current = dustDevilsGroup;
    dustDevilVorticesRef.current = buildDustDevils(dustDevilsGroup);
    dustDevilsGroup.visible = true;
    scene.add(dustDevilsGroup);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update shader time uniform for animated sand hazards & hazard grid pulses
      if (terrainMaterialRef.current) {
        terrainMaterialRef.current.uniforms.uTime.value = elapsed;
      }

      // Interactive Flight Keyboard Navigation Physics & Velocity Integration
      if (cameraModeRef.current !== 'rover' && cameraModeRef.current !== 'visor' && cameraModeRef.current !== 'globe') {
        const cam = camera;
        const target = controls.target;
        const forward = new THREE.Vector3().subVectors(target, cam.position);
        forward.y = 0;
        if (forward.lengthSq() > 0.0001) forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const keys = keysDownRef.current;
        const accel = 2.4;
        if (keys.has('w') || keys.has('arrowup')) panVelocityRef.current.addScaledVector(forward, accel);
        if (keys.has('s') || keys.has('arrowdown')) panVelocityRef.current.addScaledVector(forward, -accel);
        if (keys.has('a') || keys.has('arrowleft')) panVelocityRef.current.addScaledVector(right, -accel);
        if (keys.has('d') || keys.has('arrowright')) panVelocityRef.current.addScaledVector(right, accel);
        if (keys.has('q')) orbitVelocityRef.current += 0.026;
        if (keys.has('e')) orbitVelocityRef.current -= 0.026;
        if (keys.has('r') || keys.has('=') || keys.has('+')) zoomVelocityRef.current += 2.6;
        if (keys.has('f') || keys.has('-') || keys.has('_')) zoomVelocityRef.current -= 2.6;

        if (panVelocityRef.current.lengthSq() > 0.001) {
          controls.target.add(panVelocityRef.current);
          cam.position.add(panVelocityRef.current);
          panVelocityRef.current.multiplyScalar(0.86);
        }
        if (Math.abs(orbitVelocityRef.current) > 0.0001) {
          const offset = cam.position.clone().sub(controls.target);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitVelocityRef.current);
          cam.position.copy(controls.target).add(offset);
          orbitVelocityRef.current *= 0.86;
        }
        if (Math.abs(zoomVelocityRef.current) > 0.01) {
          const offset = cam.position.clone().sub(controls.target);
          const dist = offset.length();
          const newDist = Math.max(35, Math.min(1200, dist - zoomVelocityRef.current));
          offset.setLength(newDist);
          cam.position.copy(controls.target).add(offset);
          zoomVelocityRef.current *= 0.86;
        }
      }

      // Camera Altitude Clamp
      if (cameraModeRef.current !== 'rover' && cameraModeRef.current !== 'visor' && cameraModeRef.current !== 'globe') {
        controls.update();

        const camX = Math.max(-490, Math.min(490, camera.position.x));
        const camZ = Math.max(-490, Math.min(490, camera.position.z));
        const localElev = getJezeroElevation(camX, -camZ);
        const minCamY = to3DHeight(localElev) + 14;
        if (camera.position.y < minCamY) {
          camera.position.y = minCamY;
        }

        camera.getWorldDirection(forwardHeadingVecRef.current);
        const theta = Math.atan2(forwardHeadingVecRef.current.x, forwardHeadingVecRef.current.z);
        const phi = Math.acos(Math.max(-1, Math.min(1, forwardHeadingVecRef.current.y)));

        if (
          onCameraHeadingChangeRef.current &&
          (Math.abs(theta - lastReportedHeadingRef.current.theta) > 0.012 ||
           Math.abs(phi - lastReportedHeadingRef.current.phi) > 0.012)
        ) {
          lastReportedHeadingRef.current = { theta, phi };
          onCameraHeadingChangeRef.current(theta, phi);
        }
      } else if (cameraModeRef.current === 'globe') {
        controls.update();
        // Prevent camera from clipping through Mars planetary sphere (R=180)
        const dist = camera.position.length();
        if (dist < 198) {
          camera.position.setLength(198);
        }
      }

      // Crew beacon ring pulsing animation
      if (ev1GroupRef.current) {
        const ring = ev1GroupRef.current.getObjectByName('crewBeaconRing');
        if (ring) {
          const s = 1 + 0.15 * Math.sin(elapsed * 3.0);
          ring.scale.set(s, s, s);
        }
      }

      // Dynamic Astronaut Walking Gait Cycle (EV-1 Commander and EV-2 Geologist)
      // When crew is moving along traverse line during simulation or playback:
      const isCrewWalking = simProgressRef.current > 0.005 && simProgressRef.current < 0.995;
      const walkRate = 7.2;
      const walkPhase = elapsed * walkRate;

      [ev1GroupRef.current, ev2GroupRef.current].forEach((crewGroup, idx) => {
        if (!crewGroup) return;
        const phaseOffset = idx * Math.PI * 0.45; // Natural out-of-phase step between EV-1 and EV-2
        const p = walkPhase + phaseOffset;

        const hipL = crewGroup.getObjectByName('hipL');
        const hipR = crewGroup.getObjectByName('hipR');
        const shoulderL = crewGroup.getObjectByName('shoulderL');
        const shoulderR = crewGroup.getObjectByName('shoulderR');

        if (hipL && hipR && shoulderL && shoulderR) {
          if (isCrewWalking) {
            hipL.rotation.x = Math.sin(p) * 0.55;
            hipR.rotation.x = -Math.sin(p) * 0.55;
            shoulderL.rotation.x = -Math.sin(p) * 0.42;
            shoulderR.rotation.x = Math.sin(p) * 0.42;
          } else {
            // Smoothly return to alert standing stance
            hipL.rotation.x *= 0.88;
            hipR.rotation.x *= 0.88;
            shoulderL.rotation.x *= 0.88;
            shoulderR.rotation.x *= 0.88;
          }
        }
      });

      // Dust Devils vortex swirl & trajectory drift across crater floor
      if (dustDevilsGroupRef.current && dustDevilsGroupRef.current.visible) {
        dustDevilVorticesRef.current.forEach((v) => {
          v.funnelMesh.rotation.y += 0.045;
          v.wireMesh.rotation.y += 0.045;
          v.coreMesh.rotation.y -= 0.06;
          v.swirlRing.rotation.z += 0.08;

          const currentX = v.baseX + Math.sin(elapsed * v.driftSpeed + v.phase) * v.driftRadiusX;
          const currentZ = v.baseZ + Math.cos(elapsed * v.driftSpeed * 0.8 + v.phase) * v.driftRadiusZ;
          const groundElev = getJezeroElevation(currentX, -currentZ);
          const currentY = to3DHeight(groundElev);

          v.parentGroup.position.set(currentX, currentY, currentZ);
        });
      }

      // High-Fidelity 3D Mars Planetary Globe Spin, Atmosphere & Orbital Satellites
      if (globeGroupRef.current && globeGroupRef.current.visible && globeControllerRef.current) {
        globeControllerRef.current.update(elapsed);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      globeControllerRef.current?.dispose();
      globeControllerRef.current = null;
      if (canvasMount.contains(renderer.domElement)) {
        canvasMount.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Multi-Layer Compositing Shader Uniforms
  useEffect(() => {
    if (!terrainMaterialRef.current) return;
    const uniforms = terrainMaterialRef.current.uniforms;

    if (layerSettings) {
      uniforms.uSlopeActive.value = layerSettings.slopeHazard ? 1.0 : 0.0;
      uniforms.uSlopeOpacity.value = layerSettings.slopeOpacity;

      uniforms.uThemisActive.value = layerSettings.themisThermal ? 1.0 : 0.0;
      uniforms.uThemisOpacity.value = layerSettings.themisOpacity;

      uniforms.uCrismActive.value = layerSettings.crismMinerals ? 1.0 : 0.0;
      uniforms.uCrismOpacity.value = layerSettings.crismOpacity;

      uniforms.uRadiationActive.value = layerSettings.radiationFlux ? 1.0 : 0.0;
      uniforms.uRadiationOpacity.value = layerSettings.radiationOpacity;

      uniforms.uContoursActive.value = layerSettings.contours ? 1.0 : 0.0;
      uniforms.uContoursOpacity.value = layerSettings.contoursOpacity;

      if (walkbackRingRef.current) {
        walkbackRingRef.current.visible = layerSettings.walkbackCircle;
      }

      if (dustDevilsGroupRef.current) {
        dustDevilsGroupRef.current.visible = layerSettings.dustDevils ?? true;
      }
    } else if (activeLayers) {
      // Backward compatibility fallback
      uniforms.uSlopeActive.value = activeLayers.slopeHazard ? 1.0 : 0.0;
      uniforms.uThemisActive.value = activeLayers.themisThermal ? 1.0 : 0.0;
      uniforms.uCrismActive.value = activeLayers.crismMinerals ? 1.0 : 0.0;
      uniforms.uContoursActive.value = activeLayers.contours ? 1.0 : 0.0;
    }
  }, [layerSettings, activeLayers]);

  // Diurnal Martian Solar & Moon Lighting Updates (Continuous LMST Solar Ephemeris)
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current) return;
    const scene = sceneRef.current;
    const sunLight = sunLightRef.current;
    const ambientLight = ambientLightRef.current;

    if (cameraMode === 'globe') {
      sunLight.position.set(500, 400, 450);
      sunLight.color.setHex(0xfff8f0);
      sunLight.intensity = 2.8;
      ambientLight.color.setHex(0xd49b78);
      ambientLight.intensity = 1.35;
      return;
    }

    // Continuous Sol Hour (0.00 to 24.66 LMST)
    const hour = solTimeHour !== undefined
      ? solTimeHour
      : timeOfDay === 'sunset'
      ? 18.25
      : timeOfDay === 'night'
      ? 22.75
      : 14.65;

    // Solar angle: 0h = midnight, 6h = dawn, 12h = noon, 18.2h = blue sunset
    const solFraction = (hour % 24.66) / 24.66;
    const solarElevation = Math.sin((solFraction - 0.25) * Math.PI * 2);
    const solarAzimuth = solFraction * Math.PI * 2;

    const sunDist = 1200;
    const sunX = Math.cos(solarAzimuth) * sunDist;
    const sunY = solarElevation * 900;
    const sunZ = Math.sin(solarAzimuth * 0.5) * 800;

    sunLight.position.set(sunX, Math.max(-200, sunY), sunZ);
    if (terrainMaterialRef.current) {
      terrainMaterialRef.current.uniforms.uSunDirection.value.set(sunX, Math.max(10, sunY), sunZ).normalize();
    }

    if (sunY > 120) {
      // Day Mode — High Sun with Warm Butterscotch Sky
      const dayColor = new THREE.Color(0xc88a65);
      scene.background = dayColor;
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color = dayColor;
        (scene.fog as THREE.FogExp2).density = 0.00075;
      }
      ambientLight.color.setHex(0xd49b78);
      ambientLight.intensity = 1.15;

      sunLight.color.setHex(0xfff7ed);
      sunLight.intensity = 2.6;

      if (nightSkyGroupRef.current) nightSkyGroupRef.current.visible = false;
    } else if (sunY > -80) {
      // Martian Blue Sunset / Twilight (Atmospheric Rayleigh forward-scattering)
      const sunsetFog = new THREE.Color(0x4a241b);
      scene.background = sunsetFog;
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color = sunsetFog;
        (scene.fog as THREE.FogExp2).density = 0.00075;
      }
      ambientLight.color.setHex(0x783526);
      ambientLight.intensity = 0.85;

      sunLight.color.setHex(0x60a5fa); // Cyan-Blue twilight
      sunLight.intensity = 2.0;

      if (nightSkyGroupRef.current) nightSkyGroupRef.current.visible = false;
    } else {
      // Night Mode — Starfield & Phobos Cool Moonlight
      const nightColor = new THREE.Color(0x060810);
      scene.background = nightColor;
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color = nightColor;
        (scene.fog as THREE.FogExp2).density = 0.00075;
      }
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.35;

      sunLight.color.setHex(0x94a3b8);
      sunLight.intensity = 0.6;
      sunLight.position.set(400, 750, 250);

      if (nightSkyGroupRef.current) nightSkyGroupRef.current.visible = true;
    }
  }, [timeOfDay, solTimeHour, cameraMode]);

  // Handle Google Earth Nav Actions
  useEffect(() => {
    if (!navAction || !controlsRef.current || !cameraRef.current) return;
    const { type } = navAction;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    if (type === 'zoomIn') {
      camera.position.sub(controls.target).multiplyScalar(0.75).add(controls.target);
      controls.update();
    } else if (type === 'zoomOut') {
      camera.position.sub(controls.target).multiplyScalar(1.25).add(controls.target);
      controls.update();
    } else if (type === 'panNorth') {
      panVelocityRef.current.z -= 24;
    } else if (type === 'panSouth') {
      panVelocityRef.current.z += 24;
    } else if (type === 'panWest') {
      panVelocityRef.current.x -= 24;
    } else if (type === 'panEast') {
      panVelocityRef.current.x += 24;
    } else if (type === 'orbitLeft') {
      orbitVelocityRef.current += 0.32;
    } else if (type === 'orbitRight') {
      orbitVelocityRef.current -= 0.32;
    } else if (type === 'tiltUp') {
      const offset = camera.position.clone().sub(controls.target);
      const radius = offset.length();
      const currentPhi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));
      const newPhi = Math.max(0.15, currentPhi - 0.15);
      const theta = Math.atan2(offset.x, offset.z);
      camera.position.x = controls.target.x + radius * Math.sin(newPhi) * Math.sin(theta);
      camera.position.y = controls.target.y + radius * Math.cos(newPhi);
      camera.position.z = controls.target.z + radius * Math.sin(newPhi) * Math.cos(theta);
      controls.update();
    } else if (type === 'tiltDown') {
      const offset = camera.position.clone().sub(controls.target);
      const radius = offset.length();
      const currentPhi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));
      const newPhi = Math.min(Math.PI * 0.46, currentPhi + 0.15);
      const theta = Math.atan2(offset.x, offset.z);
      camera.position.x = controls.target.x + radius * Math.sin(newPhi) * Math.sin(theta);
      camera.position.y = controls.target.y + radius * Math.cos(newPhi);
      camera.position.z = controls.target.z + radius * Math.sin(newPhi) * Math.cos(theta);
      controls.update();
    } else if (type === 'resetNorth') {
      const offset = camera.position.clone().sub(controls.target);
      const radius = offset.length();
      const currentPhi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));
      camera.position.x = controls.target.x;
      camera.position.y = controls.target.y + radius * Math.cos(currentPhi);
      camera.position.z = controls.target.z + radius * Math.sin(currentPhi);
      controls.update();
    } else if (type === 'recenter') {
      controls.target.set(0, 30, 0);
      camera.position.set(220, 260, 340);
      controls.update();
    }
  }, [navAction]);

  // 2. High-Contrast Aerospace Landmark Pins
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;
    group.clear();

    waypoints.forEach((wp) => {
      const pinObj = new THREE.Group();
      pinObj.userData = { waypoint: wp };

      const py = getGroundElevationAt(wp.x, -wp.y);
      pinObj.position.set(wp.x, py, -wp.y);

      let pinColor = 0x38bdf8; // Sky blue default
      if (wp.type === 'Habitat / Base Camp') pinColor = 0x10b981; // Emerald
      else if (wp.type === 'Sample Cache Depot') pinColor = 0xf59e0b; // Amber
      else if (wp.type === 'Hazard Zone') pinColor = 0xf43f5e; // Crimson

      // Ground Pulsing Ring
      const ringGeo = new THREE.RingGeometry(3.5, 4.4, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'beaconRing';
      ring.position.y = 0.3;
      pinObj.add(ring);

      // Slender Vertical Hologram Beacon Mast
      const mastH = 26;
      const mastGeo = new THREE.CylinderGeometry(0.3, 0.3, mastH, 8);
      const mastMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        transparent: true,
        opacity: 0.85,
      });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = mastH / 2;
      pinObj.add(mast);

      // Glowing Top Spherical Orb
      const sphereGeo = new THREE.SphereGeometry(2.0, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: pinColor,
        emissiveIntensity: 0.75,
        roughness: 0.2,
      });
      const orb = new THREE.Mesh(sphereGeo, sphereMat);
      orb.position.y = mastH;
      pinObj.add(orb);

      // Aerospace Monospace Nameplate Sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(6, 10, 16, 0.9)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = pinColor === 0x10b981 ? '#10b981' : pinColor === 0xf59e0b ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, 256, 64);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(wp.name.slice(0, 20), 128, 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`${wp.elevation}m · ${wp.type.slice(0, 15)}`, 128, 50);

      const badgeTex = new THREE.CanvasTexture(canvas);
      const badgeMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true });
      const badge = new THREE.Sprite(badgeMat);
      badge.position.y = mastH + 4.5;
      badge.scale.set(16, 4, 1);
      pinObj.add(badge);

      group.add(pinObj);
    });
  }, [waypoints, terrainSource, objStatus, stlStatus]);

  // 3. Dynamic 3D Traverse Tube Color-Coded by Metabolic Cooling & O2 Burn Rate
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (pathMeshRef.current) {
      scene.remove(pathMeshRef.current);
      pathMeshRef.current.geometry.dispose();
      pathMeshRef.current = null;
    }

    if (!activePath || activePath.path.length === 0) return;

    const points: THREE.Vector3[] = [];
    activePath.path.forEach((node) => {
      const groundY = getGroundElevationAt(node.x, -node.y);
      points.push(new THREE.Vector3(node.x, groundY + 1.8, -node.y));
    });

    const curve = new THREE.CatmullRomCurve3(points);
    const tubularSegments = Math.max(60, points.length * 4);
    const tubeGeo = new THREE.TubeGeometry(curve, tubularSegments, 1.4, 8, false);

    // Color vertices by metabolic burn rate (Green <1.0 -> Amber 1.0-1.6 -> Crimson >1.6)
    const count = tubeGeo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const nodes = activePath.path;

    for (let i = 0; i < count; i++) {
      const segRatio = (i % tubularSegments) / tubularSegments;
      const nodeIdx = Math.min(nodes.length - 1, Math.floor(segRatio * (nodes.length - 1)));
      const rate = nodes[nodeIdx]?.metabolicBurnRate ?? 1.18;

      let r = 0.13, g = 0.77, b = 0.37; // Nominal Green (<1.0)
      if (rate >= 1.6) {
        r = 0.96; g = 0.12; b = 0.22; // High Workload Crimson (>1.6)
      } else if (rate >= 1.0) {
        r = 0.96; g = 0.62; b = 0.12; // Moderate Scree Amber (1.0 - 1.6)
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const tubeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x111827,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.castShadow = true;
    pathMeshRef.current = tubeMesh;
    scene.add(tubeMesh);
  }, [activePath, terrainSource, objStatus, stlStatus]);

  // 4. Dual Crew & Support Rover Kinematics & Visor First-Person POV
  useEffect(() => {
    if (!ev1GroupRef.current || !ev2GroupRef.current || !roverGroupRef.current || !activePath || activePath.path.length === 0) return;
    const ev1 = ev1GroupRef.current;
    const ev2 = ev2GroupRef.current;
    const rover = roverGroupRef.current;
    const pathNodes = activePath.path;

    const totalNodes = pathNodes.length;
    const exactIndex = Math.min(totalNodes - 1, simulationProgress * (totalNodes - 1));
    const idx0 = Math.floor(exactIndex);
    const idx1 = Math.min(totalNodes - 1, Math.ceil(exactIndex));
    const fraction = exactIndex - idx0;

    const n0 = pathNodes[idx0];
    const n1 = pathNodes[idx1];

    // EV-1 Commander Position
    const posX = THREE.MathUtils.lerp(n0.x, n1.x, fraction);
    const posZ = THREE.MathUtils.lerp(-n0.y, -n1.y, fraction);
    const posY = getGroundElevationAt(posX, posZ);

    // EV-2 Geologist follows 14 meters behind on the traverse line
    const lagFraction = Math.max(0, exactIndex - 2.5) / Math.max(1, totalNodes - 1);
    const lagIdx0 = Math.floor(lagFraction * (totalNodes - 1));
    const lagIdx1 = Math.min(totalNodes - 1, Math.ceil(lagFraction * (totalNodes - 1)));
    const ev2N0 = pathNodes[lagIdx0];
    const ev2N1 = pathNodes[lagIdx1];
    const ev2X = THREE.MathUtils.lerp(ev2N0.x, ev2N1.x, 0.5) - 3.5;
    const ev2Z = THREE.MathUtils.lerp(-ev2N0.y, -ev2N1.y, 0.5);
    const ev2Y = getGroundElevationAt(ev2X, ev2Z);

    if (traverseMode === 'foot') {
      // Suited human Marswalk EVA: Commander & Geologist active on foot
      ev1.position.set(posX, posY, posZ);
      ev2.position.set(ev2X, ev2Y, ev2Z);
      ev1.visible = true;
      ev2.visible = true;
      rover.visible = false;
    } else {
      // Pressurized Support Rover: driving along traverse centerline
      rover.position.set(posX, posY, posZ);
      rover.visible = true;
      ev1.visible = false;
      ev2.visible = false;
    }

    // Orient heading along traverse
    const nextIdx = Math.min(totalNodes - 1, idx0 + 1);
    const nextNode = pathNodes[nextIdx];
    const dx = nextNode.x - n0.x;
    const dz = -nextNode.y - (-n0.y);
    const horizDist = Math.hypot(dx, dz);

    if (horizDist > 0.001) {
      const heading = Math.atan2(dx, dz);
      ev1.rotation.y = heading;
      ev2.rotation.y = heading;
      rover.rotation.y = heading;
    }

    // Camera Modes: Visor (1.8m eye-level) vs Rover follow
    if (cameraMode === 'visor' && cameraRef.current) {
      const cam = cameraRef.current;
      cam.position.set(posX, posY + 1.8, posZ);

      // Look directly towards next waypoint or path node ahead
      if (horizDist > 0.001) {
        const lookTarget = new THREE.Vector3(
          posX + dx * 20,
          to3DHeight(getJezeroElevation(posX + dx * 20, -(posZ + dz * 20))) + 1.8,
          posZ + dz * 20
        );
        cam.lookAt(lookTarget);
      }
    } else if (cameraMode === 'rover' && cameraRef.current) {
      const cam = cameraRef.current;
      const heading = ev1.rotation.y;
      cam.position.x = posX - Math.sin(heading) * 45;
      cam.position.z = posZ - Math.cos(heading) * 45;
      cam.position.y = posY + 22;
      cam.lookAt(posX, posY + 4, posZ);
    }
  }, [simulationProgress, activePath, cameraMode, traverseMode, terrainSource, objStatus, stlStatus]);

  // 5. Camera Modes & Globe vs Surface transitions
  useEffect(() => {
    if (!globeGroupRef.current || !cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraMode === 'globe') {
      if (terrainMeshRef.current) terrainMeshRef.current.visible = false;
      if (outerHorizonMeshRef.current) outerHorizonMeshRef.current.visible = false;
      if (stlMeshRef.current) stlMeshRef.current.visible = false;
      if (objMeshRef.current) objMeshRef.current.visible = false;
      if (markersGroupRef.current) markersGroupRef.current.visible = false;
      if (pathMeshRef.current) pathMeshRef.current.visible = false;
      if (ev1GroupRef.current) ev1GroupRef.current.visible = false;
      if (ev2GroupRef.current) ev2GroupRef.current.visible = false;
      if (roverGroupRef.current) roverGroupRef.current.visible = false;
      if (walkbackRingRef.current) walkbackRingRef.current.visible = false;
      if (dustDevilsGroupRef.current) dustDevilsGroupRef.current.visible = false;

      // Lazy build globe system if not yet created
      if (!globeControllerRef.current && globeGroupRef.current) {
        globeControllerRef.current = buildDetailedMarsGlobe(globeGroupRef.current);
      }
      globeGroupRef.current.visible = true;

      // Deep space cosmic obsidian background & clear fog in orbit!
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x020308);
        sceneRef.current.fog = null;
      }
      if (nightSkyGroupRef.current) {
        nightSkyGroupRef.current.visible = true;
      }

      // Allow 360 degree orbital rotation around Mars globe
      controls.maxPolarAngle = Math.PI;
      controls.minPolarAngle = 0.01;
      controls.minDistance = 210;
      controls.maxDistance = 1400;

      controls.target.set(0, 0, 0);
      cameraRef.current.position.set(200, 140, 360);
      controls.update();

      if (sunLightRef.current) {
        sunLightRef.current.position.set(500, 400, 450);
        sunLightRef.current.color.setHex(0xfff8f0);
        sunLightRef.current.intensity = 2.8;
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(0xd49b78);
        ambientLightRef.current.intensity = 1.35;
      }
    } else {
      // Restore surface controls constraints
      controls.maxPolarAngle = Math.PI * 0.46;
      controls.minPolarAngle = 0.05;
      controls.minDistance = 25;
      controls.maxDistance = 1500;
      if (outerHorizonMeshRef.current) outerHorizonMeshRef.current.visible = true;
      if (markersGroupRef.current) markersGroupRef.current.visible = true;
      if (pathMeshRef.current) pathMeshRef.current.visible = true;
      if (ev1GroupRef.current) ev1GroupRef.current.visible = true;
      if (ev2GroupRef.current) ev2GroupRef.current.visible = true;
      if (roverGroupRef.current) roverGroupRef.current.visible = true;
      if (walkbackRingRef.current) walkbackRingRef.current.visible = true;
      if (dustDevilsGroupRef.current) dustDevilsGroupRef.current.visible = true;
      globeGroupRef.current.visible = false;

      // Restore diurnal surface background and fog!
      if (sceneRef.current) {
        const fogColor = timeOfDay === 'sunset' ? new THREE.Color(0x4a241b) : timeOfDay === 'night' ? new THREE.Color(0x060810) : new THREE.Color(0xc88a65);
        sceneRef.current.background = fogColor;
        sceneRef.current.fog = new THREE.FogExp2(fogColor, 0.00075);
      }
      if (nightSkyGroupRef.current) {
        nightSkyGroupRef.current.visible = timeOfDay === 'night';
      }

      if (terrainSource === 'nasa-obj' && objStatus === 'ready' && objMeshRef.current) {
        objMeshRef.current.visible = true;
        if (terrainMeshRef.current) terrainMeshRef.current.visible = false;
        if (stlMeshRef.current) stlMeshRef.current.visible = false;
      } else if (terrainSource === 'nasa-stl' && stlStatus === 'ready' && stlMeshRef.current) {
        stlMeshRef.current.visible = true;
        if (terrainMeshRef.current) terrainMeshRef.current.visible = false;
        if (objMeshRef.current) objMeshRef.current.visible = false;
      } else {
        if (stlMeshRef.current) stlMeshRef.current.visible = false;
        if (objMeshRef.current) objMeshRef.current.visible = false;
        if (terrainMeshRef.current) terrainMeshRef.current.visible = true;
      }

      if (cameraMode === 'topdown') {
        controls.target.set(-100, 20, 0);
        cameraRef.current.position.set(-100, 780, 5);
        controls.update();
      } else if (cameraMode === 'orbit') {
        controls.target.set(0, 30, 0);
        controls.update();
      }
    }
  }, [cameraMode, terrainSource, stlStatus, objStatus, timeOfDay]);

  // 6. Smooth Fly-to on Selected Waypoint
  useEffect(() => {
    if (!selectedWaypoint || cameraMode === 'rover' || cameraMode === 'visor' || cameraMode === 'globe' || !controlsRef.current || !cameraRef.current) return;
    const targetX = selectedWaypoint.x;
    const targetZ = -selectedWaypoint.y;
    const targetY = to3DHeight(selectedWaypoint.elevation);

    const controls = controlsRef.current;
    const camera = cameraRef.current;

    const currentOffset = camera.position.clone().sub(controls.target);
    const dist = Math.max(160, Math.min(320, currentOffset.length()));

    controls.target.set(targetX, targetY, targetZ);
    camera.position.set(targetX + dist * 0.6, targetY + dist * 0.7, targetZ + dist * 0.6);
    controls.update();
  }, [selectedWaypoint, cameraMode]);

  // 7. Raycasting & Click vs Pan Drag distinction
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const dt = Date.now() - pointerStartRef.current.time;
    const dist = Math.hypot(dx, dy);

    if (dist > 6 || dt > 350) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    if (markersGroupRef.current) {
      const markerHits = raycaster.intersectObjects(markersGroupRef.current.children, true);
      if (markerHits.length > 0) {
        let rootObj = markerHits[0].object;
        while (rootObj.parent && rootObj.parent !== markersGroupRef.current) {
          rootObj = rootObj.parent;
        }
        if (rootObj.userData?.waypoint) {
          tacticalAudio.playBlip();
          onSelectWaypoint(rootObj.userData.waypoint);
          return;
        }
      }
    }

    const activeMesh = terrainSource === 'nasa-obj' && objStatus === 'ready' && objMeshRef.current
      ? objMeshRef.current
      : terrainSource === 'nasa-stl' && stlStatus === 'ready' && stlMeshRef.current
      ? stlMeshRef.current
      : terrainMeshRef.current;
    if (activeMesh && onTerrainClick) {
      const terrainHits = raycaster.intersectObject(activeMesh);
      if (terrainHits.length > 0) {
        const pt = terrainHits[0].point;
        const worldX = Math.round(pt.x);
        const worldY = Math.round(-pt.z);
        const elev = Math.round(getJezeroElevation(worldX, worldY));
        tacticalAudio.playBlip();
        onTerrainClick({ x: worldX, y: worldY, elevation: elev });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);

    if (intersects.length > 0) {
      let rootObj = intersects[0].object;
      while (rootObj.parent && rootObj.parent !== markersGroupRef.current) {
        rootObj = rootObj.parent;
      }
      if (rootObj.userData?.waypoint) {
        setHoveredWaypoint(rootObj.userData.waypoint);
        return;
      }
    }
    setHoveredWaypoint(null);
  };

  return (
    <div
      ref={containerRef}
      id="mars-3d-viewport"
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Isolated Three.js WebGL Canvas Mount (prevents React removeChild conflict) */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Hover Waypoint Telemetry Pill */}
      {hoveredWaypoint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 px-3.5 py-1.5 rounded hud-panel border border-sky-400/50 text-xs shadow-2xl flex items-center gap-2.5 animate-fade-in font-mono">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{hoveredWaypoint.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-sky-300">{hoveredWaypoint.type}</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-300 font-bold">{hoveredWaypoint.elevation}m</span>
          </div>
        </div>
      )}

      {/* 4. Orbital Reconnaissance & Globe Telemetry Glass HUD */}
      {cameraMode === 'globe' && (
        <div className="absolute top-20 right-6 z-20 w-96 max-w-[calc(100vw-3rem)] hud-panel rounded-2xl border border-sky-400/30 p-4 shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-3 font-sans text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <span>Orbital Telemetry</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">MRO Polar Orbit · Alt 320 km</div>
              </div>
            </div>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                if (cameraRef.current && controlsRef.current && globeControllerRef.current) {
                  globeControllerRef.current.focusOnTarget(18.38, 77.58, cameraRef.current, controlsRef.current);
                }
              }}
              title="Recenter Camera on Jezero Crater"
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/40 text-sky-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Planetary Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Mean Radius</div>
              <div className="font-bold text-slate-200">3,389.5 km</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Surface Gravity</div>
              <div className="font-bold text-amber-300">0.376 g (3.72 m/s²)</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Axial Tilt (Obliquity)</div>
              <div className="font-bold text-sky-300">25.19°</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Atmospheric Press.</div>
              <div className="font-bold text-slate-200">6.1 mbar (CO₂ 95%)</div>
            </div>
          </div>

          {/* Target Focus Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Orbital Camera Jump Target</span>
              <span className="text-[10px] text-sky-400">7 Landmarks</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {MARS_LANDMARKS.map((lm) => (
                <button
                  key={lm.name}
                  onClick={() => {
                    tacticalAudio.playBlip();
                    if (cameraRef.current && controlsRef.current && globeControllerRef.current) {
                      globeControllerRef.current.focusOnTarget(lm.lat, lm.lon, cameraRef.current, controlsRef.current);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-all border flex flex-col ${
                    lm.name === 'Jezero Crater'
                      ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 hover:bg-sky-500/30'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold truncate">{lm.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{lm.elevation} · {lm.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Mission Quick Stats */}
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5">
            <Crosshair className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <div className="font-bold text-sky-300">Ares Jezero Expedition Active</div>
              <div className="text-[11px] text-slate-300">Western Jezero Delta (18.38° N, 77.58° E). Elevation: -2,540m. 9 NASA/International landing sites tracked.</div>
            </div>
          </div>

          {/* Return / Descend CTA */}
          <button
            onClick={() => {
              tacticalAudio.playRouteCalculated();
              if (onSetCameraMode) {
                onSetCameraMode('orbit');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Descend to Jezero Surface (3D)</span>
          </button>
        </div>
      )}

      {/* 5. Fluid Keyboard Flight Controls HUD Indicator */}
      {cameraMode !== 'globe' && (
        <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2.5 glass-panel px-3.5 py-2 rounded-2xl text-[11px] font-mono select-none text-[var(--text-secondary)] shadow-xl border border-[var(--border-subtle)] backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-[var(--text-primary)] tracking-wider">Flight Keys</span>
          </div>
          <span className="text-[var(--text-tertiary)]">·</span>
          <div className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${activeKeys.some(k => ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) ? 'bg-[var(--primary)] text-white shadow-sm scale-105' : 'bg-[var(--bg-glass-inset)] border border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>WASD / ↑↓←→</kbd>
            <span className="text-[10px]">Pan</span>
          </div>
          <span className="text-[var(--text-tertiary)]">·</span>
          <div className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${activeKeys.some(k => ['q','e'].includes(k)) ? 'bg-[var(--primary)] text-white shadow-sm scale-105' : 'bg-[var(--bg-glass-inset)] border border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>Q / E</kbd>
            <span className="text-[10px]">Orbit</span>
          </div>
          <span className="text-[var(--text-tertiary)]">·</span>
          <div className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${activeKeys.some(k => ['r','f','+','-','='].includes(k)) ? 'bg-[var(--primary)] text-white shadow-sm scale-105' : 'bg-[var(--bg-glass-inset)] border border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>R / F</kbd>
            <span className="text-[10px]">Zoom</span>
          </div>
          <span className="text-[var(--text-tertiary)]">·</span>
          <div className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${activeKeys.includes(' ') ? 'bg-[var(--primary)] text-white shadow-sm scale-105' : 'bg-[var(--bg-glass-inset)] border border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>Space</kbd>
            <span className="text-[10px]">Center</span>
          </div>
        </div>
      )}
    </div>
  );
};
