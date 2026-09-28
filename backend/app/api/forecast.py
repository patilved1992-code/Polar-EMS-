from fastapi import APIRouter, Query
from ..schemas.pydantic_schemas import ForecastSeriesResponse
from ..ml.forecasting import energy_forecaster

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

@router.get("/load", response_model=ForecastSeriesResponse)
def get_load_forecast(
    station_id: str = Query("bharati", description="Station ID"),
    horizon: str = Query("24h", description="Forecast horizon: 15m, 1h, 6h, 24h, 7d")
):
    return energy_forecaster.generate_forecast("load", station_id, horizon)

@router.get("/solar", response_model=ForecastSeriesResponse)
def get_solar_forecast(
    station_id: str = Query("bharati", description="Station ID"),
    horizon: str = Query("24h", description="Forecast horizon: 15m, 1h, 6h, 24h, 7d")
):
    return energy_forecaster.generate_forecast("solar", station_id, horizon)

@router.get("/wind", response_model=ForecastSeriesResponse)
def get_wind_forecast(
    station_id: str = Query("bharati", description="Station ID"),
    horizon: str = Query("24h", description="Forecast horizon: 15m, 1h, 6h, 24h, 7d")
):
    return energy_forecaster.generate_forecast("wind", station_id, horizon)

@router.get("/renewable", response_model=ForecastSeriesResponse)
def get_renewable_forecast(
    station_id: str = Query("bharati", description="Station ID"),
    horizon: str = Query("24h", description="Forecast horizon: 15m, 1h, 6h, 24h, 7d")
):
    return energy_forecaster.generate_forecast("renewable", station_id, horizon)
