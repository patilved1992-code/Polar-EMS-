import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Snowflake, Leaf, Zap, Sun } from 'lucide-react';
import { useTheme, Theme, THEME_OPTIONS } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (id: Theme) => {
    switch (id) {
      case 'arctic':
        return Snowflake;
      case 'emerald':
        return Leaf;
      case 'amber':
        return Zap;
      case 'light':
        return Sun;
    }
  };

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = getThemeIcon(theme);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Change Visual Theme"
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all text-xs font-medium shadow-sm"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-700/50"
          style={{ backgroundColor: currentThemeObj.accentColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden md:inline font-mono text-[11px] font-semibold text-slate-200">
          {currentThemeObj.name}
        </span>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 backdrop-blur-xl animate-fadeIn">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Theme Palettes</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">4 Presets</span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((option) => {
              const Icon = getThemeIcon(option.id);
              const isActive = theme === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start space-x-3 border ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                      : 'border-transparent hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  {/* Swatch & Icon */}
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border shadow-inner mt-0.5"
                    style={{
                      backgroundColor: option.previewBg,
                      borderColor: option.accentColor
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: option.accentColor }} />
                  </div>

                  {/* Title and description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {option.name}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
