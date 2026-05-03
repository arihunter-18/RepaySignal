from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import students, risk, portfolio, interventions, alerts

app = FastAPI(title="RepaySignal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(portfolio.router, tags=["portfolio"])
app.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

@app.get("/")
def root():
    return {"status": "RepaySignal API running", "version": "1.0.0"}
