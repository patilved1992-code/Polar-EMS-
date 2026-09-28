import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Leaf,
  DollarSign,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Info,
  Save,
  RotateCcw,
  Check,
  Shield
} from 'lucide-react';
import { StationId, OptimizationResult, SystemSettings } from '../types';
import { api } from '../services/api';

interface OptimizationPageProps {
  stationId: StationId;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({ stationId }) => {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [minSoc, setMinSoc] = useState<number>(30);
  const [fuelCost, setFuelCost] = useState<number>(1.45);
  const [co2Factor, setCo2Factor] = useState<number>(2.68);
  const [savingDefault, setSavingDefault] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const executeOptimization = (soc = minSoc, cost = fuelCost, co2 = co2Factor) => {
    setRunning(true);
    api.runOptimization(stationId, 24, {
      min_soc: soc,
      fuel_cost_per_l: cost,
      co2_factor: co2
    })
      .then((res) => {
        setResult(res);
        setRunning(false);
      })
      .catch((err) => {
        console.error('Optimization error:', err);
        setRunning(false);
      });
  };

  useEffect(() => {
    api.getSettings()
      .then((s) => {
        setMinSoc(s.min_bess_soc);
        setFuelCost(s.fuel_cost_per_l);
        setCo2Factor(s.co2_factor);
        executeOptimization(s.min_bess_soc, s.fuel_cost_per_l, s.co2_factor);
      })
      .catch(() => {
        executeOptimization(30, 1.45, 2.68);
      });
  }, [stationId]);

  const handleSaveAsDefault = async () => {
    setSavingDefault(true);
    try {
      await api.saveSettings({
        min_bess_soc: minSoc,
        fuel_cost_per_l: fuelCost,
        co2_factor: co2Factor
      });
      setSaveFeedback('Constraints & Economic factors saved to Station Database!');
      setTimeout(() => setSaveFeedback(null), 4000);
    } catch (err: any) {
      alert('Failed to persist settings: ' + err.message);
    } finally {
      setSavingDefault(false);
    }
  };

  const scheduleChartData = result?.schedule.map((s) => ({
    hour: `${s.hour.toString().padStart(2, '0')}:00`,
    solar: s.solar_kw,
    wind: s.wind_kw,
    batteryDischarge: s.battery_discharge_kw,
    diesel: s.generator_kw,
    soc: s.battery_soc_pct,
    demand: s.load_kw,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Optimization Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Constrained Microgrid Energy Optimization ({stationId.toUpperCase()})
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Objective: Minimize Diesel Burn while Enforcing &ge;{minSoc}% BESS Reserve Floor @ ${fuelCost}/L
          </p>
        </div>

        {/* Action Button: Optimize Energy */}
        <button
          onClick={() => executeOptimization()}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs font-mono uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {running ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-4 h-4 fill-slate-950" />
          )}
          <span>{running ? 'Solving MILP...' : 'RE-OPTIMIZE DISPATCH'}</span>
        </button>
      </div>

      {/* Interactive Optimization Parameters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Active Optimization Constraints & Economic Drivers
            </span>
          </div>
          {saveFeedback && (
            <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{saveFeedback}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* BESS Minimum Reserve Slider */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-1 text-xs font-mono">
              <span className="text-slate-400">BESS Reserve Floor:</span>
              <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                &ge;{minSoc}% SOC
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="1"
              value={minSoc}
              onChange={(e) => setMinSoc(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>20% (Aggressive)</span>
              <span>30% (Standard)</span>
              <span>50% (High Margin)</span>
            </div>
          </div>

          {/* Delivered Fuel Cost */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-1 text-xs font-mono">
              <span className="text-slate-400">Delivered Fuel Cost:</span>
              <span className="text-amber-400 font-bold font-mono">${fuelCost.toFixed(2)} / L</span>
            </div>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="10"
              value={fuelCost}
              onChange={(e) => setFuelCost(Number(e.target.value) || 1.45)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Includes polar icebreaker & helicopter delivery logistics.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSaveAsDefault}
              disabled={savingDefault}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono border border-slate-700 flex items-center justify-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>{savingDefault ? 'Saving...' : 'Save as Default in Database'}</span>
            </button>
            <button
              type="button"
              onClick={() => executeOptimization()}
              disabled={running}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center justify-center space-x-1.5 transition-all"
            >
              <Play className="w-3 h-3 fill-cyan-400" />
              <span>Apply & Solve Dispatch Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Savings KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1 font-mono">
            <span className="uppercase">Projected Fuel Saved</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {result?.fuel_saved_l || '0'} <span className="text-xs text-slate-400 font-normal">Litres</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            ~{result?.fuel_saved_pct || '0'}% fuel reduction vs baseline
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-cyan-400 mb-1 font-mono">
            <span className="uppercase">CO2 Avoided</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {result?.co2_reduction_kg || '0'} <span className="text-xs text-slate-400 font-normal">kg CO2</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Standard {co2Factor.toFixed(2)} kg/L Factor
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1 font-mono">
            <span className="uppercase">Estimated Cost Saved</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">
            ${result?.cost_saved_usd || '0'} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Based on ${fuelCost.toFixed(2)}/L logistics price
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span className="uppercase">Renewable Throughput</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {result?.renewable_total_kwh || '0'} <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Total Solar & Wind Harvest
          </div>
        </div>
      </div>

      {/* Primary Dispatch Schedule Stacked Bar Chart with Overlay SOC Curve & Safety Reserve Reference */}
      <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              24-Hour Microgrid Power Dispatch Schedule & Battery Reserve Enforcer
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Stacked generation fulfilling demand; line tracks BESS SOC respecting &ge;{minSoc}% reserve boundary
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded">
              Enforced Floor: &ge;{minSoc}% SOC
            </span>
            <span className="text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded">
              Priority: Solar &rarr; Wind &rarr; Battery &rarr; Diesel
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scheduleChartData} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis yAxisId="kw" stroke="#64748b" fontSize={10} tickLine={false} unit="kW" />
              <YAxis
                yAxisId="soc"
                orientation="right"
                stroke="#c084fc"
                fontSize={10}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Bar yAxisId="kw" dataKey="solar" stackId="gen" fill="#f59e0b" name="Solar PV (kW)" />
              <Bar yAxisId="kw" dataKey="wind" stackId="gen" fill="#10b981" name="Wind Array (kW)" />
              <Bar yAxisId="kw" dataKey="batteryDischarge" stackId="gen" fill="#06b6d4" name="BESS Discharge (kW)" />
              <Bar yAxisId="kw" dataKey="diesel" stackId="gen" fill="#ef4444" name="Diesel Dispatch (kW)" />
              <Line
                yAxisId="soc"
                type="monotone"
                dataKey="soc"
                stroke="#c084fc"
                strokeWidth={2}
                dot={false}
                name="BESS SOC (%)"
              />
              <ReferenceLine
                yAxisId="soc"
                y={minSoc}
                stroke="#fb7185"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: `Safety Floor: ≥${minSoc}% SOC`, fill: '#fb7185', fontSize: 10, position: 'insideRight' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Explainable AI Recommendations
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {result?.recommendations.length || 0} Actionable Prescriptions Generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result?.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                    CONFIDENCE: {rec.confidence_pct}%
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    rec.risk_level === 'low'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rec.risk_level.toUpperCase()} RISK
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  {rec.action}
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Decision Justification:
                  </span>
                  {rec.reasons.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start space-x-1.5 leading-relaxed">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold">
                  Saved: ~{rec.fuel_saving_litres} L fuel
                </span>
                <span className="text-cyan-400">
                  -{rec.co2_saving_kg} kg CO2
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
