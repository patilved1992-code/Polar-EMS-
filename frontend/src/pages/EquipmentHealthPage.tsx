import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Cpu,
  Calendar,
  ShieldAlert,
  Search,
  Flame,
  Battery,
  Sun,
  Wind,
  Layers
} from 'lucide-react';
import { StationId, EquipmentItem, AlertItem } from '../types';
import { api } from '../services/api';

interface EquipmentHealthPageProps {
  stationId: StationId;
}

export const EquipmentHealthPage: React.FC<EquipmentHealthPageProps> = ({ stationId }) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getEquipmentHealth(stationId),
      api.getAlerts(stationId)
    ])
      .then(([eq, al]) => {
        setEquipment(eq);
        setAlerts(al);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Equipment error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [stationId]);

  const handleAck = (id: number) => {
    api.acknowledgeAlert(id).then(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    });
  };

  const getEquipIcon = (type: string) => {
    switch (type) {
      case 'generator':
        return Flame;
      case 'battery':
        return Battery;
      case 'solar_inverter':
        return Sun;
      case 'wind_turbine':
        return Wind;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Equipment Predictive Maintenance & Anomaly Detection
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Statistical Residuals & Isolation Forest Anomaly Analysis for Harsh Polar Environments
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded">
          {equipment.length} Monitored Assets
        </span>
      </div>

      {/* Equipment Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((item) => {
          const Icon = getEquipIcon(item.type);
          const hasAnomaly = item.anomaly_prob >= 0.50 || item.health_score < 75;
          const isWarning = item.anomaly_prob >= 0.20 && item.anomaly_prob < 0.50;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                hasAnomaly
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${
                      hasAnomaly ? 'bg-rose-900/40 text-rose-300' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{item.type.replace('_', ' ')} • {item.capacity_kw} kW</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    hasAnomaly
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {hasAnomaly ? 'ANOMALY DETECTED' : 'NOMINAL'}
                  </span>
                </div>

                {/* Score Strip */}
                <div className="grid grid-cols-2 gap-2 my-3 font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase">Health Score</span>
                    <div className={`text-xl font-bold ${
                      item.health_score < 75 ? 'text-rose-400' : item.health_score < 85 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.health_score}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase">Anomaly Probability</span>
                    <div className={`text-xl font-bold ${
                      item.anomaly_prob > 0.5 ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {Math.round(item.anomaly_prob * 100)}%
                    </div>
                  </div>
                </div>

                {/* Issue Diagnosis */}
                {item.possible_issue && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Detected Issue:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.possible_issue}</p>
                  </div>
                )}

                {/* Recommended Maintenance */}
                {item.recommended_action && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center space-x-1">
                      <Wrench className="w-3 h-3" />
                      <span>Recommended Maintenance Action:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.recommended_action}</p>
                  </div>
                )}
              </div>

              {/* Run Hours & Service Date Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.hours_run.toLocaleString()} run hours</span>
                </span>
                <span>Serviced: {item.last_serviced || 'N/A'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Predictive Maintenance Alerts */}
      <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Active Predictive Maintenance Log & Advisories
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {alerts.filter((a) => !a.acknowledged).length} Unacknowledged Alerts
          </span>
        </div>

        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                a.acknowledged
                  ? 'bg-slate-900/30 border-slate-800/50 text-slate-500'
                  : a.severity === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  a.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {a.severity}
                </span>
                <div>
                  <span className="font-semibold text-white mr-2">[{a.component}]</span>
                  <span>{a.message}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[10px] text-slate-400">{a.timestamp.slice(0, 16).replace('T', ' ')}</span>
                {!a.acknowledged && (
                  <button
                    onClick={() => handleAck(a.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-[10px]"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
