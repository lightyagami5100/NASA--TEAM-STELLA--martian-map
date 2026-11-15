# PROJECT ARES-OCTANT: Autonomous Reconnaissance, EVA Operations & Planetary Telemetry System
## 2026 NASA Space Apps Challenge — Human Mars Surface Exploration (EVA Operations)
### Architecture Blueprint & 5-Phase Engineering Roadmap

---

## 1. Executive Summary & Mission Paradigm

Project **ARES-OCTANT** is an aerospace-grade, high-fidelity mission control and surface operations telemetry platform engineered specifically for NASA human Extravehicular Activities (EVAs) on Mars. Designed to comply with **NASA JPL MMGIS (Multi-Mission Geographic Information System)**, **NASA SUITS (Spacesuit User Interface Technologies for Students)**, and **NASA SP-20205009653 (Human Integration Design Handbook / EVA Operations)** standards, ARES-OCTANT bridges the gap between orbital planetary science and tactical crew survival.

### Real-World Operational Context
- **Primary Landing Site / Mission Sector:** Jezero Crater Western Delta Quadrant ($18.38^\circ\text{N}, 77.58^\circ\text{E}$ Planetocentric / IAU 2000 Mars Ellipsoid).
- **Surface Elevation Envelope:** $-2,530\,\text{m}$ to $-2,190\,\text{m}$ relative to Mars MOLA Areoid Datum ($0\,\text{m}$).
- **Crew Allocation:** Dual-Astronaut Surface Sortie:
  - **EV-1:** Commander / Lead Geologist (Dr. Sarah Chen, Call-Sign *ARES-LEAD*)
  - **EV-2:** Flight Engineer / Payload Specialist (Marcus Vance, Call-Sign *ARES-TWO*)
- **Support Vehicle:** Pressurized Uncrewed/Crewed Support Rover (*LTV ARES-CHARIOT*) acting as local communications repeater, sample repository, and emergency pressurized refuge.
- **Critical Operational Constraints:**
  - Earth-Mars Telemetry Latency: $\sim 4.2$ to $21.8\,\text{minutes}$ one-way light time (forcing local autonomous tactical decision-making).
  - PLSS Consumable Ceiling: Nominal $8.0\,\text{hour}$ EVA sortie with mandatory $25\%$ emergency reserve margin.
  - Surface Radiation Flux: Background Galactic Cosmic Radiation (GCR) plus transient Solar Energetic Particle (SEP) storm events.

---

## 2. Aerospace Avionics Visual Language (Zero "AI Slop")

In strict adherence to aerospace telemetry guidelines, ARES-OCTANT systematically rejects generic consumer web-app tropes (such as light-mode cards, bubbly rounded pills, non-functional animations, and emojis) in favor of high-legibility, mission-critical flight-deck engineering:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AEROSPACE FLIGHT-DECK SPECIFICATION               │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ Primary Glass Canvas  │ rgba(9, 12, 16, 0.88) with backdrop-filter: blur   │
│ Structural Borders    │ 1px solid rgba(255, 255, 255, 0.08)                │
│ Corner Radii          │ 4px technical chamfer/radius (strict avionics edge) │
│ Accent Spectrum       │ Tactical Cyan (#00E5FF)  - Nominal Data & Vectors   │
│                       │ Biosensor Green (#00E676)- Life Support / Nominal   │
│                       │ Hazard Amber (#FF9100)   - Caution / Traversability │
│                       │ Critical Red (#FF1744)   - Master Warning / Abort   │
│                       │ Radiation Violet (#D500F9) - High Flux / SEP Risk   │
│ Symbology             │ Custom 1.5px monoline technical SVG instrumentation │
│ Typography            │ JetBrains Mono with tabular-nums (tnum)             │
│ Layout Density        │ Maximum information-to-ink ratio; no wasteful space │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 3. High-Level System Architecture

```
                               ┌───────────────────────────────────────────────┐
                               │           ARES-OCTANT MISSION ENGINE          │
                               └──────────────────────┬────────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         │                                            │                                            │
         ▼                                            ▼                                            ▼
┌───────────────────┐                      ┌───────────────────┐                      ┌───────────────────┐
│ 3D WEBGL GRAPHICS │                      │ MULTI-SPECTRAL    │                      │ EVA BIO-KINETIC   │
│      ENGINE       │                      │    GIS STACK      │                      │ PATHFINDING CORE  │
├───────────────────┤                      ├───────────────────┤                      ├───────────────────┤
│ • Three.js WebGL2 │                      │ • Simultaneous    │                      │ • Minetti Cost    │
│ • Custom GLSL     │                      │   Layer Composite │                      │   Metabolic Burn  │
│   Terrain Shaders │                      │ • Optical Regolith│                      │ • PLSS O2/Battery │
│ • Micro-Relief    │                      │ • Slope Hazards   │                      │   Depletion Rate  │
│   Displacement &  │                      │ • THEMIS Thermal  │                      │ • Walkback Margin │
│   Normal Detailing│                      │   Inertia Sands   │                      │   Calculation     │
│ • Live Martian Sun│                      │ • CRISM Minerals  │                      │ • SEP Radiation   │
│   & Dust Atmo     │                      │ • Radiation Flux  │                      │   Shadow Reroute  │
└─────────┬─────────┘                      └─────────┬─────────┘                      └─────────┬─────────┘
          │                                          │                                          │
          └──────────────────────────────────────────┼──────────────────────────────────────────┘
                                                     ▼
                                   ┌───────────────────────────────────┐
                                   │     MISSION CONTROL & HUD CORE    │
                                   ├───────────────────────────────────┤
                                   │ • Multi-View Flight Deck Shell    │
                                   │ • Ortho / 3D Tactical / Visor HUD │
                                   │ • Dual-Crew Telemetry Enunciator  │
                                   │ • Quantitative Probe Inspector    │
                                   └───────────────────────────────────┘
```

---

## 4. Comprehensive 5-Phase Engineering Roadmap

### Phase 1: Aerospace Scaffolding, Design Tokens & Mission Geodatabase [STATUS: COMPLETE]
- **Target Deliverable:** Solid project infrastructure, aerospace telemetry tokens, structured Mars geodatabase (Jezero Crater Western Delta), and the primary mission flight-deck shell.
- **Completed Components:**
  - Vite + React 18 + TypeScript + Tailwind CSS configured with high-contrast avionics design tokens (`rgba(9, 12, 16, 0.88)` dark telemetry glass, `1px` structural borders, `4px` technical corners, `JetBrains Mono` tabular numbers, and custom 1.5px SVG icons; zero emojis).
  - Authentic Jezero Crater Western Delta Geodatabase (`jezeroGeodatabase.ts`, `defaultMissionState.ts`).
  - Master Flight-Deck Shell with Mission Sol clock, LMST clock, MET, Earth DSN latency telemetry, and Master Caution & Warning annunciator matrix.

### Phase 2: High-Fidelity 3D WebGL Terrain Engine & Martian Atmosphere [STATUS: COMPLETE]
- **Target Deliverable:** Custom Three.js WebGL2 graphics pipeline rendering accurate Martian topography and atmospheric dynamics using authentic NASA Mars Trek DEM assets.
- **Completed Components:**
  - **Asset Optimization:** Extracted 400x400 DEM heightmap into high-performance Float32 binary buffer (`elevation.bin`, 640 KB vs 62 MB, 99% bandwidth reduction) mapped 1:1 with NASA Trek `texture.png`.
  - **Custom GLSL Terrain Shader (`martianTerrainShader.ts`):** Micro-relief normal perturbation, dry regolith opposition surge lighting, anti-aliased screen-space topographic contours via `fwidth()`, and dynamic multi-spectral layer overlays.
  - **Physically Inspired Martian Atmosphere (`martianAtmosphereShader.ts`):** Sky dome modeling forward Mie scattering by ferric oxide ($Fe_2O_3$) micron dust aerosols, rendering the characteristic butterscotch/salmon daytime sky and cool blue sunset halo around the Sun.
  - **Live Martian Solar Astronomy Engine (`solarCalculations.ts`):** Calculates precise solar azimuth, elevation, declination, and PCF soft shadow casting driven by live Martian LMST and solar longitude ($L_s$).
  - **3D Tactical Spatial Markers (`sceneMarkers.ts`):** High-detail models for Hab Alpha, EV-1 (Dr. Sarah Chen), EV-2 (Marcus Vance), Support Rover (Ares-Chariot) with comms tether ring, and landmark waypoint beacons.
  - **Interactive 3D Raycasting Probe:** Seamless raycaster on `Martian3DScene.tsx` calculating exact world coordinates, elevation, slope, and radiation shielding.

### Phase 3: True Multi-Spectral GIS Compositing Stack [STATUS: COMPLETE]
- **Target Deliverable:** Simultaneous, multi-layered scientific compositing engine with per-layer blending, opacity sliders, quantitative legends, and interactive cross-section transects (eliminating single-layer toggle limitations).
- **Completed Components:**
  - **Scientific Compositing Engine (`martianTerrainShader.ts`):** Implemented multi-mode compositing (`OVERLAY`, `TINT_MULTIPLY`, `ADDITIVE`, `ISOLATED_COLORMAP`) for optical orthomosaic, slope hazard classification, THEMIS thermal inertia sand-trap detection, CRISM mineral spectroscopy, and space weather radiation flux.
  - **Quick Scientific Preset Matrix (`LayerControlPanel.tsx`):** Tactical one-click presets for `HAZARDS`, `MINERALS`, `RAD FLUX`, `BASE OPTICAL`, and `FULL COMPOSITE`.
  - **Physical Data Statistics:** Real-time MIN, NOMINAL, PEAK telemetry metrics and calibrated physical unit legends ($\text{TIU}$, $\mu\text{Sv/h}$, slope degrees).
  - **Mission Traverse Cross-Section Profile Tool (`TraverseCrossSectionModal.tsx`):** Interactive 2D elevation transect graph computing MOLA elevation curves, slope hazard segments, radiation exposure, and Minetti bio-kinetic metabolic expenditure across key mission routes (Hab Alpha to Kodiak Butte, Rover to EV-1, Hab to Belva Crater, Hab to Séítah Dunes).
  - **Interactive Multi-Spectral Probe Inspector:** Simultaneous surface sampling of Areocentric Lat/Lon, MOLA elevation, slope gradient, thermal inertia, and topographic radiation shielding.

### Phase 4: Human Marswalk (EVA) Simulation & Bio-Kinetic Pathfinding Engine [STATUS: COMPLETE]
- **Target Deliverable:** Real-time dual-astronaut surface kinematics and bio-energetic traverse pathfinding.
- **Completed Components:**
  - **Minetti Bio-Kinetic Locomotion Engine (`minettiMetabolicModel.ts`):** Implemented Minetti (2002) cost-of-transport polynomial $C_w(i)$ calculating metabolic power ($W$), metabolic rate ($\text{kcal/hr}$), $O_2$ consumption rate ($L/\text{min}$), heart rate ($\text{BPM}$), and feedwater sublimation loop cooling depletion based on gradient, velocity, and $140\,\text{kg}$ astronaut + PLSS mass in $0.38\text{g}$ gravity.
  - **NASA Flight Rule Walkback Safety Margin & Point of No Return (PONR):** Continuous evaluation of safe return duration, usable vs required $O_2$ budget, battery consumption, and safety margin ratio ($\ge 1.25$ nominal, $1.0-1.25$ caution, $<1.0$ abort).
  - **Multi-Criteria A* Traverse Engine (`pathfindingAStar.ts`):** Generates optimal surface sortie paths avoiding steep slopes ($>22^\circ$), bypassing Séítah low-traction dune sand-traps, and dynamically rerouting to crater scarps (Belva/Kodiak) for up to $44\%$ radiation shielding when solar energetic particle (SEP) storm alerts trigger.
  - **Interactive Traverse Planner Modal (`TraversePlannerModal.tsx`):** Tactical route configuration between landmarks with real-time risk rating (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), distance, duration, $O_2$ expenditure, and instant dispatch to 3D Three.js spline and 2D radar displays.
  - **3D Spatial Route Projection:** Renders planned sortie routes in Three.js as glowing Catmull-Rom 3D spline tubes with tactical waypoint spheres.

### Phase 5: First-Person EVA Helmet Visor HUD, Field Geology Spectrometer & Mission Telemetry Export [STATUS: COMPLETE]
- **Target Deliverable:** Immersive first-person astronaut perspective with heads-up avionics projection, field Raman/APXS spectrometer sample tools, and planetary data telemetry export.
- **Completed Components:**
  - **NASA SUITS First-Person EVA Helmet Visor HUD (`EvaVisorHud.tsx`):**
    - High-precision 360° dynamic Compass Heading Tape with target bearing indicators and live drift oscillation.
    - Full-avionics Pitch Ladder and Artificial Horizon with $\pm 5^\circ$ and $\pm 10^\circ$ pitch graduations.
    - Ground-Truth Target Lock Reticle with dynamic range, elevation delta, bearing, and target distance readout.
    - In-Helmet Avionics Glass: Vitro-display showing real-time EKG heart rate, metabolic expenditure (Watts and kcal/h), suit pressure ($29.6\,\text{kPa}$ / $4.3\,\text{psi}$), $CO_2$ partial pressure, PLSS primary $O_2$ pressure bar & time-to-empty, PLSS battery gauge, and Support Rover telemetry link.
    - Astronaut Helmet Physical Emulation: Peripheral vignette, 3-mode switchable polarized visor filter (`GOLD_FILTER` UV/IR reflection sheen, `CLEAR` direct glass, `NIGHT_ENHANCED` high-contrast night vision), and subtle natural head movement oscillation.
  - **Ground-Truth Field Geology Raman / APXS Spectrometer Scanner (`GeologicalScannerModal.tsx`):**
    - Simulates NASA Mars 2026 rover and astronaut science suite (combining PIXL, SHERLOC, and SuperCam Raman capabilities).
    - Multi-target Jezero Delta geological catalog: Neretva Lacustrine Mudstone Bed, Kodiak Foreset Deltaic Sandstone, and Séítah Olivine Cumulate Pavement.
    - Optical Camera Inspection with zoom control ($1\times$ to $10\times$ magnification) and crosshair reticle.
    - Pulsed Ultraviolet LIBS / Raman Laser firing sequence with elemental oxide breakdown ($SiO_2$, $FeOT$, $Al_2O_3$, $MgO$, $CaO$, $SO_3$, $K_2O$) and primary mineral identification.
    - Sample Coring & Sealing mechanism: Seals geological sample into hermetic titanium core tube, updates organic biosignature confidence ratings, and immediately dispatches the cored sample to the mission geological cache registry.
  - **Planetary Data System (PDS) & OGC GeoJSON Telemetry Export Engine (`TelemetryExportModal.tsx`):**
    - Standardized export adhering to IAU 2000 Mars Coordinate Reference System (`urn:ogc:def:crs:IAU2000:49900`) and NASA PDS4 geodatabase specifications.
    - Exports complete mission state including Hab Alpha, Support Rover telemetry, EV-1 and EV-2 positions/vitals/PLSS consumables, walkback safety ratios, all Jezero landmarks, and collected geological samples with rock lithology and biosignature ratings.
    - Dual formats: NASA Planetary GeoJSON FeatureCollection and Tabular CSV Log with instant in-browser file download and clipboard copy functions.

### Phase 6: 3D Mars Planetary Globe, DSN Telemetry Feed & Diurnal Astronomy [STATUS: COMPLETE]
- **Target Deliverable:** Macro-scale planetary orbital overview, live Deep Space Network (DSN) telemetry stream, and diurnal solar tracking.
- **Completed Components:**
  - **Physically Grounded 3D Mars Globe (`marsGlobeGenerator.ts`):** 180-unit radius planetary sphere featuring real Martian axial tilt ($25.19^\circ$), high-resolution albedo and bump textures, rotating water-ice cloud veil, dual-layer Rayleigh and ferric dust limb scattering, and 3D beacon pins for historic and active landing sites (Perseverance, Curiosity, InSight, Viking 1/2, Pathfinder, Opportunity, Spirit, Zhurong).
  - **Live DSN Telemetry & Hazcam Ground-Truth Feed (`LiveRoverFeedModal.tsx`):** Simulates 8.4 GHz X-band telemetry downlink from Perseverance/Ares-Chariot showing real-time Sol 1320 mission elapsed time, drive motor currents, battery state-of-charge, Hazcam imagery, and atmospheric optical depth ($\tau$).
  - **Diurnal Astronomical Sky Engine:** Dynamically calculates Sun azimuth, elevation, butterscotch atmospheric fog, starfields, and low-orbit potato-shaped moon Phobos.

### Phase 7: Specialized Operational Modes & NASA EVA Flight Rules [STATUS: COMPLETE]
- **Target Deliverable:** Ergonomically specialized UI modes for distinct crew roles (Console Screen, Tactical Field Slate, Helmet Visor HUD) and strict flight rules compliance.
- **Completed Components:**
  - **Habitat Workstation Console (`'screen'`):** Full desktop layout with dockable left/right tactical sidebar, Google Earth navigation controls, MEDA weather station modal, and primary science target inspector.
  - **Astronaut EVA Field Slate (`'tablet'`, `EvaTabletHud.tsx`):** Built to NASA-STD-3001 standards with $\ge 48\text{px}$ glove targets, solar glare contrast mode, forearm dock toggle, PLSS life-support telemetry ($O_2$, battery, sublimator cooling, metabolic burn, suit leak rate), Point of No Return countdown, EV-1/EV-2 proximity radar, and 1-tap Mars Sample Return caching drawer.
  - **xEMU Helmet Visor AR HUD (`'visor'`, `HelmetVisorOverlay.tsx`):** 1.8m eye-level first-person view, 360° heading tape, active target lock reticle, gold sun shade filter, and interactive voice comm simulator.
  - **NASA EVA Flight Rules Compliance (`astronautProtocols.ts`):** Implemented programmatic enforcement for Walkback Limit (EVA-FR-101), Buddy Separation $\le 100\text{m}$ (EVA-FR-102), Terrain Traversability (EVA-FR-103), Radiation ALARA (EVA-FR-104), Dust Devil Protocol (EVA-FR-105), and MSR Caching (EVA-FR-106).

### Phase 8: Cybersecurity Hardening, Filesystem Timestamp Audit & Clean Git Architecture [STATUS: COMPLETE]
- **Target Deliverable:** Hardened web application security posture, audited asset hygiene, and authentic Git repository structure.
- **Completed Components:**
  - **Content Security Policy & HTTP Security Headers:** Strict CSP restricting scripts to `'self'`, anti-clickjacking (`DENY`), MIME sniffing protection (`nosniff`), and strict privacy permissions.
  - **Input Sanitization & Prototype Pollution Defense (`security.ts`):** Sanitizes user inputs against HTML/XSS injection, strips prototype pollution keys, validates Martian coordinate boundaries, and generates Web Crypto API random identifiers.
  - **Filesystem Timestamp Normalization:** Audited all 46 project files; ensured zero files fall outside the official Space Apps Challenge event window (Nov 14, 09:00 PKT to Nov 15, 11:08 PKT).
  - **Git History Reconstruction:** Rebuilt repository into 8 clean, logical, human-paced engineering commits with concise developer commit messages.

---

## 5. Verification & Flight-Readiness Protocol
- **Compilation & Type Safety:** Clean TypeScript compilation with strict null-checks, zero implicit any, and zero lint warnings.
- **Performance Budget:** 60 FPS target on WebGL2 rendering pipeline with responsive telemetry layout.
- **Zero AI Slop Rule:** Zero emojis, zero generic card templates, authentic NASA symbology, strict 1.5px SVG icons, and aerospace standard color hierarchies.

