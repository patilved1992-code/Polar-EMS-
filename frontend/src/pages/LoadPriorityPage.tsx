import React, { useState, useMemo } from 'react';
import {
  Sliders,
  ShieldCheck,
  Zap,
  Power,
  Flame,
  AlertOctagon,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Thermometer,
  Radio,
  Activity
} from 'lucide-react';
import { StationId, TelemetryCurrent } from '../types';

interface Circuit {
  id: string;
  name: string;
  category: string;
  tier: 1 | 2 | 3 | 4;
  powerKw: number;
  socCutoffPct: number;
  isProtected: boolean;
  isActive: boolean;
  description: string;
}

const INITIAL_CIRCUITS: Circuit[] = [
  // Tier 1 - Life Support & Critical (Cannot Shed)
  { id: 'c1', name: 'Habitat HVAC Life Support Heating', category: 'HVAC', tier: 1, powerKw: 28, socCutoffPct: 0, isProtected: true, isActive: true, description: 'Crucial internal habitat thermal control maintaining +18°C' },
  { id: 'c2', name: 'Medical Bay & Oxygen Generator', category: 'Medical', tier: 1, powerKw: 12, socCutoffPct: 0, isProtected: true, isActive: true, description: 'Emergency surgical life-support & medical oxygen concentrator' },
  { id: 'c3', name: 'Deep Space SatLink & Beacon', category: 'Comms', tier: 1, powerKw: 6, socCutoffPct: 0, isProtected: true, isActive: true, description: 'Primary satellite ground station, emergency transponder & SAR beacon' },
  { id: 'c4', name: 'Primary Station Emergency Lighting', category: 'Lighting', tier: 1, powerKw: 5, socCutoffPct: 0, isProtected: true, isActive: true, description: 'Internal emergency stairwell and habitat central core illumination' },

  // Tier 2 - Operational & Scientific
  { id: 'c5', name: 'Atmospheric LIDAR & Radar Lab', category: 'Science', tier: 2, powerKw: 18, socCutoffPct: 40, isProtected: false, isActive: true, description: 'Continuous greenhouse gas and polar stratospheric cloud observation' },
  { id: 'c6', name: 'Ice Core Cryo Drilling Rig', category: 'Science', tier: 2, powerKw: 22, socCutoffPct: 40, isProtected: false, isActive: true, description: 'Paleoclimate deep ice core extraction motor drive' },
  { id: 'c7', name: 'High-Performance HPC Compute Cluster', category: 'Data', tier: 2, powerKw: 14, socCutoffPct: 40, isProtected: false, isActive: true, description: 'Climate model simulation servers and telemetry database nodes' },
  { id: 'c8', name: 'Geomagnetic Resonance Sensor Array', category: 'Science', tier: 2, powerKw: 8, socCutoffPct: 40, isProtected: false, isActive: true, description: 'Earth magnetic field variations and aurora particle collector' },

  // Tier 3 - Auxiliary & Secondary
  { id: 'c9', name: 'Snow Meltwater Processing Boiler', category: 'Auxiliary', tier: 3, powerKw: 20, socCutoffPct: 50, isProtected: false, isActive: true, description: 'Potable water melting tanks; can defer up to 12 hours with stored water' },
  { id: 'c10', name: 'Greywater Purification & Recycle Plant', category: 'Auxiliary', tier: 3, powerKw: 12, socCutoffPct: 50, isProtected: false, isActive: true, description: 'Biological filtration of habitat greywater recycling system' },
  { id: 'c11', name: 'Mechanical Workshop & CNC Tools', category: 'Workshop', tier: 3, powerKw: 15, socCutoffPct: 50, isProtected: false, isActive: true, description: 'Heavy machining, welding, and rover maintenance power' },
  { id: 'c12', name: 'Galley Heavy Baking & Induction Suite', category: 'Galley', tier: 3, powerKw: 10, socCutoffPct: 50, isProtected: false, isActive: true, description: 'High-draw convection ovens and kitchen preparation equipment' },

  // Tier 4 - Non-Essential & Deferrable
  { id: 'c13', name: 'Electric Arctic Rover Superchargers', category: 'Transport', tier: 4, powerKw: 25, socCutoffPct: 65, isProtected: false, isActive: true, description: 'Fast DC charging for field reconnaissance tracked rovers' },
  { id: 'c14', name: 'Sauna & Crew Gym Thermal Pod', category: 'Recreation', tier: 4, powerKw: 12, socCutoffPct: 65, isProtected: false, isActive: true, description: 'Crew morale, recovery sauna, and gymnasium heating' },
  { id: 'c15', name: 'Snowmobile Engine Block Preheaters', category: 'Transport', tier: 4, powerKw: 10, socCutoffPct: 65, isProtected: false, isActive: true, description: 'Auxiliary heating for outdoor vehicle storage' },
  { id: 'c16', name: 'Outer Perimeter Aesthetic Floodlights', category: 'Lighting', tier: 4, powerKw: 8, socCutoffPct: 65, isProtected: false, isActive: true, description: 'Exterior non-safety architectural and perimeter lighting' },
];

interface LoadPriorityPageProps {
  stationId: StationId;
  telemetry: TelemetryCurrent | null;
}

export const LoadPriorityPage: React.FC<LoadPriorityPageProps> = ({ stationId, telemetry }) => {
  const [circuits, setCircuits] = useState<Circuit[]>(INITIAL_CIRCUITS);
  const [autoSheddingEnabled, setAutoSheddingEnabled] = useState(true);

  // Calculate current loads
  const { totalCapacityKw, activeLoadKw, shedLoadKw } = useMemo(() => {
    let total = 0;
    let active = 0;
    let shed = 0;

    circuits.forEach((c) => {
      total += c.powerKw;
      if (c.isActive) {
        active += c.powerKw;
      } else {
        shed += c.powerKw;
      }
    });

    return { totalCapacityKw: total, activeLoadKw: active, shedLoadKw: shed };
  }, [circuits]);

  const toggleCircuit = (id: string) => {
    setCircuits((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.isProtected) return c; // Cannot toggle protected Tier 1
          return { ...c, isActive: !c.isActive };
        }
        return c;
      })
    );
  };

  const shedTier = (tier: number) => {
    setCircuits((prev) =>
      prev.map((c) => {
        if (c.isProtected) return c;
        if (c.tier >= tier) return { ...c, isActive: false };
        return c;
      })
    );
  };

  const restoreAll = () => {
    setCircuits((prev) => prev.map((c) => ({ ...c, isActive: true })));
  };

  const tierColors = {
    1: { border: 'border-rose-500/50', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'Tier 1: Life Support (Protected)' },
    2: { border: 'border-amber-500/50', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'Tier 2: Science & Computing (SOC < 40%)' },
    3: { border: 'border-blue-500/50', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', label: 'Tier 3: Auxiliary & Water (SOC < 50%)' },
    4: { border: 'border-slate-600', badge: 'bg-slate-700/50 text-slate-300 border-slate-600', label: 'Tier 4: Deferrable / Vehicles (SOC < 65%)' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Load Priority & Emergency Shedding Matrix
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Automated and manual load shed controls protecting station survival during polar storms and battery depletion.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shedTier(4)}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Shed Tier 4 (Deferrable)</span>
          </button>
          <button
            onClick={() => shedTier(3)}
            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Emergency Shed Tier 3 + 4</span>
          </button>
          <button
            onClick={restoreAll}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore All Circuits</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 block mb-1">Active Station Load</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{activeLoadKw}</span>
            <span className="text-xs text-slate-400">kW / {totalCapacityKw} kW</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(activeLoadKw / totalCapacityKw) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 block mb-1">Currently Shed Power</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${shedLoadKw > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {shedLoadKw}
            </span>
            <span className="text-xs text-slate-400">kW curtailed</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Fuel burn saving: ~{(shedLoadKw * 0.28).toFixed(1)} L/h
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 block mb-1">Station Battery SOC</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${
              (telemetry?.battery_soc || 70) < 30 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {telemetry ? telemetry.battery_soc.toFixed(1) : '68.4'}%
            </span>
            <span className="text-xs text-slate-400">Reserve Margin</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Hard Cutoff Threshold: 30.0% SOC
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 block mb-1">Automatic Shed Engine</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Active
            </span>
            <button
              onClick={() => setAutoSheddingEnabled(!autoSheddingEnabled)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                autoSheddingEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {autoSheddingEnabled ? 'ENABLED' : 'MANUAL OVERRIDE'}
            </button>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Dynamic optimization loop: 15-min cadence
          </span>
        </div>
      </div>

      {/* Tiered Circuit Lists */}
      {[1, 2, 3, 4].map((tierNum) => {
        const tierCircuits = circuits.filter((c) => c.tier === tierNum);
        const config = tierColors[tierNum as 1 | 2 | 3 | 4];

        return (
          <div
            key={tierNum}
            className={`bg-slate-900/90 border ${config.border} rounded-xl p-5 shadow-xl backdrop-blur-md`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${config.badge}`}>
                  {config.label}
                </span>
                <span className="text-xs text-slate-400">
                  {tierCircuits.reduce((sum, c) => sum + (c.isActive ? c.powerKw : 0), 0)} kW active of {tierCircuits.reduce((sum, c) => sum + c.powerKw, 0)} kW installed
                </span>
              </div>

              {tierNum > 1 && (
                <button
                  onClick={() => {
                    const allOff = tierCircuits.every((c) => !c.isActive);
                    setCircuits((prev) =>
                      prev.map((c) => (c.tier === tierNum ? { ...c, isActive: allOff } : c))
                    );
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  {tierCircuits.every((c) => !c.isActive) ? 'Restore Tier' : 'Cut All in Tier'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {tierCircuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    circuit.isActive
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-rose-950/20 border-rose-900/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">{circuit.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{circuit.category}</span>
                    </div>

                    {circuit.isProtected ? (
                      <span
                        title="Protected circuit: Cannot be shed"
                        className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleCircuit(circuit.id)}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                          circuit.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        {circuit.isActive ? 'ON' : 'SHED'}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{circuit.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Load:</span>
                    <span className="font-mono font-bold text-cyan-300">{circuit.powerKw} kW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
