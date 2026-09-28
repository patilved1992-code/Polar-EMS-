from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.orm_models import WeatherReading
from ..schemas.pydantic_schemas import WeatherCurrent, WeatherItem
from ..services.simulation_service import simulation_engine

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/current", response_model=WeatherCurrent)
def get_current_weather(db: Session = Depends(get_db)):
    return simulation_engine.get_current_weather(db)

@router.get("/history", response_model=List[WeatherItem])
def get_weather_history(
    limit: int = Query(48, description="Number of past hourly readings to fetch"),
    db: Session = Depends(get_db)
):
    readings = db.query(WeatherReading).order_by(WeatherReading.timestamp.desc()).limit(limit).all()
    readings = list(reversed(readings))
    return [
        WeatherItem(
            timestamp=r.timestamp.isoformat(),
            temperature=r.temperature,
            wind_speed=r.wind_speed,
            wind_direction=r.wind_direction,
            pressure=r.pressure,
            humidity=r.humidity,
            solar_irradiance=r.solar_irradiance,
            cloud_cover=r.cloud_cover
        )
        for r in readings
    ]
