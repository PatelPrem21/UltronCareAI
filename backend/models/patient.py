from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional, List
from datetime import datetime

class Patient(Document):
    user_id: str
    custom_id: Optional[str] = None
    name: str
    email: EmailStr
    age: int
    blood_type: str
    phone: str
    allergies: List[str] = []
    conditions: List[str] = []
    emergency_contact: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "patients"