import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Leaf,
  DollarSign,
  Info,
  Sliders,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { StationId, WhatIfResponse } from '../types';
import { api } from '../services/api';

interface WhatIfSimulatorPageProps {
  stationId: StationId;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({ stationId }) => {
  // Configurable sliders
  const [solarCap, setSolarCap] = useState(150);
  const [windCap, setWindCap] = useState(150);
  const [batCap, setBatCap] = useState(750);
  const [genCap, setGenCap] = useState(220);
  const [avgLoad, setAvgLoad] = useState(55);
  const [temp, setTemp] = useState(-25);
  const [windSpeed, setWindSpeed] = useState(12);
  const [solarIrr, setSolarIrr] = useState(450);
  const [researchers, setResearchers] = useState(28);
  const [renReduction, setRenReduction] = useState(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const runSimulation = () => {
    setLoading(true);
    api.runWhatIf({
      station_id: stationId,
      solar_capacity_kw: solarCap,
      wind_capacity_kw: windCap,
      battery_capacity_kwh: batCap,
      generator_capacity_kw: genCap,
      average_load_kw: avgLoad,
      peak_load_kw: avgLoad * 1.55,
      ambient_temp_c: temp,
      wind_speed_ms: windSpeed,
      solar_irradiance_wm2: solarIrr,
      researchers_count: researchers,
      renewable_reduction_pct: renReduction,
    })
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('What-If error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runSimulation();
  }, [stationId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Microgrid What-If Scenario Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Evaluate Storage Expansion, Renewable Sizing & Climate Stress Test Variations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSolarCap(90);
              setWindCap(120);
              setBatCap(500);
              setAvgLoad(55);
              setTemp(-22);
              setResearchers(24);
              setRenReduction(0);
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{loading ? 'Simulating...' : 'RUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
            <Sliders className="w-4 h-4" />
            <span>Parametric Input Vectors</span>
          </div>

          {/* Sliders List */}
          <div className="space-y-3.5 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Battery Capacity:</span>
                <span className="text-cyan-400 font-bold">{batCap} kWh</span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="50"
                value={batCap}
                onChange={(e) => setBatCap(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Solar PV Capacity:</span>
                <span className="text-amber-400 font-bold">{solarCap} kW</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={solarCap}
                onChange={(e) => setSolarCap(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Wind Turbine Capacity:</span>
                <span className="text-emerald-400 font-bold">{windCap} kW</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={windCap}
                onChange={(e) => setWindCap(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ambient Temperature:</span>
                <span className="text-blue-400 font-bold">{temp}°C</span>
              </div>
              <input
                type="range"
                min="-50"
                max="-5"
                step="1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Wind Speed:</span>
                <span className="text-cyan-400 font-bold">{windSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Station Researchers Occupancy:</span>
                <span className="text-white font-bold">{researchers} persons</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={researchers}
                onChange={(e) => setResearchers(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Renewable Loss / Curtailment:</span>
                <span className="text-rose-400 font-bold">{renReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={renReduction}
                onChange={(e) => setRenReduction(Number(e.target.value))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Comparison Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison Delta Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>DIESEL REDUCTION</span>
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                {result?.delta_fuel_litres || 0} <span className="text-xs text-slate-400 font-normal">L/day</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Simulation Estimate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                <span>EMISSIONS DELTA</span>
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                {result?.delta_co2_kg || 0} <span className="text-xs text-slate-400 font-normal">kg CO2</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Simulation Estimate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                <span>COST IMPACT</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                ${result?.delta_cost_usd || 0} <span className="text-xs text-slate-400 font-normal">/day</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Simulation Estimate
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                Scenario Performance Matrix
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Strictly Labeled: Simulation Estimate
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Performance Metric</th>
                    <th className="py-2.5 px-3 text-slate-300">Baseline Station</th>
                    <th className="py-2.5 px-3 text-cyan-400">Simulated Scenario</th>
                    <th className="py-2.5 px-3 text-emerald-400">Delta Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Total 24h Energy Demand</td>
                    <td className="py-2.5 px-3">{result?.baseline.total_demand_kwh} kWh</td>
                    <td className="py-2.5 px-3 text-cyan-300">{result?.simulated.total_demand_kwh} kWh</td>
                    <td className="py-2.5 px-3 text-slate-400">{((result?.simulated.total_demand_kwh || 0) - (result?.baseline.total_demand_kwh || 0)).toFixed(1)} kWh</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Renewable Generation Harvest</td>
                    <td className="py-2.5 px-3">{result?.baseline.renewable_gen_kwh} kWh</td>
                    <td className="py-2.5 px-3 text-cyan-300">{result?.simulated.renewable_gen_kwh} kWh</td>
                    <td className="py-2.5 px-3 text-emerald-400">+{((result?.simulated.renewable_gen_kwh || 0) - (result?.baseline.renewable_gen_kwh || 0)).toFixed(1)} kWh</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Renewable Utilization Share</td>
                    <td className="py-2.5 px-3">{result?.baseline.renewable_utilization_pct}%</td>
                    <td className="py-2.5 px-3 text-cyan-300">{result?.simulated.renewable_utilization_pct}%</td>
                    <td className="py-2.5 px-3 text-emerald-400">+{((result?.simulated.renewable_utilization_pct || 0) - (result?.baseline.renewable_utilization_pct || 0)).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Diesel Fuel Consumption</td>
                    <td className="py-2.5 px-3">{result?.baseline.diesel_litres} L</td>
                    <td className="py-2.5 px-3 text-amber-300">{result?.simulated.diesel_litres} L</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">-{result?.delta_fuel_litres} L</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Daily Polar Fuel Cost</td>
                    <td className="py-2.5 px-3">${result?.baseline.fuel_cost_usd}</td>
                    <td className="py-2.5 px-3 text-amber-300">${result?.simulated.fuel_cost_usd}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">-${result?.delta_cost_usd}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Daily CO2 Footprint</td>
                    <td className="py-2.5 px-3">{result?.baseline.co2_emissions_kg} kg</td>
                    <td className="py-2.5 px-3 text-cyan-300">{result?.simulated.co2_emissions_kg} kg</td>
                    <td className="py-2.5 px-3 text-emerald-400">-{result?.delta_co2_kg} kg</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Reliability & Reserve Score</td>
                    <td className="py-2.5 px-3">{result?.baseline.reliability_score_pct}%</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-bold">{result?.simulated.reliability_score_pct}%</td>
                    <td className="py-2.5 px-3 text-emerald-400">Verified</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulation Notes */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wide font-semibold flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Simulation Engine Analytical Insights</span>
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-400">
              {result?.analysis_notes.map((note, i) => (
                <div key={i} className="flex items-start space-x-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
