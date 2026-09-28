import math
import random
import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from ..models.orm_models import Station, EnergyReading, WeatherReading, Equipment, Alert, SystemSetting
from ..schemas.pydantic_schemas import TelemetryCurrent, WeatherCurrent, BatteryCurrent, ScenarioTriggerResponse

class SimulationEngine:
    def __init__(self):
        self.simulation_mode = True
        self.active_scenarios = {
            'bharati': 'normal',
            'maitri': 'normal'
        }
        self.co2_factor = 2.68 # kg CO2 per Litre of polar diesel
        self.fuel_cost_per_l = 1.45 # USD per Litre delivered to Antarctica
        self.last_tick = time.time()
        self.drift_phase = 0.0

    def trigger_scenario(self, scenario: str, station_id: str = "bharati") -> ScenarioTriggerResponse:
        self.active_scenarios[station_id] = scenario
        
        survival_mode = scenario in ['arctic_storm', 'generator_failure']
        
        msg = f"Station scenario set to {scenario.upper()}."
        temp_override = None
        wind_mult = 1.0
        sol_mult = 1.0
        load_mult = 1.0
        g2_online = True

        if scenario == 'low_wind':
            msg = "Katabatic wind dropped abruptly. Turbines operating at minimum cut-in threshold."
            wind_mult = 0.15
        elif scenario == 'solar_drop':
            msg = "Dense polar stratus cloud cover & whiteout event. Solar PV output reduced to zero."
            sol_mult = 0.0
        elif scenario == 'arctic_storm':
            msg = "POLAR SURVIVAL MODE ACTIVE: Severe blizzard (-38°C), high heating demand, wind turbine storm safety cut-out engaged."
            temp_override = -38.5
            wind_mult = 0.20
            sol_mult = 0.05
            load_mult = 1.35
        elif scenario == 'generator_failure':
            msg = "CRITICAL: Generator G2 mechanical trip. Primary bus shifting to battery reserve and Generator G1/G3."
            g2_online = False
        elif scenario == 'high_demand':
            msg = "Scheduled deep ice-coring drill and spectrometer laboratories energized. Peak load initiated."
            load_mult = 1.45

        return ScenarioTriggerResponse(
            status="success",
            active_scenario=scenario,
            message=msg,
            survival_mode=survival_mode,
            temperature_override=temp_override,
            wind_multiplier=wind_mult,
            solar_multiplier=sol_mult,
            load_multiplier=load_mult,
            g2_online=g2_online
        )

    def get_current_telemetry(self, station_id: str, db: Session) -> TelemetryCurrent:
        # Sync dynamic settings from database
        sys_set = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
        if sys_set:
            self.co2_factor = sys_set.co2_factor
            self.fuel_cost_per_l = sys_set.fuel_cost_per_l
            min_reserve_soc = sys_set.min_bess_soc
        else:
            min_reserve_soc = 30.0

        station = db.query(Station).filter(Station.id == station_id).first()
        tz_offset = station.timezone_offset_hours if (station and station.timezone_offset_hours is not None) else (5.0 if station_id == 'bharati' else 0.0)
        tz_label = station.timezone_label if (station and station.timezone_label) else ("UTC+05:00 (Bharati Station Time)" if station_id == 'bharati' else "UTC+00:00 (Maitri Station Time)")
        
        utc_now = datetime.now(timezone.utc)
        local_now = utc_now + timedelta(hours=tz_offset)
        local_time_str = local_now.strftime("%Y-%m-%d %H:%M:%S")
        utc_time_str = utc_now.strftime("%Y-%m-%d %H:%M:%S UTC")

        # Retrieve latest recorded reading
        latest = db.query(EnergyReading).filter(EnergyReading.station_id == station_id).order_by(EnergyReading.timestamp.desc()).first()
        scenario = self.active_scenarios.get(station_id, 'normal')
        
        # Advance micro-fluctuation phase for demo mode
        now_ts = time.time()
        self.drift_phase += (now_ts - self.last_tick) * 0.4
        self.last_tick = now_ts
        jitter = math.sin(self.drift_phase) * 1.5

        if latest:
            base_load = latest.load_kw
            base_wind = latest.wind_kw
            base_soc = latest.battery_soc
            base_temp = latest.temperature
        else:
            base_load, base_wind, base_soc, base_temp = 55.0, 45.0, 72.0, -22.0

        # Calculate exact solar generation based on station's local solar angle
        local_hour = (local_now.hour + (local_now.minute / 60.0)) % 24.0
        solar_capacity = station.solar_capacity_kw if station else (100.0 if station_id == 'bharati' else 60.0)
        if 4.0 <= local_hour <= 20.0:
            solar_elevation = math.sin(math.pi * (local_hour - 4.0) / 16.0)
            base_solar = solar_capacity * 0.72 * solar_elevation
        else:
            base_solar = 0.0

        load_kw = base_load + jitter
        solar_kw = base_solar + (math.cos(self.drift_phase * 0.5) * 0.8 if base_solar > 0 else 0.0)
        wind_kw = base_wind + math.sin(self.drift_phase * 0.8) * 2.5
        temp = base_temp

        # Scenario overrides
        if scenario == 'low_wind':
            wind_kw = max(2.0, wind_kw * 0.15)
        elif scenario == 'solar_drop':
            solar_kw = 0.0
        elif scenario == 'arctic_storm':
            temp = -38.5 + math.sin(self.drift_phase * 0.2) * 0.5
            load_kw = (base_load * 1.35) + abs(jitter * 2.0)
            solar_kw = 0.0
            wind_kw = 8.0 # safe low speed feathering
        elif scenario == 'generator_failure':
            load_kw = base_load * 0.95 # shed non-essential loads
        elif scenario == 'high_demand':
            load_kw = base_load * 1.45 + jitter

        load_kw = max(18.0, round(load_kw, 2))
        solar_kw = max(0.0, round(solar_kw, 2))
        wind_kw = max(0.0, round(wind_kw, 2))
        renewable_kw = round(solar_kw + wind_kw, 2)
        net = renewable_kw - load_kw

        bat_cap = station.battery_capacity_kwh if station else 500.0

        if net >= 0:
            # Renewable surplus charges battery
            charge_kw = min(net, bat_cap * 0.25)
            battery_kw = -round(charge_kw, 2)
            gen_kw = 0.0
            soc = min(95.0, base_soc + 0.05)
        else:
            # Renewable deficit: battery discharges respecting min_reserve_soc
            deficit = -net
            if base_soc > min_reserve_soc and scenario != 'arctic_storm':
                dis_kw = min(deficit, bat_cap * 0.3, (base_soc - min_reserve_soc) / 100.0 * bat_cap)
                battery_kw = round(dis_kw, 2)
                soc = max(min_reserve_soc, base_soc - 0.04)
                rem = deficit - dis_kw
                gen_kw = round(rem, 2) if rem > 1.0 else 0.0
            else:
                # Low battery or Arctic Storm -> dispatch generator
                battery_kw = round(min(15.0, (base_soc - 25.0)), 2) if base_soc > 25.0 else 0.0
                gen_kw = round(deficit - battery_kw, 2)
                soc = max(28.0, base_soc - 0.02)

        fuel_rate = round(gen_kw * 0.272, 2) if gen_kw > 0.5 else 0.0
        renewable_pct = round(min(100.0, (renewable_kw / load_kw) * 100.0), 1) if load_kw > 0 else 0.0
        co2_rate = round(fuel_rate * self.co2_factor, 2)
        survival_mode = scenario in ['arctic_storm', 'generator_failure'] or soc <= min_reserve_soc

        # System health calculation
        system_health = 96.0
        if scenario == 'arctic_storm':
            system_health = 74.0
        elif scenario == 'generator_failure':
            system_health = 68.0
        elif scenario in ['low_wind', 'solar_drop']:
            system_health = 88.0

        alert_count = db.query(Alert).filter(Alert.station_id == station_id, Alert.acknowledged == False).count()
        if survival_mode:
            alert_count += 1

        iso_now = utc_now.isoformat()

        return TelemetryCurrent(
            timestamp=iso_now,
            station_id=station_id,
            load_kw=load_kw,
            solar_kw=solar_kw,
            wind_kw=wind_kw,
            generator_kw=gen_kw,
            battery_kw=battery_kw,
            battery_soc=round(soc, 1),
            fuel_rate=fuel_rate,
            temperature=round(temp, 1),
            is_simulated=self.simulation_mode,
            renewable_kw=renewable_kw,
            renewable_pct=renewable_pct,
            co2_rate_kg_per_hr=co2_rate,
            system_health_pct=system_health,
            survival_mode=survival_mode,
            active_scenario=scenario,
            alert_count=alert_count,
            station_local_time=local_time_str,
            station_timezone=tz_label,
            station_utc_offset=tz_offset,
            utc_time=utc_time_str,
            min_soc=round(min_reserve_soc, 1)
        )


    def get_current_weather(self, db: Session) -> WeatherCurrent:
        latest = db.query(WeatherReading).order_by(WeatherReading.timestamp.desc()).first()
        scenario = self.active_scenarios.get('bharati', 'normal')
        
        temp = latest.temperature if latest else -22.5
        wind_speed = latest.wind_speed if latest else 12.0
        wind_dir = latest.wind_direction if latest else 135.0
        pressure = latest.pressure if latest else 984.0
        humidity = latest.humidity if latest else 65.0
        irradiance = latest.solar_irradiance if latest else 350.0
        cloud = latest.cloud_cover if latest else 0.35
        label = "Clear Polar Sky"

        if scenario == 'arctic_storm':
            temp = -38.5
            wind_speed = 34.2
            pressure = 962.0
            humidity = 92.0
            irradiance = 10.0
            cloud = 0.98
            label = "Blizzard & Katabatic Gale"
        elif scenario == 'solar_drop':
            irradiance = 0.0
            cloud = 0.95
            label = "Dense Stratus / Whiteout"
        elif scenario == 'low_wind':
            wind_speed = 2.4
            label = "Calm Cold Plateau"
        elif irradiance > 500:
            label = "High Polar Insolation"

        # Wind chill index formula
        wind_chill = round(13.12 + 0.6215 * temp - 11.37 * (wind_speed ** 0.16) + 0.3965 * temp * (wind_speed ** 0.16), 1)

        return WeatherCurrent(
            timestamp=datetime.now(timezone.utc).isoformat(),
            temperature=round(temp, 1),
            wind_speed=round(wind_speed, 1),
            wind_direction=round(wind_dir, 1),
            pressure=round(pressure, 1),
            humidity=round(humidity, 1),
            solar_irradiance=round(irradiance, 1),
            cloud_cover=round(cloud, 2),
            condition_label=label,
            gust_speed=round(wind_speed * 1.35, 1),
            wind_chill_c=wind_chill
        )

    def get_current_battery(self, station_id: str, db: Session) -> BatteryCurrent:
        telemetry = self.get_current_telemetry(station_id, db)
        station = db.query(Station).filter(Station.id == station_id).first()
        cap = station.battery_capacity_kwh if station else 500.0
        soc = telemetry.battery_soc
        stored = round(cap * (soc / 100.0), 1)

        # Voltage curve for 480V nominal LiFePO4 rack
        voltage = round(460.0 + (soc / 100.0) * 48.0, 1)
        power_kw = telemetry.battery_kw
        current_a = round((abs(power_kw) * 1000.0) / voltage, 1) if voltage > 0 else 0.0

        if power_kw > 0.5:
            state = "discharging"
        elif power_kw < -0.5:
            state = "charging"
        else:
            state = "idle"

        net_drain = max(5.0, telemetry.load_kw - telemetry.renewable_kw)
        usable_kwh = max(0.0, cap * ((soc - 30.0) / 100.0))
        autonomy_hrs = round(usable_kwh / net_drain, 1) if net_drain > 0 else 99.9

        return BatteryCurrent(
            station_id=station_id,
            soc=soc,
            capacity_kwh=cap,
            current_stored_kwh=stored,
            voltage_v=voltage,
            current_a=current_a,
            power_kw=power_kw,
            state=state,
            temperature_c=round(18.5 + (abs(power_kw) / cap) * 12.0, 1), # Thermal management keeps BESS at 18-24C
            health_pct=88.5,
            min_soc_reserve=30.0,
            max_soc=95.0,
            reserve_healthy=soc >= 30.0,
            estimated_autonomy_hours=autonomy_hrs
        )

simulation_engine = SimulationEngine()
