from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class Appointment(Document):
    custom_id: Optional[str] = None
    patient_id: str
    doctor_id: str
    datetime: datetime
    type: str  # online or in-person
    status: str = "pending"  # pending/confirmed/cancelled/completed
    reason: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "appointments"
