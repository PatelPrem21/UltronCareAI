from fastapi import APIRouter, HTTPException
from models.patient import Patient
from models.prescription import Prescription

router = APIRouter(prefix="/emergency", tags=["Emergency"])

@router.get("/{patient_id}")
async def get_emergency_data(patient_id: str):
    patient = await Patient.find_one(Patient.custom_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    active_prescriptions = await Prescription.find(
        Prescription.patient_id == patient_id,
        Prescription.status == "active"
    ).to_list()
    
    current_medications = []
    for prescription in active_prescriptions:
        for med in prescription.medicines:
            current_medications.append({
                "name": med.name,
                "dosage": med.dosage,
                "frequency": med.frequency
            })
            
    return {
        "name": patient.name,
        "blood_type": patient.blood_type,
        "allergies": patient.allergies,
        "conditions": patient.conditions,
        "emergency_contact": patient.emergency_contact,
        "current_medications": current_medications
    }
