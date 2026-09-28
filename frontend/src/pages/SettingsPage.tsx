import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle,
  Shield,
  Sliders,
  Flame,
  DollarSign,
  Cpu,
  Database,
  Radio,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Palette,
  Check
} from 'lucide-react';
import { StationId } from '../types';
import { api } from '../services/api';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';

interface SettingsPageProps {
  stationId: StationId;
  onNavigate?: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ stationId, onNavigate }) => {
  const { theme, setTheme } = useTheme();
  const [fuelCost, setFuelCost] = useState('1.45');
  const [co2Factor, setCo2Factor] = useState('2.68');
  const [minBessSoc, setMinBessSoc] = useState('30');
  const [coldTempCutoff, setColdTempCutoff] = useState('-40');
  const [aiProvider, setAiProvider] = useState<'local' | 'gemini' | 'openai'>('local');
  const [apiKey, setApiKey] = useState('');
  const [pollingInterval, setPollingInterval] = useState('3');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reOptResult, setReOptResult] = useState<any>(null);

  useEffect(() => {
    api.getSettings()
      .then((s) => {
        setFuelCost(String(s.fuel_cost_per_l));
        setCo2Factor(String(s.co2_factor));
        setMinBessSoc(String(s.min_bess_soc));
        setColdTempCutoff(String(s.cold_temp_cutoff));
        setAiProvider((s.ai_provider as any) || 'local');
        setApiKey(s.api_key || '');
        setPollingInterval(String(s.polling_interval_sec));
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.saveSettings({
        fuel_cost_per_l: parseFloat(fuelCost) || 1.45,
        co2_factor: parseFloat(co2Factor) || 2.68,
        min_bess_soc: parseFloat(minBessSoc) || 30.0,
        cold_temp_cutoff: parseFloat(coldTempCutoff) || -40.0,
        ai_provider: aiProvider,
        api_key: apiKey,
        polling_interval_sec: parseInt(pollingInterval, 10) || 3,
      });
      setReOptResult(res.re_optimized_result || null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 8000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFuelCost('1.45');
    setCo2Factor('2.68');
    setMinBessSoc('30');
    setColdTempCutoff('-40');
    setAiProvider('local');
    setApiKey('');
    setPollingInterval('3');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-1">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-wide">
            System Parameters & Polar Operational Constraints
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Tune optimization parameters, safety thresholds, and AI provider configurations for {stationId.toUpperCase()} Station.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-5 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-emerald-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm">
                Configuration Saved to Database & Microgrid Dispatch Re-Optimized!
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE OPTIMIZER SYNCED
            </span>
          </div>

          {reOptResult && (
            <div className="pt-3 border-t border-emerald-500/20">
              <p className="text-xs text-slate-300 mb-3">
                The MILP dispatch solver automatically re-evaluated the 24-hour microgrid plan with your updated constraints (BESS Reserve: ≥{minBessSoc}%, Fuel: ${fuelCost}/L, CO2: {co2Factor} kg/L):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Projected Fuel Saved</div>
                  <div className="text-lg font-bold font-mono text-emerald-300">
                    {reOptResult.fuel_saved_l} <span className="text-xs font-normal text-slate-400">Litres</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Avoided CO2</div>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    {reOptResult.co2_reduction_kg} <span className="text-xs font-normal text-slate-400">kg CO2</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-amber-500/30">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cost Savings</div>
                  <div className="text-lg font-bold font-mono text-amber-300">
                    ${reOptResult.cost_saved_usd} <span className="text-xs font-normal text-slate-400">USD</span>
                  </div>
                </div>
              </div>

              {onNavigate && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNavigate('optimization')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <span>View 24h Optimization Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Display Theme & Visual Palette */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Display Theme & Visual Color Palette
          </h2>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Select an operational color theme tailored for Antarctic station conditions, high-contrast dark environments, or daylight control-room monitoring.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEME_OPTIONS.map((opt) => {
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-md"
                      style={{ backgroundColor: opt.accentColor }}
                    />
                    <span className="font-bold text-sm text-white">{opt.name}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                  
                <p className="text-xs text-slate-400 mb-3">{opt.description}</p>

                <div className="flex items-center space-x-2 pt-2.5 border-t border-slate-800/60">
                  <span
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      backgroundColor: opt.previewBg,
                      border: `1px solid ${opt.previewBorder}`
                    }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded"
                    style={{ backgroundColor: opt.previewBorder }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded"
                    style={{ backgroundColor: opt.accentColor }}
                  />
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Economic & Carbon Factor Parameters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Economic & Carbon Emission Coefficients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Polar Diesel Delivered Fuel Cost ($ / Liter)
              </label>
              <input
                type="number"
                step="0.01"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Reflects icebreaker transport, helicopter sling loads, and polar fuel logistics surcharge.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Diesel CO2 Emission Factor (kg CO2 / Liter)
              </label>
              <input
                type="number"
                step="0.01"
                value={co2Factor}
                onChange={(e) => setCo2Factor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Arctic Grade Light Diesel default: 2.68 kg CO2 per liter burned.
              </p>
            </div>
          </div>
        </div>

        {/* Polar Safety & Invariant Constraints */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Life-Support & Safety Hard Constraints
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                BESS Minimum Reserve Constraint (% SOC)
              </label>
              <input
                type="number"
                min="20"
                max="50"
                value={minBessSoc}
                onChange={(e) => setMinBessSoc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hard safety floor: battery will NEVER discharge below this percentage to guarantee habitat life support.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Diesel Cold-Start Interlock (°C)
              </label>
              <input
                type="number"
                value={coldTempCutoff}
                onChange={(e) => setColdTempCutoff(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Requires 15-minute auxiliary block heater circulation before starting cold genset below this temperature.
              </p>
            </div>
          </div>
        </div>

        {/* AI & Copilot Inference Engine Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Copilot & Optimization Engine Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Inference Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAiProvider('local')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    aiProvider === 'local'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-cyan-300">Offline Polar Heuristics</span>
                  <span className="text-[11px] text-slate-400">Zero latency, air-gapped station deployment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider('gemini')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    aiProvider === 'gemini'
                      ? 'bg-blue-950/40 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-blue-300">Google Gemini 1.5</span>
                  <span className="text-[11px] text-slate-400">Cloud LLM with polar microgrid context</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider('openai')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    aiProvider === 'openai'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs block text-emerald-300">OpenAI GPT-4o</span>
                  <span className="text-[11px] text-slate-400">Cloud LLM with multi-horizon chain-of-thought</span>
                </button>
              </div>
            </div>

            {aiProvider !== 'local' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {aiProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste cloud API key here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telemetry Polling Cadence (Seconds)
              </label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="2">2 seconds (High frequency / Demo mode)</option>
                <option value="3">3 seconds (Standard demonstration)</option>
                <option value="5">5 seconds (Reduced bandwidth mode)</option>
                <option value="10">10 seconds (Low power satlink)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
