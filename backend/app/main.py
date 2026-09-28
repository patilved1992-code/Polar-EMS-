import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.seed_data import init_db
from .api import (
    stations,
    telemetry,
    weather,
    alerts,
    equipment,
    forecast,
    optimization,
    scenario,
    copilot,
    reports,
    settings
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema and seed synthetic data
    init_db()
    yield

app = FastAPI(
    title="POLAR-EMS API",
    description="AI-Driven Smart Energy Management System for Polar Research Stations",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(stations.router)
app.include_router(telemetry.router)
app.include_router(weather.router)
app.include_router(alerts.router)
app.include_router(equipment.router)
app.include_router(forecast.router)
app.include_router(optimization.router)
app.include_router(scenario.router)
app.include_router(copilot.router)
app.include_router(reports.router)
app.include_router(settings.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "POLAR-EMS Backend",
        "version": "1.0.0",
        "mode": "Simulation Mode (Prototype)",
        "offline_edge_ready": True
    }

@app.get("/")
def root():
    return {
        "app": "POLAR-EMS",
        "name": "AI-Driven Smart Energy Management System for Polar Research Stations",
        "docs": "/docs",
        "health": "/api/health"
    }
