import React, { useState, useEffect } from 'react';
import {
  Radio,
  Battery,
  Gauge,
  Eye,
  ShieldCheck,
  Zap,
  X,
  Camera,
  Compass,
  Disc,
  Wind,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { LiveRoverFeedData } from '../../types/mars';
import { tacticalAudio } from '../../utils/audio';

interface FeedFrame {
  id: string;
  src: string;
  title: string;
  sol: number;
  camName: string;
  focalLength: string;
  description: string;
}

const NASA_CAM_FEEDS: Record<'hazcam' | 'mastcam' | 'navcam' | 'storm' | 'supercam' | 'rimfax', FeedFrame[]> = {
  hazcam: [
    {
      id: 'hazcam-1',
      src: '/footage/hazcam_front_rt.jpeg',
      title: 'Front Hazcam-R (Stereoscopic Right)',
      sol: 1320,
      camName: 'Front Hazard Avoidance Camera (Hazcam-R)',
      focalLength: '12mm f/15 Wide-Angle Fisheye',
      description: 'Foreground bedrock & gravel hazard scan. Clear corridor directly ahead, rover wheels in baseline FOV.',
    },
    {
      id: 'hazcam-2',
      src: '/footage/hazcam_front_lt.jpeg',
      title: 'Front Hazcam-L (Stereoscopic Left)',
      sol: 1320,
      camName: 'Front Hazard Avoidance Camera (Hazcam-L)',
      focalLength: '12mm f/15 Wide-Angle Fisheye',
      description: 'Complementary stereoscopic disparity frame for autonomous obstacle depth triangulation (AutoNav).',
    },
    {
      id: 'hazcam-3',
      src: '/footage/hazcam_rear.jpeg',
      title: 'Rear Hazcam-Aft (Reverse Clearance)',
      sol: 1320,
      camName: 'Rear Hazard Avoidance Camera',
      focalLength: '12mm f/15 Wide-Angle Fisheye',
      description: 'Rear clearance verification for reverse maneuvers and RTG radiator ground thermal standoff.',
    },
    {
      id: 'hazcam-4',
      src: '/footage/hazcam_wheel_track.jpeg',
      title: 'Rocker-Bogie Wheel Ground Track',
      sol: 1320,
      camName: 'Wheel & Chassis Stance Camera',
      focalLength: '16mm f/8 Engineering Sensor',
      description: 'Wheel grousers imprint in fine sand regolith; sinkage measured at 1.4 cm (< 5% slip envelope).',
    },
    {
      id: 'hazcam-5',
      src: '/footage/hazcam_underbody.jpeg',
      title: 'Underbody Belly Cam (Sample Cache)',
      sol: 1320,
      camName: 'Adaptive Caching Assembly (ACA) Cam',
      focalLength: '16mm f/8 Engineering Sensor',
      description: 'Sample caching belly mechanism inspection and ground seal verification.',
    },
  ],

  mastcam: [
    {
      id: 'mastcam-1',
      src: '/footage/mastcam_outcrop_1.jpeg',
      title: 'Western Delta Foreset Outcrop',
      sol: 1320,
      camName: 'Mastcam-Z Multi-Spectral Telephoto (Right)',
      focalLength: '110mm f/10 Science Zoom',
      description: 'Fine sedimentary sandstone laminations with clay smectite mineral signatures.',
    },
    {
      id: 'mastcam-2',
      src: '/footage/mastcam_outcrop_2.jpeg',
      title: 'Delta Sedimentary Strata Layering',
      sol: 1320,
      camName: 'Mastcam-Z Science Zoom',
      focalLength: '110mm f/10 Science Zoom',
      description: 'Horizontal bedding planes indicating ancient deltaic lake-bottom deposition in Jezero paleolake.',
    },
    {
      id: 'mastcam-3',
      src: '/footage/mastcam_rock_bed.jpeg',
      title: 'Abraded Rock Bed Texture',
      sol: 1320,
      camName: 'Mastcam-Z High-Res Multispectral',
      focalLength: '85mm Science Lens',
      description: 'Fine-grained matrix with silicate phenocrysts, potential biosignature preservation target.',
    },
    {
      id: 'mastcam-4',
      src: '/footage/mastcam_sediment.jpeg',
      title: 'Alluvial Siltstone Formation',
      sol: 1320,
      camName: 'Mastcam-Z Science Zoom',
      focalLength: '110mm Zoom',
      description: 'Lacustrine mudstone unit exhibiting polygonal thermal contraction fracture networks.',
    },
    {
      id: 'mastcam-5',
      src: '/footage/mastcam_delta_strata.jpeg',
      title: 'Cross-Bedded Sandstone Lens',
      sol: 1320,
      camName: 'Mastcam-Z Telephoto',
      focalLength: '100mm Zoom',
      description: 'High-energy fluvial gravel bar deposit indicative of rapid river discharge pulses.',
    },
    {
      id: 'mastcam-6',
      src: '/footage/mastcam_sample_target.jpeg',
      title: 'Sample Core Extraction Target',
      sol: 1320,
      camName: 'Mastcam-Z Multi-Spectral',
      focalLength: '110mm Zoom',
      description: 'Core drill site pre-survey; rock surface vetted for rotary percussive sampling.',
    },
    {
      id: 'mastcam-7',
      src: '/footage/mastcam_regolith_detail.jpeg',
      title: 'Regolith Grain Scale Detail',
      sol: 1320,
      camName: 'Mastcam-Z Macro Zoom',
      focalLength: '95mm Zoom',
      description: 'Ferric oxide coated basaltic granules and wind-sorted ripples.',
    },
    {
      id: 'mastcam-8',
      src: '/footage/mastcam_cobbles.jpeg',
      title: 'Rounded River Cobble Field',
      sol: 1320,
      camName: 'Mastcam-Z Field Survey',
      focalLength: '70mm Zoom',
      description: 'Well-rounded cobbles transported from Jezero crater rim uplands over kilometers.',
    },
    {
      id: 'mastcam-9',
      src: '/footage/mastcam_boulder.jpeg',
      title: 'Volcanic Impact Ejecta Boulder',
      sol: 1320,
      camName: 'Mastcam-Z Telephoto',
      focalLength: '105mm Zoom',
      description: 'Vesicular basalt ejecta block with secondary carbonate vein fillings.',
    },
    {
      id: 'mastcam-10',
      src: '/footage/mastcam_drill_site.jpeg',
      title: 'Abrasion Patch & Drill Hole',
      sol: 1320,
      camName: 'Mastcam-Z High Resolution',
      focalLength: '110mm Science Zoom',
      description: 'Clean circular abrasion patch exposing unweathered subsurface minerals for PIXL and SHERLOC.',
    },
    {
      id: 'mastcam-11',
      src: '/footage/mastcam_sol_panorama.jpeg',
      title: '360° Sol 1320 Delta Panorama',
      sol: 1320,
      camName: 'Mastcam-Z Panoramic Mosaic',
      focalLength: '34mm Wide Angle',
      description: 'Panoramic view looking north-west toward the Delta Front and Kodiak Butte.',
    },
  ],

  navcam: [
    {
      id: 'navcam-1',
      src: '/footage/navcam_sky_horizon_1.jpeg',
      title: 'Navcam Panoramic Horizon (Butterscotch Sky)',
      sol: 1320,
      camName: 'Navigation Camera (Navcam-Right)',
      focalLength: '20mm f/12 Panoramic Sensor',
      description: 'Atmospheric optical depth (tau = 0.48) with airborne dust scattering across Western Delta horizon.',
    },
    {
      id: 'navcam-2',
      src: '/footage/navcam_sky_horizon_2.jpeg',
      title: 'Traverse Waypoint Corridor Ahead',
      sol: 1320,
      camName: 'Navigation Camera (Navcam-Left)',
      focalLength: '20mm f/12 Panoramic Sensor',
      description: 'Traverse corridor toward Three Forks Sample Depot; elevation gradient is safe (<7°).',
    },
    {
      id: 'navcam-3',
      src: '/footage/navcam_sky_horizon_3.jpeg',
      title: 'Jezero Crater Western Rim Horizon',
      sol: 1320,
      camName: 'Navcam Panoramic Head',
      focalLength: '20mm Panoramic Sensor',
      description: 'Distant crater rim scarp rising 450 meters above the alluvial crater floor.',
    },
    {
      id: 'navcam-4',
      src: '/footage/navcam_kodiak_view.jpeg',
      title: 'Kodiak Butte Erosional Remnant',
      sol: 1320,
      camName: 'Navcam Mast Sensor',
      focalLength: '20mm Panoramic Sensor',
      description: 'Stratigraphic key section confirming historical lake water level at -2,400 meters.',
    },
    {
      id: 'navcam-5',
      src: '/footage/navcam_crater_rim.jpeg',
      title: 'Crater Rim Scarp & Scree Slopes',
      sol: 1320,
      camName: 'Navcam Panoramic Head',
      focalLength: '20mm Sensor',
      description: 'High-incline scree talus slopes marked as autonomous rollover hazard barriers.',
    },
    {
      id: 'navcam-6',
      src: '/footage/navcam_wide_15.jpeg',
      title: 'Wide-Angle Traverse Panorama',
      sol: 1320,
      camName: 'Navcam Mosaic View',
      focalLength: '18mm Wide-Angle',
      description: 'Full azimuth terrain mosaic calibrated for rover path plan verification.',
    },
  ],

  storm: [
    {
      id: 'storm-1',
      src: '/footage/storm_dust_anim.gif',
      title: 'MEDA Skycam Live Dust Storm Animation',
      sol: 1320,
      camName: 'MEDA Rover Environmental Monitoring Skycam',
      focalLength: 'Convective Vortex Video Loop',
      description: 'Live convective vortex (dust devil) translating across Jezero crater floor at 8.4 m/s. Pressure drop: 2.8 Pa.',
    },
    {
      id: 'storm-2',
      src: '/footage/storm_front.jpeg',
      title: 'Approaching Dust Storm Wall Front',
      sol: 1320,
      camName: 'MEDA Radiation & Dust Sensor Cam',
      focalLength: 'Optical Depth Skycam',
      description: 'Regional dust storm front increasing atmospheric opacity; solar irradiance reduced by 32%.',
    },
  ],

  supercam: [
    {
      id: 'supercam-1',
      src: '/footage/supercam_micro_1.jpeg',
      title: 'SuperCam Remote Micro-Imager Target 1',
      sol: 1320,
      camName: 'SuperCam RMI Telephoto Microscope',
      focalLength: '563mm f/14 Schmidt-Cassegrain',
      description: 'Laser-Induced Breakdown Spectroscopy (LIBS) target identifying calcium sulfate veins.',
    },
    {
      id: 'supercam-2',
      src: '/footage/supercam_micro_2.jpeg',
      title: 'SuperCam Remote Micro-Imager Target 2',
      sol: 1320,
      camName: 'SuperCam RMI Telephoto Microscope',
      focalLength: '563mm f/14 Schmidt-Cassegrain',
      description: 'Sub-millimeter crystal grain inspection confirming volcanic olivine crystallization.',
    },
  ],

  rimfax: [
    {
      id: 'rimfax-1',
      src: '', // Synthetic radargram view
      title: 'RIMFAX Ground-Penetrating Radar Radargram',
      sol: 1320,
      camName: 'Radar Imager for Mars Subsurface Experiment',
      focalLength: '150-1200 MHz Ultra-Wideband GPR',
      description: 'Subsurface radargram sounding dielectric interfaces down to 12.4m depth beneath regolith.',
    },
  ],
};

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
  const [activeCam, setActiveCam] = useState<'hazcam' | 'mastcam' | 'navcam' | 'storm' | 'supercam' | 'rimfax'>('hazcam');
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<LiveRoverFeedData>(initialTelemetry);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [packetTick, setPacketTick] = useState(0);
  const [isHighContrastFilter, setIsHighContrastFilter] = useState(false);

  // Reset selected frame index when switching camera channel
  const handleSelectCam = (cam: 'hazcam' | 'mastcam' | 'navcam' | 'storm' | 'supercam' | 'rimfax') => {
    tacticalAudio.playBlip();
    setActiveCam(cam);
    setSelectedFrameIndex(0);
  };

  const frames = NASA_CAM_FEEDS[activeCam];
  const activeFrame = frames[Math.min(frames.length - 1, selectedFrameIndex)];

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rover-live-feed-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in font-sans select-none"
    >
      <div
        className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-glass)]"
        style={{
          background: 'var(--bg-glass-elevated)',
          backdropFilter: 'blur(36px) saturate(180%)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-glass-inset)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-500 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="rover-live-feed-title" className="text-base sm:text-lg font-display font-extrabold tracking-tight">
                  Perseverance Rover Live Telemetry &amp; Camera Feed
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shrink-0">
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
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="Close live camera feed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* 1. Camera Viewfinder with HUD Overlay */}
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-highlight)] bg-black shadow-2xl aspect-video max-h-[420px] flex items-center justify-center">
            {/* Viewfinder Content: Real NASA Images or Radar */}
            {activeCam === 'rimfax' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-[#070b12]">
                {/* Synthetic Radar Radargram Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-60">
                  <div className="h-0.5 bg-blue-500/40 w-full" />
                  <div className="h-0.5 bg-purple-500/50 w-3/4 ml-12" />
                  <div className="h-0.5 bg-cyan-500/60 w-5/6" />
                  <div className="h-0.5 bg-amber-500/40 w-2/3 ml-24" />
                  <div className="h-0.5 bg-blue-500/30 w-full" />
                </div>
                <div className="text-center z-10 select-none p-4">
                  <div className="text-xs uppercase tracking-widest text-cyan-300 font-mono font-bold">
                    RIMFAX Ground-Penetrating Radar Radargram
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1">
                    Subsurface Sounding Depth: 12.4m · Basaltic Substratum Interface at 3.8m
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeFrame.src}
                  alt={activeFrame.title}
                  className={`w-full h-full object-cover select-none transition-all duration-300 ${
                    isHighContrastFilter ? 'filter contrast-150 saturate-150 brightness-105' : ''
                  }`}
                  loading="eager"
                />
                {/* Subtle Scanline Overlay for Telemetry Realism */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-15"
                  style={{
                    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)',
                  }}
                />
              </div>
            )}

            {/* OSD (On-Screen Display) Tactical Reticle HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-[11px] font-mono text-white/90">
              {/* Top Row: DSN & Rover Attitude */}
              <div className="flex justify-between items-start gap-2">
                <div className="bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/15 shadow-md">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE DOWNLINK [DSN DSS-14]
                  </div>
                  <div className="text-white/70">BW: {telemetry.downlinkKbps} kbps · Frame #{packetTick} · Exp: 1/250s</div>
                </div>

                <div className="bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/15 shadow-md text-right">
                  <div>ROLL: {telemetry.rollDeg}° · PITCH: {telemetry.pitchDeg}°</div>
                  <div className="text-amber-400 font-bold">SLIP: {telemetry.wheelSlipPercent}% [SAFE TRACTION]</div>
                </div>
              </div>

              {/* Center Aiming Diamond & Crosshair Reticle */}
              <div className="self-center flex items-center justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border border-white/30 rounded-full border-dashed animate-[spin_30s_linear_infinite]" />
                  <div className="w-6 h-6 border border-sky-400/80 rotate-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active Target Coordinates & Mission Battery */}
              <div className="flex justify-between items-end gap-2">
                <div className="bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/15 shadow-md max-w-sm">
                  <div className="text-sky-300 font-bold truncate">{activeFrame.title}</div>
                  <div className="text-white/70 text-[10px] truncate">{activeFrame.camName} ({activeFrame.focalLength})</div>
                  <div className="text-amber-400 text-[10px]">LAT: 18.4447° N · LON: 77.4562° E · Elev -2545m</div>
                </div>

                <div className="bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/15 shadow-md text-right">
                  <div className="text-sky-300 font-bold">BATT: {telemetry.batteryPercent}% ({telemetry.driveCurrentAmps}A)</div>
                  <div>TEMP: -18.4°C [MMRTG NOMINAL]</div>
                  <div className="text-emerald-400 font-bold text-[10px]">AUTONAV: ACTIVE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Frame Description & Scientific Context Banner */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-glass-inset)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-[var(--primary)]">
                NASA Observation Metadata
              </span>
              <p className="text-xs text-[var(--text-secondary)] font-body mt-0.5 leading-snug">
                {activeFrame.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setIsHighContrastFilter(!isHighContrastFilter);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  isHighContrastFilter
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                    : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Toggle High-Contrast Mineral Spectral Enhancement Filter"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isHighContrastFilter ? 'Filter On' : 'Enhance'}</span>
              </button>
            </div>
          </div>

          {/* Camera Channel Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 shrink">
              <button
                onClick={() => handleSelectCam('hazcam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'hazcam' ? 'apple-btn-primary text-white shadow-md' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hazcam ({NASA_CAM_FEEDS.hazcam.length})</span>
              </button>

              <button
                onClick={() => handleSelectCam('mastcam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'mastcam' ? 'apple-btn-primary text-white shadow-md' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Mastcam-Z ({NASA_CAM_FEEDS.mastcam.length})</span>
              </button>

              <button
                onClick={() => handleSelectCam('navcam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'navcam' ? 'apple-btn-primary text-white shadow-md' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Navcam ({NASA_CAM_FEEDS.navcam.length})</span>
              </button>

              <button
                onClick={() => handleSelectCam('storm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'storm' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Dust Storm ({NASA_CAM_FEEDS.storm.length})</span>
              </button>

              <button
                onClick={() => handleSelectCam('supercam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'supercam' ? 'apple-btn-primary text-white shadow-md' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>SuperCam RMI ({NASA_CAM_FEEDS.supercam.length})</span>
              </button>

              <button
                onClick={() => handleSelectCam('rimfax')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeCam === 'rimfax' ? 'apple-btn-primary text-white shadow-md' : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isLiveStreaming ? 'bg-red-500/15 text-red-600 border border-red-500/30' : 'glass-card text-[var(--text-primary)]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-red-500 animate-ping' : 'bg-zinc-400'}`} />
              <span>{isLiveStreaming ? 'Pause Feed' : 'Resume Live'}</span>
            </button>
          </div>

          {/* Thumbnail Carousel Strip for Active Channel */}
          {frames.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                <span>Select NASA Raw Capture Frame:</span>
                <span className="text-[var(--text-primary)] font-bold">
                  Frame {selectedFrameIndex + 1} of {frames.length}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {frames.map((frame, idx) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      tacticalAudio.playBlip();
                      setSelectedFrameIndex(idx);
                    }}
                    className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedFrameIndex === idx
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary-glow)] scale-102'
                        : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100 hover:border-[var(--text-primary)]'
                    }`}
                  >
                    <img
                      src={frame.src}
                      alt={frame.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 px-1 py-0.5 text-[9px] font-mono font-bold text-white text-center truncate">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Critical Mobility & Kinematic Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* Battery SoC */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Battery State (SoC)</span>
                <Battery className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.batteryPercent}%
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
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
            <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Wheel Slip / Sinkage</span>
                <Gauge className="w-4 h-4 text-sky-500" />
              </div>
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.wheelSlipPercent}%
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
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
            <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">Drive Motor Current</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  {telemetry.driveCurrentAmps} <span className="text-sm font-normal">A</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  6 Articulated Brushless Actuators
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
            <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">MRO Relay Downlink</span>
                <Radio className="w-4 h-4 text-purple-500" />
              </div>
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                  -94 <span className="text-sm font-normal">dBm</span>
                </div>
                <div className="text-[10px] text-purple-600 font-semibold">
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
        <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-glass-inset)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Autonomous AutoNav Hazard Avoidance: <strong>ENGAGED</strong></span>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold apple-btn-primary text-white cursor-pointer transition shadow-md"
          >
            Acknowledge Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
