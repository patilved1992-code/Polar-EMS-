from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..schemas.pydantic_schemas import OptimizationRequest, OptimizationResponse
from ..optimization.dispatch_engine import energy_optimizer
from ..services.simulation_service import simulation_engine

router = APIRouter(prefix="/api/optimization", tags=["Optimization"])

_latest_result: OptimizationResponse = None

@router.post("/run", response_model=OptimizationResponse)
def run_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    global _latest_result
    tel = simulation_engine.get_current_telemetry(req.station_id, db)
    res = energy_optimizer.run_optimization(req, current_soc=tel.battery_soc)
    _latest_result = res
    return res

@router.get("/latest", response_model=OptimizationResponse)
def get_latest_optimization(
    station_id: str = Query("bharati", description="Station ID"),
    db: Session = Depends(get_db)
):
    global _latest_result
    if _latest_result and _latest_result.station_id == station_id:
        return _latest_result
    
    # Run default optimization
    req = OptimizationRequest(station_id=station_id, horizon_hours=24)
    tel = simulation_engine.get_current_telemetry(station_id, db)
    res = energy_optimizer.run_optimization(req, current_soc=tel.battery_soc)
    _latest_result = res
    return res
