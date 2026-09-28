import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, ArrowRight, Zap } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const demoProfiles: User[] = [
    {
      email: 'operator@polar-ems.local',
      name: 'Dr. Arjun Verma',
      role: 'operator',
      title: 'Station Shift Operator (Bharati)'
    },
    {
      email: 'engineer@polar-ems.local',
      name: 'Elena Rostova',
      role: 'engineer',
      title: 'Microgrid Energy Systems Engineer'
    },
    {
      email: 'admin@polar-ems.local',
      name: 'Dr. S. K. Nair',
      role: 'admin',
      title: 'NCPOR Antarctic Operations Director'
    }
  ];

  const [selectedProfile, setSelectedProfile] = useState<User>(demoProfiles[0]);

  const handleSelect = (p: User) => {
    setSelectedProfile(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedProfile);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white text-2xl font-black mb-4 shadow-xl shadow-cyan-500/20">
            ❄
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">POLAR-EMS</h1>
          <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-widest">
            AI-Driven Smart Energy Management
          </p>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Antarctic Research Stations Telemetry Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
              Select Demo Access Role:
            </label>
            <div className="space-y-2.5">
              {demoProfiles.map((p) => {
                const isSelected = selectedProfile.email === p.email;
                return (
                  <div
                    key={p.email}
                    onClick={() => handleSelect(p)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs tracking-wide text-white">{p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{p.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{p.email}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <span>Access Command System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[10px] font-mono text-slate-500">
            Smart India Hackathon Prototype • Authenticated Local Edge Node
          </p>
        </div>
      </div>
    </div>
  );
};
