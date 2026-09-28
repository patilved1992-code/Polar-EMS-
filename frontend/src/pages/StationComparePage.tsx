import React, { useState, useEffect } from 'react';
import {
  Compass,
  Zap,
  Wind,
  Sun,
  Battery,
  Flame,
  Leaf,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { api } from '../services/api';
import { StationId, TelemetryCurrent } from '../types';

interface StationComparePageProps {
  currentStationId: StationId;
  onSelectStation: (id: StationId) => void;
}

const CAPACITY_COMPARISON = [
  { name: 'Solar PV', bharati: 100, maitri: 60, unit: 'kWp' },
  { name: 'Wind Turbines', bharati: 60, maitri: 40, unit: 'kW' },
  { name: 'BESS Storage', bharati: 500, maitri: 350, unit: 'kWh' },
  { name: 'Diesel Gensets', bharati: 300, maitri: 250, unit: 'kW' },
];

export const StationComparePage: React.FC<StationComparePageProps> = ({
  currentStationId,
  onSelectStation,
}) => {
  const [bharatiTelem, setBharatiTelem] = useState<TelemetryCurrent | null>(null);
  const [maitriTelem, setMaitriTelem] = useState<TelemetryCurrent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bharatiTime, setBharatiTime] = useState<string>('');
  const [maitriTime, setMaitriTime] = useState<string>('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();

      // Bharati: UTC+5:00
      const bHours = (utcHours + 5 + 24) % 24;
      setBharatiTime(`${pad(bHours)}:${pad(utcMinutes)}:${pad(utcSeconds)}`);

      // Maitri: UTC+0:00
      const mHours = (utcHours + 0 + 24) % 24;
      setMaitriTime(`${pad(mHours)}:${pad(utcMinutes)}:${pad(utcSeconds)}`);
    };
    updateTimes();
    const tInterval = setInterval(updateTimes, 1000);
    return () => clearInterval(tInterval);
  }, []);

  const fetchBothStations = async () => {
    setLoading(true);
    try {
      const [b, m] = await Promise.all([
        api.getCurrentTelemetry('bharati'),
        api.getCurrentTelemetry('maitri')
      ]);
      setBharatiTelem(b);
      setMaitriTelem(m);
    } catch (err) {
      console.error('Failed to load comparison telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBothStations();
    const interval = setInterval(fetchBothStations, 6000);
    return () => clearInterval(interval);
  }, []);

  const radarData = [
    { subject: 'Renewable %', Bharati: bharatiTelem ? Math.min(100, bharatiTelem.renewable_pct * 1.2) : 65, Maitri: maitriTelem ? Math.min(100, maitriTelem.renewable_pct * 1.2) : 52, fullMark: 100 },
    { subject: 'BESS Reserve', Bharati: bharatiTelem ? bharatiTelem.battery_soc : 68, Maitri: maitriTelem ? maitriTelem.battery_soc : 59, fullMark: 100 },
    { subject: 'Grid Health', Bharati: bharatiTelem ? bharatiTelem.system_health_pct : 94, Maitri: maitriTelem ? maitriTelem.system_health_pct : 88, fullMark: 100 },
    { subject: 'Wind Resource', Bharati: bharatiTelem ? Math.min(100, bharatiTelem.wind_kw * 1.5) : 80, Maitri: maitriTelem ? Math.min(100, maitriTelem.wind_kw * 1.8) : 55, fullMark: 100 },
    { subject: 'Solar Index', Bharati: bharatiTelem ? Math.min(100, bharatiTelem.solar_kw * 1.2) : 50, Maitri: maitriTelem ? Math.min(100, maitriTelem.solar_kw * 1.4) : 60, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Compass className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Antarctic Station Comparison & Benchmarking
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Real-time multi-station telemetry benchmark between India's premier Antarctic Research Stations.
          </p>
        </div>

        <button
          onClick={fetchBothStations}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Comparison</span>
        </button>
      </div>

      {/* Station Timezone & Geographic Coordinates Comparative Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="flex items-center space-x-3 p-3.5 bg-slate-950/80 border border-cyan-500/40 rounded-lg shadow-sm">
          <Clock className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Bharati Station Local Time</div>
            <div className="text-lg font-bold text-white font-mono">{bharatiTime}</div>
            <div className="text-[11px] font-mono text-cyan-300">UTC+05:00 &bull; 76°11′E Solar Meridian</div>
          </div>
        </div>

        <div className="text-center px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
            5 Hours Time Offset (64.5° Longitude Apart)
          </span>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
            Larsemann Hills (Bharati) leads Schirmacher Oasis (Maitri) by 5 solar hours across 3,000 km polar distance.
          </p>
        </div>

        <div className="flex items-center space-x-3 p-3.5 bg-slate-950/80 border border-blue-500/40 rounded-lg shadow-sm">
          <Clock className="w-6 h-6 text-blue-400 shrink-0 animate-pulse" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Maitri Station Local Time</div>
            <div className="text-lg font-bold text-white font-mono">{maitriTime}</div>
            <div className="text-[11px] font-mono text-blue-300">UTC+00:00 &bull; 11°44′E Solar Meridian</div>
          </div>
        </div>
      </div>

      {/* Side by Side Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bharati Station */}
        <div className={`bg-slate-900/90 border ${
          currentStationId === 'bharati' ? 'border-cyan-500 shadow-cyan-500/10' : 'border-slate-800'
        } rounded-xl p-6 shadow-xl backdrop-blur-md transition-all`}>
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-wider">BHARATI STATION</h2>
                {currentStationId === 'bharati' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Active Station
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Larsemann Hills (69°24′S, 76°11′E) &bull; Commissioned 2012
              </p>
            </div>
            <button
              onClick={() => onSelectStation('bharati')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentStationId === 'bharati'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{currentStationId === 'bharati' ? 'Current Focus' : 'Switch Focus'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Current Demand</span>
              <span className="text-base font-bold text-white font-mono">
                {bharatiTelem ? `${bharatiTelem.load_kw.toFixed(1)} kW` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Renewable Penetration</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {bharatiTelem ? `${bharatiTelem.renewable_pct.toFixed(0)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Battery SOC</span>
              <span className="text-base font-bold text-cyan-400 font-mono">
                {bharatiTelem ? `${bharatiTelem.battery_soc.toFixed(1)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Fuel Burn Rate</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {bharatiTelem ? `${bharatiTelem.fuel_rate.toFixed(1)} L/h` : '---'}
              </span>
            </div>
          </div>

          {/* Microgrid specs */}
          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Solar PV Array:</span>
              <span className="font-mono text-slate-200">100 kWp Bifacial Arctic Rated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wind Turbine Farm:</span>
              <span className="font-mono text-slate-200">60 kW (6x 10kW Cold-Climate Vertical/Horizontal)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BESS Storage:</span>
              <span className="font-mono text-slate-200">500 kWh LiFePO4 Thermal Clad</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Diesel Backup:</span>
              <span className="font-mono text-slate-200">2x 150 kW Volvo Penta Gensets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Climatic Zone:</span>
              <span className="font-mono text-cyan-300">Coastal Polar &bull; High katabatic wind regime</span>
            </div>
          </div>
        </div>

        {/* Maitri Station */}
        <div className={`bg-slate-900/90 border ${
          currentStationId === 'maitri' ? 'border-cyan-500 shadow-cyan-500/10' : 'border-slate-800'
        } rounded-xl p-6 shadow-xl backdrop-blur-md transition-all`}>
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-wider">MAITRI STATION</h2>
                {currentStationId === 'maitri' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Active Station
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Schirmacher Oasis (70°46′S, 11°43′E) &bull; Commissioned 1989
              </p>
            </div>
            <button
              onClick={() => onSelectStation('maitri')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentStationId === 'maitri'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{currentStationId === 'maitri' ? 'Current Focus' : 'Switch Focus'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Current Demand</span>
              <span className="text-base font-bold text-white font-mono">
                {maitriTelem ? `${maitriTelem.load_kw.toFixed(1)} kW` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Renewable Penetration</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {maitriTelem ? `${maitriTelem.renewable_pct.toFixed(0)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Battery SOC</span>
              <span className="text-base font-bold text-cyan-400 font-mono">
                {maitriTelem ? `${maitriTelem.battery_soc.toFixed(1)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Fuel Burn Rate</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {maitriTelem ? `${maitriTelem.fuel_rate.toFixed(1)} L/h` : '---'}
              </span>
            </div>
          </div>

          {/* Microgrid specs */}
          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Solar PV Array:</span>
              <span className="font-mono text-slate-200">60 kWp Fixed Roof/Ground Clad</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wind Turbine Farm:</span>
              <span className="font-mono text-slate-200">40 kW (4x 10kW High-Altitude Polar Spec)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BESS Storage:</span>
              <span className="font-mono text-slate-200">350 kWh LiFePO4 Station Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Diesel Backup:</span>
              <span className="font-mono text-slate-200">2x 125 kW Kirloskar Gensets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Climatic Zone:</span>
              <span className="font-mono text-cyan-300">Inland Oasis &bull; Severe winter deep freeze down to -45°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Installed Capacity Comparison
              </h3>
              <p className="text-xs text-slate-400">Rated generation and storage ratings</p>
            </div>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAPACITY_COMPARISON}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} ${item.payload.unit}`, name === 'bharati' ? 'Bharati' : 'Maitri']}
                />
                <Legend />
                <Bar dataKey="bharati" name="Bharati Station" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maitri" name="Maitri Station" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Performance Benchmark */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resilience & Efficiency Radar Benchmark
              </h3>
              <p className="text-xs text-slate-400">Comparative microgrid robustness score</p>
            </div>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar name="Bharati" dataKey="Bharati" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Radar name="Maitri" dataKey="Maitri" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
