import math
import numpy as np
import datetime
from typing import List
from ..schemas.pydantic_schemas import ForecastPoint, ForecastSeriesResponse

class EnergyForecaster:
    def __init__(self):
        np.random.seed(42)

    def generate_forecast(
        self,
        metric: str,
        station_id: str,
        horizon: str,
        base_temp: float = -23.0,
        base_wind: float = 12.0
    ) -> ForecastSeriesResponse:
        # Horizon parsing
        horizon_clean = horizon.lower().strip()
        if horizon_clean == "15m":
            num_points = 4
            delta_mins = 15
            horizon_hours = 1.0
        elif horizon_clean == "1h":
            num_points = 6
            delta_mins = 10
            horizon_hours = 1.0
        elif horizon_clean == "6h":
            num_points = 12
            delta_mins = 30
            horizon_hours = 6.0
        elif horizon_clean == "7d":
            num_points = 28 # 6h intervals for 7 days
            delta_mins = 360
            horizon_hours = 168.0
        else: # default 24h
            horizon_clean = "24h"
            num_points = 24
            delta_mins = 60
            horizon_hours = 24.0

        now = datetime.datetime.now(datetime.timezone.utc).replace(minute=0, second=0, microsecond=0)
        points: List[ForecastPoint] = []
        
        is_bharati = (station_id.lower() == "bharati")
        base_demand = 55.0 if is_bharati else 42.0
        sol_cap = 90.0 if is_bharati else 60.0
        wind_cap = 120.0 if is_bharati else 90.0

        for i in range(num_points):
            t = now + datetime.timedelta(minutes=delta_mins * i)
            h = t.hour
            d = t.timetuple().tm_yday
            
            # Predict Weather component
            pred_temp = base_temp + 3.0 * math.cos((h - 13) * math.pi / 12.0)
            pred_wind_speed = max(2.5, min(32.0, base_wind + 5.0 * math.sin(h * 0.4) + math.sin(i * 0.6) * 3.0))
            solar_elev = max(0.0, math.sin((h - 5) * math.pi / 14.0)) if 5 <= h <= 19 else 0.0
            
            if metric == "load":
                # Heating load increases when temperature drops
                heating = max(0.0, (-pred_temp - 15.0) * 1.05)
                # Laboratory and kitchen diurnal shifts
                activity = 8.5 * math.sin((h - 7) * math.pi / 8.0) if 7 <= h <= 22 else 0.0
                val = round(max(22.0, base_demand + heating + activity + math.sin(i * 0.3) * 2.2), 2)
                err_margin = round(val * (0.04 + 0.008 * (i / num_points)), 2)
                conf = round(max(0.82, 0.96 - 0.012 * (i / num_points)), 3)

            elif metric == "solar":
                cloud = 0.35 + 0.2 * math.sin(d + i * 0.1)
                val = round(solar_elev * (1.0 - 0.7 * cloud) * sol_cap, 2)
                err_margin = round(max(1.5, val * 0.12), 2)
                conf = round(max(0.80, 0.94 - 0.015 * (i / num_points)), 3)

            elif metric == "wind":
                ws = pred_wind_speed
                if ws < 3.0 or ws > 28.0:
                    val = 0.0
                elif ws < 12.0:
                    val = round(wind_cap * ((ws - 3.0) / 9.0) ** 2.2, 2)
                else:
                    val = round(wind_cap * min(1.0, 1.0 - (ws - 12.0) * 0.02), 2)
                err_margin = round(max(3.0, val * 0.14), 2)
                conf = round(max(0.78, 0.91 - 0.018 * (i / num_points)), 3)

            elif metric == "renewable":
                # Combined Solar + Wind
                cloud = 0.35 + 0.2 * math.sin(d + i * 0.1)
                sol = round(solar_elev * (1.0 - 0.7 * cloud) * sol_cap, 2)
                ws = pred_wind_speed
                wnd = round(wind_cap * ((ws - 3.0) / 9.0) ** 2.2, 2) if 3.0 <= ws <= 12.0 else 0.0
                val = round(sol + wnd, 2)
                err_margin = round(max(4.0, val * 0.12), 2)
                conf = round(max(0.80, 0.93 - 0.014 * (i / num_points)), 3)
            else:
                val = 40.0
                err_margin = 4.0
                conf = 0.90

            points.append(ForecastPoint(
                timestamp=t.isoformat(),
                predicted=val,
                actual=val * 0.98 if i == 0 else None,
                confidence_lower=round(max(0.0, val - err_margin), 2),
                confidence_upper=round(val + err_margin, 2),
                confidence_score=conf
            ))

        vals = [p.predicted for p in points]
        hours_per_pt = horizon_hours / num_points
        total_kwh = round(sum(vals) * hours_per_pt, 1)

        return ForecastSeriesResponse(
            metric=metric,
            station_id=station_id,
            horizon=horizon_clean,
            horizon_hours=horizon_hours,
            points=points,
            peak_value=round(max(vals), 2) if vals else 0.0,
            avg_value=round(sum(vals) / len(vals), 2) if vals else 0.0,
            total_energy_kwh=total_kwh
        )

energy_forecaster = EnergyForecaster()
