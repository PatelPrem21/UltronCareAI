from datetime import datetime, timedelta
from models.visit import Visit
from models.ai_alert import AIAlert
from models.notification import Notification
from models.patient import Patient


async def check_adherence():
    """
    Runs every hour.
    Finds patients with overdue follow-up dates.
    Creates alerts and notifications automatically.
    """
    print(f"🔍 Adherence check running at {datetime.utcnow()}")

    try:
        all_visits = await Visit.find(
            Visit.follow_up_date != None
        ).to_list()

        now = datetime.utcnow()
        overdue_threshold = timedelta(days=3)

        for visit in all_visits:
            if visit.follow_up_date and (now - visit.follow_up_date) > overdue_threshold:

                existing_alert = await AIAlert.find_one(
                    AIAlert.patient_id == visit.patient_id,
                    AIAlert.module == "adherence",
                    AIAlert.resolved == False
                )

                if existing_alert:
                    continue

                days_overdue = (now - visit.follow_up_date).days

                alert_count = await AIAlert.count()
                alert_id = f"ALERT-{str(alert_count + 1).zfill(4)}"

                alert = AIAlert(
                    custom_id=alert_id,
                    patient_id=visit.patient_id,
                    module="adherence",
                    severity="medium" if days_overdue < 7 else "high",
                    message=f"Patient {visit.patient_id} missed follow-up scheduled on {visit.follow_up_date.strftime('%d %b %Y')}. {days_overdue} days overdue."
                )
                await alert.insert()

                patient = await Patient.find_one(
                    Patient.custom_id == visit.patient_id
                )

                if patient:
                    notif_count = await Notification.count()
                    notif_id = f"NOTIF-{str(notif_count + 1).zfill(4)}"

                    doctor_notif = Notification(
                        custom_id=notif_id,
                        user_id=visit.doctor_id,
                        type="adherence",
                        message=f"⚠️ {patient.name} missed their follow-up appointment. {days_overdue} days overdue."
                    )
                    await doctor_notif.insert()

                    notif_count2 = await Notification.count()
                    notif_id2 = f"NOTIF-{str(notif_count2 + 1).zfill(4)}"

                    patient_notif = Notification(
                        custom_id=notif_id2,
                        user_id=patient.user_id,
                        type="adherence",
                        message=f"📅 You missed your follow-up appointment scheduled on {visit.follow_up_date.strftime('%d %b %Y')}. Please contact your doctor."
                    )
                    await patient_notif.insert()

                print(f"✅ Adherence alert created for {visit.patient_id} — {days_overdue} days overdue")

    except Exception as e:
        print(f"❌ Adherence check error: {e}")