import React, { useState } from 'react';
import {
  Sun,
  Wind,
  BatteryCharging,
  Flame,
  Zap,
  Cpu,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { TelemetryCurrent, StationId } from '../types';

interface DigitalTwinPageProps {
  telemetry: TelemetryCurrent | null;
  stationId: StationId;
}

interface ComponentDetail {
  id: string;
  name: string;
  type: string;
  capacity: string;
  currentPower: string;
  status: string;
  health: number;
  voltage: string;
  temperature: string;
  specs: string[];
  maintenance: string;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ telemetry, stationId }) => {
  const [selectedComp, setSelectedComp] = useState<ComponentDetail | null>(null);

  const solarKw = telemetry?.solar_kw || 0;
  const windKw = telemetry?.wind_kw || 0;
  const batKw = telemetry?.battery_kw || 0;
  const genKw = telemetry?.generator_kw || 0;
  const loadKw = telemetry?.load_kw || 0;
  const soc = telemetry?.battery_soc || 75;

  const components: Record<string, ComponentDetail> = {
    solar: {
      id: 'solar',
      name: 'High-Albedo Bifacial Solar PV Array',
      type: 'Renewable Photovoltaic Array',
      capacity: '90 kWp Rated DC',
      currentPower: `${solarKw.toFixed(1)} kW`,
      status: solarKw > 0 ? 'Active Generation' : 'Night Standby',
      health: 89.0,
      voltage: '650 V DC String Bus',
      temperature: `${(telemetry?.temperature || -24) + 6}°C Panel Surface`,
      specs: [
        'Bifacial glass-glass monocrystalline modules (22.4% module efficiency)',
        'Mounted at 65° tilt angle optimized for low polar sun angles and ground snow albedo reflection',
        'Automatic DC string electro-thermal snow melting cycle capability',
        'ABB TRIO-50.0-TL Dual MPPT Polar-spec Inverter String'
      ],
      maintenance: 'Next inspection: Tilt alignment & snow drift clearance in 14 days.'
    },
    wind: {
      id: 'wind',
      name: 'Katabatic-Rated Wind Turbine Array',
      type: 'Direct-Drive Permanent Magnet Synchronous Turbines',
      capacity: '120 kW (2x 60 kW Units)',
      currentPower: `${windKw.toFixed(1)} kW`,
      status: windKw > 2 ? 'Active Synced Generation' : 'Feathered Standby',
      health: 86.5,
      voltage: '480 V AC 3-Phase',
      temperature: '-18.2°C Nacelle Core',
      specs: [
        'Cold-weather alloy steel tower certified for -50°C and 65 m/s gust resilience',
        'Direct-drive gearless permanent magnet generator (eliminates oil freezing risks)',
        'Electro-thermal resistance heating elements embedded in blade leading edges',
        'Cut-in: 3.0 m/s | Rated: 11.5 m/s | Safety Storm Cut-out: 28.0 m/s'
      ],
      maintenance: 'Turbine A yaw ring greasing performed 2 weeks ago; vibration within ISO class II limits.'
    },
    battery: {
      id: 'battery',
      name: 'BESS LiFePO4 Energy Storage Bank',
      type: 'Lithium Iron Phosphate Battery Energy Storage System',
      capacity: '500 kWh Nominal (480V DC)',
      currentPower: `${Math.abs(batKw).toFixed(1)} kW (${batKw < 0 ? 'Charging' : 'Discharging'})`,
      status: soc < 30 ? 'CRITICAL RESERVE' : 'Operational Balanced',
      health: 88.5,
      voltage: `${(460 + (soc / 100) * 48).toFixed(1)} V DC`,
      temperature: '+20.4°C (Enclosure Climatized)',
      specs: [
        'Safe LiFePO4 chemistry with zero thermal runaway propagation',
        'Vacuum-insulated climate container maintaining cell temps at +18°C to +24°C',
        'Enforced reserve buffer: 30% SOC reserved strictly for emergency survival load',
        'Liquid heating loops utilizing generator jacket waste heat recuperation'
      ],
      maintenance: 'Cell balance variance is 8 mV (Excellent). SOH calculated at 88.5%.'
    },
    generators: {
      id: 'generators',
      name: 'Heavy Diesel Auxiliary Power Plant',
      type: 'Caterpillar C4.4 & Volvo Penta Polar Generator Sets',
      capacity: '220 kW Combined (G1 120 kW + G2 100 kW)',
      currentPower: `${genKw.toFixed(1)} kW`,
      status: genKw > 0 ? 'Active Grid Stabilization' : 'Auto-Start Ready',
      health: 78.0,
      voltage: '480 V 3Φ 50 Hz',
      temperature: genKw > 0 ? '84°C Coolant' : '35°C Pre-Heated Block',
      specs: [
        'G1 (120 kW): Primary base unit, specific consumption 0.268 L/kWh at 80% load',
        'G2 (100 kW): Secondary unit (Fuel injector anomaly detected: +14% fuel rate)',
        'G3 (80 kW): Cold emergency backup stationed in independent modular container',
        'Electric jacket block pre-heaters maintain +35°C for instant 10-second start'
      ],
      maintenance: 'Advisory: G2 requires fuel injector spray recalibration before Antarctic winter.'
    },
    bus: {
      id: 'bus',
      name: 'Main 480V Station Distribution AC Bus',
      type: 'Digital Microgrid Switchgear & Synchronizer',
      capacity: '400 kVA Busbar Rating',
      currentPower: `${loadKw.toFixed(1)} kW Managed Flow`,
      status: 'Synchronized & Stable',
      health: 97.0,
      voltage: '480 V ±0.8% (50.02 Hz)',
      temperature: '+14.5°C Switchroom',
      specs: [
        'Solid-state dynamic bus transfer switch with seamless islanding capability',
        'Active harmonic filter maintaining THD < 2.5% under non-linear lab loads',
        'Under-frequency load shedding (UFLS) scheme configured for survival protection',
        'SCADA telemetry sampling at 100 ms intervals over fiber optic ring'
      ],
      maintenance: 'Busbar thermal imaging thermography completed with zero hot spots.'
    },
    loads: {
      id: 'loads',
      name: 'Polar Station Compound Electrical Loads',
      type: 'Segmented Consumer Circuits',
      capacity: '180 kW Peak Infrastructure Load',
      currentPower: `${loadKw.toFixed(1)} kW Total Draw`,
      status: 'Balanced Consumption',
      health: 95.0,
      voltage: '480V / 230V Split',
      temperature: '+19°C Habitat Modules',
      specs: [
        'Priority 1 (Critical - 28 kW): Life support, air handling, satellite comms, fire systems',
        'Priority 2 (Important - 22 kW): Scientific spectrometry, cryogenic sample freezers, water melting',
        'Priority 3 (Flexible - 18 kW): Domestic HVAC heating loops, laundry, galley ovens',
        'Priority 4 (Deferrable - 10 kW): Battery tool charging, non-critical lighting, snow clearing workshops'
      ],
      maintenance: 'All 4 sub-distribution panels operational with zero ground faults.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Polar Microgrid Digital Twin
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physical Topology • Component State Vector & Real-Time Energy Interconnections
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded">
          Click any component to inspect physical diagnostics
        </span>
      </div>

      {/* Visual Digital Twin Schematic Map */}
      <div className="p-8 bg-slate-950/80 border border-slate-800 rounded-2xl relative overflow-hidden backdrop-blur-md">
        {/* Schematic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Generation Column */}
          <div className="space-y-6">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>1. Power Generation Assets</span>
            </div>

            {/* Solar Node */}
            <div
              onClick={() => setSelectedComp(components.solar)}
              className="p-5 rounded-xl bg-slate-900/90 border-2 border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md shadow-amber-500/5 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="font-bold text-sm text-white">Solar PV Array</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {components.solar.capacity}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">
                {components.solar.currentPower}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Health: {components.solar.health}%</span>
                <span className="text-amber-400 flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
              </div>
            </div>

            {/* Wind Node */}
            <div
              onClick={() => setSelectedComp(components.wind)}
              className="p-5 rounded-xl bg-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md shadow-cyan-500/5 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wind className="w-5 h-5 text-cyan-400 group-hover:rotate-90 transition-transform" />
                  <span className="font-bold text-sm text-white">Wind Turbine Array</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {components.wind.capacity}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300">
                {components.wind.currentPower}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Health: {components.wind.health}%</span>
                <span className="text-cyan-400 flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
              </div>
            </div>
          </div>

          {/* Central Bus & Storage Column */}
          <div className="space-y-6">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>2. Storage & Distribution Core</span>
            </div>

            {/* Main AC Bus Node */}
            <div
              onClick={() => setSelectedComp(components.bus)}
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 hover:border-cyan-300 cursor-pointer transition-all hover:scale-[1.02] shadow-xl shadow-cyan-500/10 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/15 text-cyan-400 mb-2">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">
                Central Microgrid AC Bus
              </h3>
              <div className="text-3xl font-black font-mono text-cyan-200 mt-2">
                {components.bus.currentPower}
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1">
                480V 3Φ • 50.02 Hz Stable
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-center">
                Click to inspect switchgear telemetry
              </div>
            </div>

            {/* Battery BESS Node */}
            <div
              onClick={() => setSelectedComp(components.battery)}
              className={`p-5 rounded-xl bg-slate-900/90 border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                soc < 30
                  ? 'border-rose-500/60 shadow-md shadow-rose-500/10'
                  : 'border-emerald-500/40 hover:border-emerald-400 shadow-md shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <BatteryCharging className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">LiFePO4 BESS Storage</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {soc.toFixed(1)}% SOC
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {components.battery.currentPower}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Health: {components.battery.health}%</span>
                <span className="text-emerald-400 flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
              </div>
            </div>
          </div>

          {/* Backup & Demand Column */}
          <div className="space-y-6">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>3. Backup Generation & Consumers</span>
            </div>

            {/* Generator Plant Node */}
            <div
              onClick={() => setSelectedComp(components.generators)}
              className="p-5 rounded-xl bg-slate-900/90 border-2 border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md shadow-amber-500/5 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Flame className={`w-5 h-5 ${genKw > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="font-bold text-sm text-white">Diesel Gen Plant (G1-G3)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {components.generators.capacity}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {components.generators.currentPower}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Health: {components.generators.health}%</span>
                <span className="text-amber-400 flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
              </div>
            </div>

            {/* Station Load Compound Node */}
            <div
              onClick={() => setSelectedComp(components.loads)}
              className="p-5 rounded-xl bg-slate-900/90 border-2 border-blue-500/40 hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md shadow-blue-500/5 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-white">Station Load Sectors</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  4 Priorities
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-300">
                {components.loads.currentPower}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Critical Circuit Protected</span>
                <span className="text-blue-400 flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Details Modal / Drawer */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  Digital Twin Physical Telemetry
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedComp.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedComp.type}</p>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sensor Stats Strip */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Power Output</span>
                <div className="text-base font-bold text-cyan-300 mt-0.5">{selectedComp.currentPower}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Bus Voltage</span>
                <div className="text-base font-bold text-white mt-0.5">{selectedComp.voltage}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Temperature</span>
                <div className="text-base font-bold text-amber-300 mt-0.5">{selectedComp.temperature}</div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wide font-semibold">
                Physical Design & Engineering Specifications
              </h4>
              <div className="space-y-1.5 font-mono text-xs text-slate-300">
                {selectedComp.specs.map((spec, i) => (
                  <div key={i} className="flex items-start space-x-2 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Advisory */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="text-white font-semibold">Maintenance Status:</span> {selectedComp.maintenance}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComp(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
