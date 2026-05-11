from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from models.patient import Patient
from datetime import datetime
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/patients", tags=["Patient"])

class PatientProfileRequest(BaseModel):
    name: str
    age: int
    blood_type: str
    phone: str
    allergies: List[str] = []
    conditions: List[str] = []
    emergency_contact: Optional[str] = None

@router.post("/profile")
async def profile(data: PatientProfileRequest, current_user: dict = Depends(get_current_user)):
    existing = await Patient.find_one(Patient.user_id == current_user["user_id"])
    user = await User.get(current_user["user_id"])
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient already registered"
        )
    count = await Patient.count()
    custom_id = f"PAT-{str(count + 1).zfill(4)}"
    patient = Patient(
        user_id = current_user["user_id"],
        custom_id = custom_id,
        name = data.name,
        email = user.email,
        age = data.age,
        blood_type = data.blood_type,
        phone = data.phone,
        allergies = data.allergies,
        conditions =  data.conditions,
        emergency_contact = data.emergency_contact
    )
    await patient.insert()
    print("Patient saved:", patient.id)
    return {
        "message": "User is rolled out to Patient successfully",
        "user_id": str(patient.id),
        "name": patient.name,
        "role": "Patient"
    }

@router.get("/{id}")
async def get_patient_data(id: str, current_user: dict = Depends(get_current_user)):
    patient = await Patient.find_one(Patient.custom_id == id)
    if not patient:
        raise HTTPException(status_code=404, detail="patient not found")
    return patient