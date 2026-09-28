import React from 'react';
import { Sun, Wind, BatteryCharging, Flame, Activity, ArrowRight, ArrowDown, Zap } from 'lucide-react';
import { TelemetryCurrent } from '../types';

interface EnergyFlowProps {
  telemetry: TelemetryCurrent | null;
}

export const EnergyFlowVisualizer: React.FC<EnergyFlowProps> = ({ telemetry }) => {
  if (!telemetry) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
        Connecting to Station Microgrid Bus...
      </div>
    );
  }

  const isCharging = telemetry.battery_kw < -0.5;
  const isDischarging = telemetry.battery_kw > 0.5;
  const batteryFlowLabel = isCharging
    ? `Charging (${Math.abs(telemetry.battery_kw).toFixed(1)} kW)`
    : isDischarging
    ? `Discharging (${telemetry.battery_kw.toFixed(1)} kW)`
    : 'Float / Idle (0.0 kW)';

  const genRunning = telemetry.generator_kw > 1.0;

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm text-slate-200 tracking-wide uppercase">
            Microgrid Energy Bus Flow
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Renewable Gen: {(telemetry.solar_kw + telemetry.wind_kw).toFixed(1)} kW</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Bus Voltage: 480V 3Φ (50 Hz)</span>
          </span>
        </div>
      </div>

      {/* Grid Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Column 1: Sources (Solar & Wind) */}
        <div className="space-y-4 md:col-span-1">
          {/* Solar Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-amber-300 flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>SOLAR PV</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {telemetry.solar_kw > 0 ? 'ACTIVE' : 'NIGHT'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {telemetry.solar_kw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
          </div>

          {/* Wind Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-cyan-300 flex items-center space-x-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>WIND ARRAY</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {telemetry.wind_kw > 2.0 ? 'GENERATING' : 'FEATHERED'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {telemetry.wind_kw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
          </div>
        </div>

        {/* Arrow vector into Central Bus */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-4 text-slate-500">
          <div className="flex items-center text-cyan-400/80 animate-pulse font-mono text-[10px]">
            <span>INFLOW</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </div>
        </div>

        {/* Column 3: Central Energy Bus & Battery */}
        <div className="space-y-4 md:col-span-1">
          {/* Energy Bus Core */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-xl p-4 text-center shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-center space-x-1 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>MAIN AC BUS</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-cyan-200">
              {telemetry.load_kw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Grid Sync: Synchronized
            </div>
          </div>

          {/* Battery Bank Storage */}
          <div className={`rounded-lg p-3.5 border transition-all ${
            telemetry.battery_soc < 30
              ? 'border-rose-500/60 bg-rose-950/30'
              : 'border-emerald-500/30 bg-slate-900/90'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-emerald-300 flex items-center space-x-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>BESS STORAGE</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {telemetry.battery_soc.toFixed(1)}% SOC
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 font-semibold">
              {batteryFlowLabel}
            </div>
            {/* SOC Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  telemetry.battery_soc < 30 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, telemetry.battery_soc))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Arrow vector to Station Load / from Generator */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-4 text-slate-500">
          <div className="flex items-center text-emerald-400/80 animate-pulse font-mono text-[10px]">
            <span>DEMAND</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </div>
        </div>

        {/* Column 5: Station Load & Diesel Generator */}
        <div className="space-y-4 md:col-span-1">
          {/* Station Load */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-lg p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-blue-300">STATION LOAD</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                CONSUMING
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {telemetry.load_kw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Renewable Share: {telemetry.renewable_pct.toFixed(0)}%
            </div>
          </div>

          {/* Diesel Generator */}
          <div className={`rounded-lg p-3.5 border transition-all ${
            genRunning
              ? 'border-amber-500/60 bg-amber-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300 flex items-center space-x-1.5">
                <Flame className={`w-3.5 h-3.5 ${genRunning ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                <span>DIESEL GEN G1/G2</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                genRunning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {genRunning ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {telemetry.generator_kw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Fuel: {telemetry.fuel_rate.toFixed(1)} L/hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
