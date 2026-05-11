from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class Notification(Document):
    custom_id: Optional[str] = None
    user_id: str
    type: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
