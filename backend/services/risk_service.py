import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.student import Student, Institute
from backend.models.risk import RiskScore
from backend.services.ml_client import predict_risk, build_student_features


def get_risk_tier(score: float) -> str:
    if score >= 0.70: return "HIGH"
    if score >= 0.40: return "MEDIUM"
    return "LOW"


def get_stress_label(index: float) -> str:
    if index < 0.35: return "LOW"
    if index < 0.50: return "MODERATE"
    if index < 0.70: return "HIGH"
    return "CRITICAL"


async def score_student(student_id: str, db: Session) -> dict:
    """
    1. Load student + institute from DB
    2. Build feature dict
    3. Call Flask ML server
    4. Cache result in risk_scores table
    5. Return shaped response to API router
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    institute = db.query(Institute).filter(Institute.id == student.institute_id).first()
    features = build_student_features(student, institute)

    ml_result = await predict_risk(features)

    risk_score = float(ml_result["risk_score"])
    ci_lower = float(ml_result["ci_lower"])
    ci_upper = float(ml_result["ci_upper"])
    ci_width = float(ml_result.get("ci_width", ci_upper - ci_lower))
    stress_index = float(ml_result.get("repayment_stress_index", 0.5))
    bias_flags = ml_result.get("bias_flags", [])
    needs_review = ci_width > 0.30 or len(bias_flags) > 0

    result = {
        "student_id": student_id,
        "risk_score": risk_score,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "ci_width": ci_width,
        "p_3mo": float(ml_result.get("p_3mo", 0.3)),
        "p_6mo": float(ml_result.get("p_6mo", 0.5)),
        "p_12mo": float(ml_result.get("p_12mo", 0.7)),
        "predicted_salary_lower": float(ml_result.get("predicted_salary_lower", 400000)),
        "predicted_salary_upper": float(ml_result.get("predicted_salary_upper", 700000)),
        "repayment_stress_index": stress_index,
        "repayment_stress_label": get_stress_label(stress_index),
        "shap_drivers": ml_result.get("shap_drivers", []),
        "bias_flags": bias_flags,
        "data_trust_weight": float(institute.data_trust_score if institute else 0.5),
        "course_family": ml_result.get("course_family", student.course_family),
        "regulatory_note": ml_result.get("regulatory_note"),
        "needs_human_review": needs_review,
        "scored_at": datetime.utcnow().isoformat(),
    }

    # Upsert into risk_scores table (cache the latest score)
    existing = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    db_fields = {k: v for k, v in result.items()
                 if k not in ("student_id", "repayment_stress_label", "scored_at")}
    if existing:
        for k, v in db_fields.items():
            setattr(existing, k, v)
    else:
        db.add(RiskScore(id=uuid.uuid4(), student_id=student_id, **db_fields))
    try:
        db.commit()
    except Exception:
        db.rollback()

    return result