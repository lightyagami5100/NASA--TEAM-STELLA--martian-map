import React, { useState, useEffect } from 'react';
import { Radio, Battery, Gauge, Eye, ShieldCheck, Zap, X, Camera, Compass, Disc } from 'lucide-react';
import type { LiveRoverFeedData } from '../../types/mars';
import { tacticalAudio } from '../../utils/audio';

interface LiveRoverFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: LiveRoverFeedData;
}

export const LiveRoverFeedModal: React.FC<LiveRoverFeedModalProps> = ({
  isOpen,
  onClose,
  telemetry: initialTelemetry,
}) => {
  const [activeCam, setActiveCam] = useState<'hazcam' | 'navcam' | 'mastcam' | 'rimfax'>('hazcam');
  const [telemetry, setTelemetry] = useState<LiveRoverFeedData>(initialTelemetry);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [packetTick, setPacketTick] = useState(0);

  // Simulated DSN telemetry live streaming updates
  useEffect(() => {
    if (!isOpen || !isLiveStreaming) return;
    const interval = setInterval(() => {
      setPacketTick((prev) => prev + 1);
      setTelemetry((prev) => ({
        ...prev,
        driveCurrentAmps: Number((4.6 + Math.sin(Date.now() / 2000) * 0.8).toFixed(1)),
        wheelSlipPercent: Number((5.8 + Math.cos(Date.now() / 3200) * 1.5).toFixed(1)),
        batteryPercent: Math.max(75, Number((prev.batteryPercent - 0.002).toFixed(2))),
        pitchDeg: Number((2.4 + Math.sin(Date.now() / 1500) * 0.4).toFixed(1)),
        rollDeg: Number((-1.1 + Math.cos(Date.now() / 1800) * 0.3).toFixed(1)),
        downlinkKbps: Math.round(2048 + Math.sin(Date.now() / 4000) * 128),
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen, isLiveStreaming]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-glass)]"
        style={{
          background: 'var(--bg-glass-elevated)',
          backdropFilter: 'blur(36px) saturate(180%)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-glass-inset)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-500">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Perseverance Rover Live Telemetry &amp; Camera Feed</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  DSN 34m DSS-14 RELAY ACTIVE
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Sol {telemetry.sol} · {telemetry.lmst} LMST · Mars Distance 1.48 AU · Roundtrip Delay 14m 24s
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Camera Viewfinder with HUD Overlay */}
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-highlight)] bg-black shadow-inner aspect-video max-h-[380px] flex items-center justify-center">
            {/* Camera View Content */}
            {activeCam === 'hazcam' && (
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-[#2a140d] via-[#4d2417] to-[#1a0a06]">
                {/* Simulated Martian Terrain View */}
                <div className="absolute inset-0 opacity-80 mix-blend-screen pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-600/40 via-red-900/20 to-transparent" />
                <div className="absolute bottom-0 w-full h-28 bg-[#180804] rounded-t-[50%] blur-sm opacity-90" />
                {/* Rover Front Wheel Treads in FOV */}
                <div className="absolute bottom-2 left-10 w-16 h-24 bg-zinc-800 rounded-lg border-2 border-zinc-600 shadow-2xl flex flex-col justify-around py-1 px-0.5 opacity-90">
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                </div>
                <div className="absolute bottom-2 right-10 w-16 h-24 bg-zinc-800 rounded-lg border-2 border-zinc-600 shadow-2xl flex flex-col justify-around py-1 px-0.5 opacity-90">
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                  <div className="h-1 bg-zinc-600 rounded" />
                </div>
                <div className="text-center z-10 select-none">
                  <div className="text-xs uppercase tracking-widest text-amber-300 font-mono font-bold">Front Hazcam Stereoscopic Right (Hazcam-R)</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1">Hazard Distance Ahead: 4.8m · Clear Corridor · AutoNav Active</div>
                </div>
              </div>
            )}

            {activeCam === 'navcam' && (
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-[#7c3f2b] via-[#462114] to-[#1c0c07]">
                <div className="absolute top-12 left-1/4 w-32 h-16 bg-[#2d140a] rounded-t-full blur-xs opacity-75" />
                <div className="text-center z-10 select-none">
                  <div className="text-xs uppercase tracking-widest text-sky-300 font-mono font-bold">Navcam Mast-Mounted Panoramic Sensor</div>
                  <div className="text-[11px] text-zinc-300 font-mono mt-1">Elevation Angle: -4.2° · Azimuth: 245° WSW · Kodiak Butte Visible</div>
                </div>
              </div>
            )}

            {activeCam === 'mastcam' && (
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-[#944a33] via-[#592a1a] to-[#250f08]">
                <div className="text-center z-10 select-none">
                  <div className="text-xs uppercase tracking-widest text-emerald-300 font-mono font-bold">Mastcam-Z High-Resolution Science Zoom</div>
                  <div className="text-[11px] text-zinc-300 font-mono mt-1">Focal Length: 110mm · Multi-Spectral Target: Delta Foreset Beds</div>
                </div>
              </div>
            )}

            {activeCam === 'rimfax' && (
              <div className="w-full h-full relative flex items-center justify-center bg-[#070b12]">
                {/* Synthetic Radar Radargram Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-60">
                  <div className="h-0.5 bg-blue-500/40 w-full" />
                  <div className="h-0.5 bg-purple-500/50 w-3/4 ml-12" />
                  <div className="h-0.5 bg-cyan-500/60 w-5/6" />
                  <div className="h-0.5 bg-amber-500/40 w-2/3 ml-24" />
                  <div className="h-0.5 bg-blue-500/30 w-full" />
                </div>
                <div className="text-center z-10 select-none">
                  <div className="text-xs uppercase tracking-widest text-cyan-300 font-mono font-bold">RIMFAX Ground-Penetrating Radar Radargram</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1">Subsurface Sounding Depth: 12.4m · Basaltic Substratum Interface at 3.8m</div>
                </div>
              </div>
            )}

            {/* OSD (On-Screen Display) Tactical Reticle HUD */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-[11px] font-mono text-white/80">
              <div className="flex justify-between items-start">
                <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE DOWNLINK [DSN DSS-14]
                  </div>
                  <div className="text-white/60">BW: {telemetry.downlinkKbps} kbps · Frame #{packetTick}</div>
                </div>
                <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-right">
                  <div>ROLL: {telemetry.rollDeg}° · PITCH: {telemetry.pitchDeg}°</div>
                  <div className="text-amber-400 font-bold">SLIP: {telemetry.wheelSlipPercent}% [SAFE]</div>
                </div>
              </div>

              {/* Crosshair Center Reticle */}
              <div className="self-center flex items-center justify-center">
                <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500/80 rounded-full" />
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                  <div>LAT: 18.4447° N · LON: 77.4562° E</div>
                  <div>TARGET: Three Forks Sample Depot</div>
                </div>
                <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-right">
                  <div className="text-sky-300 font-bold">BATT: {telemetry.batteryPercent}% ({telemetry.driveCurrentAmps}A)</div>
                  <div>TEMP: -18.4°C [MMRTG OK]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Selectors */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setActiveCam('hazcam');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeCam === 'hazcam' ? 'apple-btn-primary text-white shadow-md' : 'apple-btn-secondary'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Front Hazcam</span>
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setActiveCam('navcam');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeCam === 'navcam' ? 'apple-btn-primary text-white shadow-md' : 'apple-btn-secondary'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Navcam 360°</span>
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setActiveCam('mastcam');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeCam === 'mastcam' ? 'apple-btn-primary text-white shadow-md' : 'apple-btn-secondary'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Mastcam-Z Science</span>
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setActiveCam('rimfax');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeCam === 'rimfax' ? 'apple-btn-primary text-white shadow-md' : 'apple-btn-secondary'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>RIMFAX Radar</span>
              </button>
            </div>

            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setIsLiveStreaming((prev) => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isLiveStreaming ? 'bg-red-500/15 text-red-600 border border-red-500/30' : 'apple-btn-secondary'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-red-500 animate-ping' : 'bg-zinc-400'}`} />
              {isLiveStreaming ? 'Pause Feed' : 'Resume Live'}
            </button>
          </div>

          {/* 2. Critical Mobility & Kinematic Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Battery SoC */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Battery State (SoC)</span>
                <Battery className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.batteryPercent}%
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  43.2V · 24-Cell Li-Ion · MMRTG Powered
                </div>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-glass-inset)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${telemetry.batteryPercent}%` }}
                />
              </div>
            </div>

            {/* Wheel Slip / Sinkage */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Wheel Slip / Sinkage</span>
                <Gauge className="w-4 h-4 text-sky-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.wheelSlipPercent}%
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Safe Regolith Traction (&lt;20% Limit)
                </div>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-glass-inset)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, telemetry.wheelSlipPercent * 4)}%` }}
                />
              </div>
            </div>

            {/* Drive Current */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Drive Motor Current</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.driveCurrentAmps} <span className="text-base font-normal">A</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  6 Articulated Brushless Hub Actuators
                </div>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-glass-inset)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (telemetry.driveCurrentAmps / 10) * 100)}%` }}
                />
              </div>
            </div>

            {/* DSN Link Quality */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">MRO Relay Downlink</span>
                <Radio className="w-4 h-4 text-purple-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  -94 <span className="text-base font-normal">dBm</span>
                </div>
                <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
                  Electra UHF · 2.0 Mb/s Nominal
                </div>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-glass-inset)] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass-inset)] flex items-center justify-between">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Autonomous AutoNav Hazard Avoidance: <strong>ENGAGED</strong></span>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold apple-btn-primary text-white cursor-pointer transition shadow-md"
          >
            Acknowledge Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
