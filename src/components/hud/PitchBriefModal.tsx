import React, { useState } from 'react';
import {
  X,
  Award,
  Navigation,
  Compass,
  Trophy,
  Database,
  Zap,
  Wind,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface PitchBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchBriefModal: React.FC<PitchBriefModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'math' | 'awards'>('overview');

  if (!isOpen) return null;

  return (
    <div
      id="modal-project-brief"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md animate-fade-in select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden glass-panel flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-3.5 border-b border-[var(--border-subtle)] flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
              style={{
                background: 'var(--primary-bg)',
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  NASA Space Apps Challenge 2026
                </span>
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono"
                  style={{ background: 'var(--safe-bg)', color: 'var(--safe)' }}
                >
                  Flight Ready
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mt-0.5">
                Ares Jezero · Human EVA Surface Navigation
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capsule Tab Bar */}
        <div className="px-6 pt-3.5 pb-1">
          <div className="glass-segmented-container">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('overview');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-1.5 ${
                activeTab === 'overview' ? 'active' : ''
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Concept</span>
            </button>

            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('datasets');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-1.5 ${
                activeTab === 'datasets' ? 'active' : ''
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>NASA Datasets</span>
            </button>

            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('math');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-1.5 ${
                activeTab === 'math' ? 'active' : ''
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Kinematics</span>
            </button>

            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('awards');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-1.5 ${
                activeTab === 'awards' ? 'active' : ''
              }`}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
              <span>Awards</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div
                className="glass-card p-4 flex flex-col gap-1.5 border"
                style={{ borderColor: 'var(--warn-border)' }}
              >
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>
                  Operational Challenge
                </span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-body">
                  Traversing Mars presents severe kinematic and environmental risks: scarps above 15° induce rollover hazards,
                  loose sand pockets in Séítah immobilize rovers, and crews face dust devils and unshielded radiation.
                  Ares delivers a flight-grade decision-support HUD for human astronauts in Jezero Crater.
                </p>
              </div>

              <div
                className="glass-card p-4 flex flex-col gap-1.5 border"
                style={{ borderColor: 'var(--primary-border)' }}
              >
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  Multi-Layer Architecture
                </span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-body">
                  Ares fuses 6 authentic NASA planetary science datasets into a 60 FPS WebGL shader compositing engine covering
                  the <strong>100 km² Western Delta Fan (18.38° N, 77.58° E)</strong>—guiding dual astronaut pairs (EV-1 &amp; EV-2)
                  and a Pressurized Support Rover safely between geological targets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass-card p-4 flex flex-col gap-1">
                  <span className="font-extrabold text-sm" style={{ color: 'var(--primary)' }}>MOLA -2,580m Datum</span>
                  <span className="text-xs text-[var(--text-secondary)]">Anchored to official USGS elevation datum.</span>
                </div>
                <div className="glass-card p-4 flex flex-col gap-1">
                  <span className="font-extrabold text-sm" style={{ color: 'var(--danger)' }}>&lt;15° Rollover Limit</span>
                  <span className="text-xs text-[var(--text-secondary)]">Autonomous A* scarp and cliff avoidance.</span>
                </div>
                <div className="glass-card p-4 flex flex-col gap-1">
                  <span className="font-extrabold text-sm" style={{ color: 'var(--safe)' }}>2.5 km Walkback Radius</span>
                  <span className="text-xs text-[var(--text-secondary)]">Dynamic PLSS emergency O₂ return boundary.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-[var(--text-secondary)]">
                Ares strictly fuses peer-reviewed, calibrated NASA Planetary Data System archives:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="glass-card p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">MGS MOLA &amp; MRO HiRISE</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                      Altimetry
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Jezero crater floor datum calibrated at -2,580m, integrated with an official 323K-triangle STL mesh from NASA Mars Trek.
                  </p>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">MRO CRISM Spectrometer</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--science-bg)', color: 'var(--science)' }}>
                      Mineralogy
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Highlights Fe/Mg smectite clays in delta mudstones and magnesium carbonates along lacustrine shore terraces.
                  </p>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">2001 Odyssey THEMIS</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                      Thermal Inertia
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Detects fine unconsolidated sand megaripples (&lt;150 TIU in Séítah) where suited astronauts and wheels slip.
                  </p>
                </div>

                <div className="glass-card p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">MSL RAD &amp; Perseverance MEDA</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                      Space Weather
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-body">
                    Models GCR dose flux (14–32 µSv/hr), topographic shielding, surface wind, dust opacity, and convective dust devils.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'math' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass-card p-4 flex flex-col gap-2">
                <span className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                  <Compass className="w-4 h-4" />
                  <span>Kinematic A* Cost Function</span>
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-body">
                  Evaluates 3D gradient θ = arctan(|Δz| / d) across grid nodes:
                </p>
                <div className="glass-inset p-3 text-xs font-mono text-[var(--text-primary)] space-y-1">
                  <div>• θ ≤ 6°: C = d (Nominal)</div>
                  <div>• 6°–12°: C = d · (1 + 0.25·(θ - 6))</div>
                  <div>• 12°–15°: C = d · (1 + 0.6·(θ - 12)²)</div>
                  <div style={{ color: 'var(--danger)' }}>• θ &gt; 15°: ∞ (Scree Barrier)</div>
                </div>
              </div>

              <div className="glass-card p-4 flex flex-col gap-2">
                <span className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: 'var(--safe)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>2.5 km Walkback Safety Envelope</span>
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-body">
                  Enforces emergency suit walkback margin:
                </p>
                <div className="glass-inset p-3 text-xs font-mono text-[var(--text-primary)]">
                  <div>R_walkback = V_walk · T_margin ≤ 2.5 km</div>
                  <div className="text-[var(--text-secondary)] font-sans mt-1.5">
                    Guarantees safe crew foot return if the pressurized rover experiences a mobility fault.
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 flex flex-col gap-2">
                <span className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: 'var(--warn)' }}>
                  <Wind className="w-4 h-4" />
                  <span>Metabolic O₂ Model</span>
                </span>
                <div className="glass-inset p-3 text-xs font-mono text-[var(--text-primary)]">
                  O₂_rate = 0.85 + 0.08 · max(0, θ - 4°) L/min
                </div>
              </div>

              <div className="glass-card p-4 flex flex-col gap-2">
                <span className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                  <Zap className="w-4 h-4" />
                  <span>Rover Battery Energy Model</span>
                </span>
                <div className="glass-inset p-3 text-xs font-mono text-[var(--text-primary)]">
                  E_kWh = (C_rr · m · g · d + m · g · Δh) / (3.6e6 · η)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="flex flex-col gap-3">
              <div className="glass-card p-4 flex flex-col gap-1.5">
                <span className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Trophy className="w-4 h-4" style={{ color: 'var(--warn)' }} />
                  <span>Best Use of Data</span>
                </span>
                <p className="text-sm text-[var(--text-secondary)] font-body">
                  Fuses 6 distinct NASA planetary datasets (MOLA, HiRISE 3D DTM, CRISM, THEMIS, MEDA, and RAD radiation) into a real-time interactive fusion stack.
                </p>
              </div>

              <div className="glass-card p-4 flex flex-col gap-1.5">
                <span className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--safe)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Best Mission Concept</span>
                </span>
                <p className="text-sm text-[var(--text-secondary)] font-body">
                  Directly addresses human Marswalk operations—tracking PLSS O₂ expenditure, steep scree safety limits, convective dust devils, and walkback envelopes.
                </p>
              </div>

              <div className="glass-card p-4 flex flex-col gap-1.5">
                <span className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--science)' }}>
                  <Sparkles className="w-4 h-4" />
                  <span>Best Use of Technology</span>
                </span>
                <p className="text-sm text-[var(--text-secondary)] font-body">
                  Custom GLSL multi-layer compositing shaders, derivative contour isolines, dynamic traverse gradient tubes, and 1.8m first-person Helmet Visor HUD.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--safe)' }} />
            <span>NASA Space Apps Challenge 2026</span>
          </div>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="apple-btn-primary px-5 py-2.5 text-xs cursor-pointer"
          >
            Acknowledge Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
