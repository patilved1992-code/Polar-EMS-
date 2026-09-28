export type StationId = 'bharati' | 'maitri';

export type UserRole = 'operator' | 'engineer' | 'admin';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface TelemetryCurrent {
  timestamp: string;
  station_id: string;
  load_kw: number;
  solar_kw: number;
  wind_kw: number;
  generator_kw: number;
  battery_kw: number;
  battery_soc: number;
  fuel_rate: number;
  temperature: number;
  is_simulated: boolean;
  renewable_kw: number;
  renewable_pct: number;
  co2_rate_kg_per_hr: number;
  system_health_pct: number;
  survival_mode: boolean;
  active_scenario: string;
  alert_count: number;
  station_local_time: string;
  station_timezone: string;
  station_utc_offset: number;
  utc_time: string;
  min_soc?: number;
}

export interface SystemSettings {
  fuel_cost_per_l: number;
  co2_factor: number;
  min_bess_soc: number;
  cold_temp_cutoff: number;
  ai_provider: string;
  api_key?: string;
  polling_interval_sec: number;
  updated_at?: string;
}

export interface TelemetryItem {
  timestamp: string;
  station_id: string;
  load_kw: number;
  solar_kw: number;
  wind_kw: number;
  generator_kw: number;
  battery_kw: number;
  battery_soc: number;
  fuel_rate: number;
  temperature: number;
  is_simulated: boolean;
}

export interface TelemetryHistory {
  station_id: string;
  timeframe: string;
  readings: TelemetryItem[];
  total_energy_consumed_kwh: number;
  total_renewable_kwh: number;
  total_diesel_kwh: number;
  renewable_share_pct: number;
  diesel_fuel_litres: number;
  co2_emissions_kg: number;
  avg_load_kw: number;
  peak_load_kw: number;
}

export interface WeatherCurrent {
  timestamp: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  humidity: number;
  solar_irradiance: number;
  cloud_cover: number;
  condition_label: string;
  gust_speed: number;
  wind_chill_c: number;
}

export interface BatteryCurrent {
  station_id: string;
  soc: number;
  capacity_kwh: number;
  current_stored_kwh: number;
  voltage_v: number;
  current_a: number;
  power_kw: number;
  state: 'charging' | 'discharging' | 'idle';
  temperature_c: number;
  health_pct: number;
  min_soc_reserve: number;
  max_soc: number;
  reserve_healthy: boolean;
  estimated_autonomy_hours: number;
}

export interface EquipmentItem {
  id: string;
  station_id: string;
  name: string;
  type: string;
  capacity_kw: number;
  health_score: number;
  status: string;
  hours_run: number;
  anomaly_prob: number;
  possible_issue?: string;
  recommended_action?: string;
  last_serviced?: string;
}

export interface AlertItem {
  id: number;
  timestamp: string;
  station_id: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  component: string;
  message: string;
  acknowledged: boolean;
}

export interface ForecastPoint {
  timestamp: string;
  predicted: number;
  actual?: number;
  confidence_lower: number;
  confidence_upper: number;
  confidence_score: number;
}

export interface ForecastSeries {
  metric: string;
  station_id: string;
  horizon: string;
  horizon_hours: number;
  points: ForecastPoint[];
  peak_value: number;
  avg_value: number;
  total_energy_kwh: number;
}

export interface ScheduleSlot {
  timestamp: string;
  hour: number;
  load_kw: number;
  solar_kw: number;
  wind_kw: number;
  renewable_total_kw: number;
  battery_discharge_kw: number;
  battery_charge_kw: number;
  battery_soc_pct: number;
  generator_kw: number;
  fuel_litres: number;
  co2_kg: number;
  active_generators: string[];
}

export interface ExplainableRecommendation {
  id: string;
  title: string;
  action: string;
  reasons: string[];
  confidence_pct: number;
  fuel_saving_litres: number;
  co2_saving_kg: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface OptimizationResult {
  station_id: string;
  created_at: string;
  horizon_hours: number;
  total_demand_kwh: number;
  solar_generation_kwh: number;
  wind_generation_kwh: number;
  renewable_total_kwh: number;
  battery_throughput_kwh: number;
  diesel_generation_kwh: number;
  baseline_fuel_consumed_l: number;
  optimized_fuel_consumed_l: number;
  fuel_saved_l: number;
  fuel_saved_pct: number;
  co2_reduction_kg: number;
  cost_saved_usd: number;
  schedule: ScheduleSlot[];
  recommendations: ExplainableRecommendation[];
}

export interface WhatIfComparisonItem {
  scenario_label: string;
  total_demand_kwh: number;
  renewable_gen_kwh: number;
  diesel_gen_kwh: number;
  diesel_litres: number;
  fuel_cost_usd: number;
  renewable_utilization_pct: number;
  battery_cycles: number;
  co2_emissions_kg: number;
  reliability_score_pct: number;
}

export interface WhatIfResponse {
  baseline: WhatIfComparisonItem;
  simulated: WhatIfComparisonItem;
  delta_fuel_litres: number;
  delta_co2_kg: number;
  delta_cost_usd: number;
  analysis_notes: string[];
}

export interface CopilotResponse {
  reply: string;
  sources_used: string[];
  context_data: Record<string, any>;
  timestamp: string;
}
