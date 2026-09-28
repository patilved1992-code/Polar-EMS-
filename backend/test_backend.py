import sys
from app.database.seed_data import init_db
from app.main import app
from app.database.connection import SessionLocal
from app.services.simulation_service import simulation_engine
from app.optimization.dispatch_engine import energy_optimizer
from app.schemas.pydantic_schemas import OptimizationRequest, WhatIfRequest
from app.api.scenario import run_what_if_analysis
from app.services.copilot_service import energy_copilot
from app.schemas.pydantic_schemas import CopilotChatRequest

print("Initializing DB...")
init_db()

db = SessionLocal()
try:
    tel = simulation_engine.get_current_telemetry("bharati", db)
    print(f"Current Telemetry: Load={tel.load_kw} kW, Solar={tel.solar_kw} kW, Wind={tel.wind_kw} kW, Gen={tel.generator_kw} kW, SOC={tel.battery_soc}%")
    
    weather = simulation_engine.get_current_weather(db)
    print(f"Current Weather: Temp={weather.temperature} C, Wind={weather.wind_speed} m/s, Label={weather.condition_label}")

    opt_req = OptimizationRequest(station_id="bharati", horizon_hours=24)
    opt_res = energy_optimizer.run_optimization(opt_req, current_soc=tel.battery_soc)
    print(f"Optimization Success: Demand={opt_res.total_demand_kwh} kWh, Fuel Saved={opt_res.fuel_saved_l} L, Recs={len(opt_res.recommendations)}")

    whatif_req = WhatIfRequest(station_id="bharati", battery_capacity_kwh=750.0)
    whatif_res = run_what_if_analysis(whatif_req)
    print(f"What-If Success: Baseline Fuel={whatif_res.baseline.diesel_litres} L, Sim Fuel={whatif_res.simulated.diesel_litres} L, Delta={whatif_res.delta_fuel_litres} L")

    chat_req = CopilotChatRequest(message="Why is diesel consumption high?")
    chat_res = energy_copilot.process_chat(chat_req, db)
    print(f"Copilot Success: Sources={chat_res.sources_used}, Reply Length={len(chat_res.reply)}")

    print("ALL BACKEND CHECKS PASSED!")
finally:
    db.close()
