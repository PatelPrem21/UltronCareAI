from pydantic import BaseModel, Field
from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime

class Vitals(BaseModel):
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    heart_rate: Optional[int] = None
    oxygen_level: Optional[float] = None

class Visit(Document):
    custom_id: Optional[str] = None
    patient_id: str
    doctor_id: str
    vitals: Optional[Vitals] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "visits"