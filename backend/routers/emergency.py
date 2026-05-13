from fastapi import APIRouter, HTTPException
from models.patient import Patient
from models.prescription import Prescription
from ai.emergency_summarizer import generate_emergency_summary
from ai.qr_generator import generate_qr

router = APIRouter(prefix="/emergency", tags=["Emergency"])


@router.get("/{patient_id}")
async def get_emergency_data(patient_id: str):

    # ── 1. Fetch patient ───────────────────────────────────────
    patient = await Patient.find_one(Patient.custom_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # ── 2. Fetch active prescriptions (your existing logic) ────
    active_prescriptions = await Prescription.find(
        Prescription.patient_id == patient_id,
        Prescription.status == "active"
    ).to_list()

    current_medications = []
    for prescription in active_prescriptions:
        for med in prescription.medicines:
            current_medications.append({
                "name":      med.name,
                "dosage":    med.dosage,
                "frequency": med.frequency,
            })

    # ── 3. Generate AI triage summary (Gemini) ─────────────────
    try:
        ai_summary = await generate_emergency_summary(patient_id)
    except Exception as e:
        ai_summary = {
            "triage_level": "UNKNOWN",
            "triage_color": "#6b90b0",
            "ai_brief":     f"AI summary unavailable: {str(e)}",
            "active_alerts": 0,
            "visits_analyzed": 0,
        }

    # ── 4. Generate QR code ────────────────────────────────────
    try:
        qr_code = generate_qr(patient_id)
    except Exception as e:
        qr_code = None

    # ── 5. Return full emergency brief ─────────────────────────
    return {
        # Basic patient info (your original fields)
        "name":               patient.name,
        "age":                patient.age,
        "blood_type":         patient.blood_type,
        "allergies":          patient.allergies,
        "conditions":         patient.conditions,
        "emergency_contact":  patient.emergency_contact,
        "current_medications": current_medications,

        # AI triage fields
        "triage_level":    ai_summary.get("triage_level", "UNKNOWN"),
        "triage_color":    ai_summary.get("triage_color", "#6b90b0"),
        "ai_brief":        ai_summary.get("ai_brief", ""),
        "active_alerts":   ai_summary.get("active_alerts", 0),
        "visits_analyzed": ai_summary.get("visits_analyzed", 0),
        "generated_at":    ai_summary.get("generated_at", ""),

        # QR code (base64 PNG — use in <img src="data:image/png;base64,...">)
        "qr_code": qr_code,
    }