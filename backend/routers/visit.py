from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from models.visit import Visit, Vitals
from models.patient import Patient
from models.doctor import Doctor
from utils.auth import get_current_user

router = APIRouter(prefix="/visits", tags=["Visits"])

class VitalsRequest(BaseModel):
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    heart_rate: Optional[int] = None
    oxygen_level: Optional[float] = None

class VisitRequest(BaseModel):
    patient_id: str
    vitals: Optional[VitalsRequest] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None

@router.post("/")
async def create_visit(data: VisitRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create visits")
    patient = await Patient.find_one(Patient.custom_id == data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = await Doctor.find_one(Doctor.user_id == current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    count = await Visit.count()
    custom_id = f"VIS-{str(count + 1).zfill(4)}"
    vitals = None
    if data.vitals:
        vitals = Vitals(
            blood_pressure=data.vitals.blood_pressure,
            temperature=data.vitals.temperature,
            weight=data.vitals.weight,
            heart_rate=data.vitals.heart_rate,
            oxygen_level=data.vitals.oxygen_level
        )
    visit = Visit(
        custom_id=custom_id,
        patient_id=data.patient_id,
        doctor_id=doctor.custom_id,
        vitals=vitals,
        diagnosis=data.diagnosis,
        notes=data.notes,
        follow_up_date=data.follow_up_date
    )
    await visit.insert()
    return {
        "message": "Visit created successfully",
        "visit_id": custom_id,
        "patient_id": data.patient_id,
        "doctor_id": doctor.custom_id,
        "created_at": visit.created_at
    }

@router.get("/{patient_id}")
async def get_patient_visits(patient_id: str, current_user: dict = Depends(get_current_user)):
    visits = await Visit.find(Visit.patient_id == patient_id).to_list()
    if not visits:
        raise HTTPException(status_code=404, detail="No visits found for this patient")
    return visits