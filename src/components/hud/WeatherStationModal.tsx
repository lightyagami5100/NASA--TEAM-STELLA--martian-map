import React, { useState } from 'react';
import {
  X,
  Wind,
  Sun,
  Moon,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Gauge,
  Thermometer,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface WeatherStationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherStationModal: React.FC<WeatherStationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'groundtruth'>('overview');

  if (!isOpen) return null;

  const diurnalTemps = [
    { hour: '00', temp: -78 },
    { hour: '03', temp: -82 },
    { hour: '05', temp: -84 },
    { hour: '08', temp: -68 },
    { hour: '11', temp: -38 },
    { hour: '13', temp: -22 },
    { hour: '15', temp: -30 },
    { hour: '17', temp: -52 },
    { hour: '19', temp: -68 },
    { hour: '21', temp: -74 },
    { hour: '24', temp: -78 },
  ];

  const width = 420;
  const height = 110;
  const minTemp = -92;
  const maxTemp = -10;
  const tempRange = maxTemp - minTemp;

  const points = diurnalTemps.map((d, i) => {
    const x = (i / (diurnalTemps.length - 1)) * width;
    const y = height - ((d.temp - minTemp) / tempRange) * (height - 24) - 12;
    return { x, y, ...d };
  });

  const svgPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');

  // Current 14:39 LMST sits at ~82.5% between index 5 (13h: -22°C) and index 6 (15h: -30°C) -> ~-29°C right on curve
  const currentTempX = (5.825 / 10) * width;
  const currentTempY = height - ((-29 - minTemp) / tempRange) * (height - 24) - 12;

  return (
    <div
      id="modal-weather-station"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md animate-fade-in select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden glass-panel flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-3.5 border-b border-[var(--border-subtle)] flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
              style={{
                background: 'var(--warn-bg)',
                borderColor: 'var(--warn-border)',
                color: 'var(--warn)',
              }}
            >
              <Wind className="w-6 h-6 animate-soft-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>
                  NASA MEDA Atmospheric Suite
                </span>
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono"
                  style={{ background: 'var(--safe-bg)', color: 'var(--safe)' }}
                >
                  Live Sol 1320
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mt-0.5">
                Jezero Weather, Dust Devils &amp; Diurnal Cycle
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

        {/* Capsule Tabs */}
        <div className="px-6 pt-3.5 pb-1">
          <div className="glass-segmented-container">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('overview');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-2 ${
                activeTab === 'overview' ? 'active' : ''
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>Atmospheric Overview</span>
            </button>

            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab('groundtruth');
              }}
              className={`glass-segmented-item flex items-center justify-center gap-2 ${
                activeTab === 'groundtruth' ? 'active' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Perseverance Rover Ground-Truth</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 font-body">
          {activeTab === 'overview' && (
            <>
              {/* Active Dust Devil Alert Banner */}
              <div
                className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border"
                style={{ borderColor: 'var(--warn-border)', background: 'var(--warn-bg)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 shrink-0" style={{ color: 'var(--warn)' }}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-extrabold text-[var(--text-primary)] text-sm">
                        Dust Devil Convective Vortex Active
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase font-sans"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                      >
                        Hazard Alert
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] opacity-85 mt-1 leading-relaxed">
                      Passing 1.4 km NW of Kodiak Butte. Core pressure drop: <strong className="font-mono">-4.8 Pa</strong> ·
                      Peak gust: <strong className="font-mono">18.5 m/s (66.6 km/h)</strong> · Opacity: <strong className="font-mono">τ = 0.65</strong>.
                    </p>
                  </div>
                </div>
                <div className="glass-card px-3.5 py-2 text-center shrink-0">
                  <span className="text-[10px] font-sans font-bold uppercase text-[var(--text-secondary)] block">
                    Crew Advisory
                  </span>
                  <span className="text-xs font-sans font-extrabold" style={{ color: 'var(--warn)' }}>
                    Maintain Tether
                  </span>
                </div>
              </div>

              {/* Diurnal Temperature Wave Card */}
              <div className="p-5 glass-card flex flex-col gap-3 font-sans">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">-29°C</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                        Air Temp (14:39 LMST) · 24h Mean: -61°C
                      </span>
                      <div className="flex items-center gap-2.5 text-xs font-mono font-bold flex-wrap">
                        <span className="flex items-center gap-1" style={{ color: 'var(--warn)' }}>
                          <Sun className="w-3.5 h-3.5" /> High: -22°C
                        </span>
                        <span className="text-[var(--text-tertiary)]">·</span>
                        <span className="flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                          <Moon className="w-3.5 h-3.5" /> Low: -84°C Air (-98°C Soil)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl glass-inset text-[var(--text-primary)] text-xs font-mono font-bold">
                    LMST 14:39:19
                  </div>
                </div>

                {/* Spline Wave */}
                <div className="relative pt-2">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
                    <defs>
                      <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.38" />
                        <stop offset="100%" stopColor="#0071E3" stopOpacity="0.04" />
                      </linearGradient>
                    </defs>
                    <path d={`${svgPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#tempGradient)" />
                    <path d={svgPath} fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

                    {points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={p.hour === '13' || p.hour === '05' ? 4.5 : 2.5}
                          fill="#FFFFFF"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                        />
                        <text
                          x={p.x}
                          y={height + 14}
                          textAnchor="middle"
                          fill="currentColor"
                          fillOpacity="0.55"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.hour}h
                        </text>
                      </g>
                    ))}

                    <line
                      x1={currentTempX}
                      y1={0}
                      x2={currentTempX}
                      y2={height}
                      stroke="#0071E3"
                      strokeWidth="1.8"
                      strokeDasharray="3 3"
                    />
                    <circle cx={currentTempX} cy={currentTempY} r={5.5} fill="#0071E3" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* 4 Big Meteorological Parameter Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                <div className="p-4 glass-card flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px]">
                    <span className="font-extrabold uppercase tracking-wider">Wind Speed</span>
                    <Wind className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      8.4 <span className="text-xs font-bold text-[var(--text-secondary)]">m/s</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1 font-medium">
                      <Compass className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
                      <span>245° WSW</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 glass-card flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px]">
                    <span className="font-extrabold uppercase tracking-wider">Pressure</span>
                    <Gauge className="w-4 h-4" style={{ color: 'var(--safe)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      724 <span className="text-xs font-bold text-[var(--text-secondary)]">Pa</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                      7.24 mbar (-2.56km)
                    </div>
                  </div>
                </div>

                <div className="p-4 glass-card flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px]">
                    <span className="font-extrabold uppercase tracking-wider">Humidity</span>
                    <Radio className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      &lt;0.2 <span className="text-xs font-bold text-[var(--text-secondary)]">%</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                      Night Peak ~68%
                    </div>
                  </div>
                </div>

                <div className="p-4 glass-card flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px]">
                    <span className="font-extrabold uppercase tracking-wider">Solar UV</span>
                    <ShieldAlert className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--danger)' }}>
                      38.5 <span className="text-xs font-bold text-[var(--text-secondary)]">W/m²</span>
                    </div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--warn)' }}>
                      Extreme UV
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'groundtruth' && (
            <div className="flex flex-col gap-3.5 font-sans">
              <div className="glass-card p-4.5">
                <span className="font-extrabold text-[15px] text-[var(--text-primary)] block mb-1.5">
                  Perseverance MEDA &amp; MSL RAD Reference Calibration
                </span>
                <p className="text-[13.5px] font-medium text-[var(--text-secondary)] leading-relaxed">
                  Baseline weather profiles are calibrated against published Mars 2020 Perseverance MEDA diurnal climatology ranges (seasonal means 204–232 K / -69°C to -41°C, highs -20°C to -33°C, lows -80°C to -111°C ground skin).
                </p>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] glass-inset text-xs text-[var(--text-secondary)] uppercase font-sans font-extrabold tracking-wide">
                      <th className="p-3.5">Parameter</th>
                      <th className="p-3.5">Published MEDA / RAD Baseline</th>
                      <th className="p-3.5">Dashboard Model</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-sans text-[13px] font-semibold">
                    {[
                      { label: 'Afternoon Temp (14:39)', rover: '-25°C to -33°C (MEDA ATS)', model: '-29.0 °C', match: 'Calibrated' },
                      { label: '24h Diurnal Mean', rover: '-41°C to -69°C (204–232 K)', model: '-61.0 °C', match: 'Calibrated' },
                      { label: 'Jezero Pressure', rover: '650–850 Pa (PS Barometer)', model: '724 Pa', match: 'Calibrated' },
                      { label: 'Wind Speed', rover: '2–10 m/s nominal (WS Booms)', model: '8.4 m/s', match: 'Calibrated' },
                      { label: 'Surface GCR Dose', rover: '~0.6 mSv/day (MSL RAD)', model: '24.2 µSv/hr', match: 'Calibrated' },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="p-3.5 font-extrabold text-[var(--text-primary)]">{row.label}</td>
                        <td className="p-3.5 font-semibold text-[var(--text-secondary)]">{row.rover}</td>
                        <td className="p-3.5 font-extrabold" style={{ color: 'var(--primary)' }}>{row.model}</td>
                        <td className="p-3.5 font-extrabold" style={{ color: 'var(--safe)' }}>{row.match}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="p-4 rounded-2xl border flex items-center gap-2.5 text-[13px] font-bold"
                style={{ background: 'var(--safe-bg)', borderColor: 'var(--safe-border)', color: 'var(--safe)' }}
              >
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Baseline values anchored to NASA Mars 2020 MEDA Climatology &amp; MSL RAD measurements.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            NASA Mars 2020 Perseverance MEDA Science Team
          </span>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="apple-btn-primary px-5 py-2.5 text-xs cursor-pointer"
          >
            Close Weather Suite
          </button>
        </div>
      </div>
    </div>
  );
};
