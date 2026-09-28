from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.orm_models import Station
from ..schemas.pydantic_schemas import StationItem

router = APIRouter(prefix="/api/stations", tags=["Stations"])

@router.get("", response_model=List[StationItem])
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    return [
        StationItem(
            id=s.id,
            name=s.name,
            location=s.location,
            nominal_load_kw=s.nominal_load_kw,
            battery_capacity_kwh=s.battery_capacity_kwh,
            solar_capacity_kw=s.solar_capacity_kw,
            wind_capacity_kw=s.wind_capacity_kw,
            generator_capacity_kw=s.generator_capacity_kw,
            min_soc=s.min_soc,
            max_soc=s.max_soc,
            latitude=s.latitude if s.latitude is not None else (-69.4078 if s.id == 'bharati' else -70.7661),
            longitude=s.longitude if s.longitude is not None else (76.1872 if s.id == 'bharati' else 11.7322),
            timezone_offset_hours=s.timezone_offset_hours if s.timezone_offset_hours is not None else (5.0 if s.id == 'bharati' else 0.0),
            timezone_label=s.timezone_label if s.timezone_label else ("UTC+05:00 (Bharati Station Time)" if s.id == 'bharati' else "UTC+00:00 (Maitri Station Time)")
        )
        for s in stations
    ]

@router.get("/{station_id}", response_model=StationItem)
def get_station(station_id: str, db: Session = Depends(get_db)):
    s = db.query(Station).filter(Station.id == station_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Station not found")
    return StationItem(
        id=s.id,
        name=s.name,
        location=s.location,
        nominal_load_kw=s.nominal_load_kw,
        battery_capacity_kwh=s.battery_capacity_kwh,
        solar_capacity_kw=s.solar_capacity_kw,
        wind_capacity_kw=s.wind_capacity_kw,
        generator_capacity_kw=s.generator_capacity_kw,
        min_soc=s.min_soc,
        max_soc=s.max_soc,
        latitude=s.latitude if s.latitude is not None else (-69.4078 if s.id == 'bharati' else -70.7661),
        longitude=s.longitude if s.longitude is not None else (76.1872 if s.id == 'bharati' else 11.7322),
        timezone_offset_hours=s.timezone_offset_hours if s.timezone_offset_hours is not None else (5.0 if s.id == 'bharati' else 0.0),
        timezone_label=s.timezone_label if s.timezone_label else ("UTC+05:00 (Bharati Station Time)" if s.id == 'bharati' else "UTC+00:00 (Maitri Station Time)")
    )
