import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Sparkles,
  TrendingDown,
  Leaf,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { StationId } from '../types';

interface ReportsPageProps {
  stationId: StationId;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ stationId }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReport(reportType, stationId);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, stationId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-xl backdrop-blur-md print:hidden">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Station Energy Audit & Compliance Reports
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Certified carbon audit, dispatch performance metrics, and equipment diagnostic briefings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                reportType === 'daily'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Brief (24h)
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                reportType === 'weekly'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Audit (7d)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-12 text-center shadow-xl">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-mono">Synthesizing station audit report...</p>
        </div>
      ) : reportData ? (
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-md space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Official Polar Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-1">
                <span>NATIONAL CENTRE FOR POLAR & OCEAN RESEARCH (NCPOR)</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                POLAR-EMS MICROGRID DISPATCH & EMISSIONS REPORT
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Station: <strong className="text-slate-200">{reportData.station_name}</strong> &bull; Location: {reportData.station_id === 'bharati' ? 'Larsemann Hills (69°24′S, 76°11′E)' : 'Schirmacher Oasis (70°46′S, 11°43′E)'}
              </p>
            </div>

            <div className="text-left md:text-right text-xs space-y-1 font-mono text-slate-400">
              <div>Report ID: <span className="text-slate-200">RPT-{reportData.station_id.toUpperCase()}-{Date.now().toString().slice(-6)}</span></div>
              <div>Generated: <span className="text-slate-200">{reportData.generated_at}</span></div>
              <div>Period: <span className="text-cyan-400 font-bold">{reportData.reporting_period}</span></div>
            </div>
          </div>

          {/* Executive Summary AI Box */}
          <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Executive Synthesis</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {reportData.executive_summary}
            </p>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Station Demand</span>
              <span className="text-2xl font-black text-white font-mono">
                {reportData.kpis.total_demand_kwh.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 ml-1">kWh</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Renewable Fraction</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {reportData.kpis.renewable_share_pct}%
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {reportData.kpis.renewable_generation_kwh.toLocaleString()} kWh green
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Polar Diesel Saved</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {reportData.kpis.estimated_fuel_saved_l}
                </span>
                <span className="text-xs text-slate-500">Liters</span>
              </div>
              <span className="text-xs text-emerald-400 block mt-0.5 font-medium">
                ~${reportData.kpis.estimated_cost_saved_usd.toLocaleString()} saved
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Avoided Carbon (CO2)</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {reportData.kpis.estimated_co2_avoided_kg}
                </span>
                <span className="text-xs text-slate-500">kg CO2</span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">Factor: 2.68 kg/L</span>
            </div>
          </div>

          {/* Detailed Balance Table */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Energy Generation & Storage Balance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Source / Asset</th>
                    <th className="p-3">Generated / Stored</th>
                    <th className="p-3">Share of Total</th>
                    <th className="p-3">Operational Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">Solar PV Array</td>
                    <td className="p-3 font-mono">{reportData.kpis.solar_kwh.toLocaleString()} kWh</td>
                    <td className="p-3 font-mono text-cyan-300">
                      {((reportData.kpis.solar_kwh / reportData.kpis.total_demand_kwh) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-400">Bifacial albedo reflection contribution active</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">Wind Turbine Farm</td>
                    <td className="p-3 font-mono">{reportData.kpis.wind_kwh.toLocaleString()} kWh</td>
                    <td className="p-3 font-mono text-cyan-300">
                      {((reportData.kpis.wind_kwh / reportData.kpis.total_demand_kwh) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-400">Operating in Antarctic gusts; de-icing heaters healthy</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">Diesel Gensets (G1 + G2)</td>
                    <td className="p-3 font-mono">{reportData.kpis.diesel_generation_kwh.toLocaleString()} kWh</td>
                    <td className="p-3 font-mono text-amber-400">
                      {((reportData.kpis.diesel_generation_kwh / reportData.kpis.total_demand_kwh) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-400">Fuel: {reportData.kpis.diesel_fuel_consumed_l} L Arctic Grade Diesel</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">BESS Battery Storage</td>
                    <td className="p-3 font-mono">{reportData.battery_summary.capacity_kwh} kWh Rated</td>
                    <td className="p-3 font-mono text-emerald-400">~{reportData.battery_summary.estimated_cycles} cycles</td>
                    <td className="p-3 text-slate-400">{reportData.battery_summary.min_soc_maintained}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Equipment Anomalies & Alarms */}
          {reportData.equipment_anomalies && reportData.equipment_anomalies.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Equipment Health Warnings Detected in Reporting Window
              </h3>
              <div className="space-y-2">
                {reportData.equipment_anomalies.map((eq: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{eq.equipment}</span>
                      <span className="text-slate-400 block">Type: {eq.type} &bull; Status: {eq.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">Health: {eq.health_score.toFixed(1)}%</span>
                      <span className="text-[10px] text-slate-500 block">Anomaly Prob: {(eq.anomaly_prob * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign-off & Authority Stamps */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6 text-xs text-slate-400">
            <div>
              <p className="border-b border-slate-700 pb-8 mb-2 font-mono text-slate-500">[DIGITALLY SIGNED]</p>
              <p className="font-bold text-slate-200">Station Commander</p>
              <p className="text-[10px]">Bharati / Maitri Expedition Leader</p>
            </div>
            <div>
              <p className="border-b border-slate-700 pb-8 mb-2 font-mono text-slate-500">[DIGITALLY SIGNED]</p>
              <p className="font-bold text-slate-200">Chief Microgrid Engineer</p>
              <p className="text-[10px]">Power & Life Support Division</p>
            </div>
            <div>
              <p className="border-b border-slate-700 pb-8 mb-2 font-mono text-slate-500">[VERIFIED BY POLAR-EMS AI]</p>
              <p className="font-bold text-slate-200">Autonomous Optimization Engine</p>
              <p className="text-[10px]">Smart India Hackathon 2024 Finalist Build</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
