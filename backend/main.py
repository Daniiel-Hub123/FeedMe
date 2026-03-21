from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import connect_db, disconnect_db
from routers import campaigns, feedback
from services.scheduler import start_scheduler, shutdown_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    start_scheduler()
    yield
    shutdown_scheduler()
    await disconnect_db()


app = FastAPI(
    title="Feedback Evaluator API",
    description="Decentralized feedback evaluation system with blockchain rewards",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])


@app.get("/")
async def root():
    return {"message": "Feedback Evaluator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
