# RepaySignal Backend Structure & API Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Data Models](#core-data-models)
3. [API Endpoints & Business Logic](#api-endpoints--business-logic)
4. [Backend Data Flow](#backend-data-flow)
5. [Key Business Logic Patterns](#key-business-logic-patterns)
6. [Frontend-to-Backend Call Matrix](#frontend-to-backend-call-matrix)

---

## Architecture Overview

- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Base URL**: http://localhost:8000
- **ML Pipeline**: XGBoost risk model, survival analysis (Cox PH), SHAP explainability
- **Core Purpose**: Risk scoring, portfolio analytics, intervention ranking, alert triggering
- **CORS**: Allows requests from http://localhost:5173 (frontend)

### Framework Structure
```
backend/
├── main.py                 # FastAPI app initialization
├── database.py             # SQLAlchemy session management
├── routers/                # API endpoint handlers
│   ├── students.py         # Student listing & detail
│   ├── risk.py             # Risk scoring endpoints
│   ├── portfolio.py        # Portfolio aggregation & stress test
│   ├── interventions.py    # Intervention recommendation
│   ├── alerts.py           # Alert management
│   └── auth.py             # Authentication (currently bypassed)
├── services/               # Business logic layer
│   ├── risk_service.py     # ML scoring orchestration
│   ├── portfolio_service.py# Portfolio aggregation
│   ├── trigger_service.py  # Alert triggering
│   └── llm_service.py      # LLM risk card generation
├── ml/                     # Machine learning modules
│   ├── gbm_model.py        # XGBoost models
│   ├── features.py         # Feature engineering (40+ features)
│   ├── bias_detector.py    # Fairness checks
│   ├── shap_explainer.py   # SHAP feature importance
│   ├── survival_model.py   # Cox PH models
│   ├── intervention_ranker.py # Intervention ranking
│   ├── ensemble.py         # Model ensembling
│   ├── uncertainty.py      # Confidence intervals (MAPIE)
│   ├── trust_scorer.py     # Data quality scoring
│   ├── course_router.py    # Course classification
│   └── drift_monitor.py    # Model drift detection
├── models/
│   ├── schema.py           # SQLAlchemy ORM models
│   └── [domain models]     # Business entity schemas
└── data/
    ├── demand_index_mock.py# Market demand context
    ├── intervention_catalog.py # Intervention definitions
    └── synthetic_generator.py  # Test data generation
```

---

## Core Data Models

### Student
```python
class Student(Base):
    __tablename__ = "students"
    student_id: str (UUID, PK)
    name: str
    institute_id: str (FK → Institute)
    course_type: str          # "B.Tech", "MBA", etc.
    course_family: str        # "campus", "market", "regulatory"
    cgpa: float
    internship_count: int
    internship_employer_tier: str  # "tier_1", "tier_2", "tier_3", "none"
    ppo_exists: bool          # Pre-Placement Offer flag
    cert_count: int           # Certification count
    graduation_month: int
    graduation_year: int
    target_field: str         # "Software Engineering", "Data Science", etc.
    target_city_tier: int     # 1=metro, 2=tier2, 3=tier3
    loan_emi_monthly: float   # Monthly EMI obligation
    data_trust_score: float   # (0-1) Data quality confidence
    has_profile_contradiction: bool
    is_scarred: bool          # Previous default history
    months_since_graduation: int
    placement_status: str     # "placed", "searching"
    tenth_board_score: float
    twelfth_board_score: float
```

### RiskScore (ML Output - Cached)
```python
class RiskScore(Base):
    __tablename__ = "risk_scores"
    id: str (UUID, PK)
    student_id: str
    
    # Core Risk Metrics
    risk_score: float              # (0-1) Probability of default
    ci_lower: float                # 80% confidence interval lower bound
    ci_upper: float                # 80% confidence interval upper bound
    ci_width: float                # Width of confidence interval
    
    # Survival Probabilities (Cox PH)
    p_3mo: float                   # Probability of staying enrolled at 3mo
    p_6mo: float                   # Probability of staying enrolled at 6mo
    p_12mo: float                  # Probability of staying enrolled at 12mo
    
    # Salary Prediction
    predicted_salary_lower: float  # 25th percentile predicted salary
    predicted_salary_upper: float  # 75th percentile predicted salary
    
    # Repayment Stress
    repayment_stress_index: float  # (0-1) EMI / predicted_salary ratio
    
    # Explainability
    shap_drivers: JSON             # [{feature, value}, ...] top 5 SHAP values
    bias_flags: JSON               # [{flag, severity}, ...] fairness warnings
    
    # Data Quality & Governance
    data_trust_weight: float       # (0-1) Data quality confidence
    course_family: str
    regulatory_note: str           # Compliance notes
    needs_human_review: bool
    xai_card_text: str             # Pre-generated LLM narrative
    
    scored_at: datetime
```

### AlertState (State Machine)
```python
class AlertState(Base):
    __tablename__ = "alert_states"
    id: str (UUID, PK)
    student_id: str
    trigger_id: str                # "T001", "T004", etc.
    trigger_name: str              # "90-day no placement"
    state: str                     # monitoring → triggered → actioned → resolved
    severity: str                  # "high", "medium", "low"
    priority_score: float          # (0-1) for sorting
    assignee: str                  # "Relationship Manager"
    deadline: date
    action_taken: str              # Description of action taken
    updated_at: datetime
```

### Institute
```python
class Institute(Base):
    __tablename__ = "institutes"
    institute_id: str (UUID, PK)
    name: str
    tier: str                      # "tier_1", "tier_2", "tier_3"
    data_trust_score: float        # (0-1) Data quality of this institute
```

### DemandIndex (Market Context)
```python
class DemandIndex(Base):
    __tablename__ = "demand_index"
    id: int (PK)
    field: str                     # "Software Engineering", "Data Science"
    city_tier: int                 # 1=metro, 2=tier2, 3=tier3
    month: date
    demand_percentile: float       # (0-100) Market demand strength
    mom_delta: float               # Month-over-month % change
    adjacent_sectors: JSON         # Related fields
```

### ModelRegistry (Version Control)
```python
class ModelRegistry(Base):
    __tablename__ = "model_registry"
    id: int (PK)
    retrained_at: datetime
    n_new_labels: int              # New labels used in retraining
    survival_weight: float         # Weight of survival models
    cohort_weight: float           # Weight of cohort features
    demand_weight: float           # Weight of demand features
    meta_learner_r2: float         # Ensemble R² score
```

---

## API Endpoints & Business Logic

### 1. STUDENTS ENDPOINTS
**Base URL**: `/students`

#### GET `/students` - List Students
**Purpose**: Admin portfolio view - fetch all students with risk summaries

**Query Parameters**:
```
course_family (optional): "campus", "market", "regulatory"
risk_tier (optional): "HIGH", "MEDIUM", "LOW"
limit (optional): 1-200, default=50
```

**Business Logic**:
1. Query all Students from DB
2. Apply `course_family` filter if provided
3. Fetch all RiskScores & Institutes (for joins)
4. Calculate risk_tier from risk_score:
   - HIGH: score ≥ 0.75
   - MEDIUM: 0.55 ≤ score < 0.75
   - LOW: score < 0.55
5. Apply `risk_tier` filter if provided
6. Limit and return paginated list

**Response Example**:
```json
[
  {
    "student_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "course_type": "B.Tech",
    "course_family": "campus",
    "target_field": "Software Engineering",
    "risk_score": 0.623,
    "risk_tier": "MEDIUM",
    "months_since_graduation": 6,
    "placement_status": "placed",
    "institute_tier": "tier_1"
  }
]
```

---

#### GET `/students/{student_id}` - Get Student Detail
**Purpose**: Fetch detailed student profile for admin or student view

**Path Parameters**:
```
student_id: UUID
```

**Business Logic**:
1. Query Student by `student_id`
2. Query Institute by `student.institute_id`
3. Return full student profile with institute tier & data_trust_score

**Response Example**:
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "course_type": "B.Tech",
  "course_family": "campus",
  "target_field": "Software Engineering",
  "cgpa": 7.5,
  "internship_employer_tier": "tier_1",
  "ppo_exists": true,
  "cert_count": 3,
  "target_city_tier": 1,
  "loan_emi_monthly": 15000.0,
  "months_since_graduation": 6,
  "placement_status": "placed",
  "institute_tier": "tier_1",
  "data_trust_score": 0.85
}
```

---

### 2. RISK ENDPOINTS
**Base URL**: `/risk`

#### GET `/risk/{student_id}` - Calculate Risk (Real-time)
**Purpose**: Run full ML pipeline for real-time risk scoring

**Path Parameters**:
```
student_id: UUID
```

**Business Logic** (`score_student()` function):
1. Fetch Student from DB → validate exists
2. Fetch Institute for `data_trust_score`
3. Query latest DemandIndex for student's `target_field` & `city_tier`
4. Build cohort DataFrame: students with same institute/course_type/graduation_year
5. Call `build_feature_vector()` → generates 40+ features:
   - CGPA percentile (within cohort)
   - Internship access score (based on employer tier)
   - PPO binary indicator
   - Certificate count (normalized)
   - Placement gap (months_since_graduation)
   - Target city tier
   - Market demand percentile
   - Month-over-month demand delta
   - Institute tier
   - Data trust score
   - Adjacent sector opportunities
   - [and 28 more...]
6. Load pre-trained XGBoost risk model → predict probability of default
7. Load MAPIE quantile model → compute 80% confidence interval
8. Load Cox PH survival models (3 types: campus/market/regulatory) → compute p_3mo, p_6mo, p_12mo
9. Load XGBoost salary model → predict salary range (lower/upper quantiles)
10. Compute `repayment_stress_index` = (loan_emi_monthly / predicted_salary_median)
11. Generate SHAP values → top 5 feature drivers
12. Run `check_single_student_bias()` → flag fairness concerns (gender, caste, religion imbalance in cohort)
13. Cache result in RiskScore table
14. Return full risk card with all metrics

**Response Example**:
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "risk_score": 0.623,
  "ci_lower": 0.565,
  "ci_upper": 0.681,
  "ci_width": 0.116,
  "p_3mo": 0.95,
  "p_6mo": 0.87,
  "p_12mo": 0.72,
  "predicted_salary_lower": 350000.0,
  "predicted_salary_upper": 500000.0,
  "repayment_stress_index": 0.45,
  "repayment_stress_label": "MODERATE",
  "shap_drivers": [
    {
      "feature": "cgpa_percentile",
      "value": 0.085
    },
    {
      "feature": "months_since_graduation",
      "value": -0.062
    },
    {
      "feature": "internship_access_score",
      "value": 0.048
    },
    {
      "feature": "demand_percentile",
      "value": 0.035
    },
    {
      "feature": "ppo_binary",
      "value": 0.028
    }
  ],
  "bias_flags": [
    {
      "flag": "gender_imbalance_in_cohort",
      "severity": "low"
    }
  ],
  "data_trust_weight": 0.85,
  "course_family": "campus",
  "regulatory_note": "Scored under ECOA guidelines with paraplege consideration",
  "needs_human_review": false,
  "scored_at": "2026-05-04T10:30:00"
}
```

---

#### GET `/risk/{student_id}/cached` - Get Cached Risk (No ML Re-run)
**Purpose**: Return last cached risk score without re-running ML pipeline (faster)

**Path Parameters**:
```
student_id: UUID
```

**Business Logic**:
1. Query RiskScore table for `student_id`
2. If exists, return cached values directly (no ML computation)
3. If not exists, call `score_student()` to compute and cache

**Response**: Same format as `/risk/{student_id}`

---

#### POST `/risk/card` - Generate Risk Narrative
**Purpose**: Generate human-readable LLM narrative explaining risk in plain language

**Request Body**:
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Business Logic**:
1. Query Student, Institute, RiskScore by `student_id`
2. If `RiskScore.xai_card_text` exists in DB, return cached narrative
3. Otherwise:
   - Call `generate_risk_card(student, risk_data, institute_name)` → LLM generates narrative
   - Save narrative to `RiskScore.xai_card_text`
   - Commit to DB
4. Return narrative + generation timestamp

**Response Example**:
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "risk_summary": "John is a tier-1 institute graduate with strong CGPA (75th percentile) and secure placement at an IT firm. His repayment stress is moderate (45% EMI-to-salary ratio), and survival probability remains high through 6-month horizon (87%). Market demand for software engineering remains strong (85th percentile). Key upside: secured PPO. Monitor if job market weakens or if he transitions out of IT.",
  "generated_at": "2026-05-04T10:31:00"
}
```

---

### 3. PORTFOLIO ENDPOINTS
**Base URL**: `/portfolio`

#### GET `/portfolio` - Admin Dashboard Summary
**Purpose**: Fetch portfolio-level aggregated metrics & alerts for dashboard

**No Query Parameters**

**Business Logic**:
1. Fetch all Students from DB
2. Fetch all RiskScores from DB
3. Count students by risk tier:
   - HIGH: risk_score ≥ 0.75
   - MEDIUM: 0.55 ≤ risk_score < 0.75
   - LOW: risk_score < 0.55
4. Group by `target_field` → calculate avg_risk per field
5. Sort fields by risk (descending) → return as sector_exposure
6. Compute portfolio `avg_risk_score` = mean(all_risk_scores)
7. Query 5 most recent triggered alerts:
   - Join with Student table to get student name & course_type
   - Format with trigger_name, severity, deadline, state
8. Query latest ModelRegistry entry → return model metadata (retraining info, weights)
9. Return aggregated portfolio summary

**Response Example**:
```json
{
  "total_students": 250,
  "high_risk_count": 42,
  "medium_risk_count": 98,
  "low_risk_count": 110,
  "avg_risk_score": 0.512,
  "sector_exposure": [
    {
      "field": "Software Engineering",
      "student_count": 65,
      "avg_risk": 0.485,
      "demand_percentile": 85.0
    },
    {
      "field": "Data Science",
      "student_count": 42,
      "avg_risk": 0.605,
      "demand_percentile": 72.0
    },
    {
      "field": "Finance",
      "student_count": 38,
      "avg_risk": 0.538,
      "demand_percentile": 68.0
    }
  ],
  "recent_alerts": [
    {
      "id": "alert-uuid-1",
      "student_id": "550e8400-e29b-41d4-a716-446655440000",
      "student_name": "John Doe",
      "trigger_name": "90-day no placement",
      "severity": "high",
      "deadline": "2026-05-11",
      "state": "triggered"
    },
    {
      "id": "alert-uuid-2",
      "student_id": "660e8400-e29b-41d4-a716-446655440001",
      "student_name": "Jane Smith",
      "trigger_name": "No internship and no PPO",
      "severity": "high",
      "deadline": "2026-05-09",
      "state": "triggered"
    }
  ],
  "model_version": {
    "id": 12,
    "retrained_at": "2026-05-01T08:00:00",
    "n_new_labels": 47,
    "survival_weight": 0.4,
    "cohort_weight": 0.35,
    "demand_weight": 0.25,
    "meta_learner_r2": 0.723
  }
}
```

---

#### POST `/stress-test` - Scenario Analysis
**Purpose**: Simulate portfolio impact if a field's market demand drops

**Request Body**:
```json
{
  "field": "Software Engineering",
  "shock_pct": -20.5
}
```

**Business Logic** (`run_stress_test()` function):
1. Parse `shock_pct` (e.g., -20.5 = demand drops 20.5%)
2. Fetch all students with `target_field` matching request
3. For each affected student:
   - Modify demand_percentile by `shock_pct`
   - Rebuild feature vector with stressed demand
   - Re-score using XGBoost risk model
4. Recalculate portfolio metrics with new scores
5. Compare baseline vs stressed:
   - Calculate avg_risk delta
   - Count new HIGH_RISK students
   - Track affected_student_count
6. Return delta metrics (changes, not absolute values)

**Response Example**:
```json
{
  "scenario": "Software Engineering demand -20%",
  "baseline_metrics": {
    "avg_risk": 0.512,
    "high_risk_count": 42
  },
  "stressed_metrics": {
    "avg_risk": 0.548,
    "high_risk_count": 67
  },
  "delta": {
    "avg_risk_delta": 0.036,
    "high_risk_added": 25,
    "affected_students": 65
  }
}
```

---

### 4. INTERVENTIONS ENDPOINTS
**Base URL**: `/interventions`

#### GET `/interventions/{student_id}` - Get Personalized Interventions
**Purpose**: Recommend top-3 interventions tailored to student's risk profile

**Path Parameters**:
```
student_id: UUID
```

**Business Logic**:
1. Fetch Student, Institute, RiskScore by `student_id`
2. Get latest DemandIndex for student's `target_field` & `city_tier`
3. Call `build_feature_vector()` → generates 40+ features
4. Call `rank_interventions(features, risk_data, top_n=3)`:
   - Load INTERVENTION_CATALOG (pre-defined interventions with base lift estimates)
   - For each intervention, compute **contextual modifier**:
     - **No internship**: If `internship_access_score < 0.3` → boost "internship prep" (modifier = 1.3-1.5)
     - **Low CGPA**: If `cgpa_percentile < 0.35` → boost "CGPA improvement" (modifier = 1.4)
     - **Has PPO**: If `ppo_binary == 1` → reduce placement interventions (modifier = 0.6)
     - **High stress_index**: If `stress_index > 0.6` → boost "financial planning" (modifier = 1.6)
     - **Tier-3 institute**: If `data_trust_weight < 0.4` → boost "networking" (modifier = 1.5)
     - **Tier-1 institute**: If `data_trust_weight > 0.8` → reduce "networking" (modifier = 0.7)
     - **Demand declining**: If `mom_delta < -5%` → boost related interventions (modifier = 1.2)
     - **Low cert count**: If `cert_count_norm < 0.2` → boost "credential building" (modifier = 1.4)
   - Score each intervention = `base_lift × modifier × urgency_bonus`
   - Sort descending by score
   - Return top 3
5. Return interventions with metadata

**Intervention Catalog Structure**:
```python
INTERVENTION_CATALOG = [
  {
    "id": "I001",
    "name": "Internship Opportunity - Tier 1 Employer",
    "category": "career-advancement",
    "description": "Connect with top-tier firms for 6-month internship to boost employment prospects",
    "base_lift": 0.18,  # Reduces risk by 18 percentage points
    "implementation_time_weeks": 8,
    "cost": "free",
    "lift_modifiers": {
      "no_internship": 1.5,
      "has_ppo": 0.4,
      "tier_1_institute": 0.9
    }
  },
  {
    "id": "I003",
    "name": "Financial Planning Workshop",
    "category": "financial-literacy",
    "base_lift": 0.082,
    "lift_modifiers": {
      "high_stress_index": 1.6
    }
  }
]
```

**Response Example**:
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "generated_at": "2026-05-04T10:32:00",
  "lift_note": "Lift estimates are research-calibrated priors. They update as real outcomes accumulate.",
  "interventions": [
    {
      "id": "I001",
      "name": "Internship Opportunity - Tier 1 Employer",
      "category": "career-advancement",
      "description": "Connect with top-tier firms for 6-month internship to boost employment prospects",
      "predicted_lift": 0.185,
      "implementation_time_weeks": 8,
      "cost": "free",
      "eligibility_note": "Open; student has no prior internship"
    },
    {
      "id": "I003",
      "name": "Financial Planning Workshop",
      "category": "financial-literacy",
      "description": "Budgeting & EMI management for secure repayment",
      "predicted_lift": 0.082,
      "implementation_time_weeks": 2,
      "cost": "free",
      "eligibility_note": "High EMI-to-salary ratio (45%); recommended"
    },
    {
      "id": "I005",
      "name": "Credential Building - Data Analytics Certificate",
      "category": "upskilling",
      "description": "Industry-recognized cert to boost market demand & salary",
      "predicted_lift": 0.156,
      "implementation_time_weeks": 12,
      "cost": "₹8,000",
      "eligibility_note": "Aligns with adjacent opportunity in data domain"
    }
  ]
}
```

---

### 5. ALERTS ENDPOINTS
**Base URL**: `/alerts`

#### GET `/alerts` - List Triggered Alerts
**Purpose**: Fetch active alerts for alert management page

**Query Parameters**:
```
state (optional): "triggered" | "actioned" | "resolved" | "monitoring"
                 default="triggered"
limit (optional): 1-100, default=20
```

**Business Logic**:
1. Query AlertState table filtered by `state`
2. Order by `updated_at` descending (newest first)
3. For each alert:
   - Join with Student table to get `student_name` & `course_type`
   - Format all fields
4. Apply pagination (`limit`)
5. Return alert list

**Response Example**:
```json
[
  {
    "id": "alert-uuid-1",
    "student_id": "550e8400-e29b-41d4-a716-446655440000",
    "student_name": "John Doe",
    "student_course": "B.Tech",
    "trigger_id": "T001",
    "trigger_name": "90-day no placement",
    "severity": "high",
    "state": "triggered",
    "assignee": "Relationship Manager",
    "deadline": "2026-05-11",
    "action_taken": null
  },
  {
    "id": "alert-uuid-2",
    "student_id": "660e8400-e29b-41d4-a716-446655440001",
    "student_name": "Jane Smith",
    "student_course": "B.Tech",
    "trigger_id": "T004",
    "trigger_name": "No internship and no PPO",
    "severity": "high",
    "state": "triggered",
    "assignee": "Relationship Manager",
    "deadline": "2026-05-09",
    "action_taken": null
  }
]
```

---

#### PATCH `/alerts/{alert_id}` - Mark Alert Actioned
**Purpose**: Update alert state to "actioned" after intervention attempted

**Path Parameters**:
```
alert_id: UUID
```

**Request Body**:
```json
{
  "action_taken": "Scheduled 1-on-1 mentoring session with career coach; referred to T-Hub for startup networking"
}
```

**Business Logic** (`resolve_alert()` function):
1. Query AlertState by `alert_id` → validate exists
2. Update `state` → "actioned"
3. Store `action_taken` description
4. Update `updated_at` timestamp
5. Commit to DB
6. Return updated alert

**Response**:
```json
{
  "id": "alert-uuid-1",
  "state": "actioned",
  "action_taken": "Scheduled 1-on-1 mentoring session with career coach; referred to T-Hub for startup networking"
}
```

---

## Automatic Alert Triggering

The backend automatically triggers alerts based on student profile changes. Alerts are generated by the **trigger_service** when students are scored.

### Defined Triggers

| Trigger ID | Trigger Name | Condition | Severity | Assignee | Deadline |
|---|---|---|---|---|---|
| **T001** | 90-day no placement | `months_since_graduation ≥ 3 AND placement_status = "searching"` | high | Relationship Manager | 7 days |
| **T004** | No internship and no PPO | `internship_employer_tier = "none" AND ppo_exists = false` | high | Relationship Manager | 5 days |

### Alert State Machine
```
monitoring (initial state)
    ↓
triggered (condition met → deadline set)
    ↓
actioned (action taken → wait for resolution)
    ↓
resolved (outcome recorded)
```

---

## Backend Data Flow

```
Frontend Request
       ↓
FastAPI Router
(students / risk / portfolio / interventions / alerts)
       ↓
Service Layer
(risk_service / portfolio_service / trigger_service / intervention_ranker)
       ↓
ML Pipeline
(XGBoost → MAPIE → Cox PH → SHAP → bias_detector)
       ↓
Feature Engineering
(build_feature_vector from student + institute + demand + cohort)
       ↓
Database
(SQLite: Students, RiskScores, AlertStates, Institutes, DemandIndex, ModelRegistry)
       ↓
Response JSON
(risk_score + interventions + alerts + portfolio_summary)
       ↓
Frontend Display
(Dashboard / StudentDetail / AlertsPage / StudentDashboard)
```

---

## Key Business Logic Patterns

### Risk Tier Classification
```python
def get_risk_tier(score: float) -> str:
    if score >= 0.75: 
        return "HIGH"
    elif score >= 0.55: 
        return "MEDIUM"
    else: 
        return "LOW"
```

### Repayment Stress Classification
```python
def get_stress_label(index: float) -> str:
    if index < 0.35: 
        return "LOW"
    elif index < 0.50: 
        return "MODERATE"
    elif index < 0.70: 
        return "HIGH"
    else: 
        return "CRITICAL"
```

### Intervention Lift Modifiers
```python
def _compute_modifier(intervention, student_features, risk_data):
    modifier = 1.0
    modifiers = intervention.get("lift_modifiers", {})
    
    # No internship modifier
    if "no_internship" in modifiers:
        if student_features.get("internship_access_score", 0) < 0.3:
            modifier *= modifiers["no_internship"]  # Usually 1.3-1.5
    
    # Low CGPA modifier
    if "low_cgpa" in modifiers:
        if student_features.get("cgpa_percentile", 0.5) < 0.35:
            modifier *= modifiers["low_cgpa"]  # Usually 1.4
    
    # Has PPO modifier (reduces lift)
    if "has_ppo" in modifiers:
        if student_features.get("ppo_binary", 0) == 1:
            modifier *= modifiers["has_ppo"]  # Usually 0.4-0.6
    
    # High stress index modifier
    if "high_stress_index" in modifiers:
        stress = risk_data.get("repayment_stress_index", 0.5)
        if stress > 0.6:
            modifier *= modifiers["high_stress_index"]  # Usually 1.5-1.6
    
    # Tier-3 institute modifier
    if "tier_3_institute" in modifiers:
        trust = student_features.get("data_trust_weight", 0.5)
        if trust < 0.4:
            modifier *= modifiers["tier_3_institute"]  # Usually 1.4-1.5
    
    # Tier-1 institute modifier (reduces lift)
    if "tier_1_institute" in modifiers:
        trust = student_features.get("data_trust_weight", 0.5)
        if trust > 0.8:
            modifier *= modifiers["tier_1_institute"]  # Usually 0.7-0.8
    
    return modifier
```

---

## Feature Engineering (40+ Features)

The feature vector built by `build_feature_vector()` includes:

### Student Profile Features
- `cgpa_percentile`: CGPA ranking within institute/course/graduation cohort (0-1)
- `internship_access_score`: Quality of internship (tier_1=0.9, tier_2=0.6, tier_3=0.3, none=0)
- `ppo_binary`: Pre-placement offer indicator (0 or 1)
- `cert_count_norm`: Certification count normalized by cohort median
- `placement_gap_months`: Months since graduation without placement

### Academic Profile
- `tenth_board_score`: 10th standard board marks
- `twelfth_board_score`: 12th standard board marks
- `graduation_year`: Year of graduation
- `course_type_encoded`: B.Tech/MBA/Other encoded

### Geographic & Market Context
- `target_city_tier`: Urban tier (1=metro, 2=tier2, 3=tier3)
- `target_field`: Career field selected
- `demand_percentile`: Market demand for target field (0-100)
- `mom_demand_delta`: Month-over-month demand change (-1 to 1)
- `adjacent_opportunity`: Opportunity in related fields

### Financial Profile
- `loan_emi_monthly`: Monthly EMI obligation
- `predicted_salary_lower`: 25th percentile salary (from model)
- `predicted_salary_upper`: 75th percentile salary (from model)
- `stress_index`: EMI / predicted_salary ratio

### Institute Context
- `institute_tier`: Tier ranking (tier_1/2/3)
- `data_trust_score`: Data quality confidence for institute

### Data Quality
- `has_profile_contradiction`: Profile inconsistencies (0/1)
- `is_scarred`: Previous default history (0/1)
- `data_trust_weight`: Overall data quality confidence (0-1)

### [28+ more features derived from above]

---

## Frontend-to-Backend Call Matrix

| Frontend Page | Frontend Call | Backend Endpoint | Purpose | Key Response Fields |
|---|---|---|---|---|
| Dashboard (Admin) | `GET /students?limit=100` | `GET /students` | Load student grid | [student_id, name, risk_score, risk_tier, placement_status] |
| Dashboard (Admin) | `GET /portfolio` | `GET /portfolio` | Load portfolio stats & alerts | [total_students, high_risk_count, avg_risk_score, sector_exposure, recent_alerts] |
| Dashboard (Admin) | `POST /stress-test` | `POST /stress-test` | Run scenario analysis | [baseline_metrics, stressed_metrics, delta] |
| StudentDetail (Admin) | `GET /students/{id}` | `GET /students/{id}` | Load student profile | [student_id, cgpa, placement_status, institute_tier] |
| StudentDetail (Admin) | `GET /risk/{id}` | `GET /risk/{id}` | Load risk metrics (real-time ML) | [risk_score, ci_lower/upper, p_3mo/6mo/12mo, shap_drivers] |
| StudentDetail (Admin) | `POST /risk/card` | `POST /risk/card` | Load risk narrative | [risk_summary, generated_at] |
| StudentDetail (Admin) | `GET /interventions/{id}` | `GET /interventions/{id}` | Load intervention recommendations | [interventions[], id, name, predicted_lift, cost] |
| StudentDashboard (Student) | `GET /risk/{student_id}` | `GET /risk/{student_id}` | Load own risk score | [risk_score, repayment_stress_index, p_12mo] |
| StudentDashboard (Student) | `POST /risk/card` | `POST /risk/card` | Load own risk narrative | [risk_summary] |
| StudentDashboard (Student) | `GET /interventions/{student_id}` | `GET /interventions/{student_id}` | Load own recommendations | [interventions[]] |
| AlertsPage (Admin) | `GET /alerts?state=triggered` | `GET /alerts` | Load active alerts | [id, student_id, student_name, trigger_name, severity, deadline] |
| AlertsPage (Admin) | `PATCH /alerts/{id}` | `PATCH /alerts/{id}` | Mark action taken | [state, action_taken] |

---

## Key Implementation Notes for Frontend Developers

### Data Types & Ranges
- **risk_score**: Float 0-1 (displayed as percentage 0-100%)
- **confidence intervals** (ci_lower/ci_upper): Float 0-1, width typically 0.05-0.15
- **survival probabilities** (p_3mo, p_6mo, p_12mo): Float 0-1 (displayed as percentage)
- **stress_index**: Float 0-1 (lower is better)
- **demand_percentile**: Float 0-100 (market strength)
- **lift estimates**: Float 0-0.5+ (displayed as percentage reduction)

### Caching & Refresh Strategy
- **Portfolio**: Refresh every 30 seconds (auto via useAlerts hook)
- **Risk scores**: Cache for 60 seconds on real-time endpoint, 120 seconds on cached endpoint
- **Student list**: Cache for 30 seconds
- **Interventions**: Cache for 5 minutes (don't change frequently)
- **Alerts**: Refetch every 30 seconds for "triggered" state, static for "actioned"

### Error Handling
- **404 Student not found**: Return graceful message "Student not found"
- **ML model unavailable**: Return confidence intervals based on cached data
- **Database connection error**: Return 500 with "Backend unavailable"

### Performance Considerations
- **Cached risk endpoint** (`GET /risk/{id}/cached`) is significantly faster for dashboards
- **Real-time risk endpoint** (`GET /risk/{id}`) runs full ML pipeline (2-5 sec)
- Consider using cached endpoint for bulk displays, real-time for detail pages
- Batch API calls where possible (React Query coalescence)

