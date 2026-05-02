from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RepaySignal API",
    description="AI-powered education loan repayment risk scoring engine",
    version="1.0.0",
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "RepaySignal API running", "version": "1.0.0"}


# Router imports — will be populated in Phase 4
# from backend.routers import students, risk, portfolio, interventions, alerts, llm
# app.include_router(students.router, prefix="/students", tags=["students"])
# app.include_router(risk.router, prefix="/risk", tags=["risk"])
# app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
# app.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
# app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
# app.include_router(llm.router, prefix="/llm", tags=["llm"])
