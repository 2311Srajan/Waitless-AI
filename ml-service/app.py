from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel, Field
import math
import csv
from pathlib import Path

app = FastAPI(
    title="WAITLESS AI Prediction Service",
    version="1.1.0",
)


class PredictRequest(BaseModel):
    locationId: str
    peopleAhead: int = Field(default=0, ge=0)
    serviceRatePerHour: float = Field(default=4, gt=0)
    minutesOpen: int = Field(default=0, ge=0)
    dayOfWeek: int = Field(ge=0, le=6)
    hour: int = Field(ge=0, le=23)
    appointments: int = Field(default=0, ge=0)


class PredictResponse(BaseModel):
    waitMinutes: float
    crowdLevel: str
    trend: str
    recommendation: str
    confidence: float


def predict_wait(r: PredictRequest) -> PredictResponse:
    # Estimate queue wait from the number of people and
    # the service rate. This is a heuristic, not a trained model.
    people_wait = (r.peopleAhead / r.serviceRatePerHour) * 60

    # Approximate additional workload from appointments.
    appointment_load = min(r.appointments, 30) * 0.5

    # Expected demand multiplier for typical busy hours.
    if r.hour in (10, 11, 12, 13):
        peak_factor = 1.20
    elif r.hour in (15, 16, 17):
        peak_factor = 1.10
    else:
        peak_factor = 1.0

    # Sunday is treated as lower demand only as a default
    # assumption; actual local patterns may differ.
    weekday_factor = 0.95 if r.dayOfWeek == 0 else 1.0

    estimate = (
        people_wait + appointment_load
    ) * peak_factor * weekday_factor

    wait = round(max(1.0, estimate), 1)

    total_load = r.peopleAhead + r.appointments

    if total_load < 10:
        crowd = "Low"
    elif total_load < 25:
        crowd = "Moderate"
    else:
        crowd = "High"

    if peak_factor >= 1.2 and total_load >= 10:
        trend = "Increasing"
    elif total_load < 10:
        trend = "Low demand"
    else:
        trend = "Stable"

    if wait <= 10:
        recommendation = "Good time to go"
    elif wait <= 25:
        recommendation = "Moderate wait expected"
    else:
        recommendation = "Consider visiting later"

    # Rule-based reliability indicator, NOT calibrated ML confidence.
    confidence = 0.65
    if r.peopleAhead > 0:
        confidence += 0.08
    if r.minutesOpen >= 30:
        confidence += 0.04
    if r.locationId.strip():
        confidence += 0.03

    confidence = round(min(confidence, 0.80), 2)

    return PredictResponse(
        waitMinutes=wait,
        crowdLevel=crowd,
        trend=trend,
        recommendation=recommendation,
        confidence=confidence,
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "waitless-ai"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    result = predict_wait(request)

    log_path = Path(__file__).parent / "data" / "prediction_log.csv"
    log_path.parent.mkdir(parents=True, exist_ok=True)

    fields = [
        "timestamp", "locationId", "peopleAhead",
        "serviceRatePerHour", "minutesOpen", "dayOfWeek",
        "hour", "appointments", "predictedWaitMinutes",
    ]

    file_exists = log_path.exists() and log_path.stat().st_size > 0

    with log_path.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        if not file_exists:
            writer.writeheader()

        writer.writerow({
            "timestamp": datetime.now().astimezone().isoformat(),
            "locationId": request.locationId,
            "peopleAhead": request.peopleAhead,
            "serviceRatePerHour": request.serviceRatePerHour,
            "minutesOpen": request.minutesOpen,
            "dayOfWeek": request.dayOfWeek,
            "hour": request.hour,
            "appointments": request.appointments,
            "predictedWaitMinutes": result.waitMinutes,
        })

    return result