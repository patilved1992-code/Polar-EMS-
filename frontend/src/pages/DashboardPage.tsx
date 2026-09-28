import React from 'react';
import {
  Zap,
  Sun,
  BatteryCharging,
  Flame,
  Fuel,
  PieChart,
  CloudFog,
  ShieldCheck,
  Play,
  BrainCircuit,
  Sliders,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { TelemetryCurrent, WeatherCurrent, StationId } from '../types';
import { MetricCard } from '../components/MetricCard';
import { EnergyFlowVisualizer } from '../components/EnergyFlowVisualizer';
import { WeatherWidget } from '../components/WeatherWidget';
import { SurvivalModeBanner } from '../components/SurvivalModeBanner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  telemetry: TelemetryCurrent | null;
  weather: WeatherCurrent | null;
  stationId: StationId;
  onNavigate: (tab: string) => void;
  onTriggerScenario: (scenario: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  telemetry,
  weather,
  stationId,
  onNavigate,
  onTriggerScenario
}) => {
  const renKw = telemetry ? telemetry.solar_kw + telemetry.wind_kw : 0;
  const loadKw = telemetry ? telemetry.load_kw : 0;
  const soc = telemetry ? telemetry.battery_soc : 0;
  const genKw = telemetry ? telemetry.generator_kw : 0;
  const fuelRate = telemetry ? telemetry.fuel_rate : 0;
  const renUtil = telemetry ? telemetry.renewable_pct : 0;
  const co2Rate = telemetry ? telemetry.co2_rate_kg_per_hr : 0;
  const sysHealth = telemetry ? telemetry.system_health_pct : 100;

  // Mini live waveform mock for recent bus balance
  const liveTrends = Array.from({ length: 12 }).map((_, i) => {
    const offset = (11 - i) * 5;
    const factor = 1 + Math.sin(i * 0.5) * 0.08;
    return {
      time: `-${offset}m`,
      load: Math.round(loadKw * factor),
      renewable: Math.round(renKw * (1 + Math.cos(i * 0.6) * 0.12)),
      diesel: Math.round(genKw * (1 + Math.sin(i * 0.4) * 0.05)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Emergency Survival Mode Banner */}
      <SurvivalModeBanner
        active={!!telemetry?.survival_mode}
        activeScenario={telemetry?.active_scenario || 'normal'}
        soc={soc}
      />

      {/* 8 Primary Industrial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="CURRENT LOAD"
          value={loadKw.toFixed(1)}
          unit="kW"
          subtext={`Station Base + Thermal Loop`}
          icon={Zap}
          status="highlight"
        />
        <MetricCard
          label="RENEWABLE GENERATION"
          value={renKw.toFixed(1)}
          unit="kW"
          subtext={`Solar: ${telemetry?.solar_kw.toFixed(1) || 0} kW | Wind: ${telemetry?.wind_kw.toFixed(1) || 0} kW`}
          icon={Sun}
          status={renKw > loadKw ? 'highlight' : 'normal'}
        />
        <MetricCard
          label="BATTERY SOC"
          value={soc.toFixed(1)}
          unit="%"
          subtext={`Min Reserve: ${telemetry?.min_soc ?? 30}% | Health: 88.5%`}
          icon={BatteryCharging}
          status={soc < (telemetry?.min_soc ?? 30) ? 'critical' : soc < (telemetry?.min_soc ?? 30) + 15 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="DIESEL GENERATION"
          value={genKw.toFixed(1)}
          unit="kW"
          subtext={genKw > 0 ? 'Auxiliary Generator Active' : 'Standby / Zero Dispatch'}
          icon={Flame}
          status={genKw > 40 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="FUEL CONSUMPTION"
          value={fuelRate.toFixed(1)}
          unit="L/hr"
          subtext={`Specific Rate: ~0.27 L/kWh`}
          icon={Fuel}
          status={fuelRate > 15 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="RENEWABLE UTILIZATION"
          value={renUtil.toFixed(0)}
          unit="%"
          subtext={`Instantaneous Demand Coverage`}
          icon={PieChart}
          status={renUtil > 75 ? 'highlight' : 'normal'}
        />
        <MetricCard
          label="CO2 ESTIMATE"
          value={co2Rate.toFixed(1)}
          unit="kg/hr"
          subtext={`Emission Factor: 2.68 kg/L`}
          icon={CloudFog}
          status="normal"
        />
        <MetricCard
          label="SYSTEM HEALTH"
          value={sysHealth.toFixed(0)}
          unit="%"
          subtext={`Predictive Isolation Forest Score`}
          icon={ShieldCheck}
          status={sysHealth < 75 ? 'critical' : sysHealth < 85 ? 'warning' : 'normal'}
        />
      </div>

      {/* Energy Flow Visualization */}
      <EnergyFlowVisualizer telemetry={telemetry} />

      {/* Grid Row: Surface Meteorology + Live Bus Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Column */}
        <div className="lg:col-span-1 space-y-4">
          <WeatherWidget weather={weather} />

          {/* Quick SIH Demo Action Cards */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
              SIH Demonstration Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('optimization')}
                className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Optimize</span>
              </button>
              <button
                onClick={() => onNavigate('forecast')}
                className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>AI Forecast</span>
              </button>
              <button
                onClick={() => onTriggerScenario('arctic_storm')}
                className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Arctic Storm</span>
              </button>
              <button
                onClick={() => onNavigate('copilot')}
                className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Ask Copilot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Power Bus Trend Chart */}
        <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Real-Time Microgrid Power Balance
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Load vs. Renewable Output vs. Diesel Compensation (Last 60 Minutes)
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Load</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Renewables</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Diesel</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" name="Demand (kW)" />
                <Area type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRen)" name="Renewable (kW)" />
                <Area type="monotone" dataKey="diesel" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorDiesel)" name="Diesel (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
