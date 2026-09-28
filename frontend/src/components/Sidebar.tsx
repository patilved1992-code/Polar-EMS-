import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  BrainCircuit,
  Sliders,
  Cpu,
  FlaskConical,
  Wrench,
  Bot,
  Layers,
  ListOrdered,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Radio
} from 'lucide-react';
import { User, StationId } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  stationId: StationId;
  survivalMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  stationId,
  survivalMode
}) => {
  const { theme } = useTheme();

  const getBrandIcon = () => {
    switch (theme) {
      case 'emerald': return '🍃';
      case 'amber': return '⚡';
      case 'light': return '☀️';
      default: return '❄';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'analytics', label: 'Energy Analytics', icon: LineChart },
    { id: 'forecast', label: 'AI Forecast', icon: BrainCircuit },
    { id: 'optimization', label: 'Energy Optimization', icon: Sliders },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { id: 'simulator', label: 'What-If Simulator', icon: FlaskConical },
    { id: 'equipment', label: 'Equipment Health', icon: Wrench },
    { id: 'copilot', label: 'AI Energy Copilot', icon: Bot },
    { id: 'compare', label: 'Station Compare', icon: Layers },
    { id: 'priority', label: 'Load Priority', icon: ListOrdered },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col h-screen select-none backdrop-blur-md shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-lg shadow-cyan-500/20">
            {getBrandIcon()}
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 tracking-wider text-base leading-tight">POLAR-EMS</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">NCPOR Polar System</p>
          </div>
        </div>
      </div>

      {/* Station Node Badge */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${survivalMode ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${survivalMode ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="font-mono text-slate-300 font-medium">Node: {stationId.toUpperCase()}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
          70°S EDGE
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Survival Mode Indicator */}
      {survivalMode && (
        <div className="mx-3 mb-3 p-2.5 rounded bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs flex items-center space-x-2 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tracking-wide">SURVIVAL PROTOCOL</span>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-slate-200 truncate">{currentUser?.name || 'Operator'}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate uppercase">{currentUser?.title || 'Station Operator'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Switch User / Logout"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
