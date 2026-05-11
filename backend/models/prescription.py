from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Medicine(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class Prescription(Document):
    custom_id: Optional[str] = None
    patient_id: str
    doctor_id: str
    visit_id: str
    medicines: List[Medicine] = []
    instructions: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prescriptions"
