import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Database,
  Compass,
  Cpu,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { StationId, TelemetryCurrent, CopilotResponse } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  context?: Record<string, any>;
  timestamp: string;
}

interface CopilotPageProps {
  stationId: StationId;
  telemetry: TelemetryCurrent | null;
}

const PRESET_QUESTIONS = [
  "Why is diesel consumption higher than normal right now?",
  "Should I start G2 generator immediately?",
  "What happens if wind speed drops by 30% tonight?",
  "Recommend the best time to run the high-load water desalinator",
  "Explain the current load shedding risk and battery reserve status",
  "What is the health and degradation status of Battery Bank Alpha?"
];

export const CopilotPage: React.FC<CopilotPageProps> = ({ stationId, telemetry }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Greetings, Station Operator. I am **POLAR-EMS Energy Copilot**, powered by real-time microgrid telemetry, multi-horizon ML forecasting, and the Polar Dispatch Optimization Engine.\n\nI continuously monitor renewable generation, battery storage state-of-charge, generator fuel consumption rates, and weather trends at **${stationId.toUpperCase()} Station** to provide explainable operational guidance.\n\nHow may I assist you with energy dispatch or microgrid diagnostics today?`,
      sources: ['Station Microgrid Telemetry', 'Polar Dispatch Rulebook v4.2'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const query = questionText || input.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res: CopilotResponse = await api.sendCopilotChat(query, stationId);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        sources: res.sources_used,
        context: res.context_data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `**Operational Alert:** Unable to contact Copilot inference engine. Reason: ${err.message}. Using cached polar heuristic rules: Priority 1: Preserve BESS SOC ≥ 30%. Priority 2: Maximize wind utilization.`,
        sources: ['Local Heuristics Fallback'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Session reset. Ready for new operational inquiries for **${stationId.toUpperCase()} Station**.`,
        sources: ['System'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      // Check for bullet points
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ') || paragraph.includes('\n- ')) {
        const items = paragraph.split('\n').filter(Boolean);
        return (
          <ul key={pIdx} className="space-y-1.5 my-2 list-disc list-inside text-sm text-slate-300">
            {items.map((item, itemIdx) => {
              const cleanItem = item.replace(/^[-*]\s+/, '');
              return (
                <li key={itemIdx} className="leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: formatBold(cleanItem) }} />
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p key={pIdx} className="text-sm leading-relaxed text-slate-200 mb-2 last:mb-0"
           dangerouslySetInnerHTML={{ __html: formatBold(paragraph) }}
        />
      );
    });
  };

  const formatBold = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 text-xs font-mono">$1</code>');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Chat Top Banner */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">Polar Energy AI Copilot</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Station: {stationId.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trained on Antarctic Station Microgrid dynamics & dispatch constraints
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-md shadow-cyan-500/20'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-xl p-4.5 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg'
                    : 'bg-slate-800/90 border border-slate-700/80 rounded-tl-none shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/10 text-xs opacity-75">
                  <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Polar Energy Copilot'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                <div className="text-sm">
                  {msg.sender === 'user' ? (
                    <p className="leading-relaxed">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>

                {/* Sources & Context Data Badges */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Database className="w-3 h-3 text-cyan-400" /> Evidence:
                    </span>
                    {msg.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-cyan-300"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl rounded-tl-none p-4 shadow-lg flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-400 font-mono">Analyzing station telemetry & dispatch rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Query Pills */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recommended Operator Queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-slate-300 transition-all text-left truncate max-w-xs disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Polar Copilot about ${stationId.toUpperCase()} power dispatch, generator health, or weather forecast...`}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Telemetry Snapshot & Knowledge Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Live Context Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Agent Context</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Active Station</span>
              <span className="font-semibold text-white font-mono">{stationId.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Current Station Load</span>
              <span className="font-semibold text-cyan-300 font-mono">
                {telemetry ? `${telemetry.load_kw.toFixed(1)} kW` : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Renewable Output</span>
              <span className="font-semibold text-emerald-300 font-mono">
                {telemetry ? `${telemetry.renewable_kw.toFixed(1)} kW (${telemetry.renewable_pct.toFixed(0)}%)` : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Battery SOC</span>
              <span className={`font-semibold font-mono ${
                (telemetry?.battery_soc || 0) < 30 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {telemetry ? `${telemetry.battery_soc.toFixed(1)}%` : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Diesel Gen Active</span>
              <span className="font-semibold text-amber-300 font-mono">
                {telemetry ? `${telemetry.generator_kw.toFixed(1)} kW` : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Fuel Burn Rate</span>
              <span className="font-semibold text-amber-400 font-mono">
                {telemetry ? `${telemetry.fuel_rate.toFixed(1)} L/h` : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Survival Mode State</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                telemetry?.survival_mode
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {telemetry?.survival_mode ? 'ACTIVATED (SHEDDING)' : 'NORMAL OPERATION'}
              </span>
            </div>
          </div>
        </div>

        {/* Operating Rules & Constraints */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex-1">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Hard Invariant Constraints</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <p className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                BESS Protection Rule
              </p>
              <p className="text-[11px] text-slate-400">
                Reserve margin strictly ≥ 30% SOC. Discharge cuts off automatically below this threshold to safeguard habitat life-support.
              </p>
            </div>

            <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Dispatch Merit Order
              </p>
              <p className="text-[11px] text-slate-400">
                Solar PV &rarr; Wind Turbines &rarr; Battery Discharge &rarr; Diesel Gensets (G1 base-load, G2 peaker).
              </p>
            </div>

            <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Cold Soak Engine Guard
              </p>
              <p className="text-[11px] text-slate-400">
                Block cold diesel starts below -35°C without 15 min block heater warmup cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
