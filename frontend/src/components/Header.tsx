import React, { useState, useEffect } from 'react';
import {
  Clock,
  Compass,
  Play,
  RotateCcw,
  Wind,
  SunDim,
  CloudLightning,
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { StationId } from '../types';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  stationId: StationId;
  setStationId: (id: StationId) => void;
  activeScenario: string;
  onTriggerScenario: (scenario: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  isSimulated: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stationId,
  setStationId,
  activeScenario,
  onTriggerScenario,
  demoMode,
  setDemoMode,
  isSimulated,
  onRefresh
}) => {
  const [stationTime, setStationTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();
      setUtcTime(`${pad(utcHours)}:${pad(utcMinutes)}:${pad(utcSeconds)} UTC`);

      // Bharati: UTC+5:00, Maitri: UTC+0:00
      const offsetHours = stationId === 'bharati' ? 5 : 0;
      const stationHours = (utcHours + offsetHours + 24) % 24;
      setStationTime(`${pad(stationHours)}:${pad(utcMinutes)}:${pad(utcSeconds)}`);

      // IST (NCPOR HQ, Goa, India): UTC+5:30
      const totalMinutesIST = (utcHours * 60 + utcMinutes + 330) % 1440;
      const istH = Math.floor(totalMinutesIST / 60);
      const istM = totalMinutesIST % 60;
      setIstTime(`${pad(istH)}:${pad(istM)}:${pad(utcSeconds)} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [stationId]);

  const scenarios = [
    { id: 'normal', label: 'Normal', icon: CheckCircle2, color: 'hover:border-emerald-500' },
    { id: 'low_wind', label: 'Low Wind', icon: Wind, color: 'hover:border-amber-500' },
    { id: 'solar_drop', label: 'Solar Drop', icon: SunDim, color: 'hover:border-amber-500' },
    { id: 'arctic_storm', label: 'Arctic Storm', icon: CloudLightning, color: 'hover:border-rose-500' },
    { id: 'generator_failure', label: 'G2 Failure', icon: AlertTriangle, color: 'hover:border-rose-500' },
    { id: 'high_demand', label: 'High Demand', icon: Zap, color: 'hover:border-cyan-500' },
  ];

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      {/* Station Selector & Exact Station Time */}
      <div className="flex items-center space-x-4 lg:space-x-6">
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg p-1">
          <button
            onClick={() => setStationId('bharati')}
            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${
              stationId === 'bharati'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BHARATI
          </button>
          <button
            onClick={() => setStationId('maitri')}
            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${
              stationId === 'maitri'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MAITRI
          </button>
        </div>

        {/* Exact Station Local Clock */}
        <div
          className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm"
          title={`Station Local Solar Time: ${stationId === 'bharati' ? 'UTC+05:00 (Larsemann Hills 76°11′E)' : 'UTC+00:00 (Schirmacher Oasis 11°44′E)'}`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{stationTime}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {stationId === 'bharati' ? 'UTC+5' : 'UTC+0'}
            </span>
          </div>
        </div>

        {/* Reference Clocks Pill */}
        <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80">
          <span>UTC: <strong className="text-slate-300">{utcTime.replace(' UTC', '')}</strong></span>
          <span className="text-slate-600">|</span>
          <span>NCPOR HQ: <strong className="text-slate-300">{istTime}</strong></span>
        </div>

        {/* Prototype Simulated Data Badge */}
        {isSimulated && (
          <span className="hidden sm:flex text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Simulation</span>
          </span>
        )}
      </div>


      {/* Scenario Controls & Demo Mode */}
      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 px-2 uppercase tracking-wider">Presets:</span>
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isCurrent = activeScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onTriggerScenario(s.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  isCurrent
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
                } ${s.color}`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Visual Theme Palette Selector */}
        <ThemeSelector />

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Force Sync Telemetry"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Demo Mode Toggle */}
        <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer select-none bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-[11px] text-slate-400">Live Tick:</span>
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => setDemoMode(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
          />
          <span className={`text-[11px] font-semibold ${demoMode ? 'text-emerald-400' : 'text-slate-500'}`}>
            {demoMode ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>
    </header>
  );
};
