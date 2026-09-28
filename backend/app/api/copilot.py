from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..schemas.pydantic_schemas import CopilotChatRequest, CopilotChatResponse
from ..services.copilot_service import energy_copilot

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])

@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat(req: CopilotChatRequest, db: Session = Depends(get_db)):
    return energy_copilot.process_chat(req, db)
