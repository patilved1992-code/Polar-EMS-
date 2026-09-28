import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SurvivalModeBanner } from './components/SurvivalModeBanner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ForecastPage } from './pages/ForecastPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { EquipmentHealthPage } from './pages/EquipmentHealthPage';
import { CopilotPage } from './pages/CopilotPage';
import { StationComparePage } from './pages/StationComparePage';
import { LoadPriorityPage } from './pages/LoadPriorityPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { StationId, TelemetryCurrent, WeatherCurrent, User } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    email: 'operator@polar-ems.local',
    name: 'Dr. Arjun Verma',
    role: 'operator',
    title: 'Station Shift Operator (Bharati)'
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stationId, setStationId] = useState<StationId>('bharati');
  const [telemetry, setTelemetry] = useState<TelemetryCurrent | null>(null);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Sync telemetry and weather data
  const refreshTelemetry = useCallback(async () => {
    try {
      const [tData, wData] = await Promise.all([
        api.getCurrentTelemetry(stationId),
        api.getCurrentWeather()
      ]);
      setTelemetry(tData);
      setWeather(wData);
      if (tData.active_scenario) {
        setActiveScenario(tData.active_scenario);
      }
    } catch (err) {
      console.error('Failed to sync telemetry:', err);
    }
  }, [stationId]);

  useEffect(() => {
    refreshTelemetry();
  }, [refreshTelemetry]);

  // Polling loop for live demonstration micro-fluctuations
  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(refreshTelemetry, 3000);
    return () => clearInterval(interval);
  }, [demoMode, refreshTelemetry]);

  // Scenario trigger handler
  const handleTriggerScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      const res = await api.triggerScenario(scenario, stationId);
      if (res && res.telemetry) {
        setTelemetry(res.telemetry);
      } else {
        await refreshTelemetry();
      }
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
      await refreshTelemetry();
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  const isSurvivalActive = Boolean(
    telemetry?.survival_mode ||
    (telemetry?.battery_soc !== undefined && telemetry.battery_soc < (telemetry.min_soc ?? 30)) ||
    activeScenario === 'arctic_storm' ||
    activeScenario === 'generator_failure'
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        stationId={stationId}
        survivalMode={isSurvivalActive}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <Header
          stationId={stationId}
          setStationId={(id) => {
            setStationId(id);
            refreshTelemetry();
          }}
          activeScenario={activeScenario}
          onTriggerScenario={handleTriggerScenario}
          demoMode={demoMode}
          setDemoMode={setDemoMode}
          isSimulated={telemetry?.is_simulated ?? true}
          onRefresh={refreshTelemetry}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-radial from-slate-900/60 to-slate-950">
          {/* Survival Mode Banner Notification */}
          <SurvivalModeBanner
            active={isSurvivalActive}
            activeScenario={activeScenario}
            soc={telemetry?.battery_soc ? Number(telemetry.battery_soc.toFixed(1)) : 28.5}
            minSoc={telemetry?.min_soc ?? 30}
          />

          {/* Active View Routing */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              telemetry={telemetry}
              weather={weather}
              stationId={stationId}
              onNavigate={setActiveTab}
              onTriggerScenario={handleTriggerScenario}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage stationId={stationId} />}

          {activeTab === 'forecast' && <ForecastPage stationId={stationId} />}

          {activeTab === 'optimization' && <OptimizationPage stationId={stationId} />}

          {activeTab === 'digital-twin' && (
            <DigitalTwinPage telemetry={telemetry} stationId={stationId} />
          )}

          {activeTab === 'simulator' && <WhatIfSimulatorPage stationId={stationId} />}

          {activeTab === 'equipment' && <EquipmentHealthPage stationId={stationId} />}

          {activeTab === 'copilot' && (
            <CopilotPage stationId={stationId} telemetry={telemetry} />
          )}

          {activeTab === 'compare' && (
            <StationComparePage
              currentStationId={stationId}
              onSelectStation={(id) => {
                setStationId(id);
                refreshTelemetry();
              }}
            />
          )}

          {activeTab === 'priority' && (
            <LoadPriorityPage stationId={stationId} telemetry={telemetry} />
          )}

          {activeTab === 'reports' && <ReportsPage stationId={stationId} />}

          {activeTab === 'settings' && (
            <SettingsPage stationId={stationId} onNavigate={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
