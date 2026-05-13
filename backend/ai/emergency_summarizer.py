"""
Emergency AI Summarizer
━━━━━━━━━━━━━━━━━━━━━━━
Called by GET /emergency/{patient_id} (public route — no auth).
Fetches full patient record + last 3 visits → sends to Gemini Flash
→ returns structured triage brief in under 3 seconds.
"""

import os
from groq import Groq
from datetime import datetime
from models.patient import Patient
from models.visit import Visit
from models.ai_alert import AIAlert

# ── Configure Gemini ───────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _format_vitals(vitals) -> str:
    if not vitals:
        return "No vitals recorded"
    parts = []
    if vitals.blood_pressure: parts.append(f"BP: {vitals.blood_pressure}")
    if vitals.heart_rate:     parts.append(f"HR: {vitals.heart_rate} bpm")
    if vitals.temperature:    parts.append(f"Temp: {vitals.temperature}°F")
    if vitals.oxygen_level:   parts.append(f"SpO₂: {vitals.oxygen_level}%")
    if vitals.weight:         parts.append(f"Weight: {vitals.weight} kg")
    return " | ".join(parts) if parts else "No vitals recorded"


def _build_prompt(patient: Patient, visits: list, alerts: list) -> str:
    visits_text = ""
    for i, v in enumerate(visits, 1):
        visits_text += f"""
  Visit {i} ({v.created_at.strftime('%Y-%m-%d')}):
    Vitals    : {_format_vitals(v.vitals)}
    Diagnosis : {v.diagnosis or 'N/A'}
    Notes     : {v.notes or 'N/A'}
"""

    alerts_text = "\n".join(
        f"  [{a.severity.upper()}] {a.module}: {a.message}"
        for a in alerts
    ) or "  None"

    return f"""
You are an emergency medical AI assistant. A paramedic or ER doctor is reading this.
Generate a concise, structured triage brief for immediate use.

PATIENT RECORD:
  Name             : {patient.name}
  Age              : {patient.age}
  Blood Type       : {patient.blood_type}
  Allergies        : {', '.join(patient.allergies) if patient.allergies else 'None known'}
  Known Conditions : {', '.join(patient.conditions) if patient.conditions else 'None'}
  Emergency Contact: {patient.emergency_contact or 'Not provided'}

RECENT VISITS (last 3):
{visits_text}

ACTIVE AI ALERTS:
{alerts_text}

OUTPUT FORMAT (strictly follow this — use plain text, no markdown):
TRIAGE LEVEL: [GREEN / YELLOW / ORANGE / RED]
CRITICAL INFO: [1 sentence — most important thing for the ER doctor to know right now]
KNOWN ALLERGIES: [list or NONE]
ACTIVE CONDITIONS: [list or NONE]
CURRENT MEDICATIONS: [if known from visits, else UNKNOWN]
RECENT VITALS: [latest vitals summary]
AI RISK FLAGS: [any deterioration or drug alerts — summarized]
IMMEDIATE ACTION: [what should happen in the next 10 minutes]
EMERGENCY CONTACT: [{patient.emergency_contact or 'Not provided'}]

Be direct. Lives depend on speed. No filler words.
""".strip()


async def generate_emergency_summary(patient_id: str) -> dict:
    """
    Main entry point.
    Returns a dict with patient info + AI triage brief.
    """

    # ── 1. Fetch patient ───────────────────────────────────────
    patient = await Patient.find_one(Patient.custom_id == patient_id)
    if not patient:
        # Try by user_id as fallback
        patient = await Patient.find_one(Patient.user_id == patient_id)
    if not patient:
        return {"error": "Patient not found"}

    # ── 2. Fetch last 3 visits ─────────────────────────────────
    visits = (
        await Visit.find(Visit.patient_id == patient_id)
        .sort("-created_at")
        .limit(3)
        .to_list()
    )

    # ── 3. Fetch active AI alerts ──────────────────────────────
    alerts = (
        await AIAlert.find(
            AIAlert.patient_id == patient_id,
            AIAlert.resolved == False,
        )
        .sort("-created_at")
        .limit(10)
        .to_list()
    )

    # ── 4. Build prompt & call Gemini ──────────────────────────
    prompt = _build_prompt(patient, visits, alerts)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_brief = response.choices[0].message.content.strip()
    except Exception as e:
        ai_brief = f"AI summary unavailable: {str(e)}"

    # ── 5. Parse triage level from response ───────────────────
    triage_level = "UNKNOWN"
    for level in ["RED", "ORANGE", "YELLOW", "GREEN"]:
        if level in ai_brief:
            triage_level = level
            break

    triage_colors = {
        "RED":     "#ff4466",
        "ORANGE":  "#ff8c42",
        "YELLOW":  "#ffd700",
        "GREEN":   "#00e5a0",
        "UNKNOWN": "#6b90b0",
    }

    return {
        "patient": {
            "name":              patient.name,
            "age":               patient.age,
            "blood_type":        patient.blood_type,
            "allergies":         patient.allergies,
            "conditions":        patient.conditions,
            "emergency_contact": patient.emergency_contact,
            "custom_id":         patient.custom_id,
        },
        "triage_level":  triage_level,
        "triage_color":  triage_colors.get(triage_level, "#6b90b0"),
        "ai_brief":      ai_brief,
        "active_alerts": len(alerts),
        "generated_at":  datetime.utcnow().isoformat(),
        "visits_analyzed": len(visits),
    }
