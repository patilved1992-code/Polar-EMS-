from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.orm_models import Alert
from ..schemas.pydantic_schemas import AlertItem

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertItem])
def get_alerts(
    station_id: str = Query("bharati", description="Station ID"),
    unack_only: bool = Query(False, description="Filter unacknowledged alerts only"),
    db: Session = Depends(get_db)
):
    q = db.query(Alert).filter(Alert.station_id == station_id)
    if unack_only:
        q = q.filter(Alert.acknowledged == False)
    alerts = q.order_by(Alert.timestamp.desc()).all()
    return [
        AlertItem(
            id=a.id,
            timestamp=a.timestamp.isoformat(),
            station_id=a.station_id,
            severity=a.severity,
            component=a.component,
            message=a.message,
            acknowledged=a.acknowledged
        )
        for a in alerts
    ]

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.acknowledged = True
    db.commit()
    return {"status": "success", "alert_id": alert_id, "acknowledged": True}
