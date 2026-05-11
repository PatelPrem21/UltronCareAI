from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional, List
from datetime import datetime

class Doctor(Document):
    user_id: str
    custom_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    degree: str
    specialization: str
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    hospital: Optional[str] = None
    department: Optional[str] = None
    available_days: List[str] = []
    consultation_fees: Optional[float] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "doctors"