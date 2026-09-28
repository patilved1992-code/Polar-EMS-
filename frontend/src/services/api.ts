import {
  StationId,
  TelemetryCurrent,
  TelemetryHistory,
  WeatherCurrent,
  BatteryCurrent,
  EquipmentItem,
  AlertItem,
  ForecastSeries,
  OptimizationResult,
  WhatIfResponse,
  CopilotResponse,
  SystemSettings
} from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Telemetry
  getCurrentTelemetry: (stationId: StationId = 'bharati'): Promise<TelemetryCurrent> =>
    request<TelemetryCurrent>(`/telemetry/current?station_id=${stationId}`),

  getTelemetryHistory: (stationId: StationId = 'bharati', timeframe = '24h'): Promise<TelemetryHistory> =>
    request<TelemetryHistory>(`/telemetry/history?station_id=${stationId}&timeframe=${timeframe}`),

  // Weather
  getCurrentWeather: (): Promise<WeatherCurrent> =>
    request<WeatherCurrent>('/weather/current'),

  // Battery
  getCurrentBattery: (stationId: StationId = 'bharati'): Promise<BatteryCurrent> =>
    request<BatteryCurrent>(`/battery/current?station_id=${stationId}`),

  // Equipment & Alerts
  getEquipmentHealth: (stationId: StationId = 'bharati'): Promise<EquipmentItem[]> =>
    request<EquipmentItem[]>(`/equipment/health?station_id=${stationId}`),

  getAlerts: (stationId: StationId = 'bharati'): Promise<AlertItem[]> =>
    request<AlertItem[]>(`/alerts?station_id=${stationId}`),

  acknowledgeAlert: (alertId: number): Promise<{ status: string }> =>
    request<{ status: string }>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),

  // Forecasts
  getForecast: (metric: 'load' | 'solar' | 'wind' | 'renewable', stationId: StationId = 'bharati', horizon = '24h'): Promise<ForecastSeries> =>
    request<ForecastSeries>(`/forecast/${metric}?station_id=${stationId}&horizon=${horizon}`),

  // Optimization
  runOptimization: (
    stationId: StationId = 'bharati',
    horizonHours = 24,
    options?: { min_soc?: number; fuel_cost_per_l?: number; co2_factor?: number; protect_critical_only?: boolean }
  ): Promise<OptimizationResult> =>
    request<OptimizationResult>('/optimization/run', {
      method: 'POST',
      body: JSON.stringify({
        station_id: stationId,
        horizon_hours: horizonHours,
        ...options,
      }),
    }),

  getLatestOptimization: (stationId: StationId = 'bharati'): Promise<OptimizationResult> =>
    request<OptimizationResult>(`/optimization/latest?station_id=${stationId}`),

  // Settings
  getSettings: (): Promise<SystemSettings> =>
    request<SystemSettings>('/settings'),

  saveSettings: (settings: Partial<SystemSettings>): Promise<any> =>
    request<any>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  // Scenarios
  triggerScenario: (scenario: string, stationId: StationId = 'bharati'): Promise<any> =>
    request<any>('/scenario/run', {
      method: 'POST',
      body: JSON.stringify({ scenario, station_id: stationId }),
    }),

  getScenarioStatus: (stationId: StationId = 'bharati'): Promise<any> =>
    request<any>(`/scenario/status?station_id=${stationId}`),

  // What-If
  runWhatIf: (params: any): Promise<WhatIfResponse> =>
    request<WhatIfResponse>('/scenario/whatif', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Copilot Chat
  sendCopilotChat: (message: string, stationId: StationId = 'bharati'): Promise<CopilotResponse> =>
    request<CopilotResponse>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, station_id: stationId }),
    }),

  // Reports
  getReport: (type: 'daily' | 'weekly', stationId: StationId = 'bharati'): Promise<any> =>
    request<any>(`/reports/${type}?station_id=${stationId}`),
};

