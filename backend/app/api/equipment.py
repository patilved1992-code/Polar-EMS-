from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.orm_models import Equipment
from ..schemas.pydantic_schemas import EquipmentItem
from ..ml.anomaly_detection import anomaly_detector

router = APIRouter(prefix="/api/equipment", tags=["Equipment"])

@router.get("/health", response_model=List[EquipmentItem])
def get_equipment_health(
    station_id: str = Query("bharati", description="Station ID"),
    db: Session = Depends(get_db)
):
    items = db.query(Equipment).filter(Equipment.station_id == station_id).all()
    results = []
    for item in items:
        diag = anomaly_detector.assess_equipment(item.id, item.type, item.health_score)
        results.append(EquipmentItem(
            id=item.id,
            station_id=item.station_id,
            name=item.name,
            type=item.type,
            capacity_kw=item.capacity_kw,
            health_score=item.health_score,
            status=item.status,
            hours_run=item.hours_run,
            anomaly_prob=diag["anomaly_prob"],
            possible_issue=diag["possible_issue"],
            recommended_action=diag["recommended_action"],
            last_serviced=item.last_serviced
        ))
    return results
