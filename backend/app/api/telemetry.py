from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from ..database.connection import get_db
from ..models.orm_models import EnergyReading, Station
from ..schemas.pydantic_schemas import TelemetryCurrent, TelemetryHistoryResponse, TelemetryItem, BatteryCurrent
from ..services.simulation_service import simulation_engine

router = APIRouter(prefix="/api", tags=["Telemetry"])

@router.get("/telemetry/current", response_model=TelemetryCurrent)
def get_current_telemetry(
    station_id: str = Query("bharati", description="Station ID: bharati or maitri"),
    db: Session = Depends(get_db)
):
    return simulation_engine.get_current_telemetry(station_id, db)

@router.get("/telemetry/history", response_model=TelemetryHistoryResponse)
def get_telemetry_history(
    station_id: str = Query("bharati", description="Station ID"),
    timeframe: str = Query("24h", description="Timeframe: 24h, 7d, 30d"),
    db: Session = Depends(get_db)
):
    hours_map = {
        "24h": 24,
        "1d": 24,
        "7d": 168,
        "30d": 720
    }
    limit_hours = hours_map.get(timeframe.lower(), 24)
    
    # Query latest readings up to limit
    readings = (
        db.query(EnergyReading)
        .filter(EnergyReading.station_id == station_id)
        .order_by(EnergyReading.timestamp.desc())
        .limit(limit_hours)
        .all()
    )
    
    # Reverse so chronological
    readings = list(reversed(readings))
    
    items: List[TelemetryItem] = []
    tot_energy = 0.0
    tot_renewable = 0.0
    tot_diesel = 0.0
    tot_fuel = 0.0
    loads = []
    
    for r in readings:
        ren_kw = r.solar_kw + r.wind_kw
        tot_energy += r.load_kw
        tot_renewable += ren_kw
        tot_diesel += r.generator_kw
        tot_fuel += r.fuel_rate
        loads.append(r.load_kw)
        
        items.append(TelemetryItem(
            timestamp=r.timestamp.isoformat(),
            station_id=r.station_id,
            load_kw=round(r.load_kw, 2),
            solar_kw=round(r.solar_kw, 2),
            wind_kw=round(r.wind_kw, 2),
            generator_kw=round(r.generator_kw, 2),
            battery_kw=round(r.battery_kw, 2),
            battery_soc=round(r.battery_soc, 1),
            fuel_rate=round(r.fuel_rate, 2),
            temperature=round(r.temperature, 1),
            is_simulated=r.is_simulated
        ))
        
    avg_load = round(sum(loads) / len(loads), 2) if loads else 0.0
    peak_load = round(max(loads), 2) if loads else 0.0
    ren_share = round((tot_renewable / tot_energy) * 100.0, 1) if tot_energy > 0 else 0.0
    co2_kg = round(tot_fuel * simulation_engine.co2_factor, 1)
    
    return TelemetryHistoryResponse(
        station_id=station_id,
        timeframe=timeframe,
        readings=items,
        total_energy_consumed_kwh=round(tot_energy, 1),
        total_renewable_kwh=round(tot_renewable, 1),
        total_diesel_kwh=round(tot_diesel, 1),
        renewable_share_pct=ren_share,
        diesel_fuel_litres=round(tot_fuel, 1),
        co2_emissions_kg=co2_kg,
        avg_load_kw=avg_load,
        peak_load_kw=peak_load
    )

@router.post("/telemetry", response_model=TelemetryItem)
def post_telemetry(reading: TelemetryItem, db: Session = Depends(get_db)):
    try:
        ts = datetime.fromisoformat(reading.timestamp)
    except Exception:
        ts = datetime.utcnow()
        
    obj = EnergyReading(
        timestamp=ts,
        station_id=reading.station_id,
        load_kw=reading.load_kw,
        solar_kw=reading.solar_kw,
        wind_kw=reading.wind_kw,
        generator_kw=reading.generator_kw,
        battery_kw=reading.battery_kw,
        battery_soc=reading.battery_soc,
        fuel_rate=reading.fuel_rate,
        temperature=reading.temperature,
        is_simulated=reading.is_simulated
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return reading

@router.get("/battery/current", response_model=BatteryCurrent)
def get_battery_current(
    station_id: str = Query("bharati", description="Station ID"),
    db: Session = Depends(get_db)
):
    return simulation_engine.get_current_battery(station_id, db)
