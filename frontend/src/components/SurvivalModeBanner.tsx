import React from 'react';
import { AlertOctagon, ShieldAlert, ZapOff, CheckCircle } from 'lucide-react';

interface SurvivalModeBannerProps {
  active: boolean;
  activeScenario: string;
  soc: number;
  minSoc?: number;
  onDismiss?: () => void;
}

export const SurvivalModeBanner: React.FC<SurvivalModeBannerProps> = ({
  active,
  activeScenario,
  soc,
  minSoc = 30,
  onDismiss
}) => {
  if (!active) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-500 shadow-xl shadow-rose-950/50 text-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-rose-900 border border-rose-500 text-rose-200 mt-0.5 md:mt-0">
          <AlertOctagon className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black tracking-widest bg-rose-800 px-2 py-0.5 rounded text-white border border-rose-400">
              ALERT LEVEL 1
            </span>
            <h2 className="text-base font-black tracking-wider uppercase text-white">
              POLAR SURVIVAL MODE ACTIVE
            </h2>
          </div>
          <p className="text-xs text-rose-200 mt-1 max-w-3xl leading-relaxed">
            {activeScenario === 'arctic_storm'
              ? 'Severe Antarctic blizzard detected. Wind turbines feathered for safety. Deferrable HVAC and non-essential lab loads have been shed to protect life-support thermal loops and communication arrays.'
              : activeScenario === 'generator_failure'
              ? 'Generator G2 has tripped mechanically. Microgrid bus is operating on BESS reserve and Generator G1/G3. Shedding non-critical loads to prevent blackout.'
              : `Battery SOC has depleted to ${soc}% (at or below critical ${minSoc}% reserve boundary). Emergency load preservation protocol initiated.`}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 font-mono text-xs">
        <div className="px-3 py-1.5 rounded bg-black/40 border border-rose-400/40 text-rose-300 text-[11px]">
          Priority: CRITICAL LOADS ONLY
        </div>
      </div>
    </div>
  );
};
