# WAITLESS AI 🚦
### Real-time Queue Intelligence Platform

WAITLESS AI helps people decide **when to visit a place** by estimating current waiting time, crowd trend and the best time to go.

## MVP flow
1. User selects a service/location.
2. Backend receives live queue/check-in observations.
3. Python AI service predicts waiting time.
4. Backend returns wait estimate + crowd trend + recommendation.
5. React dashboard visualizes the result.

## Stack
- Java 21 + Spring Boot + Maven
- Python 3.11 + FastAPI + scikit-learn
- PostgreSQL + Redis (Docker-ready)
- React + Vite
- REST APIs

## Run
```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8080
AI service: http://localhost:8000/docs

## Demo API
```bash
curl http://localhost:8080/api/v1/locations
curl -X POST http://localhost:8080/api/v1/predict \
  -H 'Content-Type: application/json' \
  -d '{"locationId":"aiims-bhopal","peopleAhead":47,"serviceRatePerHour":38,"minutesOpen":210,"dayOfWeek":2,"hour":14,"appointments":65}'
```

## Product roadmap
- Phase 1: simulated real-time queue + prediction
- Phase 2: QR check-ins and staff dashboard
- Phase 3: historical forecasting and anomaly detection
- Phase 4: nearby alternative recommendation
- Phase 5: LLM conversational layer
- Phase 6: maps, notifications and multi-city rollout
