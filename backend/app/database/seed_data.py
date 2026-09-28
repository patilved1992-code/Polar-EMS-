import os
import pandas as pd
from datetime import datetime
from .connection import engine, Base, SessionLocal
from sqlalchemy import text
from ..models.orm_models import Station, EnergyReading, WeatherReading, Equipment, Alert, SystemSetting

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check and migrate columns on stations table if missing
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(stations)"))
            existing_cols = [row[1] for row in res.fetchall()]
            if 'latitude' not in existing_cols:
                conn.execute(text("ALTER TABLE stations ADD COLUMN latitude FLOAT DEFAULT -69.4078"))
            if 'longitude' not in existing_cols:
                conn.execute(text("ALTER TABLE stations ADD COLUMN longitude FLOAT DEFAULT 76.1872"))
            if 'timezone_offset_hours' not in existing_cols:
                conn.execute(text("ALTER TABLE stations ADD COLUMN timezone_offset_hours FLOAT DEFAULT 5.0"))
            if 'timezone_label' not in existing_cols:
                conn.execute(text("ALTER TABLE stations ADD COLUMN timezone_label VARCHAR DEFAULT 'UTC+05:00 (Bharati Station Time)'"))
            conn.commit()

        # Ensure SystemSetting row exists
        setting = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
        if not setting:
            db.add(SystemSetting(
                id=1,
                fuel_cost_per_l=1.45,
                co2_factor=2.68,
                min_bess_soc=30.0,
                cold_temp_cutoff=-40.0,
                ai_provider='local',
                api_key='',
                polling_interval_sec=3
            ))
            db.commit()

        # Update station timezone and coordinate data
        sb = db.query(Station).filter(Station.id == "bharati").first()
        if sb:
            sb.latitude = -69.4078
            sb.longitude = 76.1872
            sb.timezone_offset_hours = 5.0
            sb.timezone_label = "UTC+05:00 (Bharati Station Time)"
            db.commit()

        sm = db.query(Station).filter(Station.id == "maitri").first()
        if sm:
            sm.latitude = -70.7661
            sm.longitude = 11.7322
            sm.timezone_offset_hours = 0.0
            sm.timezone_label = "UTC+00:00 (Maitri Station Time)"
            db.commit()

        if db.query(Station).first() is not None and db.query(EnergyReading).first() is not None:
            return
        
        print("Seeding initial database...")
        s_bharati = Station(
            id="bharati",
            name="Bharati Station",
            location="Larsemann Hills, East Antarctica (69°24'S, 76°11'E)",
            nominal_load_kw=55.0,
            battery_capacity_kwh=500.0,
            solar_capacity_kw=90.0,
            wind_capacity_kw=120.0,
            generator_capacity_kw=220.0,
            min_soc=30.0,
            max_soc=95.0
        )
        s_maitri = Station(
            id="maitri",
            name="Maitri Station",
            location="Schirmacher Oasis, East Antarctica (70°45'S, 11°44'E)",
            nominal_load_kw=42.0,
            battery_capacity_kwh=350.0,
            solar_capacity_kw=60.0,
            wind_capacity_kw=90.0,
            generator_capacity_kw=180.0,
            min_soc=30.0,
            max_soc=95.0
        )
        db.add_all([s_bharati, s_maitri])
        db.commit()

        weather_path = "C:/Users/asus/.gemini/antigravity/scratch/polar-ems/data/sample_weather.csv"
        if os.path.exists(weather_path):
            df_w = pd.read_csv(weather_path)
            w_objs = [
                WeatherReading(
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    temperature=float(row["temperature"]),
                    wind_speed=float(row["wind_speed"]),
                    wind_direction=float(row["wind_direction"]),
                    pressure=float(row["pressure"]),
                    humidity=float(row["humidity"]),
                    solar_irradiance=float(row["solar_irradiance"]),
                    cloud_cover=float(row["cloud_cover"])
                )
                for _, row in df_w.iterrows()
            ]
            db.bulk_save_objects(w_objs)
            db.commit()

        energy_path = "C:/Users/asus/.gemini/antigravity/scratch/polar-ems/data/sample_energy.csv"
        if os.path.exists(energy_path):
            df_e = pd.read_csv(energy_path)
            e_objs = [
                EnergyReading(
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    station_id=row["station_id"],
                    load_kw=float(row["load_kw"]),
                    solar_kw=float(row["solar_kw"]),
                    wind_kw=float(row["wind_kw"]),
                    generator_kw=float(row["generator_kw"]),
                    battery_kw=float(row["battery_kw"]),
                    battery_soc=float(row["battery_soc"]),
                    fuel_rate=float(row["fuel_rate"]),
                    temperature=float(row["temperature"]),
                    is_simulated=bool(row["is_simulated"])
                )
                for _, row in df_e.iterrows()
            ]
            db.bulk_save_objects(e_objs)
            db.commit()

        equip_path = "C:/Users/asus/.gemini/antigravity/scratch/polar-ems/data/sample_equipment.csv"
        if os.path.exists(equip_path):
            df_eq = pd.read_csv(equip_path)
            eq_objs = [
                Equipment(
                    id=row["id"],
                    station_id=row["station_id"],
                    name=row["name"],
                    type=row["type"],
                    capacity_kw=float(row["capacity_kw"]),
                    health_score=float(row["health_score"]),
                    status=row["status"],
                    hours_run=float(row["hours_run"]),
                    anomaly_prob=float(row["anomaly_prob"]),
                    last_serviced=str(row["last_serviced"])
                )
                for _, row in df_eq.iterrows()
            ]
            db.bulk_save_objects(eq_objs)
            db.commit()

        alerts = [
            Alert(
                station_id="bharati",
                severity="warning",
                component="Generator G2",
                message="Generator G2 fuel burn rate is 14% higher than manufacturer baseline curve. Recommended injector service."
            ),
            Alert(
                station_id="bharati",
                severity="info",
                component="BESS Battery Bank",
                message="High renewable surplus expected midday. BESS charging schedule programmed to reach 92% SOC before 16:00 UTC."
            )
        ]
        db.add_all(alerts)
        db.commit()
        print("Database initialized and seeded successfully!")
    finally:
        db.close()
