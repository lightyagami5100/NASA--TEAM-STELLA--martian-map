import React, { useState } from 'react';
import type { Waypoint } from '../../types/mars';
import {
  X,
  FlaskConical,
  ArrowRight,
  Shield,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface WaypointInspectorProps {
  waypoint: Waypoint | null;
  onClose: () => void;
  onSetStart: (wp: Waypoint) => void;
  onSetGoal: (wp: Waypoint) => void;
  dockSide?: 'left' | 'right';
}

export const WaypointInspector: React.FC<WaypointInspectorProps> = ({
  waypoint,
  onClose,
  onSetStart,
  onSetGoal,
  dockSide = 'left',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'science'>('overview');

  if (!waypoint) return null;

  const science = waypoint.scienceData;
  const positionClass = dockSide === 'left' ? 'right-4' : 'left-4';

  const typeDotColor =
    waypoint.type === 'Habitat / Base Camp'
      ? 'var(--safe-bright)'
      : waypoint.type === 'Sample Cache Depot'
      ? 'var(--warn-bright)'
      : waypoint.type === 'Hazard Zone'
      ? 'var(--danger-bright)'
      : 'var(--primary)';

  return (
    <div
      id="waypoint-inspector"
      aria-label="Waypoint details inspector"
      className={`fixed top-[92px] ${positionClass} bottom-4 z-20 w-[416px] max-w-[calc(100vw-2rem)] glass-panel flex flex-col overflow-hidden animate-fade-in select-none font-sans pointer-events-auto`}
    >
      {/* 1. Pinned Header */}
      <div className="p-5 pb-3.5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border-2"
            style={{
              borderColor: 'var(--primary)',
              backgroundColor: 'var(--bg-glass-inset)',
            }}
          >
            {waypoint.surfacePov?.imageUrl ? (
              <img
                src={waypoint.surfacePov.imageUrl}
                alt={waypoint.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6" style={{ color: 'var(--warn)' }} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: typeDotColor }}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] truncate">
                {waypoint.type}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight leading-snug mt-0.5 truncate">
              {waypoint.name}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <span>{waypoint.lat}° N, {waypoint.lon}° E</span>
              <span>·</span>
              <strong className="text-[var(--text-primary)]">{waypoint.elevation}m</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onClose();
          }}
          className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Pinned Capsule Tabs */}
      <div className="px-5 pt-3.5 pb-1 shrink-0">
        <div className="glass-segmented-container">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('overview');
            }}
            className={`glass-segmented-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview &amp; Cache
          </button>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('science');
            }}
            className={`glass-segmented-item flex items-center justify-center gap-1.5 ${
              activeTab === 'science' ? 'active' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
            <span>Ground-Truth &amp; XRF</span>
          </button>
        </div>
      </div>

      {/* 3. Scrollable Big-Legibility Body */}
      <div className="flex-1 overflow-y-auto px-5 py-3.5 flex flex-col gap-3.5">
        {activeTab === 'overview' && (
          <>
            {/* Description */}
            <p className="glass-card p-4 text-sm leading-relaxed text-[var(--text-primary)] font-body">
              {waypoint.description}
            </p>

            {/* Cached Sample Tube Card */}
            {waypoint.sampleTube && (
              <div
                className="glass-card p-4 flex flex-col gap-2.5 border"
                style={{ borderColor: 'var(--warn-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>
                    <FlaskConical className="w-4 h-4" />
                    <span>Perseverance Cache Tube</span>
                  </div>
                  <span
                    className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}
                  >
                    {waypoint.sampleTube.tubeId}
                  </span>
                </div>

                <div className="text-base font-extrabold text-[var(--text-primary)]">
                  &ldquo;{waypoint.sampleTube.name}&rdquo;
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="glass-inset p-3">
                    <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                      Lithology
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {waypoint.sampleTube.rockType}
                    </span>
                  </div>
                  <div className="glass-inset p-3">
                    <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                      Biosignature Potential
                    </span>
                    <span className="text-sm font-extrabold" style={{ color: 'var(--safe)' }}>
                      {waypoint.sampleTube.biosignatureRating}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)] pt-1">
                  <span>Core: <strong className="text-[var(--text-primary)]">{waypoint.sampleTube.coreLengthMm} mm</strong></span>
                  <span>Sol: <strong className="text-[var(--text-primary)]">{waypoint.sampleTube.collectionSol}</strong></span>
                </div>
              </div>
            )}

            {/* Big Telemetry Meta Cards (Flux drawer-meta-grid) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="glass-card p-3.5 col-span-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Geologic Regolith
                </span>
                <span className="text-sm font-extrabold text-right" style={{ color: 'var(--primary)' }}>
                  {waypoint.spectralSignature}
                </span>
              </div>

              <div className="glass-card p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                  Thermal Inertia
                </span>
                <span className="text-lg font-extrabold font-mono text-[var(--text-primary)] mt-0.5 block">
                  {waypoint.thermalInertia} <span className="text-xs font-semibold text-[var(--text-secondary)]">TIU</span>
                </span>
              </div>

              <div className="glass-card p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Hazard Rating</span>
                </span>
                <span className="text-sm font-extrabold mt-1 block" style={{ color: 'var(--warn)' }}>
                  {waypoint.hazardRating}
                </span>
              </div>
            </div>

            {/* Deployed NASA Instruments */}
            {waypoint.instruments && waypoint.instruments.length > 0 && (
              <div className="glass-card p-4 flex flex-col gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  NASA Perseverance Payload Deployed
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {waypoint.instruments.map((inst) => (
                    <span
                      key={inst}
                      className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold border"
                      style={{
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary-border)',
                      }}
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'science' && (
          <>
            {/* Surface Reconnaissance Photo & Notes */}
            {waypoint.surfacePov && (
              <div className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                    <Camera className="w-4 h-4" />
                    <span>Surface Optical Recon</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full glass-inset text-[var(--text-secondary)]">
                    {waypoint.surfacePov.camera}
                  </span>
                </div>

                {waypoint.surfacePov.imageUrl && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black/10">
                    <img
                      src={waypoint.surfacePov.imageUrl}
                      alt={waypoint.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="glass-inset p-3 text-[13px] italic text-[var(--text-primary)] leading-relaxed font-body">
                  &ldquo;{waypoint.surfacePov.caption}&rdquo;
                </div>

                <div
                  className="p-3 rounded-xl text-xs leading-relaxed font-body border"
                  style={{
                    background: 'var(--warn-bg)',
                    color: 'var(--warn)',
                    borderColor: 'var(--warn-border)',
                  }}
                >
                  <strong className="font-sans font-extrabold">Crew Advisory: </strong>
                  {waypoint.surfacePov.visualNotes}
                </div>
              </div>
            )}

            {/* Rock Lithology & Petrophysics */}
            {science && (
              <div className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                    <Layers className="w-4 h-4" />
                    <span>Lithology &amp; Petrophysics</span>
                  </span>
                  <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--safe)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                    Unit Classification
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{science.lithology}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="glass-inset p-2.5">
                    <span className="text-[10px] font-sans font-bold uppercase text-[var(--text-tertiary)] block">
                      Grain
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{science.grainSize}</span>
                  </div>
                  <div className="glass-inset p-2.5">
                    <span className="text-[10px] font-sans font-bold uppercase text-[var(--text-tertiary)] block">
                      Hardness
                    </span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--warn)' }}>
                      {science.hardnessMohs} Mohs
                    </span>
                  </div>
                  <div className="glass-inset p-2.5">
                    <span className="text-[10px] font-sans font-bold uppercase text-[var(--text-tertiary)] block">
                      Density
                    </span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--primary)' }}>
                      {science.densityGCm3} g/cm³
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Raman / Micro-XRF Spectrum */}
            {science?.spectrum && (
              <div className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                    <Activity className="w-4 h-4" />
                    <span>{science.spectrum.instrument}</span>
                  </span>
                  <span
                    className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'var(--safe-bg)', color: 'var(--safe)' }}
                  >
                    Match {science.spectrum.confidenceScore}%
                  </span>
                </div>

                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  Target: <strong className="text-[var(--text-primary)]">{science.spectrum.targetName}</strong>
                </div>

                <div className="h-32 glass-inset p-3 flex flex-col justify-between overflow-hidden">
                  <div className="h-20 flex items-end justify-around gap-2 px-1">
                    {science.spectrum.peaks.map((pk, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{
                            height: `${pk.intensity}%`,
                            background: 'linear-gradient(to top, #0071E3, #38BDF8, #FF9500)',
                          }}
                        />
                        <span className="text-[9px] text-[var(--text-secondary)] truncate w-full text-center mt-1 font-mono font-semibold">
                          {pk.label.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono pt-1 border-t border-[var(--border-subtle)]">
                    <span>500 {science.spectrum.peaks[0]?.unit}</span>
                    <span>1200</span>
                    <span>1800 {science.spectrum.peaks[0]?.unit}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] font-semibold">Mineral Match:</span>
                    <strong className="text-sm" style={{ color: 'var(--warn)' }}>
                      {science.spectrum.mineralMatch}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[var(--text-secondary)] font-semibold">Elements:</span>
                    {science.spectrum.elementsDetected.map((el) => (
                      <span
                        key={el}
                        className="px-2 py-0.5 rounded-md glass-inset text-[var(--text-primary)] text-[11px] font-mono font-bold"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Pinned Bottom Actions */}
      <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3 shrink-0">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSetStart(waypoint);
          }}
          className="apple-btn-secondary py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--safe-bright)' }} />
          <span>Set Origin</span>
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSetGoal(waypoint);
          }}
          className="apple-btn-primary py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Set Target</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
