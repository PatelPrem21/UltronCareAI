import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from models.lab_report import LabReport
from models.patient import Patient
from models.doctor import Doctor
from utils.auth import get_current_user
from ai.lab_interpreter import interpret_lab_report

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports"])

UPLOAD_DIR = "uploads/lab_reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_lab_report(
    patient_id: str = Form(...),
    doctor_id: str = Form(...),
    visit_id: str = Form(...),
    report_name: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    patient = await Patient.find_one(Patient.custom_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = await Doctor.find_one(Doctor.custom_id == doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    count = await LabReport.count()
    custom_id = f"LAB-{str(count + 1).zfill(4)}"
    file_name = f"{custom_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        interpretation = await interpret_lab_report(file_path, report_name)
        ai_text = interpretation.get("summary", "")
        status = interpretation.get("overall_status", "pending")
    except Exception as e:
        interpretation = {}
        ai_text = f"Interpretation failed: {str(e)}"
        status = "pending"

    lab_report = LabReport(
        custom_id=custom_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        visit_id=visit_id,
        report_name=report_name,
        pdf_url=file_path,
        extracted_values=interpretation,
        ai_interpretation=ai_text,
        status=status,
    )
    await lab_report.insert()

    return {
        "message": "Lab report uploaded and interpreted successfully",
        "lab_report_id": custom_id,
        "overall_status": status,
        "interpretation": interpretation,
    }

@router.get("/patient/{patient_id}")
async def get_patient_lab_reports(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
):
    reports = await LabReport.find(
        LabReport.patient_id == patient_id
    ).sort("-uploaded_at").to_list()
    if not reports:
        raise HTTPException(status_code=404, detail="No lab reports found")
    return reports

@router.get("/{id}")
async def get_lab_report(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    report = await LabReport.find_one(LabReport.custom_id == id)
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    return report