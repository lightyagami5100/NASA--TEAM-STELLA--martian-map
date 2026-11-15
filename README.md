# NASA Space Apps Challenge 2026: Team Stella
## Martian Surface Operations & Tactical EVA Telemetry System (ARES-OCTANT)

> **Live Operational Deployment:** [https://nasa-team-stella-martian-map.vercel.app/](https://nasa-team-stella-martian-map.vercel.app/)  
> **Official Space Apps Project Link:** [https://nasa-team-stella-martian-map.vercel.app/](https://nasa-team-stella-martian-map.vercel.app/)  
> **Repository:** [https://github.com/lightyagami5100/NASA--TEAM-STELLA--martian-map](https://github.com/lightyagami5100/NASA--TEAM-STELLA--martian-map)

ARES-OCTANT is an aerospace-grade mission control and extravehicular activity (EVA) navigation platform engineered for human exploration of Jezero Crater, Mars. The system complies with NASA Human Integration Design standards (NASA-STD-3001) and NASA EVA Flight Rules (EVA-FR-101 through 106).

---

### Executive Overview for Judges

When astronauts land on Mars, the 4 to 22-minute light-time delay prevents real-time tactical assistance from Earth mission control. Every surface traverse, life-support margin, and hazard avoidance decision must be calculated autonomously in the field.

Furthermore, astronaut dexterity is reduced by approximately 70 percent due to pressurized spacesuit gloves, direct Martian solar glare washes out standard screens, and treacherous terrain (loose sand drift traps in Seitah and steep crater scarps) poses severe rollover and entrapment risks.

Team Stella built ARES-OCTANT to solve these operational hurdles through three purpose-engineered interfaces, multi-spectral orbital GIS fusion, and physics-based bio-kinetic traverse routing.

---

### Primary Features

#### 1. Three Tailored Operational Interfaces

Astronauts and habitat operators operate under different physical constraints. ARES-OCTANT provides three switchable operational modes accessible via the top command bar or keyboard shortcuts (keys 1, 2, 3, and Escape):

- **Console Screen Mode (Hotkey 1):**
  Designed for habitat workstations and flight controllers. Features a dockable telemetry sidebar (reversible for left or right-handed use), an active waypoint inspector with elemental XRF breakdown, Google Earth-style orbital navigation controls, and the NASA MEDA atmospheric weather suite with diurnal temperature curves (-29 deg C to -84 deg C).

- **Astronaut Field Slate / Tablet Mode (Hotkey 2):**
  Designed for field slates mounted on spacesuit forearms, built to NASA-STD-3001 human factors specifications:
  - Minimum 48-pixel touch targets with an active glove mode toggle.
  - High-glare solar filter to maintain contrast under unattenuated Martian sunlight.
  - Left-hand / right-hand forearm docking toggle.
  - Portable Life Support System (PLSS) monitor tracking primary oxygen pressure (4.28 psi pure O2), water sublimator cooling loop, metabolic heat dissipation (Watts), suit leak rate (14 sccm), and dosimeter readings (24.2 micro-Sv/h).
  - Walkback Safety Limit & Point of No Return countdown (+52 minute buffer over mandatory 30-minute reserve).
  - EV-1 and EV-2 crew buddy proximity radar alerting if separation exceeds 100 meters (EVA-FR-102).
  - Mars Sample Return (MSR) drawer for 1-tap titanium sample core logging with hermetic seal verification and witness blank tracking.

- **Helmet Visor Augmented Reality HUD (Hotkey 3):**
  First-person 1.8-meter eye-level heads-up display:
  - 360-degree conformal compass heading tape with target bearing markers.
  - Waypoint locking reticle displaying distance and elevation delta.
  - Gold anti-glare sun shade visor filter toggle.
  - Simulated xEMU voice radio interface ("Nav to Kodiak", "Abort EVA").

#### 2. Calibrated Multimodal 3D Terrain Engine

The visualization pipeline supports three interchangeable terrain models:
- **Continuous DEM Plane:** Mathematical C1/C2 elevation grid synthesizing USGS MOLA and HiRISE elevation data of the Jezero Western Delta, Kodiak Butte, Belva Crater, and Seitah dunes.
- **NASA Mars Trek 323K Triangle STL Mesh:** Polygon model generated from orbiter laser altimetry, calibrated to the -2,580 meter datum.
- **NASA Mars Trek 970K Vertices OBJ Model:** High-resolution digital elevation mesh with normalized planar UV mapping and surface normal recalculation. Integrated with downward raycasting (y = 600) so that the rover, crew, and waypoint beacons stay clamped to the terrain without elevation drift.

#### 3. Multi-Spectral GIS Compositing Stack

Simultaneous GLSL shader layer compositing with independent opacity controls:
- **Optical Regolith:** MRO Context Camera (CTX) / HiRISE surface albedo.
- **Slope & Boulder Hazards:** High-visibility crimson pulse grid for steep slopes (>15 deg), amber hatching for moderate scree (10 to 15 deg), and clear corridors (<10 deg).
- **THEMIS Thermal Inertia:** Stippled cyan warning pattern identifying loose drift pockets and sand traps (<150 TIU).
- **CRISM Mineralogy:** Multi-band spectroscopy highlighting aqueous carbonates (magenta) and phyllosilicates/clays (emerald) in delta strata.
- **RAD Radiation Shielding:** Topographic dose exposure modeling natural shielding in crater floors versus exposed ridges.
- **USGS Elevation Contours:** Anti-aliased screen-space derivative (fwidth) isolines with 10-meter minor and 50-meter index intervals.

#### 4. Bio-Kinetic Traverse Routing (Minetti Model)

Traverse paths are calculated using an A* pathfinder integrated with the Minetti (2002) cost-of-transport polynomial. The engine accounts for:
- Metabolic power expenditure (Watts) and oxygen consumption based on terrain slope and walking velocity.
- The 140 kg combined mass of an astronaut and their PLSS suit in 0.38g gravity.
- Dynamic rerouting away from unnavigable slopes (>20 deg) and loose sand hazards.

---

### NASA EVA Flight Rules Compliance

| Rule ID | Operational Rule | Implementation in ARES-OCTANT |
|---|---|---|
| EVA-FR-101 | Walkback Safety Limit | Unassisted walking distance cannot exceed remaining primary oxygen minus mandatory 30-minute reserve. Point of No Return countdown evaluated continuously. |
| EVA-FR-102 | Buddy Separation | EV-1 and EV-2 must stay within 100 meters nominal distance (150 meters maximum redline). Audio alert triggers on limit breach. |
| EVA-FR-103 | Terrain Traversability | Traversing slopes greater than 15 degrees requires safety tether or switchback routing; slopes greater than 25 degrees are strictly avoided. |
| EVA-FR-104 | Radiation ALARA | Sortie aborts if cumulative dose exceeds 100 micro-Sv or instantaneous flux exceeds 50 micro-Sv/h. Safe scarp routes mapped during solar particle alerts. |
| EVA-FR-105 | Dust Devil Protocol | If a convective vortex produces core pressure drop greater than 3.0 Pa or wind exceeds 15 m/s within 2 km, crew must tether and shelter behind the rover. |
| EVA-FR-106 | Sample Caching | Geological core tubes must be verified for hermetic seal integrity, witness blank status, and serial registration before caching. |

---

### Cybersecurity and Architecture Hardening

ARES-OCTANT incorporates enterprise-grade web application security controls:
- **Content Security Policy (CSP):** Restricts script and resource loading strictly to authorized origin sources.
- **HTTP Security Headers:** Anti-clickjacking (X-Frame-Options: DENY), MIME sniffing defense (X-Content-Type-Options: nosniff), and strict referrer policy.
- **Input Sanitization:** Neutralizes XSS vectors, script injection, and pseudo-protocols in search queries and sample log inputs.
- **Prototype Pollution Defense:** Recursive JSON parsing rejects dangerous object keys (__proto__, constructor, prototype).
- **Cryptographic Identifiers:** Web Crypto API (crypto.getRandomValues) used for generating secure sample tube serials and mission IDs.

---

### Technical Architecture

- **Frontend Core:** React 18 with TypeScript in strict mode
- **3D Graphics:** Three.js with custom GLSL vertex and fragment shaders
- **Styling:** Tailwind CSS with custom aerospace dark telemetry design tokens
- **Build System:** Vite 8 (build completes in ~1.1 seconds)
- **Audio:** Web Audio API tactical synthesizer for avionics feedback (zero external audio files)

---

### Quickstart Guide

#### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

#### Installation and Local Execution

```bash
# Clone the repository
git clone https://github.com/lightyagami5100/NASA--TEAM-STELLA--martian-map.git
cd NASA--TEAM-STELLA--martian-map

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

#### Production Build

```bash
# Compile and package for production
npm run build

# Preview production build locally
npm run preview
```

---

### Official NASA Dataset Attributions

- **Elevation Models:** USGS Astrogeology / NASA Mars Global Surveyor MOLA & MRO HiRISE Digital Terrain Models centered on the Jezero Western Delta (18.38 deg N, 77.58 deg E).
- **Surface Imagery:** NASA Mars Reconnaissance Orbiter Context Camera (CTX) mosaics and Mars Trek 3D Jezero surface terrain models.
- **Spectroscopy:** NASA MRO Compact Reconnaissance Imaging Spectrometer for Mars (CRISM) spectral data; Mars 2020 PIXL/SHERLOC ground-truth.
- **Atmospheric Weather:** NASA Mars 2020 Perseverance Rover MEDA (Mars Environmental Dynamics Analyzer) diurnal pressure, temperature, UV, and optical depth records.
- **Subsurface Profiling:** NASA Mars 2020 RIMFAX ground-penetrating radar dielectric permittivity data.

---

### Team Stella & License

Developed by **Team Stella** for the **2026 NASA Space Apps Challenge**.  
Licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for full license details.
