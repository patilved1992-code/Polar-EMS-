import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  status?: 'normal' | 'warning' | 'critical' | 'highlight';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  status = 'normal'
}) => {
  const statusStyles = {
    normal: 'border-slate-800 bg-slate-900/60 text-slate-100',
    highlight: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 shadow-sm shadow-cyan-500/10',
    warning: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    critical: 'border-rose-500/50 bg-rose-950/30 text-rose-300 shadow-sm shadow-rose-500/20 animate-pulse',
  };

  const iconColors = {
    normal: 'text-slate-400 bg-slate-800/80',
    highlight: 'text-cyan-400 bg-cyan-900/40',
    warning: 'text-amber-400 bg-amber-900/40',
    critical: 'text-rose-400 bg-rose-900/40',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${statusStyles[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-medium">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${iconColors[status]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-extrabold font-mono tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-400 uppercase">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/60 pt-2">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};
