from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any
from ..database.connection import get_db
from ..models.orm_models import SystemSetting, Station
from ..schemas.pydantic_schemas import SystemSettingsSchema, OptimizationRequest
from ..services.simulation_service import simulation_engine
from ..optimization.dispatch_engine import energy_optimizer

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=SystemSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
    if not setting:
        setting = SystemSetting(
            id=1,
            fuel_cost_per_l=1.45,
            co2_factor=2.68,
            min_bess_soc=30.0,
            cold_temp_cutoff=-40.0,
            ai_provider="local",
            api_key="",
            polling_interval_sec=3
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)

    return SystemSettingsSchema(
        fuel_cost_per_l=setting.fuel_cost_per_l,
        co2_factor=setting.co2_factor,
        min_bess_soc=setting.min_bess_soc,
        cold_temp_cutoff=setting.cold_temp_cutoff,
        ai_provider=setting.ai_provider,
        api_key=setting.api_key or "",
        polling_interval_sec=setting.polling_interval_sec,
        updated_at=setting.updated_at.isoformat() if setting.updated_at else None
    )

@router.post("", response_model=Dict[str, Any])
@router.put("", response_model=Dict[str, Any])
def update_settings(payload: SystemSettingsSchema, db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
    if not setting:
        setting = SystemSetting(id=1)
        db.add(setting)

    setting.fuel_cost_per_l = payload.fuel_cost_per_l
    setting.co2_factor = payload.co2_factor
    setting.min_bess_soc = payload.min_bess_soc
    setting.cold_temp_cutoff = payload.cold_temp_cutoff
    setting.ai_provider = payload.ai_provider
    setting.api_key = payload.api_key or ""
    setting.polling_interval_sec = payload.polling_interval_sec
    setting.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(setting)

    # Propagate updated parameters to active simulation engine
    simulation_engine.fuel_cost_per_l = payload.fuel_cost_per_l
    simulation_engine.co2_factor = payload.co2_factor

    # Update Station min_soc
    stations = db.query(Station).all()
    for st in stations:
        st.min_soc = payload.min_bess_soc
    db.commit()

    # Automatically re-run optimization with the newly saved constraints & economic coefficients
    opt_req = OptimizationRequest(
        station_id="bharati",
        horizon_hours=24,
        min_soc=payload.min_bess_soc,
        fuel_cost_per_l=payload.fuel_cost_per_l,
        co2_factor=payload.co2_factor
    )
    tel = simulation_engine.get_current_telemetry("bharati", db)
    opt_res = energy_optimizer.run_optimization(opt_req, current_soc=tel.battery_soc)

    return {
        "status": "success",
        "message": f"Settings saved to database. Microgrid re-optimized with BESS reserve >= {payload.min_bess_soc}% and Fuel ${payload.fuel_cost_per_l}/L.",
        "settings": {
            "fuel_cost_per_l": setting.fuel_cost_per_l,
            "co2_factor": setting.co2_factor,
            "min_bess_soc": setting.min_bess_soc,
            "cold_temp_cutoff": setting.cold_temp_cutoff,
            "ai_provider": setting.ai_provider,
            "polling_interval_sec": setting.polling_interval_sec,
            "updated_at": setting.updated_at.isoformat()
        },
        "re_optimized_result": {
            "fuel_saved_l": opt_res.fuel_saved_l,
            "co2_reduction_kg": opt_res.co2_reduction_kg,
            "cost_saved_usd": opt_res.cost_saved_usd,
            "horizon_hours": opt_res.horizon_hours
        }
    }
