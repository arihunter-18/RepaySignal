from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database import get_db
from backend.models.student import Student, Institute
from backend.services.ml_client import predict_interventions, build_student_features

router = APIRouter()


@router.get("/{student_id}")
async def get_interventions(student_id: str, db: Session = Depends(get_db)):
    
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    institute = db.query(Institute).filter(Institute.id == student.institute_id).first()

    features = build_student_features(student, institute)
    ml_result = await predict_interventions(features)

    return {
        "student_id": student_id,
        "generated_at": datetime.utcnow().isoformat(),
        "lift_note": "Lift estimates are research-calibrated priors. They update as real outcomes accumulate.",
        "interventions": ml_result.get("interventions", []),
    }