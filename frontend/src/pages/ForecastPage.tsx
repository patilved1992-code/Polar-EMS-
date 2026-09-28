import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BrainCircuit, Sun, Wind, Zap, Gauge, Sparkles, AlertCircle } from 'lucide-react';
import { StationId, ForecastSeries } from '../types';
import { api } from '../services/api';

interface ForecastPageProps {
  stationId: StationId;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ stationId }) => {
  const [metric, setMetric] = useState<'load' | 'solar' | 'wind' | 'renewable'>('load');
  const [horizon, setHorizon] = useState<'15m' | '1h' | '6h' | '24h' | '7d'>('24h');
  const [forecast, setForecast] = useState<ForecastSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getForecast(metric, stationId, horizon)
      .then((res) => {
        if (isMounted) {
          setForecast(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Forecast error:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [metric, stationId, horizon]);

  const chartData = forecast?.points.map((p) => ({
    time: horizon === '7d'
      ? p.timestamp.slice(5, 10) + ' ' + p.timestamp.slice(11, 13) + 'h'
      : p.timestamp.slice(11, 16),
    predicted: p.predicted,
    actual: p.actual,
    lower: p.confidence_lower,
    upper: p.confidence_upper,
    confidenceScore: Math.round(p.confidence_score * 100),
  })) || [];

  const avgConfidence = forecast?.points.length
    ? Math.round(
        (forecast.points.reduce((acc, curr) => acc + curr.confidence_score, 0) / forecast.points.length) * 100
      )
    : 92;

  const metricColors = {
    load: { primary: '#06b6d4', fill: 'url(#fcLoad)' },
    solar: { primary: '#f59e0b', fill: 'url(#fcSolar)' },
    wind: { primary: '#10b981', fill: 'url(#fcWind)' },
    renewable: { primary: '#3b82f6', fill: 'url(#fcRenewable)' },
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              AI Microgrid Predictive Forecasting
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physical-Statistical ML Engine • Multi-Horizon Energy Generation & Load Projections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-400 px-2 uppercase">Horizon:</span>
            {(['15m', '1h', '6h', '24h', '7d'] as const).map((hz) => (
              <button
                key={hz}
                onClick={() => setHorizon(hz)}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  horizon === hz
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hz.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            {[
              { id: 'load', label: 'Demand', icon: Zap },
              { id: 'solar', label: 'Solar PV', icon: Sun },
              { id: 'wind', label: 'Wind Array', icon: Wind },
              { id: 'renewable', label: 'Combined', icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              const isSel = metric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded font-semibold transition-all ${
                    isSel
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Performance & Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Forecast Horizon</div>
          <div className="text-xl font-bold font-mono text-white mt-1 uppercase">
            {horizon === '15m' ? '15 Minutes' : horizon === '1h' ? '1 Hour' : horizon === '6h' ? '6 Hours' : horizon === '24h' ? 'Next 24 Hours' : '7 Days'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Total Points: {forecast?.points.length || 0}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Predicted Energy</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {forecast?.total_energy_kwh.toLocaleString() || 0} <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Cumulative horizon integral
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Anticipated Peak Value</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {forecast?.peak_value || 0} <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Average: {forecast?.avg_value || 0} kW
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Model Confidence Score</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
            {avgConfidence}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            95% Confidence Band Bounds
          </div>
        </div>
      </div>

      {/* Primary Forecast Chart with 95% Confidence Interval Band */}
      <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              {metric.toUpperCase()} FORECAST CURVE WITH CONFIDENCE ENVELOPE
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Shaded band represents 95% confidence interval derived from atmospheric variability
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Predicted Value</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-700/60 border border-slate-600"></span>
              <span>Confidence Band (Upper/Lower)</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fcLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fcSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fcWind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fcRenewable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="kW" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#334155" fillOpacity={0.25} name="Upper 95% Bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#090d16" fillOpacity={1} name="Lower 95% Bound" />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={metricColors[metric].primary}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                name={`Predicted ${metric.toUpperCase()} (kW)`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Engineering Explainability Card */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
        <h4 className="font-semibold text-slate-200 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Active ML Model Feature Inputs</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-400">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-white font-semibold">Diurnal Activity Cycle:</span> UTC hour weighting for scientific lab experiments & galley cooking.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-white font-semibold">Katabatic Dynamics:</span> Antarctic plateau pressure gradient & boundary-layer thermal inversion.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-white font-semibold">Solar Elevation:</span> Astronomical zenith calculation with cloud attenuation factor.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-white font-semibold">Thermal Load Scaling:</span> Heat loss transfer coefficient responding to -30°C temperature deltas.
          </div>
        </div>
      </div>
    </div>
  );
};
