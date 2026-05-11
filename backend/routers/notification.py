from fastapi import APIRouter, HTTPException, Depends
from models.notification import Notification
from utils.auth import get_current_user
from pymongo import DESCENDING

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/{user_id}/unread-count")
async def get_unread_count(user_id: str, current_user: dict = Depends(get_current_user)):
    count = await Notification.find(
        Notification.user_id == user_id,
        Notification.read == False
    ).count()
    return {"unread_count": count}

@router.get("/{user_id}")
async def get_user_notifications(user_id: str, current_user: dict = Depends(get_current_user)):
    notifications = await Notification.find(
        Notification.user_id == user_id
    ).sort([("created_at", DESCENDING)]).to_list()
    
    if not notifications:
        raise HTTPException(status_code=404, detail="No notifications found")
    return notifications

@router.put("/{id}/read")
async def mark_notification_read(id: str, current_user: dict = Depends(get_current_user)):
    notification = await Notification.find_one(Notification.custom_id == id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.read = True
    await notification.save()
    
    return {"message": "Notification marked as read"}
