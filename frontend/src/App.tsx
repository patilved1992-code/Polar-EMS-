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
      console.warn('Backend offline or connecting, using autonomous edge fallback:', err);
      setTelemetry((prev) => {
        if (prev && !prev.is_simulated) return prev;
        const now = new Date();
        const baseLoad = stationId === 'bharati' ? 68.4 : 52.1;
        const windGen = 92.5 + Math.sin(Date.now() / 5000) * 8;
        return {
          timestamp: now.toISOString(),
          station_id: stationId,
          load_kw: Math.round(baseLoad * 10) / 10,
          solar_kw: 0.0,
          wind_kw: Math.round(windGen * 10) / 10,
          generator_kw: 0.0,
          battery_kw: Math.round((baseLoad - windGen) * 10) / 10,
          battery_soc: 94.0,
          fuel_rate: 0.0,
          temperature: -26.4,
          is_simulated: true,
          renewable_kw: Math.round(windGen * 10) / 10,
          renewable_pct: 100.0,
          co2_rate_kg_per_hr: 0.0,
          system_health_pct: 96.0,
          survival_mode: false,
          active_scenario: 'normal',
          alert_count: 2,
          station_local_time: now.toLocaleTimeString(),
          station_timezone: stationId === 'bharati' ? 'UTC+05:00 (Bharati)' : 'UTC+05:00 (Maitri)',
          station_utc_offset: 5.0,
          utc_time: now.toUTCString(),
          min_soc: 35.0,
        };
      });
      setWeather((prev) => {
        if (prev) return prev;
        return {
          timestamp: new Date().toISOString(),
          temperature: -26.4,
          wind_speed: 23.3,
          wind_direction: 151.0,
          pressure: 999.2,
          humidity: 72.5,
          solar_irradiance: 0.0,
          cloud_cover: 0.44,
          condition_label: 'Polar Katabatic Wind Loop',
          gust_speed: 31.5,
          wind_chill_c: -39.4,
        };
      });
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
