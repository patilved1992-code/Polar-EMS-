import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Calendar, Download, Filter, Flame, Sun, Wind, Battery, Zap } from 'lucide-react';
import { StationId, TelemetryHistory } from '../types';
import { api } from '../services/api';

interface AnalyticsPageProps {
  stationId: StationId;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stationId }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [data, setData] = useState<TelemetryHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getTelemetryHistory(stationId, timeframe)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load telemetry history:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [stationId, timeframe]);

  const formattedChartData = data?.readings.map((r) => ({
    time: timeframe === '24h'
      ? r.timestamp.slice(11, 16)
      : r.timestamp.slice(5, 10) + ' ' + r.timestamp.slice(11, 13) + 'h',
    load: r.load_kw,
    solar: r.solar_kw,
    wind: r.wind_kw,
    renewable: r.solar_kw + r.wind_kw,
    diesel: r.generator_kw,
    batterySoc: r.battery_soc,
    batteryKw: r.battery_kw,
    fuelRate: r.fuel_rate,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide uppercase">
            Station Energy Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Historical Power Generation, Load Profiling & Diesel Burn Trends
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                timeframe === tf
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf === '24h' ? '1 DAY (24H)' : tf === '7d' ? '7 DAYS' : '30 DAYS'}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Demand</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {data?.total_energy_consumed_kwh.toLocaleString() || '0'} <span className="text-[10px] text-slate-400">kWh</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/70 border border-emerald-500/20 rounded-lg">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Renewable Gen</div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
            {data?.total_renewable_kwh.toLocaleString() || '0'} <span className="text-[10px] text-slate-400">kWh</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/70 border border-cyan-500/20 rounded-lg">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">Renewable Share</div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
            {data?.renewable_share_pct || '0'}%
          </div>
        </div>
        <div className="p-3 bg-slate-900/70 border border-amber-500/20 rounded-lg">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Diesel Consumed</div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-1">
            {data?.diesel_fuel_litres || '0'} <span className="text-[10px] text-slate-400">L</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Average Load</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {data?.avg_load_kw || '0'} <span className="text-[10px] text-slate-400">kW</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Peak Demand</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {data?.peak_load_kw || '0'} <span className="text-[10px] text-slate-400">kW</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Energy Generation vs Load */}
      <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              Microgrid Power Generation vs. Station Demand
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Station Load (kW) compared to Solar PV, Wind Turbine Array, and Diesel Dispatch
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="anLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="kW" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#anLoad)" name="Demand (kW)" />
              <Line type="monotone" dataKey="solar" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Solar PV (kW)" />
              <Line type="monotone" dataKey="wind" stroke="#10b981" strokeWidth={1.5} dot={false} name="Wind Turbines (kW)" />
              <Line type="monotone" dataKey="diesel" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Diesel Gen (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2-Column: Battery SOC Dynamics & Fuel Burn Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery SOC Profile */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Battery State of Charge (SOC) Trend
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Minimum Reserve: 30% | Maximum Charge Threshold: 95%
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              500 kWh LiFePO4
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="batterySoc" stroke="#10b981" strokeWidth={2} dot={false} name="BESS SOC (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diesel Fuel Consumption Rate */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Diesel Generator Fuel Rate
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Hourly Consumption (L/hr) during deficit compensation
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              L/hr
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="anFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="L/h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="fuelRate" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#anFuel)" name="Fuel Rate (L/hr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
