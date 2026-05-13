"""
QR Code Generator
━━━━━━━━━━━━━━━━━
Generates a QR code PNG (base64) linking to the
public emergency page for a given patient.

Usage:
    qr_b64 = generate_qr(patient_id, base_url)
    # Returns base64 string — embed directly in <img src="data:image/png;base64,...">
"""

import qrcode
import base64
from io import BytesIO


def generate_qr(patient_id: str, base_url: str = "http://localhost:5173") -> str:
    """
    Generate a QR code linking to /emergency/{patient_id}.
    Returns a base64-encoded PNG string.
    """
    url = f"{base_url}/emergency/{patient_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#00e5a0", back_color="#04080f")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return b64


def generate_qr_url(patient_id: str, base_url: str = "http://localhost:5173") -> str:
    """Returns just the emergency URL (useful for saving to DB)."""
    return f"{base_url}/emergency/{patient_id}"
