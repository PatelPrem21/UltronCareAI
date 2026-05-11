from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class AIAlert(Document):
    custom_id: Optional[str] = None
    patient_id: str
    module: str  # drug_interaction/deterioration/adherence
    severity: str  # low/medium/high/critical
    message: str
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "ai_alerts"
