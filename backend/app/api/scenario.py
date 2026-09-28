from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..schemas.pydantic_schemas import (
    ScenarioTriggerRequest,
    ScenarioTriggerResponse,
    WhatIfRequest,
    WhatIfResponse,
    WhatIfComparisonItem
)
from ..services.simulation_service import simulation_engine

router = APIRouter(prefix="/api/scenario", tags=["Scenarios"])

@router.post("/run", response_model=ScenarioTriggerResponse)
def trigger_scenario(req: ScenarioTriggerRequest):
    return simulation_engine.trigger_scenario(req.scenario, req.station_id)

@router.get("/status")
def get_scenario_status(station_id: str = Query("bharati", description="Station ID")):
    scen = simulation_engine.active_scenarios.get(station_id, "normal")
    survival = scen in ["arctic_storm", "generator_failure"]
    return {
        "station_id": station_id,
        "active_scenario": scen,
        "survival_mode": survival,
        "simulation_mode": simulation_engine.simulation_mode
    }

@router.post("/whatif", response_model=WhatIfResponse)
def run_what_if_analysis(req: WhatIfRequest):
    # Calculate 24-hour simulation for baseline
    # Baseline configuration (Bharati: 500 kWh battery, 90 kW solar, 120 kW wind)
    base_demand = req.average_load_kw * 24.0
    base_ren_gen = (req.solar_capacity_kw * 5.2) + (req.wind_capacity_kw * 14.5)
    base_ren_used = min(base_demand * 0.88, base_ren_gen * 0.92)
    base_diesel_gen = max(0.0, base_demand - base_ren_used)
    base_fuel_litres = round(base_diesel_gen * 0.285, 1)
    base_cost = round(base_fuel_litres * 1.45, 2)
    base_ren_util = round(min(100.0, (base_ren_used / base_demand) * 100.0), 1)
    base_co2 = round(base_fuel_litres * simulation_engine.co2_factor, 1)
    base_rel = 98.5

    # Simulated User Configuration
    # Factor in researcher count and temperature impact on heating
    heating_factor = max(1.0, 1.0 + (-req.ambient_temp_c - 15.0) * 0.018)
    occupancy_factor = 1.0 + (req.researchers_count - 24) * 0.015
    sim_demand = round(req.average_load_kw * 24.0 * heating_factor * occupancy_factor, 1)
    
    # Renewable generation adjusted for deratings and capacity
    solar_derate = max(0.0, 1.0 - (req.renewable_reduction_pct / 100.0)) * (req.solar_irradiance_wm2 / 500.0)
    wind_derate = max(0.0, 1.0 - (req.renewable_reduction_pct / 100.0)) * (min(1.2, req.wind_speed_ms / 11.0))
    
    sim_sol_gen = req.solar_capacity_kw * 5.5 * solar_derate
    sim_wind_gen = req.wind_capacity_kw * 15.0 * wind_derate
    sim_ren_gen = round(sim_sol_gen + sim_wind_gen, 1)
    
    # Battery absorption buffer: higher capacity captures more surplus
    cap_ratio = req.battery_capacity_kwh / 500.0
    absorption_factor = min(0.96, 0.80 + (cap_ratio - 1.0) * 0.12)
    sim_ren_used = min(sim_demand * 0.95, sim_ren_gen * absorption_factor)
    
    sim_diesel_gen = round(max(0.0, sim_demand - sim_ren_used), 1)
    sim_fuel_litres = round(sim_diesel_gen * 0.272, 1)
    sim_cost = round(sim_fuel_litres * 1.45, 2)
    sim_ren_util = round(min(100.0, (sim_ren_used / sim_demand) * 100.0), 1)
    sim_cycles = round((sim_ren_used * 0.45) / max(100.0, req.battery_capacity_kwh), 2)
    sim_co2 = round(sim_fuel_litres * simulation_engine.co2_factor, 1)
    
    sim_rel = 99.0
    if req.battery_capacity_kwh < 300.0:
        sim_rel -= 4.5
    if sim_diesel_gen > req.generator_capacity_kw * 20.0:
        sim_rel -= 8.0

    delta_fuel = round(base_fuel_litres - sim_fuel_litres, 1)
    delta_co2 = round(base_co2 - sim_co2, 1)
    delta_cost = round(base_cost - sim_cost, 2)

    notes = []
    if delta_fuel > 0:
        notes.append(f"Proposed setup yields estimated savings of {delta_fuel} L of polar diesel per day.")
        notes.append(f"Estimated CO2 reduction: {delta_co2} kg/day ({round((delta_fuel/base_fuel_litres)*100.0, 1)}% lower emissions).")
    else:
        notes.append(f"Proposed configuration increases diesel dependence by {-delta_fuel} L/day due to load or renewable deficit.")
    
    if req.battery_capacity_kwh >= 700.0:
        notes.append("High battery capacity enables complete diesel shutdown during daytime renewable surplus.")
    elif req.battery_capacity_kwh <= 350.0:
        notes.append("Warning: Low storage capacity causes frequent generator cycling during Katabatic wind lulls.")

    baseline_item = WhatIfComparisonItem(
        scenario_label="Baseline Station (500 kWh BESS, 90 kW Solar, 120 kW Wind)",
        total_demand_kwh=base_demand,
        renewable_gen_kwh=round(base_ren_gen, 1),
        diesel_gen_kwh=round(base_diesel_gen, 1),
        diesel_litres=base_fuel_litres,
        fuel_cost_usd=base_cost,
        renewable_utilization_pct=base_ren_util,
        battery_cycles=0.65,
        co2_emissions_kg=base_co2,
        reliability_score_pct=base_rel
    )

    simulated_item = WhatIfComparisonItem(
        scenario_label=f"User Scenario ({int(req.battery_capacity_kwh)} kWh BESS, {int(req.solar_capacity_kw)} kW Solar, {int(req.wind_capacity_kw)} kW Wind)",
        total_demand_kwh=sim_demand,
        renewable_gen_kwh=sim_ren_gen,
        diesel_gen_kwh=sim_diesel_gen,
        diesel_litres=sim_fuel_litres,
        fuel_cost_usd=sim_cost,
        renewable_utilization_pct=sim_ren_util,
        battery_cycles=sim_cycles,
        co2_emissions_kg=sim_co2,
        reliability_score_pct=round(sim_rel, 1)
    )

    return WhatIfResponse(
        baseline=baseline_item,
        simulated=simulated_item,
        delta_fuel_litres=delta_fuel,
        delta_co2_kg=delta_co2,
        delta_cost_usd=delta_cost,
        analysis_notes=notes
    )
