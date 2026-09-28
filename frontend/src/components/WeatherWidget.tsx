import React from 'react';
import { Thermometer, Wind, Sun, Gauge, Droplets, CloudSnow } from 'lucide-react';
import { WeatherCurrent } from '../types';

interface WeatherWidgetProps {
  weather: WeatherCurrent | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-500 font-mono">
        Reading Antarctic Met Station...
      </div>
    );
  }

  const isStorm = weather.wind_speed > 28.0 || weather.temperature < -35.0;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isStorm
        ? 'border-rose-500/50 bg-rose-950/20'
        : 'border-slate-800 bg-slate-900/60'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-medium flex items-center space-x-1.5">
          <CloudSnow className="w-3.5 h-3.5 text-cyan-400" />
          <span>Surface Meteorology</span>
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
          isStorm
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          {weather.condition_label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {/* Temp & Wind Chill */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] mb-1">
            <Thermometer className="w-3 h-3 text-blue-400" />
            <span>TEMPERATURE</span>
          </div>
          <div className="text-lg font-bold text-white">
            {weather.temperature}°C
          </div>
          <div className="text-[10px] text-cyan-400">
            Chill: {weather.wind_chill_c}°C
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] mb-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>KATABATIC WIND</span>
          </div>
          <div className="text-lg font-bold text-white">
            {weather.wind_speed} <span className="text-[10px] text-slate-400">m/s</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Gusts: {weather.gust_speed} m/s
          </div>
        </div>

        {/* Solar Irradiance */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] mb-1">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>INSOLATION</span>
          </div>
          <div className="text-lg font-bold text-white">
            {weather.solar_irradiance} <span className="text-[10px] text-slate-400">W/m²</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Cloud: {Math.round(weather.cloud_cover * 100)}%
          </div>
        </div>

        {/* Pressure & Humidity */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] mb-1">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>BAROMETER</span>
          </div>
          <div className="text-lg font-bold text-white">
            {weather.pressure} <span className="text-[10px] text-slate-400">hPa</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Humidity: {weather.humidity}%
          </div>
        </div>
      </div>
    </div>
  );
};
