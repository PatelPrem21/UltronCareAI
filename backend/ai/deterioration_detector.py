"""
Silent Deterioration Detector
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Triggered on every new visit save.
Loads last 6 visits for the patient → fits linear regression
per vital → if slope exceeds clinical threshold → saves alert.
"""

import numpy as np
from datetime import datetime
from typing import Optional
from models.visit import Visit
from models.ai_alert import AIAlert


# ── Clinical thresholds (slope per visit) ─────────────────────
THRESHOLDS = {
    "heart_rate":    {"rising": 5,   "falling": -5,   "unit": "bpm"},
    "temperature":   {"rising": 0.3, "falling": -0.3, "unit": "°F"},
    "weight":        {"rising": 1.5, "falling": -1.5, "unit": "kg"},
    "oxygen_level":  {"rising": None,"falling": -1.0, "unit": "%"},
    "systolic_bp":   {"rising": 8,   "falling": -8,   "unit": "mmHg"},
}

SEVERITY_MAP = {
    "heart_rate":   {"rising": "high",     "falling": "medium"},
    "temperature":  {"rising": "high",     "falling": "medium"},
    "weight":       {"rising": "medium",   "falling": "high"},
    "oxygen_level": {"rising": "low",      "falling": "critical"},
    "systolic_bp":  {"rising": "critical", "falling": "medium"},
}

MESSAGES = {
    "heart_rate": {
        "rising":  "⚠️ Heart rate is steadily increasing across recent visits. Possible tachycardia trend — review cardiovascular status.",
        "falling": "⚠️ Heart rate is trending downward. Possible bradycardia — monitor closely.",
    },
    "temperature": {
        "rising":  "🌡️ Body temperature shows a rising trend. Possible developing infection or inflammation.",
        "falling": "🌡️ Temperature trending low. Monitor for hypothermia or systemic illness.",
    },
    "weight": {
        "rising":  "⚖️ Gradual weight gain detected across visits. Review for fluid retention or metabolic changes.",
        "falling": "⚖️ Progressive weight loss detected. Investigate nutritional status or underlying illness.",
    },
    "oxygen_level": {
        "falling": "🫁 Oxygen saturation showing a declining trend. Risk of hypoxia — urgent respiratory review recommended.",
        "rising":  "🫁 Oxygen levels improving steadily.",
    },
    "systolic_bp": {
        "rising":  "🩺 Systolic blood pressure is rising across visits. Hypertension trend detected — medication review needed.",
        "falling": "🩺 Systolic BP trending downward. Monitor for hypotension risk.",
    },
}


def _parse_systolic(bp_str: Optional[str]) -> Optional[float]:
    """Extract systolic from '120/80' format."""
    if not bp_str:
        return None
    try:
        return float(bp_str.split("/")[0].strip())
    except Exception:
        return None


def _linear_slope(values: list[float]) -> float:
    """Fit a simple linear regression and return the slope."""
    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)
    # slope = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
    n = len(x)
    slope = (n * np.dot(x, y) - x.sum() * y.sum()) / (n * np.dot(x, x) - x.sum() ** 2 + 1e-9)
    return float(slope)


def _extract_vitals(visits: list) -> dict[str, list[float]]:
    """Pull numeric vitals from a list of Visit documents."""
    series: dict[str, list[float]] = {k: [] for k in THRESHOLDS}
    for v in visits:
        vt = v.vitals
        if not vt:
            continue
        if vt.heart_rate  is not None: series["heart_rate"].append(float(vt.heart_rate))
        if vt.temperature is not None: series["temperature"].append(float(vt.temperature))
        if vt.weight      is not None: series["weight"].append(float(vt.weight))
        if vt.oxygen_level is not None: series["oxygen_level"].append(float(vt.oxygen_level))
        sys = _parse_systolic(vt.blood_pressure)
        if sys is not None: series["systolic_bp"].append(sys)
    return series


async def _alert_exists(patient_id: str, vital: str) -> bool:
    """Avoid duplicate alerts for same patient + vital within 24 hours."""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(hours=24)
    # Fetch recent deterioration alerts for this patient
    recent_alerts = await AIAlert.find(
        AIAlert.patient_id == patient_id,
        AIAlert.module == "deterioration",
        AIAlert.resolved == False,
        AIAlert.created_at >= cutoff,
    ).to_list()
    # Check if any alert message mentions this vital
    vital_readable = vital.replace("_", " ")
    return any(vital_readable in alert.message for alert in recent_alerts)


async def run_deterioration_check(patient_id: str) -> list[dict]:
    """
    Main entry point — call this after saving a visit.

    Returns a list of alert dicts that were created.
    """
    # ── 1. Load last 6 visits sorted oldest → newest ───────────
    visits = (
        await Visit.find(Visit.patient_id == patient_id)
        .sort("+created_at")
        .limit(6)
        .to_list()
    )

    if len(visits) < 3:
        # Need at least 3 data points for a meaningful trend
        return []

    # ── 2. Extract numeric series per vital ────────────────────
    series = _extract_vitals(visits)

    alerts_created = []

    # ── 3. Run regression per vital ────────────────────────────
    for vital, values in series.items():
        if len(values) < 3:
            continue  # not enough data points for this vital

        slope = _linear_slope(values)
        thresholds = THRESHOLDS[vital]
        direction = None

        if thresholds["rising"] is not None and slope >= thresholds["rising"]:
            direction = "rising"
        elif thresholds["falling"] is not None and slope <= thresholds["falling"]:
            direction = "falling"

        if direction is None:
            continue  # trend within normal bounds

        # ── 4. Deduplicate ─────────────────────────────────────
        if await _alert_exists(patient_id, vital):
            continue

        # ── 5. Build & save alert ──────────────────────────────
        severity = SEVERITY_MAP[vital][direction]
        message  = MESSAGES[vital][direction]

        alert = AIAlert(
            patient_id = patient_id,
            module     = "deterioration",
            severity   = severity,
            message    = f"{message} (slope: {slope:+.2f} {THRESHOLDS[vital]['unit']}/visit)",
        )
        await alert.insert()

        alerts_created.append({
            "vital":     vital,
            "direction": direction,
            "slope":     round(slope, 3),
            "severity":  severity,
            "message":   message,
        })

    return alerts_created