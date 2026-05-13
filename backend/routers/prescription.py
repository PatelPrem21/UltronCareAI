from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from models.prescription import Prescription, Medicine
from models.patient import Patient
from models.doctor import Doctor
from models.notification import Notification
from utils.auth import get_current_user, require_doctor
from models.ai_alert import AIAlert
from utils.drug_checker import check_drug_interactions

router = APIRouter(prefix="/prescriptions", tags=["Prescription"])

class MedicineRequest(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionRequest(BaseModel):
    patient_id: str
    visit_id: str
    medicines: List[MedicineRequest]
    instructions: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str

@router.post("/")
async def create_prescription(data: PrescriptionRequest, current_user: dict = Depends(require_doctor)):
    doctor = await Doctor.find_one(Doctor.user_id == current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    patient = await Patient.find_one(Patient.custom_id == data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    count = await Prescription.count()
    custom_id = f"PRESC-{str(count + 1).zfill(4)}"

    medicines = [
        Medicine(
            name=m.name,
            dosage=m.dosage,
            frequency=m.frequency,
            duration=m.duration
        ) for m in data.medicines
    ]

    prescription = Prescription(
        custom_id=custom_id,
        patient_id=data.patient_id,
        doctor_id=doctor.custom_id,
        visit_id=data.visit_id,
        medicines=medicines,
        instructions=data.instructions
    )
    await prescription.insert()

    # ── AI Module 1: Drug Interaction Check ──────────────────────────
    try:
        # Get all existing active medications for this patient
        existing_prescriptions = await Prescription.find(
            Prescription.patient_id == data.patient_id,
            Prescription.status == "active"
        ).to_list()

        # Extract all existing medicine names
        existing_drug_names = []
        for presc in existing_prescriptions:
            for med in presc.medicines:
                existing_drug_names.append(med.name)

        # Check each new medicine against existing ones
        for new_medicine in data.medicines:
            interactions = await check_drug_interactions(
                new_medicine.name,
                existing_drug_names
            )

            # Save alert for each interaction found
            for interaction in interactions:
                alert_count = await AIAlert.count()
                alert_id = f"ALERT-{str(alert_count + 1).zfill(4)}"

                alert = AIAlert(
                    custom_id=alert_id,
                    patient_id=data.patient_id,
                    module="drug_interaction",
                    severity=interaction["severity"],
                    message=interaction["message"]
                )
                await alert.insert()

                # Notify doctor about the interaction
                notif_count = await Notification.count()
                notif_id = f"NOTIF-{str(notif_count + 1).zfill(4)}"
                drug_notif = Notification(
                    custom_id=notif_id,
                    user_id=current_user["user_id"],
                    type="drug_interaction",
                    message=f"⚠️ Drug interaction detected: {interaction['message']}"
                )
                await drug_notif.insert()

    except Exception as e:
        # Never block prescription creation if AI check fails
        print(f"Drug interaction check failed: {e}")
    # ── End AI Module 1 ───────────────────────────────────────────────

    # Create notification for patient
    notification_count = await Notification.count()
    notif_id = f"NOTIF-{str(notification_count + 1).zfill(4)}"
    notification = Notification(
        custom_id=notif_id,
        user_id=patient.user_id,
        type="prescription",
        message=f"A new prescription ({custom_id}) has been added by Dr. {doctor.name}."
    )
    await notification.insert()

    return {
        "message": "Prescription created successfully",
        "prescription_id": custom_id,
        "patient_id": data.patient_id,
        "doctor_id": doctor.custom_id
    }

@router.get("/{patient_id}")
async def get_patient_prescriptions(patient_id: str, current_user: dict = Depends(get_current_user)):
    prescriptions = await Prescription.find(Prescription.patient_id == patient_id).to_list()
    if not prescriptions:
        raise HTTPException(status_code=404, detail="No prescriptions found for this patient")
    return prescriptions

@router.put("/{id}/status")
async def update_prescription_status(id: str, data: StatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    prescription = await Prescription.find_one(Prescription.custom_id == id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    prescription.status = data.status
    await prescription.save()
    
    return {"message": "Prescription status updated successfully", "status": prescription.status}
