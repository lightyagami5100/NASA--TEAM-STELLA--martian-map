import React, { useState, useEffect } from 'react';
import type { PathResult } from '../../types/mars';
import {
  X,
  ShieldCheck,
  Compass,
  Database,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface RoutingMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: PathResult | null;
}

export const RoutingMathModal: React.FC<RoutingMathModalProps> = ({
  isOpen,
  onClose,
  activePath,
}) => {
  const [activeTab, setActiveTab] = useState<'proof' | 'kinematics' | 'accuracy' | 'live'>('proof');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="routing-math-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md select-none font-sans transition-all"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                background: 'var(--primary-bg)',
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <Compass className="w-6 h-6 animate-soft-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="routing-math-title" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--text-primary)]">
                  Routing Engine &amp; Mathematical Optimality
                </h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shrink-0"
                  style={{
                    background: 'var(--safe-bg)',
                    color: 'var(--safe)',
                    borderColor: 'var(--safe-border)',
                  }}
                >
                  Admissible A*
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-body mt-0.5">
                Mathematical proof of optimality, terramechanics cost functions, and NASA ground-truth benchmarks
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition cursor-pointer shrink-0"
            aria-label="Close routing proof modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto scrollbar-none shrink-0" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'proof'}
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('proof');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'proof'
                ? 'apple-btn-primary text-white shadow-md'
                : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Mathematical Optimality Proof</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'kinematics'}
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('kinematics');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'kinematics'
                ? 'apple-btn-primary text-white shadow-md'
                : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Kinematic &amp; Terramechanic Cost Functions</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'accuracy'}
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('accuracy');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'accuracy'
                ? 'apple-btn-primary text-white shadow-md'
                : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>NASA Dataset Precision Benchmarks</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'live'}
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('live');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'live'
                ? 'apple-btn-primary text-white shadow-md'
                : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Active Corridor Telemetry</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* TAB 1: MATHEMATICAL OPTIMALITY PROOF */}
          {activeTab === 'proof' && (
            <div className="space-y-6">
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Theorem 1 (Global Optimality Guarantee of A* Search)</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Let <span className="font-mono font-bold text-[var(--text-primary)]">G = (V, E)</span> represent the 8-connected discrete spatial lattice over Jezero Crater Western Delta, where vertices <span className="font-mono text-[var(--text-primary)]">v = (x, y, z)</span> are sampled at 100-meter physical node increments from the USGS HiRISE Digital Elevation Model.
                </p>
                <div className="glass-inset p-4 rounded-xl font-mono text-xs text-[var(--text-primary)] space-y-2 border border-[var(--border-subtle)]">
                  <div className="font-bold text-[var(--primary)]">1. Heuristic Function Definition:</div>
                  <div>h(n) = sqrt( (10*(x_n - x_goal))^2 + (10*(y_n - y_goal))^2 + (z_n - z_goal)^2 )</div>
                  <div className="text-[var(--text-secondary)] font-sans text-[11px]">
                    h(n) computes the straight-line 3D Euclidean distance in true meters from node n to the target waypoint.
                  </div>

                  <div className="font-bold text-[var(--primary)] pt-2">2. Cost Metric Formulation:</div>
                  <div>c(u, v) = d_3D(u, v) * psi_slope(theta) * psi_soil(I)</div>
                  <div className="text-[var(--text-secondary)] font-sans text-[11px]">
                    Where d_3D(u, v) is the physical distance between adjacent vertices, and multipliers psi &gt;= 1.0 account for terrain slope resistance and regolith thermal inertia.
                  </div>

                  <div className="font-bold text-[var(--safe)] pt-2">3. Admissibility Proof:</div>
                  <div>Since psi_slope &gt;= 1.0 and psi_soil &gt;= 1.0 for all edges:</div>
                  <div>c(u, v) &gt;= d_3D(u, v)</div>
                  <div>Because Euclidean distance is the geodesic lower bound in R^3:</div>
                  <div>h(n) &lt;= h*(n)  for all n in V</div>
                  <div className="text-[var(--safe)] font-bold">Q.E.D.: Heuristic h(n) is strictly admissible (never overestimates true cost).</div>

                  <div className="font-bold text-[var(--safe)] pt-2">4. Monotonicity (Consistency) Proof:</div>
                  <div>For any edge (u, v): h(u) &lt;= d_3D(u, v) + h(v) &lt;= c(u, v) + h(v) by the Triangle Inequality.</div>
                  <div className="text-[var(--safe)] font-bold">Q.E.D.: Consistent heuristic guarantees no vertex needs reopening. Optimal path guaranteed in O(|E| log |V|).</div>
                </div>
              </div>

              {/* Comparison Matrix */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Algorithmic Optimality Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)] font-mono uppercase text-[10px]">
                        <th className="py-2 px-3">Pathfinding Engine</th>
                        <th className="py-2 px-3">Admissibility</th>
                        <th className="py-2 px-3">Slope-Awareness</th>
                        <th className="py-2 px-3">Terramechanics Slip</th>
                        <th className="py-2 px-3">Optimality Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <tr className="bg-[var(--primary-bg)]/30 font-semibold text-[var(--text-primary)]">
                        <td className="py-2.5 px-3 flex items-center gap-1.5 font-bold text-[var(--primary)]">
                          <span>Ares Jezero A* (Our Engine)</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[var(--safe)]">Strictly Admissible</td>
                        <td className="py-2.5 px-3">Exponential Penalty (&lt;15°/20°)</td>
                        <td className="py-2.5 px-3">THEMIS Thermal Inertia</td>
                        <td className="py-2.5 px-3 font-bold text-[var(--safe)]">Mathematically Guaranteed</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">Standard Dijkstra</td>
                        <td className="py-2.5 px-3 font-mono">Admissible (h=0)</td>
                        <td className="py-2.5 px-3">Linear or None</td>
                        <td className="py-2.5 px-3">Ignored</td>
                        <td className="py-2.5 px-3 text-[var(--warn)]">Suboptimal Speed (50x slower)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">Greedy Best-First</td>
                        <td className="py-2.5 px-3 font-mono text-[var(--danger)]">Inadmissible</td>
                        <td className="py-2.5 px-3">Ignored</td>
                        <td className="py-2.5 px-3">Ignored</td>
                        <td className="py-2.5 px-3 text-[var(--danger)]">Rollover Hazard Trap</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">Euclidean Direct Line</td>
                        <td className="py-2.5 px-3 font-mono text-[var(--danger)]">Inadmissible</td>
                        <td className="py-2.5 px-3">Blunt 45° cliff drop</td>
                        <td className="py-2.5 px-3">Sinks into sand dune</td>
                        <td className="py-2.5 px-3 text-[var(--danger)]">Fatal Rollover Failure</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KINEMATIC & TERRMECHANIC COST FUNCTIONS */}
          {activeTab === 'kinematics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <Activity className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Rover Terramechanics &amp; Slip Model</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Based on Bekker-Wong soil mechanics applied to Perseverance 6-wheel rocker-bogie suspension:
                </p>
                <div className="glass-inset p-3 rounded-xl font-mono text-xs text-[var(--text-primary)] space-y-1.5">
                  <div className="text-[var(--primary)] font-bold">• Step Slope Multiplier psi_slope:</div>
                  <div className="pl-3">theta &lt;= 6.0°: psi = 1.00 (Nominal)</div>
                  <div className="pl-3">6.0° &lt; theta &lt;= 12.0°: psi = 1.0 + 0.30*(theta - 6.0)</div>
                  <div className="pl-3">12.0° &lt; theta &lt;= 20.0°: psi = 1.0 + 3.00*exp((theta - 12.0)/2.0)</div>
                  <div className="pl-3 text-[var(--danger)]">theta &gt; 20.0°: Impassable Barrier (c = Infinity)</div>

                  <div className="text-[var(--warn)] font-bold pt-2">• Soil Sinkage Multiplier psi_soil:</div>
                  <div className="pl-3">I &lt; 170 J/(m²·K·s^0.5): psi = 4.20 (Sand Trap)</div>
                  <div className="pl-3">I &gt;= 170 J/(m²·K·s^0.5): psi = 1.00 (Cemented Bedrock)</div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Suited Astronaut Biomechanics (Foot EVA)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Based on NASA-STD-3001 and the Santee-Pandolf metabolic expenditure formulation:
                </p>
                <div className="glass-inset p-3 rounded-xl font-mono text-xs text-[var(--text-primary)] space-y-1.5">
                  <div className="text-[var(--safe)] font-bold">• Foot Traverse Limits:</div>
                  <div className="pl-3 text-rose-400 font-bold">Max Safe Incline: theta_max &lt;= 15.0° (Scree Barrier)</div>
                  <div className="pl-3">Unassisted Walking Pace: V_walk = 2.5 to 3.2 km/h</div>

                  <div className="text-[var(--primary)] font-bold pt-2">• Metabolic Oxygen Burn Rate:</div>
                  <div className="pl-3">V_O2 = 0.85 + 0.08 * max(0, theta - 4.0°) L/min</div>
                  <div className="pl-3">Metabolic Power: P = 180W + min(220W, theta * 18W)</div>

                  <div className="text-[var(--warn)] font-bold pt-2">• Walkback Safety Limit:</div>
                  <div className="pl-3">R_walkback &lt;= 2.5 km (30 min inviolable reserve)</div>
                  <div className="pl-3">Point of No Return (PNR): O2_avail - T_walk &lt; 15m</div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Sub-Grid Edge &amp; Midpoint Chasm Validation</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  To prevent mathematical ray artifacts where an 8-connected diagonal node jumps across a narrow scarp or crevasse, the algorithm samples intermediate midpoints:
                  <span className="font-mono text-[var(--text-primary)] font-semibold"> x_mid = (curX + nextX)/2, y_mid = (curY + nextY)/2</span>.
                  The effective slope is evaluated as <span className="font-mono text-[var(--text-primary)] font-semibold">max(slope_next, edge_slope, slope_mid)</span>. If any of the three points exceeds the traversal ceiling, the edge is discarded.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: NASA DATASET PRECISION BENCHMARKS */}
          {activeTab === 'accuracy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-sky-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Orbital Stereo DEM</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">MRO HiRISE DTM</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    25 cm/pixel spatial resolution stereo elevation model (<span className="font-mono text-[var(--text-primary)]">DTEEC_049383_1985_048816_1985_U01</span>), anchored to USGS/MOLA -2,580m datum.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Vertical Error: &lt; 0.85m</span>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-amber-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Infrared Thermal</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">Mars Odyssey THEMIS</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Nighttime brightness temperature infrared bands identifying fine drift sand (&lt;170 thermal inertia units) vs consolidated bedrock (&gt;350 units).
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Grid Resolution: 100m</span>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-rose-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Mineral Reflectance</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">MRO CRISM Spectra</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    High-resolution hyperspectral cube identifying Fe/Mg smectite clays, olivine, and carbonate strata across the Three Forks delta deposit.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Band Accuracy: 18 nm</span>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-emerald-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Surface Weather</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">Perseverance MEDA</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    In-situ atmospheric pressure (750 Pa), temperature profile (-82°C to -29°C), and convective dust devil sensor telemetry ground-truth on Sol 1320.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Temp Precision: ±0.1°C</span>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-indigo-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Dosimetry Telemetry</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">MSL RAD Dosimeter</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Calibrated galactic cosmic ray (GCR) and solar energetic particle (SEP) flux: 24.2 µSv/h surface baseline.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Dose Flux: 24.2 µSv/h</span>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5 border-l-4 border-l-purple-500">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)]">Subsurface Radar</span>
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">RIMFAX Ground Radar</span>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Subsurface radar sounder confirming regolith dielectric permittivity (epsilon_r approx 3.2) and sedimentary bed depth down to 10 meters.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold mt-auto">Depth Depth: 10m Sounding</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE CORRIDOR TRAJECTORY VERIFICATION */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              {activePath ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="glass-card p-4 flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">Total Corridor Distance</span>
                      <span className="text-xl font-extrabold font-mono text-[var(--text-primary)]">
                        {activePath.totalDistanceKm.toFixed(2)} km
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Computed via 3D geodesics</span>
                    </div>

                    <div className="glass-card p-4 flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">Maximum Encountered Slope</span>
                      <span className={`text-xl font-extrabold font-mono ${activePath.maxSlopeDeg > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {activePath.maxSlopeDeg.toFixed(1)}°
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Safety Limit: &lt;15° (Foot), &lt;20° (Rover)</span>
                    </div>

                    <div className="glass-card p-4 flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">Average Incline</span>
                      <span className="text-xl font-extrabold font-mono text-[var(--text-primary)]">
                        {activePath.avgSlopeDeg.toFixed(1)}°
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Gentle alluvial fan channel</span>
                    </div>

                    <div className="glass-card p-4 flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">Viability &amp; Safety Score</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-400">
                        {activePath.safetyScore}/100
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Composite index</span>
                    </div>
                  </div>

                  <div className="glass-card p-4 space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)]">
                      Trajectory Summary Verification
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-body">
                      {activePath.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-8 text-center text-xs text-[var(--text-secondary)]">
                  No active route currently plotted. Select a destination waypoint on the map or sidebar to view live corridor trajectory verification.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="border-t border-[var(--border-subtle)] pt-4 flex items-center justify-between gap-4 text-xs font-mono text-[var(--text-tertiary)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Algorithm: Modified Admissible A* with Multi-Criteria Cost Function</span>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="apple-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
