from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel
from models.lab_report import LabReport
from models.patient import Patient
from models.doctor import Doctor
from utils.auth import get_current_user

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports"])

class LabReportUploadRequest(BaseModel):
    patient_id: str
    doctor_id: str
    visit_id: str
    report_name: str
    pdf_url: str

@router.post("/upload")
async def upload_lab_report(data: LabReportUploadRequest, current_user: dict = Depends(get_current_user)):
    patient = await Patient.find_one(Patient.custom_id == data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    doctor = await Doctor.find_one(Doctor.custom_id == data.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    count = await LabReport.count()
    custom_id = f"LAB-{str(count + 1).zfill(4)}"

    lab_report = LabReport(
        custom_id=custom_id,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        visit_id=data.visit_id,
        report_name=data.report_name,
        pdf_url=data.pdf_url
    )
    await lab_report.insert()

    return {
        "message": "Lab report uploaded successfully",
        "lab_report_id": custom_id
    }

@router.get("/patient/{patient_id}")
async def get_patient_lab_reports(patient_id: str, current_user: dict = Depends(get_current_user)):
    reports = await LabReport.find(LabReport.patient_id == patient_id).to_list()
    if not reports:
        raise HTTPException(status_code=404, detail="No lab reports found for this patient")
    return reports

@router.get("/{id}")
async def get_lab_report(id: str, current_user: dict = Depends(get_current_user)):
    report = await LabReport.find_one(LabReport.custom_id == id)
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    return report
