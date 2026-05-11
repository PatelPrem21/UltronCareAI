import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

async def init_db(document_models: list):
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    database = client[os.getenv("DB_NAME", "ultroncareDB")]
    await init_beanie(
        database=database,
        document_models=document_models
    )