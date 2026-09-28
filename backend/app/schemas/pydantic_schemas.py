from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Telemetry
class TelemetryItem(BaseModel):
    timestamp: str
    station_id: str
    load_kw: float
    solar_kw: float
    wind_kw: float
    generator_kw: float
    battery_kw: float
    battery_soc: float
    fuel_rate: float
    temperature: float
    is_simulated: bool = True

class TelemetryCurrent(BaseModel):
    timestamp: str
    station_id: str
    load_kw: float
    solar_kw: float
    wind_kw: float
    generator_kw: float
    battery_kw: float
    battery_soc: float
    fuel_rate: float
    temperature: float
    is_simulated: bool = True
    renewable_kw: float
    renewable_pct: float
    co2_rate_kg_per_hr: float
    system_health_pct: float
    survival_mode: bool = False
    active_scenario: str = "normal"
    alert_count: int = 0
    station_local_time: str
    station_timezone: str
    station_utc_offset: float
    utc_time: str
    min_soc: float = 30.0

class TelemetryHistoryResponse(BaseModel):
    station_id: str
    timeframe: str
    readings: List[TelemetryItem]
    total_energy_consumed_kwh: float
    total_renewable_kwh: float
    total_diesel_kwh: float
    renewable_share_pct: float
    diesel_fuel_litres: float
    co2_emissions_kg: float
    avg_load_kw: float
    peak_load_kw: float

# Weather
class WeatherItem(BaseModel):
    timestamp: str
    temperature: float
    wind_speed: float
    wind_direction: float
    pressure: float
    humidity: float
    solar_irradiance: float
    cloud_cover: float

class WeatherCurrent(BaseModel):
    timestamp: str
    temperature: float
    wind_speed: float
    wind_direction: float
    pressure: float
    humidity: float
    solar_irradiance: float
    cloud_cover: float
    condition_label: str
    gust_speed: float
    wind_chill_c: float

# Battery
class BatteryCurrent(BaseModel):
    station_id: str
    soc: float
    capacity_kwh: float
    current_stored_kwh: float
    voltage_v: float
    current_a: float
    power_kw: float
    state: str # charging, discharging, idle
    temperature_c: float
    health_pct: float
    min_soc_reserve: float
    max_soc: float
    reserve_healthy: bool
    estimated_autonomy_hours: float

# Station
class StationItem(BaseModel):
    id: str
    name: str
    location: str
    nominal_load_kw: float
    battery_capacity_kwh: float
    solar_capacity_kw: float
    wind_capacity_kw: float
    generator_capacity_kw: float
    min_soc: float
    max_soc: float
    latitude: float = -69.4078
    longitude: float = 76.1872
    timezone_offset_hours: float = 5.0
    timezone_label: str = "UTC+05:00 (Bharati Station Time)"

class SystemSettingsSchema(BaseModel):
    fuel_cost_per_l: float = 1.45
    co2_factor: float = 2.68
    min_bess_soc: float = 30.0
    cold_temp_cutoff: float = -40.0
    ai_provider: str = "local"
    api_key: Optional[str] = ""
    polling_interval_sec: int = 3
    updated_at: Optional[str] = None

# Equipment
class EquipmentItem(BaseModel):
    id: str
    station_id: str
    name: str
    type: str
    capacity_kw: float
    health_score: float
    status: str
    hours_run: float
    anomaly_prob: float
    possible_issue: Optional[str] = None
    recommended_action: Optional[str] = None
    last_serviced: Optional[str] = None

# Alert
class AlertItem(BaseModel):
    id: int
    timestamp: str
    station_id: str
    severity: str
    component: str
    message: str
    acknowledged: bool

# Forecast
class ForecastPoint(BaseModel):
    timestamp: str
    predicted: float
    actual: Optional[float] = None
    confidence_lower: float
    confidence_upper: float
    confidence_score: float

class ForecastSeriesResponse(BaseModel):
    metric: str # load, solar, wind, renewable
    station_id: str
    horizon: str
    horizon_hours: float
    points: List[ForecastPoint]
    peak_value: float
    avg_value: float
    total_energy_kwh: float

# Optimization
class OptimizationRequest(BaseModel):
    station_id: str = "bharati"
    horizon_hours: int = 24
    min_soc: Optional[float] = None
    max_soc: Optional[float] = 95.0
    fuel_cost_per_l: Optional[float] = None
    co2_factor: Optional[float] = None
    protect_critical_only: bool = False

class ScheduleSlot(BaseModel):
    timestamp: str
    hour: int
    load_kw: float
    solar_kw: float
    wind_kw: float
    renewable_total_kw: float
    battery_discharge_kw: float
    battery_charge_kw: float
    battery_soc_pct: float
    generator_kw: float
    fuel_litres: float
    co2_kg: float
    active_generators: List[str]

class ExplainableRecommendation(BaseModel):
    id: str
    title: str
    action: str
    reasons: List[str]
    confidence_pct: float
    fuel_saving_litres: float
    co2_saving_kg: float
    risk_level: str # low, medium, high

class OptimizationResponse(BaseModel):
    station_id: str
    created_at: str
    horizon_hours: int
    total_demand_kwh: float
    solar_generation_kwh: float
    wind_generation_kwh: float
    renewable_total_kwh: float
    battery_throughput_kwh: float
    diesel_generation_kwh: float
    baseline_fuel_consumed_l: float
    optimized_fuel_consumed_l: float
    fuel_saved_l: float
    fuel_saved_pct: float
    co2_reduction_kg: float
    cost_saved_usd: float
    schedule: List[ScheduleSlot]
    recommendations: List[ExplainableRecommendation]

# Scenarios
class ScenarioTriggerRequest(BaseModel):
    scenario: str # normal, low_wind, solar_drop, arctic_storm, generator_failure, high_demand
    station_id: str = "bharati"

class ScenarioTriggerResponse(BaseModel):
    status: str
    active_scenario: str
    message: str
    survival_mode: bool
    temperature_override: Optional[float] = None
    wind_multiplier: float
    solar_multiplier: float
    load_multiplier: float
    g2_online: bool

# What-If Simulator
class WhatIfRequest(BaseModel):
    station_id: str = "bharati"
    solar_capacity_kw: float = 90.0
    wind_capacity_kw: float = 120.0
    battery_capacity_kwh: float = 500.0
    generator_capacity_kw: float = 220.0
    average_load_kw: float = 55.0
    peak_load_kw: float = 85.0
    ambient_temp_c: float = -25.0
    wind_speed_ms: float = 11.5
    solar_irradiance_wm2: float = 450.0
    researchers_count: int = 24
    renewable_reduction_pct: float = 0.0

class WhatIfComparisonItem(BaseModel):
    scenario_label: str
    total_demand_kwh: float
    renewable_gen_kwh: float
    diesel_gen_kwh: float
    diesel_litres: float
    fuel_cost_usd: float
    renewable_utilization_pct: float
    battery_cycles: float
    co2_emissions_kg: float
    reliability_score_pct: float

class WhatIfResponse(BaseModel):
    baseline: WhatIfComparisonItem
    simulated: WhatIfComparisonItem
    delta_fuel_litres: float
    delta_co2_kg: float
    delta_cost_usd: float
    analysis_notes: List[str]

# Copilot Chat
class CopilotMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class CopilotChatRequest(BaseModel):
    message: str
    station_id: str = "bharati"
    history: Optional[List[CopilotMessage]] = None

class CopilotChatResponse(BaseModel):
    reply: str
    sources_used: List[str]
    context_data: Dict[str, Any]
    timestamp: str
