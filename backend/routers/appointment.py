from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from models.appointment import Appointment
from models.patient import Patient
from models.doctor import Doctor
from models.notification import Notification
from utils.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    datetime: datetime
    type: str
    reason: str
    notes: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str

@router.post("/")
async def book_appointment(data: AppointmentRequest, current_user: dict = Depends(get_current_user)):
    patient = await Patient.find_one(Patient.custom_id == data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    doctor = await Doctor.find_one(Doctor.custom_id == data.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Basic conflict check (same doctor, same time)
    conflict = await Appointment.find_one(
        Appointment.doctor_id == data.doctor_id,
        Appointment.datetime == data.datetime,
        Appointment.status != "cancelled"
    )
    if conflict:
        raise HTTPException(status_code=400, detail="Doctor is already booked for this time")

    count = await Appointment.count()
    custom_id = f"APT-{str(count + 1).zfill(4)}"

    appointment = Appointment(
        custom_id=custom_id,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        datetime=data.datetime,
        type=data.type,
        reason=data.reason,
        notes=data.notes
    )
    await appointment.insert()

    # Notifications
    notif_count = await Notification.count()
    
    notif_patient = Notification(
        custom_id=f"NOTIF-{str(notif_count + 1).zfill(4)}",
        user_id=patient.user_id,
        type="appointment",
        message=f"Appointment {custom_id} booked with Dr. {doctor.name}."
    )
    await notif_patient.insert()

    notif_doctor = Notification(
        custom_id=f"NOTIF-{str(notif_count + 2).zfill(4)}",
        user_id=doctor.user_id,
        type="appointment",
        message=f"New appointment {custom_id} booked by patient {patient.name}."
    )
    await notif_doctor.insert()

    return {
        "message": "Appointment booked successfully",
        "appointment_id": custom_id
    }

@router.get("/{user_id}")
async def get_user_appointments(user_id: str, current_user: dict = Depends(get_current_user)):
    # works for both patient and doctor
    patient = await Patient.find_one(Patient.user_id == user_id)
    doctor = await Doctor.find_one(Doctor.user_id == user_id)
    
    if patient:
        appointments = await Appointment.find(Appointment.patient_id == patient.custom_id).to_list()
    elif doctor:
        appointments = await Appointment.find(Appointment.doctor_id == doctor.custom_id).to_list()
    else:
        raise HTTPException(status_code=404, detail="User profile not found")

    if not appointments:
        raise HTTPException(status_code=404, detail="No appointments found")
        
    return appointments

@router.put("/{id}")
async def update_appointment_status(id: str, data: AppointmentStatusUpdate, current_user: dict = Depends(get_current_user)):
    appointment = await Appointment.find_one(Appointment.custom_id == id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.status = data.status
    await appointment.save()
    
    return {
        "message": "Appointment status updated",
        "status": appointment.status
    }
