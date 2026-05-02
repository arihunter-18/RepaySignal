import httpx
from backend.config import settings

ML_URL = settings.ML_SERVER_URL
TIMEOUT = 15.0


async def predict_risk(student_features: dict) -> dict:
    """
    Send student features to Flask ML server, get risk prediction back.
    
    Expected response from Flask:
    {
        "risk_score": 0.74,
        "ci_lower": 0.62,
        "ci_upper": 0.86,
        "ci_width": 0.24,
        "p_3mo": 0.18,
        "p_6mo": 0.42,
        "p_12mo": 0.71,
        "predicted_salary_lower": 480000,
        "predicted_salary_upper": 680000,
        "repayment_stress_index": 0.62,
        "shap_drivers": [
            {"feature": "ppo_binary", "direction": "increases_risk", "magnitude": 0.42, "display": "No PPO offer"},
            {"feature": "internship_access_score", "direction": "increases_risk", "magnitude": 0.28, "display": "No internship"},
            {"feature": "field_demand_percentile", "direction": "increases_risk", "magnitude": 0.15, "display": "Declining sector demand"}
        ],
        "bias_flags": [],
        "course_family": "campus",
        "regulatory_note": null
    }
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(f"{ML_URL}/predict", json=student_features)
        response.raise_for_status()
        return response.json()


async def predict_interventions(student_features: dict) -> dict:
    """
    Expected response from Flask:
    {
        "interventions": [
            {"name": "Mock interview coaching", "base_lift_pp": 12.0, "cost_tier": "Zero cost", "delivery": "NGO partner", "description": "..."},
            {"name": "Resume review", "base_lift_pp": 8.0, "cost_tier": "Zero cost", "delivery": "AI tool", "description": "..."},
            {"name": "Adjacent sector pivot", "base_lift_pp": 15.0, "cost_tier": "Low cost", "delivery": "Counsellor", "description": "..."}
        ]
    }
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(f"{ML_URL}/interventions", json=student_features)
        response.raise_for_status()
        return response.json()


async def predict_stress_test(field: str, shock_pct: float, portfolio_features: list[dict]) -> dict:
    """
    Expected response from Flask:
    {
        "baseline_high_risk": 6,
        "shocked_high_risk": 9,
        "new_at_risk": 3,
        "portfolio_impact_pct": 15.0,
        "most_affected_fields": ["IT_software"]
    }
    """
    payload = {
        "field": field,
        "shock_pct": shock_pct,
        "students": portfolio_features
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(f"{ML_URL}/stress-test", json=payload)
        response.raise_for_status()
        return response.json()


async def generate_risk_card(student_data: dict, risk_data: dict) -> str:
    """
    Expected response from Flask:
    {
        "risk_summary": "This Engineering student faces elevated risk primarily due to..."
    }
    """
    payload = {"student": student_data, "risk": risk_data}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(f"{ML_URL}/risk-card", json=payload)
        response.raise_for_status()
        return response.json().get("risk_summary", "Assessment unavailable.")


def build_student_features(student, institute) -> dict:
    """
    Converts DB student + institute objects into the flat feature dict
    that the Flask ML server expects. Agree this schema with the ML team.
    """
    return {
        "student_id": str(student.student_id),
        "course_type": student.course_type,
        "course_family": student.course_family,
        "cgpa": float(student.cgpa or 0),
        "internship_count": student.internship_count or 0,
        "internship_employer_tier": student.internship_employer_tier,
        "ppo_exists": student.ppo_exists,
        "cert_count": student.cert_count or 0,
        "graduation_month": student.graduation_month,
        "graduation_year": student.graduation_year,
        "target_field": student.target_field,
        "target_city_tier": student.target_city_tier,
        "loan_emi_monthly": float(student.loan_emi_monthly or 0),
        "months_since_graduation": student.months_since_graduation or 0,
        "placement_status": student.placement_status,
        "institute_tier": institute.tier if institute else "tier_2",
        "data_trust_score": float(institute.data_trust_score if institute else 0.5),
    }