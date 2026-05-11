from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional, List
from pydantic import BaseModel
from models.doctor import Doctor
from models.user import User
from utils.auth import get_current_user

router = APIRouter(prefix="/doctors", tags=["Doctor"])

class DoctorProfileRequest(BaseModel):
    specialization: str
    degree: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    hospital: Optional[str] = None
    department: Optional[str] = None
    available_days: List[str] = []
    consultation_fees: Optional[float] = None
    bio: Optional[str] = None

@router.post("/profile")
async def create_doctor_profile(data: DoctorProfileRequest, current_user: dict = Depends(get_current_user)):
    existing = await Doctor.find_one(Doctor.user_id == current_user["user_id"])
    if existing:
        raise HTTPException(status_code=400, detail="Doctor profile already exists")
    user = await User.get(current_user["user_id"])
    count = await Doctor.count()
    custom_id = f"DOC-{str(count + 1).zfill(4)}"
    doctor = Doctor(
        user_id = current_user["user_id"],  # ← actual MongoDB user id
        custom_id = custom_id,              # ← our custom DOC-0001 id
        name=user.name,
        email=user.email,
        specialization=data.specialization,
        degree=data.degree,
        license_number=data.license_number,
        experience_years=data.experience_years,
        hospital=data.hospital,
        department=data.department,
        available_days=data.available_days,
        consultation_fees=data.consultation_fees,
        bio=data.bio
    )
    await doctor.insert()
    return {
        "message": "Doctor profile created successfully",
        "doctor_id": str(doctor.id),
        "name": doctor.name,
        "specialization": doctor.specialization
    }

@router.get("/{id}")
async def get_doctor(id: str, current_user: dict = Depends(get_current_user)):
    doctor = await Doctor.find_one(Doctor.custom_id == id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "doctor_id": doctor.custom_id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "hospital": doctor.hospital,
        "experience_years": doctor.experience_years,
        "available_days": doctor.available_days,
        "consultation_fees": doctor.consultation_fees,
        "bio": doctor.bio
    }