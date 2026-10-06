from fastapi import FastAPI
from pydantic import BaseModel, Field
import math

app = FastAPI(title="WAITLESS AI Prediction Service", version="0.1.0")

class PredictRequest(BaseModel):
    locationId: str
    peopleAhead: int = Field(ge=0)
    serviceRatePerHour: float = Field(gt=0)
    minutesOpen: int = Field(ge=0)
    dayOfWeek: int = Field(ge=0, le=6)
    hour: int = Field(ge=0, le=23)
    appointments: int = Field(ge=0)

class PredictResponse(BaseModel):
    waitMinutes: float
    crowdLevel: str
    trend: str
    recommendation: str
    confidence: float

def predict_wait(r: PredictRequest) -> float:
    # MVP prediction engine. Replace with trained XGBoost/time-series model
    # once real queue observations are collected.
    capacity_per_min = r.serviceRatePerHour / 60.0
    base = r.peopleAhead / max(capacity_per_min, 0.01)
    appointment_pressure = min(r.appointments * 0.12, 18)
    peak_factor = 1.18 if r.hour in {10,11,12,13} else (0.88 if r.hour in {15,16,17} else 1.0)
    weekday_factor = 1.08 if r.dayOfWeek in {0,5} else 1.0
    return round(max(5, base * peak_factor * weekday_factor + appointment_pressure), 1)

@app.get("/health")
def health(): return {"status": "ok", "service": "waitless-ml"}

@app.post("/predict", response_model=PredictResponse)
def predict(r: PredictRequest):
    wait = predict_wait(r)
    crowd = "Low" if wait < 30 else "Medium" if wait < 75 else "High"
    trend = "Increasing" if r.hour in {10,11,12,13} else "Decreasing" if r.hour in {15,16,17} else "Stable"
    if wait >= 100:
        rec = "Avoid going now. Check again later; current queue is expected to take over 100 minutes."
    elif wait >= 60:
        rec = "If possible, delay your visit. A later off-peak slot is likely to have a shorter wait."
    else:
        rec = "Good time to go. Current estimated wait is relatively low."
    confidence = round(max(0.62, min(0.94, 0.94 - abs(wait - 55) / 400)), 2)
    return PredictResponse(waitMinutes=wait, crowdLevel=crowd, trend=trend, recommendation=rec, confidence=confidence)
