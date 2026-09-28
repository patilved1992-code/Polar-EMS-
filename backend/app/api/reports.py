from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..services.report_service import report_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/daily")
def get_daily_report(
    station_id: str = Query("bharati", description="Station ID"),
    db: Session = Depends(get_db)
):
    return report_service.generate_report(station_id, "daily", db)

@router.get("/weekly")
def get_weekly_report(
    station_id: str = Query("bharati", description="Station ID"),
    db: Session = Depends(get_db)
):
    return report_service.generate_report(station_id, "weekly", db)
