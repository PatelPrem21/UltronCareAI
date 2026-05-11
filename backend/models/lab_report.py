from beanie import Document
from pydantic import Field
from typing import Optional, Dict, Any
from datetime import datetime

class LabReport(Document):
    custom_id: Optional[str] = None
    patient_id: str
    doctor_id: str
    visit_id: str
    report_name: str
    pdf_url: str
    extracted_values: Dict[str, Any] = {}
    ai_interpretation: Optional[str] = None
    status: str = "pending"
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "lab_reports"
