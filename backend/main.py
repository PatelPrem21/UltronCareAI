from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from models import Patient, User, Doctor, Visit, Prescription, LabReport, Appointment, Notification, AIAlert
from routers import auth, patients, doctors, visit, prescription, lab_report, appointment, notification, emergency
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from utils.adherence_agent import check_adherence
from datetime import datetime

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db([Patient, User, Doctor, Visit,
                       Prescription, LabReport, Appointment,
                       Notification, AIAlert])
        print("[OK] MongoDB connected successfully")

        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            check_adherence,
            trigger=IntervalTrigger(hours=1),
            id="adherence_check",
            replace_existing=True,
            misfire_grace_time=3600  # Allow 1 hour grace time
        )
        scheduler.start()
        print("[OK] Adherence agent started")

        import asyncio
        asyncio.ensure_future(check_adherence())

    except Exception as e:
        print(f"[ERROR] Startup failed: {e}")
        raise e

    yield

    scheduler.shutdown()
    print("[STOP] Server shutting down")

app = FastAPI(
    title="UltronCare.Ai API",
    description="AI-powered Healthcare Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(visit.router)
app.include_router(prescription.router)
app.include_router(lab_report.router)
app.include_router(appointment.router)
app.include_router(notification.router)
app.include_router(emergency.router)

@app.get("/")
async def root():
    return {"message": "UltronCare.Ai API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "api": "UltronCare.Ai"}