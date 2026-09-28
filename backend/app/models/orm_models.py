from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
import datetime
from ..database.connection import Base

class Station(Base):
    __tablename__ = 'stations'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    nominal_load_kw = Column(Float, default=55.0)
    battery_capacity_kwh = Column(Float, default=500.0)
    solar_capacity_kw = Column(Float, default=90.0)
    wind_capacity_kw = Column(Float, default=120.0)
    generator_capacity_kw = Column(Float, default=220.0)
    min_soc = Column(Float, default=30.0)
    max_soc = Column(Float, default=95.0)
    latitude = Column(Float, default=-69.4078)
    longitude = Column(Float, default=76.1872)
    timezone_offset_hours = Column(Float, default=5.0)
    timezone_label = Column(String, default="UTC+05:00 (Mawson / Bharati)")

class SystemSetting(Base):
    __tablename__ = 'system_settings'
    id = Column(Integer, primary_key=True, default=1)
    fuel_cost_per_l = Column(Float, default=1.45)
    co2_factor = Column(Float, default=2.68)
    min_bess_soc = Column(Float, default=30.0)
    cold_temp_cutoff = Column(Float, default=-40.0)
    ai_provider = Column(String, default='local')
    api_key = Column(String, default='')
    polling_interval_sec = Column(Integer, default=3)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class EnergyReading(Base):
    __tablename__ = 'energy_readings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    station_id = Column(String, ForeignKey('stations.id'), nullable=False, index=True)
    load_kw = Column(Float, nullable=False)
    solar_kw = Column(Float, nullable=False)
    wind_kw = Column(Float, nullable=False)
    generator_kw = Column(Float, nullable=False)
    battery_kw = Column(Float, nullable=False)
    battery_soc = Column(Float, nullable=False)
    fuel_rate = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    is_simulated = Column(Boolean, default=True)

class WeatherReading(Base):
    __tablename__ = 'weather_readings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    wind_direction = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    solar_irradiance = Column(Float, nullable=False)
    cloud_cover = Column(Float, nullable=False)

class Equipment(Base):
    __tablename__ = 'equipment'
    id = Column(String, primary_key=True)
    station_id = Column(String, ForeignKey('stations.id'), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    capacity_kw = Column(Float, nullable=False)
    health_score = Column(Float, nullable=False)
    status = Column(String, default='operational')
    hours_run = Column(Float, default=0.0)
    anomaly_prob = Column(Float, default=0.0)
    last_serviced = Column(String, nullable=True)

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    station_id = Column(String, default='bharati')
    severity = Column(String, nullable=False)
    component = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)

class OptimizationSchedule(Base):
    __tablename__ = 'optimization_results'
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    station_id = Column(String, default='bharati')
    horizon_hours = Column(Integer, default=24)
    total_fuel_saved_l = Column(Float, default=0.0)
    co2_reduction_kg = Column(Float, default=0.0)
    schedule_json = Column(Text, nullable=False)
    recommendations_json = Column(Text, nullable=False)
