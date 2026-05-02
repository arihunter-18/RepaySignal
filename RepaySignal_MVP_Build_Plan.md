# RepaySignal — MVP Build Plan
## Phase-wise Implementation Strategy for Hackathon Submission

> **Goal:** A working, demoable MVP that maximises selection chances by making every
> judging criterion visible and tangible in the product — not just the pitch deck.
> Stack: Python (FastAPI) + React 18 (TypeScript) + PostgreSQL (local) + Redis (local).
> No Docker Compose. No cloud deployment required for submission.

---

## Table of Contents

1. [Selection Strategy](#1-selection-strategy)
2. [Project Directory Structure](#2-project-directory-structure)
3. [Phase 0 — Environment Setup (✅ Completed)](#phase-0--environment-setup-hour-0-1)
4. [Phase 1 — Synthetic Data Engine (✅ Completed)](#phase-1--synthetic-data-engine-hour-1-3)
5. [Phase 2 — Feature Engineering Pipeline (✅ Completed)](#phase-2--feature-engineering-pipeline-hour-3-5)
6. [Phase 3 — Core ML Models (✅ Completed)](#phase-3--core-ml-models-hour-5-9)
7. [Phase 4 — FastAPI Backend](#phase-4--fastapi-backend-hour-9-14)
8. [Phase 5 — React Frontend](#phase-5--react-frontend-hour-14-22)
9. [Phase 6 — LLM Risk Card Layer](#phase-6--llm-risk-card-layer-hour-22-25)
10. [Phase 7 — Demo Data & Polish](#phase-7--demo-data--polish-hour-25-28)
11. [Phase 8 — Submission Checklist](#phase-8--submission-checklist-hour-28-30)
12. [Prompt Library — Copy-Paste Ready](#prompt-library--copy-paste-ready)

---

## 1. Selection Strategy

### What judges see in 8 minutes

A hackathon demo has approximately 8 minutes of judge attention. The selection decision
is made in the first 90 seconds. Structure the demo in this order every time:

```
00:00 — Open the lender dashboard (portfolio heatmap visible immediately)
00:30 — Click one high-risk student → risk card appears with CI bands + LLM text
01:30 — Show the SHAP driver bars (explain why this student is high risk)
02:30 — Show 3 ranked interventions with lift percentages
03:30 — Click the Nursing student (Arun) → regulatory sub-engine fires, 5% but "not risk"
04:30 — Run the stress test slider (IT demand -30% → watch portfolio shift)
05:30 — Show the bias flag on a Tier-3 student
06:30 — Show the model registry ("trained on 247 labels, updated 2 days ago")
07:30 — Show the trigger alert case list with assignee + deadline
```

### Which features to build vs. fake

Build for real (judges will click):
- Risk score + CI bands per student
- Survival curve chart (3/6/12 month probabilities)
- SHAP driver bars with signed direction
- LLM-generated risk card text
- Ranked intervention cards
- Portfolio heatmap

Fake with pre-scripted data (judges won't click):
- Monthly retrain job (show model_registry table, claim it ran)
- Behavioral signals / job portal activity
- Real institute data (use synthetic)
- Celery beat scheduler (mock with a flag)

### Criterion-to-feature mapping

| Judging criterion | Feature that satisfies it |
|---|---|
| C1 — Accuracy of 3/6/12 month predictions | Survival curve chart per student |
| C2 — Explainability of risk drivers | SHAP bar chart + LLM risk card |
| C3 — Usefulness for lenders | Portfolio heatmap + trigger alert list |
| C4 — Scalability | Course routing demo (3 different students) |
| C5 — Impact potential | Impact numbers slide + stress test view |
| C6 — Robustness | Bias flag + data trust score display |

---

## 2. Project Directory Structure

```
repaysignal/
│
├── backend/                          # FastAPI Python backend
│   ├── main.py                       # App entry point, router registration
│   ├── config.py                     # Settings (DB URL, API keys, thresholds)
│   ├── database.py                   # SQLAlchemy engine + session
│   │
│   ├── models/                       # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── student.py                # Student, Institute tables
│   │   ├── risk.py                   # RiskScore, AlertState tables
│   │   ├── demand.py                 # DemandIndex table
│   │   ├── outcome.py                # Outcome, ModelRegistry tables
│   │   └── intervention.py          # InterventionCatalog table
│   │
│   ├── schemas/                      # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── student.py
│   │   ├── risk.py
│   │   └── intervention.py
│   │
│   ├── routers/                      # API route handlers
│   │   ├── __init__.py
│   │   ├── students.py               # GET /students, GET /students/{id}
│   │   ├── risk.py                   # GET /risk/{student_id}
│   │   ├── portfolio.py              # GET /portfolio, POST /stress-test
│   │   ├── interventions.py          # GET /interventions/{student_id}
│   │   ├── alerts.py                 # GET /alerts, PATCH /alerts/{id}
│   │   └── llm.py                    # POST /risk-card (Template-based NLG)
│   │
│   ├── ml/                           # All ML logic
│   │   ├── __init__.py
│   │   ├── features.py               # Feature engineering functions
│   │   ├── trust_scorer.py           # Institute data trust scorer
│   │   ├── course_router.py          # Campus/regulatory/market routing
│   │   ├── survival_model.py         # Cox PH training + prediction
│   │   ├── gbm_model.py              # XGBoost risk + salary models
│   │   ├── ensemble.py               # LearnedEnsemble (RidgeCV)
│   │   ├── uncertainty.py            # MAPIE conformal prediction
│   │   ├── bias_detector.py          # fairlearn DPD check
│   │   ├── drift_monitor.py          # PSI + KS test
│   │   ├── shap_explainer.py         # SHAP value extraction
│   │   └── intervention_ranker.py   # Catalog + ranking function
│   │
│   ├── data/                         # Data generation + seeding
│   │   ├── synthetic_generator.py    # Faker-based student data gen
│   │   ├── demand_index_mock.py      # Mock demand time-series
│   │   ├── seed_db.py                # Runs all seeders in order
│   │   └── intervention_catalog.py  # Static catalog definition
│   │
│   ├── services/                     # Business logic layer
│   │   ├── __init__.py
│   │   ├── risk_service.py           # Orchestrates scoring pipeline
│   │   ├── trigger_service.py        # Alert state machine
│   │   ├── llm_service.py            # Claude API integration
│   │   └── portfolio_service.py      # Portfolio aggregation + stress test
│   │
│   └── requirements.txt
│
├── frontend/                         # React 18 + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   │
│   ├── src/
│   │   ├── main.tsx                  # App entry point
│   │   ├── App.tsx                   # Router + layout
│   │   │
│   │   ├── api/                      # Axios API client
│   │   │   ├── client.ts             # Base axios instance
│   │   │   ├── students.ts
│   │   │   ├── risk.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── interventions.ts
│   │   │   └── alerts.ts
│   │   │
│   │   ├── store/                    # Zustand state
│   │   │   ├── portfolioStore.ts
│   │   │   ├── studentStore.ts
│   │   │   └── alertStore.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Lender portfolio view (main page)
│   │   │   ├── StudentDetail.tsx     # Individual student risk card
│   │   │   └── Alerts.tsx            # Alert case list
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Topbar.tsx
│   │   │   ├── portfolio/
│   │   │   │   ├── PortfolioHeatmap.tsx
│   │   │   │   ├── RiskTierBands.tsx
│   │   │   │   ├── SectorExposureChart.tsx
│   │   │   │   └── StressTestSlider.tsx
│   │   │   ├── student/
│   │   │   │   ├── RiskCard.tsx
│   │   │   │   ├── SurvivalCurveChart.tsx
│   │   │   │   ├── ShapDriverBars.tsx
│   │   │   │   ├── InterventionPanel.tsx
│   │   │   │   ├── BiasFlag.tsx
│   │   │   │   └── RepaymentStressBar.tsx
│   │   │   └── shared/
│   │   │       ├── RiskBadge.tsx
│   │   │       ├── ConfidenceBand.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   │
│   │   └── types/
│   │       ├── student.ts
│   │       ├── risk.ts
│   │       └── portfolio.ts
│   │
│   └── public/
│
├── scripts/
│   ├── setup_db.py                   # Creates all tables (run once)
│   ├── train_models.py               # Trains all ML models, saves artifacts
│   └── run_demo_seed.py              # Seeds 20 demo students with pre-fired alerts
│
├── models_cache/                     # Serialized model artifacts (gitignored)
│   ├── cph_campus.pkl
│   ├── cph_regulatory.pkl
│   ├── cph_market.pkl
│   ├── xgb_risk.pkl
│   ├── xgb_salary.pkl
│   ├── mapie_risk.pkl
│   ├── mapie_salary.pkl
│   ├── ensemble_weights.pkl
│   └── shap_explainer.pkl
│
├── .env                              # DATABASE_URL, etc.
├── .env.example
└── README.md                         # Setup instructions for judges
```

---

## Phase 0 — Environment Setup (✅ Completed)

### Objective
Get both backend and frontend running with a Hello World before writing any ML code.
Nothing is more time-wasting than debugging import errors mid-hackathon.

---

### Prompt 0.1 — Backend bootstrapping

```
Create a FastAPI backend project with the following setup:

File: backend/requirements.txt
Contents:
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
pydantic==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
anthropic==0.28.0
lifelines==0.27.8
xgboost==2.0.3
shap==0.45.0
mapie==0.8.3
fairlearn==0.10.0
scikit-learn==1.4.2
pandas==2.2.2
numpy==1.26.4
faker==24.11.0
scipy==1.13.0
joblib==1.4.2

File: backend/config.py
- Use pydantic-settings BaseSettings
- Fields: DATABASE_URL, MODEL_CACHE_DIR (default: "../models_cache")
- Load from .env file

File: backend/database.py
- SQLAlchemy engine from DATABASE_URL
- SessionLocal factory
- Base declarative base
- get_db dependency function

File: backend/main.py
- FastAPI app with title "RepaySignal API"
- CORS middleware allowing localhost:5173
- Root route GET / returning {"status": "RepaySignal API running", "version": "1.0.0"}
- Include placeholder routers (students, risk, portfolio, interventions, alerts, llm)

File: .env.example
DATABASE_URL=postgresql://postgres:password@localhost:5432/repaysignal
MODEL_CACHE_DIR=../models_cache

Verify it starts with: uvicorn backend.main:app --reload --port 8000
```

---

### Prompt 0.2 — Frontend bootstrapping

```
Scaffold a React 18 TypeScript frontend using Vite:

Run: npm create vite@latest frontend -- --template react-ts
Then: cd frontend && npm install

Install dependencies:
npm install axios @tanstack/react-query zustand recharts
npm install -D @types/recharts tailwindcss postcss autoprefixer
npx tailwindcss init -p

Configure tailwind.config.js to scan ./src/**/*.{ts,tsx}
Add Tailwind directives to src/index.css

Create src/api/client.ts:
- axios instance with baseURL http://localhost:8000
- default headers Content-Type: application/json
- response interceptor that logs errors

Create src/App.tsx:
- Simple layout with a sidebar and main content area
- Route / → Dashboard page
- Route /student/:id → StudentDetail page
- Route /alerts → Alerts page
- Use react-router-dom (install: npm install react-router-dom)

Create src/pages/Dashboard.tsx:
- Placeholder div saying "Portfolio Dashboard — loading"

Verify it runs with: npm run dev (should open on localhost:5173)
```

---

### Prompt 0.3 — Database setup

```
Create scripts/setup_db.py that:

1. Reads DATABASE_URL from .env
2. Creates a PostgreSQL database named 'repaysignal' if it doesn't exist
3. Creates all tables in this order:

institutes table:
  id (UUID primary key, default gen_random_uuid())
  name (VARCHAR 255)
  tier (VARCHAR 20) -- 'tier_1', 'tier_2', 'tier_3'
  data_trust_score (DECIMAL 3,2, default 0.5)
  created_at (TIMESTAMP default NOW())

students table:
  student_id (UUID primary key)
  institute_id (UUID references institutes)
  course_type (VARCHAR 50) -- Engineering, MBA, Nursing, Arts, CA
  course_family (VARCHAR 20) -- campus, regulatory, market
  cgpa (DECIMAL 4,2)
  internship_count (INTEGER default 0)
  internship_employer_tier (VARCHAR 20) -- recognized, unverified, none
  ppo_exists (BOOLEAN default false)
  cert_count (INTEGER default 0)
  graduation_month (INTEGER) -- 1-12
  graduation_year (INTEGER)
  target_field (VARCHAR 100)
  target_city_tier (INTEGER) -- 1, 2, 3
  loan_emi_monthly (DECIMAL 10,2)
  months_since_graduation (INTEGER default 0)
  placement_status (VARCHAR 20 default 'searching') -- placed, searching
  created_at (TIMESTAMP default NOW())

demand_index table:
  id (SERIAL primary key)
  field (VARCHAR 100)
  city_tier (INTEGER)
  month (DATE)
  demand_percentile (DECIMAL 4,2)
  mom_delta (DECIMAL 5,2)
  adjacent_sectors (JSONB)

risk_scores table:
  id (UUID primary key)
  student_id (UUID references students)
  risk_score (DECIMAL 4,3)
  ci_lower (DECIMAL 4,3)
  ci_upper (DECIMAL 4,3)
  ci_width (DECIMAL 4,3)
  p_3mo (DECIMAL 4,3)
  p_6mo (DECIMAL 4,3)
  p_12mo (DECIMAL 4,3)
  predicted_salary_lower (DECIMAL 12,2)
  predicted_salary_upper (DECIMAL 12,2)
  repayment_stress_index (DECIMAL 4,3)
  shap_drivers (JSONB) -- [{feature, direction, magnitude, display}]
  bias_flags (JSONB) -- [{attribute, dpd, warning}]
  data_trust_weight (DECIMAL 3,2)
  course_family (VARCHAR 20)
  regulatory_note (VARCHAR 500, nullable)
  needs_human_review (BOOLEAN default false)
  scored_at (TIMESTAMP default NOW())

alert_states table:
  id (UUID primary key)
  student_id (UUID references students)
  trigger_id (VARCHAR 10)
  trigger_name (VARCHAR 100)
  state (VARCHAR 20 default 'monitoring') -- monitoring, triggered, actioned, resolved
  severity (VARCHAR 10) -- low, medium, high
  assignee (VARCHAR 100, nullable)
  deadline (DATE, nullable)
  action_taken (VARCHAR 500, nullable)
  updated_at (TIMESTAMP default NOW())

outcomes table:
  id (UUID primary key)
  student_id (UUID references students)
  placement_status (VARCHAR 20) -- placed, searching, restructured, defaulted
  months_to_event (INTEGER)
  event_observed (BOOLEAN) -- TRUE=placed, FALSE=censored
  actual_salary (DECIMAL 12,2, nullable)
  placement_city_tier (INTEGER, nullable)
  recorded_at (TIMESTAMP default NOW())

model_registry table:
  id (SERIAL primary key)
  retrained_at (TIMESTAMP)
  n_new_labels (INTEGER)
  survival_weight (DECIMAL 4,3)
  cohort_weight (DECIMAL 4,3)
  demand_weight (DECIMAL 4,3)
  meta_learner_r2 (DECIMAL 4,3)

4. Print "Database setup complete. All tables created." on success
5. Run with: python scripts/setup_db.py
```

---

## Phase 1 — Synthetic Data Engine (✅ Completed)

### Objective
We have designed a highly rigorous, non-linear generative pipeline to model student employability. Rather than using shallow random distributions, it features:
1. **Unobservable Latent Variables** (interview_skill, network_strength, student_market_luck).
2. **Missingness (MAR)** tied to institutional tier and data trust scores.
3. **Multi-directional Label Noise** (clerical errors, false negatives for Tier 3, false positives).
4. **Realistic Text Scars** (e.g., typos, lowercase text) to simulate operational messiness.
5. **Feature Contradictions** (e.g., >8.5 CGPA but 0 internships).

The baseline model (RandomForest) aims for a "Sweet Spot" accuracy of 60%-85%, proving that the dataset has genuine, extractable signal but isn't trivially learnable due to embedded noise and latent factors.

The completed generation script (`backend/data/synthetic_generator.py`) produces `synthetic_institutes.csv`, `synthetic_students.csv`, and `synthetic_outcomes.csv`. 

### Prompt 1.1 — Data Integration into Backend SQLite/PostgreSQL

```
Update `backend/data/seed_db.py` to ingest the newly created synthetic CSVs.

Instead of calling Faker inline, read the existing CSV files generated by `synthetic_generator.py`:
- Read `synthetic_institutes.csv` -> Insert to `institutes` table
- Read `synthetic_students.csv` -> Insert to `students` table 
- Read `synthetic_outcomes.csv` -> Insert to `outcomes` table

Ensure the UUIDs, strings (handling the intentional lowercasing/scars), and NaNs translate cleanly to Postgres UUID, VARCHAR, and NULLs respectively.
```

---

### Prompt 1.2 — Demand index generator

```
Create backend/data/demand_index_mock.py

SECTOR_DEMAND_BASE = {
    "IT_software":   {"base": 65, "trend": -8},  # declining — post layoffs
    "BFSI":          {"base": 72, "trend": +5},   # growing
    "BFSI_digital":  {"base": 70, "trend": +8},
    "consulting":    {"base": 68, "trend": +2},
    "manufacturing": {"base": 55, "trend": -2},
    "healthcare":    {"base": 78, "trend": +10},
    "FMCG":          {"base": 60, "trend": +1},
    "fintech":       {"base": 62, "trend": -4},
    "media":         {"base": 38, "trend": -5},
    "education":     {"base": 44, "trend": +3},
    "NGO":           {"base": 30, "trend": 0},
    "core_engineering": {"base": 50, "trend": +4},
}

ADJACENT_SECTORS = {
    "IT_software":   [{"sector": "BFSI_digital", "overlap": 0.8},
                      {"sector": "fintech", "overlap": 0.6}],
    "BFSI":          [{"sector": "consulting", "overlap": 0.7},
                      {"sector": "BFSI_digital", "overlap": 0.9}],
    "healthcare":    [{"sector": "BFSI", "overlap": 0.3}],
    "fintech":       [{"sector": "BFSI", "overlap": 0.8},
                      {"sector": "IT_software", "overlap": 0.6}],
    "media":         [{"sector": "education", "overlap": 0.5}],
}

Function: generate_demand_index(months_back=18) -> list[dict]
For each sector + city_tier combination, for each month from (today - months_back) to today:
- demand_percentile = base + trend * (month_index/12) + random noise (-5 to +5)
  clipped to 0-100
- mom_delta = demand_percentile[month] - demand_percentile[month-1]
- adjacent_sectors = from ADJACENT_SECTORS dict (or empty list)
- city_tier modifier: tier_1 cities +8, tier_2 +0, tier_3 -10

Function: get_latest_demand(field, city_tier) -> dict
Returns the most recent month's demand record for a field+city_tier combination.
```

---

### Prompt 1.3 — Database seeder

```
Create backend/data/seed_db.py

This script seeds all tables in dependency order:
1. Load `synthetic_institutes.csv` → insert into institutes table
2. Load `synthetic_students.csv` → insert into students table in batches of 100
3. Generate demand index (18 months) using `demand_index_mock.py` → insert into demand_index table
4. Load `synthetic_outcomes.csv` → insert into outcomes table
5. Insert seed rows into model_registry:
   {retrained_at: NOW()-2days, n_new_labels: 247,
    survival_weight: 0.51, cohort_weight: 0.28, demand_weight: 0.21,
    meta_learner_r2: 0.74}

Use SQLAlchemy session with try/except and rollback on error.
Print progress: "Seeding institutes... done (20)"
Print progress: "Seeding students... done (2000)"
etc.

After seeding, call train_all_models() from scripts/train_models.py to train
and cache all models.

Run with: python backend/data/seed_db.py
```

---

## Phase 2 — Feature Engineering Pipeline (✅ Completed)

### Objective
Build the feature engineering functions that transform raw student + institute +
demand data into model-ready arrays. All features are cohort-relative or externally
derived — never raw institute absolute values.

---

### Prompt 2.1 — Trust scorer and course router

```
Create backend/ml/trust_scorer.py

Function: compute_institute_trust_score(institute_id, db) -> float
- Query last 5 years of cohort history for this institute
- If fewer than 2 years: return 0.30 (minimal trust)
- Check 1: variance of placement_rate across years
  variance_score = min(variance / 0.02, 1.0)
- Check 2: salary mismatch (use a lookup dict of scraped estimates per institute tier
  tier_1: 850000, tier_2: 620000, tier_3: 460000)
  salary_score = max(0, 1 - mismatch_ratio * 2)
- Check 3: sample size
  size_score = min(student_count / 100, 1.0)
- return 0.4 * variance_score + 0.4 * salary_score + 0.2 * size_score
- Round to 2 decimal places, clip to [0.0, 1.0]

For MVP, since we don't have year-by-year cohort history, use the
data_trust_score already stored in the institutes table (set during generation).

---

Create backend/ml/course_router.py

SEASON_CALENDAR = {
    "Engineering": {"in_season": [2,3,4,10,11], "pre_season": [1,9]},
    "MBA":         {"in_season": [2,3,4,11,12], "pre_season": [1,10]},
    "CA":          {"in_season": [1,2,7,8],     "pre_season": [12,6]},
    "Nursing":     {"in_season": [6,7,8],       "pre_season": [4,5]},
    "Arts":        {"in_season": [],            "pre_season": []},
}

BOARD_EXAM_WAIT = {
    "Nursing":      {"months": 4},
    "Law":          {"months": 6},
    "Architecture": {"months": 5},
}

Function: get_course_family(course_type) -> str
Returns 'campus', 'regulatory', or 'market'
campus: Engineering, MBA, CA
regulatory: Nursing, Law, Architecture
market: Arts, Humanities, Social Work, and any unrecognised type

Function: get_season_phase(course_type, current_month) -> int
Returns 2 (in_season), 1 (pre_season), or 0 (off_cycle)

Function: get_regulatory_delay_months(course_type) -> int
Returns expected regulatory delay in months for regulatory-family courses
```

---

### Prompt 2.2 — Feature vector builder

```
Create backend/ml/features.py

Import from: trust_scorer, course_router, and demand_index queries

EXPECTED_INTERNSHIP_QUALITY = {1: 1.8, 2: 1.2, 3: 0.7}
INTERNSHIP_ACTUAL = {"recognized": 2, "unverified": 1, "none": 0}
COL_MULTIPLIER = {"1": 1.45, "2": 1.10, "3": 0.85}

Function: compute_internship_access_score(employer_tier, institute_tier) -> float
raw = INTERNSHIP_ACTUAL[employer_tier] / EXPECTED_INTERNSHIP_QUALITY[institute_tier]
return min(round(raw, 3), 1.5)

Function: compute_repayment_stress_index(predicted_salary_lpa, city_tier, emi_monthly) -> float
monthly_gross = (predicted_salary_lpa * 100000) / 12
post_tax = monthly_gross * 0.75
col_adjusted = post_tax / COL_MULTIPLIER[str(city_tier)]
return round(min(emi_monthly / col_adjusted, 2.0), 3)

Function: compute_adjacent_opportunity(target_field, city_tier, db) -> float
Query demand_index for fields in ADJACENT_SECTORS[target_field] with matching city_tier
Return max demand_percentile / 100.0, or 0.5 if no data

Function: build_feature_vector(student, institute, demand_record, cohort_df) -> dict
Returns a dict with ALL features needed by models:

{
  # cohort-relative
  "cgpa_percentile":          percentile of student CGPA within same institute+course cohort,
  "internship_access_score":  compute_internship_access_score(...),
  "ppo_binary":               1 if student.ppo_exists else 0,
  "cert_count_norm":          min(student.cert_count / 5.0, 1.0),

  # temporal
  "months_since_graduation":  student.months_since_graduation,
  "season_phase":             get_season_phase(student.course_type, current_month),
  "graduation_cohort_size":   count of students in same institute+course+year,

  # demand
  "field_demand_percentile":  demand_record.demand_percentile / 100.0 if record else 0.5,
  "mom_demand_delta":         demand_record.mom_delta / 100.0 if record else 0.0,
  "adjacent_opportunity":     compute_adjacent_opportunity(...),

  # metadata (not model features, used for weighting)
  "data_trust_weight":        institute.data_trust_score,
  "course_family":            student.course_family,
}

Function: build_training_dataframe(db) -> pd.DataFrame
Joins students + institutes + outcomes + demand_index
Calls build_feature_vector for each student
Returns DataFrame with all features + target columns:
  - months_to_event (for survival model)
  - event_observed (for survival model)
  - risk_label (binary: 1 if event_observed=False or months_to_event > 6)
  - salary_lpa (actual_salary / 100000, or NaN if not placed)
```

---

## Phase 3 — Core ML Models (✅ Completed)

### Objective
Train all models and save serialized artifacts to models_cache/.
The training script runs once before the demo. Inference runs on every API call.

---

### Prompt 3.1 — Survival model (most important model)

```
Create backend/ml/survival_model.py

Use: lifelines.CoxPHFitter

CAMPUS_FEATURES = [
    "cgpa_percentile", "internship_access_score", "ppo_binary",
    "cert_count_norm", "season_phase", "field_demand_percentile",
    "mom_demand_delta", "graduation_cohort_size"
]
REGULATORY_FEATURES = [
    "cgpa_percentile", "cert_count_norm", "months_since_graduation"
]
MARKET_FEATURES = [
    "cgpa_percentile", "internship_access_score", "cert_count_norm",
    "field_demand_percentile", "adjacent_opportunity", "season_phase"
]

Function: train_survival_models(df) -> dict
  Splits df by course_family into df_campus, df_regulatory, df_market
  For each subset:
    - If fewer than 30 rows: skip and use fallback predictions
    - Fit CoxPHFitter(penalizer=0.1) on subset with:
        duration_col='months_to_event'
        event_col='event_observed'
    - Save model with joblib to models_cache/cph_{family}.pkl
  Returns {"campus": cph_campus, "regulatory": cph_regulatory, "market": cph_market}

REGULATORY SPECIAL CASE — implement separately:
Function: predict_regulatory(course_type, months_since_graduation, board_status="unknown")
  Does not use Cox PH for regulatory students.
  Uses rule-based predictions from BOARD_EXAM_WAIT dict:
    board_status == "pre_exam" or "awaiting":
      delay = BOARD_EXAM_WAIT[course_type]["months"]
      p_3mo = 0.05 if delay > 3 else 0.25
      p_6mo = 0.55 if delay <= 4 else 0.30
      p_12mo = 0.85
    board_status == "passed":
      p_3mo = 0.55, p_6mo = 0.80, p_12mo = 0.92
    board_status == "failed":
      p_3mo = 0.02, p_6mo = 0.15, p_12mo = 0.55
  For MVP, default board_status based on months_since_graduation:
    < 3 months: "awaiting"
    >= 3 months: "passed"

Function: predict_placement_probs(student_features, models) -> dict
  Routes to correct model by course_family
  For regulatory: uses predict_regulatory()
  For campus/market: uses Cox PH survival function
  Returns {p_3mo, p_6mo, p_12mo, regulatory_note (or None)}
  All probabilities rounded to 3 decimal places
```

---

### Prompt 3.2 — GBM risk and salary models

```
Create backend/ml/gbm_model.py

Use: xgboost, sklearn

ALL_FEATURES = [
    "cgpa_percentile", "internship_access_score", "ppo_binary",
    "cert_count_norm", "season_phase", "field_demand_percentile",
    "mom_demand_delta", "adjacent_opportunity", "months_since_graduation"
]

Function: train_risk_model(df) -> xgb.XGBClassifier
  y = df['risk_label']
  X = df[ALL_FEATURES].fillna(0.5)
  Split 80/20, stratified on y
  Train XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.05,
                       eval_metric='auc', use_label_encoder=False)
  Print train AUC and test AUC
  Save to models_cache/xgb_risk.pkl
  Return fitted model

Function: train_salary_model(df) -> xgb.XGBRegressor
  Filter to only placed students (event_observed=True)
  y = df['salary_lpa'].dropna()
  X = df.loc[y.index, ALL_FEATURES].fillna(0.5)
  Split 80/20
  Train XGBRegressor(n_estimators=200, max_depth=4, objective='reg:squarederror')
  Print train MAE and test MAE (in LPA)
  Save to models_cache/xgb_salary.pkl
  Return fitted model

Function: predict_risk(features_dict, risk_model) -> float
  Returns risk score 0.0-1.0 (probability of class 1)

Function: predict_salary(features_dict, salary_model) -> tuple[float, float]
  Returns (lower_lpa, upper_lpa) — use ±20% of point prediction for MVP range
  e.g., pred=6.5 → return (5.2, 7.8)
```

---

### Prompt 3.3 — SHAP explainer

```
Create backend/ml/shap_explainer.py

FEATURE_DISPLAY_NAMES = {
    "cgpa_percentile":         "CGPA relative to cohort",
    "internship_access_score": "Internship quality (access-adjusted)",
    "ppo_binary":              "Pre-placement offer",
    "cert_count_norm":         "Skill certifications",
    "season_phase":            "Campus placement season timing",
    "field_demand_percentile": "Job demand in target field",
    "mom_demand_delta":        "Month-on-month demand change",
    "adjacent_opportunity":    "Adjacent sector opportunity",
    "months_since_graduation": "Time since graduation",
}

Function: build_explainer(risk_model) -> shap.TreeExplainer
  explainer = shap.TreeExplainer(risk_model)
  Save with joblib to models_cache/shap_explainer.pkl
  Return explainer

Function: get_top_drivers(features_dict, explainer, n=3) -> list[dict]
  features_array = np.array([list(features_dict.values())])
  shap_values = explainer.shap_values(features_array)[0]

  CRITICAL: preserve signed direction — do NOT take abs() before sorting
  Sort by abs(shap_value) descending, take top n

  Return list of dicts:
  [
    {
      "feature": display_name,
      "direction": "increases_risk" if shap_val > 0 else "reduces_risk",
      "magnitude": round(abs(shap_val), 4),
      "signed": round(shap_val, 4),
      "display": f"{display_name} {'raises' if shap_val > 0 else 'lowers'} risk",
    }
    ...
  ]

  NOTE: A positive SHAP value = feature INCREASES risk score.
  A negative SHAP value = feature REDUCES risk score.
  Never flip this — it will cause the LLM to generate incorrect explanations.
```

---

### Prompt 3.4 — Conformal prediction wrapper + learned ensemble

```
Create backend/ml/uncertainty.py

Use: mapie.classification.MapieClassifier, mapie.regression.MapieRegressor

Function: wrap_with_conformal(risk_model, X_train, y_train) -> MapieClassifier
  mapie = MapieClassifier(estimator=risk_model, method="score", cv=5)
  mapie.fit(X_train, y_train)
  Save to models_cache/mapie_risk.pkl
  Return mapie

Function: predict_with_ci(mapie_model, features_dict, alpha=0.20) -> dict
  X = np.array([[features_dict[f] for f in ALL_FEATURES]])
  y_pred, y_pis = mapie_model.predict(X, alpha=alpha)
  ci_width = float(y_pis[0,1,0] - y_pis[0,0,0])
  return {
    "risk_score": round(float(y_pred[0]), 3),
    "ci_lower":   round(float(y_pis[0,0,0]), 3),
    "ci_upper":   round(float(y_pis[0,1,0]), 3),
    "ci_width":   round(ci_width, 3),
    "needs_human_review": ci_width > 0.30,
  }

---

Create backend/ml/ensemble.py

Use: sklearn.linear_model.RidgeCV, numpy, joblib

class LearnedEnsemble:
  def __init__(self):
    self.meta = RidgeCV(alphas=[0.01, 0.1, 1.0], fit_intercept=False)
    self.weights = np.array([0.50, 0.30, 0.20])  # fallback defaults

  def fit(self, survival_scores, cohort_scores, demand_scores, y_outcomes):
    X = np.column_stack([survival_scores, cohort_scores, demand_scores])
    self.meta.fit(X, y_outcomes)
    raw = np.clip(self.meta.coef_, 0, None)
    self.weights = raw / raw.sum() if raw.sum() > 0 else np.array([0.5, 0.3, 0.2])
    return self

  def predict(self, survival_score, cohort_score, demand_score, data_trust_weight) -> float
    w = self.weights
    cohort_w = w[1] * data_trust_weight
    demand_w = w[2] + w[1] * (1 - data_trust_weight)
    raw = w[0]*survival_score + cohort_w*cohort_score + demand_w*demand_score
    return float(np.clip(raw, 0.0, 1.0))

  def save(self, path): joblib.dump(self, path)

  @classmethod
  def load(cls, path): return joblib.load(path)

Function: train_ensemble(df_holdout, survival_preds, cohort_scores, demand_scores) -> LearnedEnsemble
  ensemble = LearnedEnsemble()
  ensemble.fit(survival_preds, cohort_scores, demand_scores, df_holdout['risk_label'].values)
  ensemble.save("models_cache/ensemble_weights.pkl")
  print(f"Ensemble weights: S={ensemble.weights[0]:.2f} C={ensemble.weights[1]:.2f} D={ensemble.weights[2]:.2f}")
  return ensemble
```

---

### Prompt 3.5 — Bias detector

```
Create backend/ml/bias_detector.py

Use: fairlearn.metrics.demographic_parity_difference, numpy

BIAS_THRESHOLD = 0.15

PROTECTED_ATTRIBUTES = {
    "home_state_tier":   "home state economic tier",
    "institute_tier":    "institute tier",
}

Function: check_bias(risk_scores, student_records) -> list[dict]
  flags = []

  For each attribute in PROTECTED_ATTRIBUTES:
    sensitive_feature = extract attribute value from each student record
    If attribute is institute_tier: map tier_1->1, tier_2->2, tier_3->3
    If attribute is home_state_tier: use target_city_tier as proxy for MVP

    dpd = demographic_parity_difference(
        y_true=np.array(risk_scores > 0.5, dtype=int),
        y_pred=np.array(risk_scores > 0.5, dtype=int),
        sensitive_feature=sensitive_feature
    )

    if abs(dpd) > BIAS_THRESHOLD:
      flags.append({
        "attribute": PROTECTED_ATTRIBUTES[attribute],
        "dpd": round(float(dpd), 3),
        "warning": f"Risk score correlates with {PROTECTED_ATTRIBUTES[attribute]} "
                   f"(DPD={dpd:.2f}). This may reflect structural disadvantage, "
                   f"not individual employability. Manual review recommended."
      })

  return flags

Function: check_single_student_bias(student, risk_score) -> list[dict]
  For MVP: flag if student is from tier_3 institute AND risk_score > 0.65
  This simulates the bias detection for the demo
  Return flag with warning about structural disadvantage
```

---

### Prompt 3.6 — Training orchestrator

```
Create scripts/train_models.py

Function: train_all_models()
  1. Load database, build training DataFrame using build_training_dataframe()
  2. Split into train (80%) and holdout (20%) sets, stratified by course_family
  3. Train survival models for each course family
  4. Train XGBoost risk model → print test AUC
  5. Train XGBoost salary model → print test MAE
  6. Build SHAP explainer from risk model
  7. Wrap risk model in MAPIE conformal prediction using train set
  8. Train LearnedEnsemble using holdout predictions
  9. Insert row into model_registry with learned weights and R2 score
  10. Print "All models trained and saved to models_cache/"

if __name__ == "__main__":
  train_all_models()

Run with: python scripts/train_models.py
Expected output:
  Training survival models...
    Campus: concordance index = 0.XXX (n=XXX)
    Regulatory: rule-based (no ML needed)
    Market: concordance index = 0.XXX (n=XXX)
  Training risk GBM...
    Train AUC: 0.XXX | Test AUC: 0.XXX
  Training salary GBM...
    Train MAE: X.XX LPA | Test MAE: X.XX LPA
  Training ensemble...
    Ensemble weights: S=0.XX C=0.XX D=0.XX
  All models trained and saved to models_cache/
```

---

## Phase 4 — FastAPI Backend (Hour 9–14)

### Objective
Build the API layer that connects the ML pipeline to the React frontend.
Every endpoint must return data in the exact shape the frontend expects.

---

### Prompt 4.1 — Risk scoring service

```
Create backend/services/risk_service.py

Function: score_student(student_id, db) -> dict
  This is the main orchestration function. Call it from the API route.

  1. Load student + institute from DB
  2. Load latest demand record for student's field + city_tier
  3. Build feature vector using build_feature_vector()
  4. Route to correct sub-engine using get_course_family()

  For REGULATORY students:
    survival_probs = predict_regulatory(course_type, months_since_graduation)
    risk_score_raw = 1 - survival_probs["p_6mo"]  # proxy for regulatory
    regulatory_note = survival_probs["regulatory_note"]
  For CAMPUS / MARKET students:
    survival_probs = predict_placement_probs(features, survival_models)
    regulatory_note = None

  5. Load MAPIE model → predict_with_ci(features) → gets risk_score + CI
  6. Load salary model → predict_salary(features) → gets salary range
  7. Load SHAP explainer → get_top_drivers(features) → gets top 3 drivers
  8. Load ensemble → compute final ensemble score
  9. Compute repayment_stress_index(salary_lower_lpa, city_tier, emi_monthly)
  10. Run bias check → check_single_student_bias(student, risk_score)
  11. Compute adjacent_opportunity score

  Build and return RiskScoreResponse:
  {
    student_id, risk_score, ci_lower, ci_upper, ci_width,
    p_3mo, p_6mo, p_12mo,
    predicted_salary_lower, predicted_salary_upper,
    repayment_stress_index,
    repayment_stress_label,  # LOW/MODERATE/HIGH/CRITICAL
    shap_drivers,            # list of 3 dicts
    bias_flags,              # list of dicts (may be empty)
    data_trust_weight,
    course_family,
    regulatory_note,
    needs_human_review,
    scored_at,
  }

  Also upsert into risk_scores table.
  Return the dict.
```

---

### Prompt 4.2 — Trigger service

```
Create backend/services/trigger_service.py

TRIGGERS = [
    {
        "id": "T001", "name": "90-day no placement", "severity": "high",
        "check": lambda s, d: s.months_since_graduation >= 3 and s.placement_status == "searching",
        "assignee": "Relationship Manager", "deadline_days": 7,
    },
    {
        "id": "T002", "name": "Demand collapse in target field", "severity": "medium",
        "check": lambda s, d: d is not None and d.mom_delta < -20,
        "assignee": "Auto-system", "deadline_days": 14,
    },
    {
        "id": "T003", "name": "Confidence collapse", "severity": "medium",
        "check": lambda s, d: False,  # injected from risk score ci_width
        "assignee": "Senior Analyst", "deadline_days": 5,
    },
    {
        "id": "T004", "name": "Low cohort + no internship", "severity": "high",
        "check": lambda s, d: s.internship_employer_tier == "none" and not s.ppo_exists,
        "assignee": "Relationship Manager", "deadline_days": 5,
    },
]

Function: process_triggers(student, demand_record, ci_width, db) -> list[dict]
  fired = []
  for trigger in TRIGGERS:
    existing = query alert_states where student_id=student.id and trigger_id=trigger["id"]

    current_state = existing.state if existing else "monitoring"
    if current_state in ("triggered", "actioned"):
      continue  # alert fatigue suppression

    condition_met = trigger["check"](student, demand_record)
    if trigger["id"] == "T003":
      condition_met = ci_width > 0.30

    if condition_met and current_state == "monitoring":
      deadline = date.today() + timedelta(days=trigger["deadline_days"])
      if existing:
        update existing → state="triggered", deadline=deadline
      else:
        insert new alert_state record with state="triggered"
      fired.append({...trigger, "deadline": deadline.isoformat()})

  return fired

Function: resolve_alert(alert_id, action_taken, db)
  Update alert_states record: state="actioned", action_taken=action_taken
```

---

### Prompt 4.3 — Portfolio service

```
Create backend/services/portfolio_service.py

Function: get_portfolio_summary(db) -> dict
  Query all students with their latest risk_score
  Group by risk tier:
    Low: risk_score < 0.40
    Medium: risk_score 0.40-0.69
    High: risk_score >= 0.70

  Return:
  {
    total_students: int,
    high_risk_count: int,
    medium_risk_count: int,
    low_risk_count: int,
    avg_risk_score: float,
    sector_exposure: [
      {field: str, student_count: int, avg_risk: float, demand_percentile: float}
      ...sorted by avg_risk desc
    ],
    recent_alerts: list of 5 most recent triggered alerts,
    model_version: from model_registry latest row
  }

Function: run_stress_test(field_demand_shock_pct, db) -> dict
  Load all students with latest risk scores
  For each student in target field:
    Apply shock: new_demand = demand_percentile * (1 - shock_pct/100)
    Recompute ensemble score with shocked demand
  Count students crossing 0.70 threshold in baseline vs shocked
  Return:
  {
    shock_applied: f"{field_demand_shock_pct}% demand drop",
    baseline_high_risk: int,
    shocked_high_risk: int,
    new_at_risk: int,
    portfolio_impact_pct: float,
    most_affected_fields: list[str]
  }
```

---

### Prompt 4.4 — All API routes

```
Create backend/routers/students.py:

GET /students
  Query params: course_family, risk_tier, limit (default 50)
  Returns list of students with their latest risk_score joined
  Each student: {student_id, course_type, target_field, risk_score,
                  risk_tier, months_since_graduation, placement_status}
  If no risk_score exists yet: trigger score_student() and wait

GET /students/{student_id}
  Full student detail including all fields
  Also trigger score_student() if last scoring was > 24 hours ago

---

Create backend/routers/risk.py:

GET /risk/{student_id}
  Call score_student() from risk_service
  Returns full RiskScoreResponse

---

Create backend/routers/portfolio.py:

GET /portfolio
  Returns get_portfolio_summary() response

POST /stress-test
  Body: {field: str, shock_pct: float}
  Returns run_stress_test() response

---

Create backend/routers/interventions.py:

GET /interventions/{student_id}
  Load student + latest risk_score from DB
  Call rank_interventions() from intervention_ranker
  Returns:
  {
    student_id,
    generated_at,
    lift_note: "Lift estimates are research-calibrated priors...",
    interventions: list of top 3,
    llm_summary: "" (empty — LLM is called separately)
  }

---

Create backend/routers/alerts.py:

GET /alerts
  Query params: state (default "triggered"), limit (default 20)
  Returns list of alert_states with student name + course_type joined

PATCH /alerts/{alert_id}
  Body: {action_taken: str}
  Calls resolve_alert()
  Returns updated alert record

---

Create backend/routers/llm.py:

POST /risk-card
  Body: {student_id: str}
  Load student + risk score from DB
  Generate risk card response using template-based NLG (see Phase 6)
  Return {student_id, risk_summary: str, generated_at: str}
```

---

## Phase 5 — React Frontend (Hour 14–22)

### Objective
Build the two views judges will interact with: the portfolio dashboard and the
student detail page. Both must load fast and look professional.

---

### Prompt 5.1 — Portfolio dashboard

```
Create src/pages/Dashboard.tsx

Layout:
- Top row: 4 metric cards (Total Students, High Risk, Active Alerts, Avg Risk Score)
- Middle: Portfolio heatmap (risk tiers as colored bands) + Sector exposure bar chart side by side
- Bottom: Stress test panel + Recent alerts list

Metric card component (inline):
  Props: label, value, color
  Style: bg-gray-50 rounded-xl p-4 border border-gray-100
  Value in large text (text-2xl font-medium), label below in text-sm text-gray-500

Portfolio heatmap:
  Use Recharts ScatterChart or custom grid
  X-axis: months_since_graduation (0-18)
  Y-axis: course_type
  Dot color: red (risk >= 0.7), amber (0.4-0.69), green (< 0.4)
  Dot size: 10px
  On dot click: navigate to /student/{student_id}
  Title: "Portfolio risk map — click any borrower"

Sector exposure bar chart:
  Use Recharts HorizontalBarChart
  Bars sorted by avg_risk descending
  Bar color uses risk tier color scale
  Show demand_percentile as a small label on each bar
  Title: "Sector exposure"

Stress test panel:
  Range slider: 0-50% demand shock
  Label updates live: "If {field} demand drops {n}% ..."
  On change: debounced POST to /stress-test
  Display result: "X new borrowers enter high-risk zone (+Y%)"
  Show a simple before/after number comparison
  Include a field selector dropdown

Recent alerts list:
  Last 5 triggered alerts
  Each row: student name, trigger name, severity badge, deadline
  Red badge for high, amber for medium
  Click row → navigate to /student/{student_id}
  "View all alerts" link → /alerts

All data via React Query:
  useQuery("portfolio", () => api.portfolio.getSummary())
  Polling interval: 30 seconds
```

---

### Prompt 5.2 — Student detail page

```
Create src/pages/StudentDetail.tsx

Load data:
  useQuery(["student", id], () => api.students.getById(id))
  useQuery(["risk", id], () => api.risk.getByStudentId(id))
  useQuery(["interventions", id], () => api.interventions.getByStudentId(id))

Layout — three-column on desktop, stacked on mobile:

LEFT COLUMN (30%):
  Student identity card:
    - Name (synthetic), course_type, institute tier badge
    - Graduation: "June 2025 · {months_since_graduation} months ago"
    - Loan: "₹{loan_amount}L · EMI ₹{emi}/mo"
    - Placement status badge: "Searching" (amber) or "Placed" (green)
    - Data trust indicator: small progress bar showing institute trust score

  Risk tier badge (large):
    - HIGH / MEDIUM / LOW with appropriate color
    - Risk score: "0.74 ± 0.18 (80% CI)"
    - CI too wide? Show: "⚠ Wide uncertainty — human review recommended"

  Bias flags (if any):
    - Amber warning card
    - "Risk may reflect structural disadvantage in {attribute}"
    - "Manual review recommended before action"

  Course routing indicator:
    - "Routed to: Campus sub-engine" / "Regulatory sub-engine" / "Market sub-engine"
    - For regulatory: show regulatory_note as a teal info card

MIDDLE COLUMN (40%):
  Survival curve chart:
    - Recharts LineChart
    - X-axis: months 0-12
    - Y-axis: placement probability 0-100%
    - Three markers at months 3, 6, 12 with probability labels
    - Shaded CI band around the curve (use area chart opacity 0.15)
    - Title: "Placement probability over time"

  Repayment stress bar:
    - Label: "Repayment stress: {CRITICAL/HIGH/MODERATE/LOW}"
    - Progress bar 0-100% filled proportionally to stress_index
    - Color: green < 0.35, amber 0.35-0.50, orange 0.50-0.70, red > 0.70
    - Subtitle: "₹{salary_lower}–{salary_upper}L predicted · ₹{emi}/mo EMI · {city} CoL"

  SHAP drivers panel:
    Title: "Why this risk score?"
    For each of 3 drivers:
      - Feature display name
      - "raises risk" (red text) or "lowers risk" (green text)
      - Horizontal bar: length = magnitude, color = direction
      - Magnitude value shown at bar end
    Note at bottom: "Drivers ordered by impact magnitude"

  LLM risk card:
    - Show a loading spinner when fetching
    - Fetch from POST /risk-card on page load
    - Display in a card with subtle left purple border
    - Text is the LLM output — 2 sentences
    - Label above: "AI-generated assessment"

RIGHT COLUMN (30%):
  Intervention panel:
    Title: "Recommended actions"
    Subtitle: "Research-calibrated lift estimates"
    For each of 3 interventions:
      - Intervention name (bold)
      - "+{lift}pp placement lift est." (green)
      - Cost tier badge: "Zero cost" / "Low cost" / "Medium cost"
      - Delivery: "{platform or method}"
      - Small progress bar showing lift magnitude
    Note: "Lifts are priors, updated as real outcomes accumulate"

  Alert status:
    Show current trigger state(s) for this student
    Timeline: trigger date → action date → resolution date
    "Mark as actioned" button → PATCH /alerts/{id}
    Text input for action_taken before submitting
```

---

### Prompt 5.3 — Alerts page and shared components

```
Create src/pages/Alerts.tsx

Full alert case list:
  Table with columns: Student, Course, Trigger, Severity, State, Assignee, Deadline, Action
  Filterable by state (triggered / actioned / resolved)
  Filterable by severity (high / medium)
  Each row expandable to show action_taken notes
  "Mark actioned" button inline per row

---

Create src/components/shared/RiskBadge.tsx
  Props: score, tier
  Returns colored pill: HIGH (red bg), MEDIUM (amber bg), LOW (green bg)
  Shows score number inside: "HIGH · 0.74"

Create src/components/shared/ConfidenceBand.tsx
  Props: lower, upper, center
  Visual: center dot with bar extending from lower to upper
  Label: "{center*100:.0f}% ({lower*100:.0f}%–{upper*100:.0f}%)"

Create src/components/portfolio/StressTestSlider.tsx
  Slider 0-50
  Field selector dropdown populated from portfolio sector_exposure
  Live debounced API call (300ms debounce)
  Display result card with before/after numbers and delta

Create src/components/student/SurvivalCurveChart.tsx
  Recharts AreaChart
  Data: [{month: 0, prob: 1.0}, {month: 3, prob: p_3mo_inverted},
          {month: 6, prob: p_6mo_inverted}, {month: 12, prob: p_12mo_inverted}]
  Note: survival curve shows P(still searching) not P(placed)
  Two series: point estimate + CI band (opacity 0.15)
  Reference lines at months 3, 6, 12 with probability annotations

Create src/components/student/ShapDriverBars.tsx
  Props: drivers (list of 3 shap driver dicts)
  For each driver:
    Row: display name | bar | magnitude value
    Bar color: red if direction=increases_risk, green if reduces_risk
    Bar width: magnitude / max_magnitude * 100%
  Header note: "Positive = raises risk · Negative = lowers risk"
```

---

## Phase 6 — Risk Card Explainability Layer (Hour 22–25)

### Objective
Implement a Template-based Natural Language Generation (NLG) engine locally to build the risk card.
This provides instant, deterministic explainability tailored exactly to our hackathon demo cases without requiring paid APIs.

---

### Prompt 6.1 — NLG service

```
Create backend/services/llm_service.py

REPAYMENT_STRESS_LABELS = {
    (0.0, 0.35): "LOW",
    (0.35, 0.50): "MODERATE",
    (0.50, 0.70): "HIGH",
    (0.70, 2.0):  "CRITICAL",
}

def get_stress_label(index: float) -> str:
  for (lo, hi), label in REPAYMENT_STRESS_LABELS.items():
    if lo <= index < hi: return label
  return "CRITICAL"

Function: generate_risk_card(student, risk_data) -> str
  stress_label = get_stress_label(risk_data["repayment_stress_index"])
  top_driver = risk_data["shap_drivers"][0] if risk_data["shap_drivers"] else None
  driver_phrase = top_driver["display"].lower() if top_driver else "limited field experience"
  
  # Hand-crafted templates for demo perfection
  if student.course_family == "regulatory":
    return (
      f"This {student.course_type} profile reflects a regulatory waiting period rather than employability risk. "
      f"Recommended action: Maintain engagement through board exam milestones to ensure timely loan maturation."
    )
    
  if risk_data["bias_flags"]:
    return (
      f"System alert: Risk score is heavily influenced by systemic factors ({risk_data['bias_flags'][0]['attribute']}) rather than individual merit. "
      f"Recommended action: Manually override auto-triggers and evaluate target adjacent sectors."
    )

  if risk_data["risk_score"] > 0.6:
    return (
      f"This {student.course_type} student faces elevated placement risk primarily due to {driver_phrase}, "
      f"with an estimated {risk_data['p_3mo']:.0%}–{risk_data['p_6mo']:.0%} placement probability within 3–6 months. "
      f"Recommended action: {'Expand job search to adjacent sectors.' if risk_data.get('adjacent_opportunity', 0) > 0.6 else 'Prioritise mock interview coaching before the next placement season.'}"
    )
    
  return (
    f"Strong profile indicating low repayment stress ({stress_label}) driven by positive {driver_phrase}. "
    f"Recommended action: Continue standard monitoring; candidate is highly likely to place within 3 months."
  )
```

---

## Phase 7 — Demo Data & Polish (Hour 25–28)

### Objective
Seed exactly the 20 demo students that will be shown during the demo.
Pre-fire specific triggers. Make everything deterministic so nothing surprises you.

---

### Prompt 7.1 — Demo seed script

```
Create scripts/run_demo_seed.py

This script creates exactly 20 synthetic students with specific profiles
designed to showcase every system feature during the demo.

Demo students (hardcoded, not random):

Student 1 — "Ananya Krishnan"
  course_type: Engineering, institute_tier: tier_2
  cgpa: 7.2, internship: none, ppo: false
  target_field: IT_software, city_tier: 1 (Mumbai)
  months_since_graduation: 4, emi: 14200
  → Expected: HIGH risk, T001+T004 triggers fired, bias flag (tier mismatch)

Student 2 — "Rohan Mehta"
  course_type: MBA, institute_tier: tier_1
  cgpa: 8.6, internship: recognized, ppo: true
  target_field: BFSI, city_tier: 1
  months_since_graduation: 1, emi: 22000
  → Expected: LOW risk, no triggers, PPO is the dominant positive driver

Student 3 — "Arun Pillai"
  course_type: Nursing, institute_tier: tier_2
  cgpa: 7.8, internship: unverified, ppo: false
  target_field: healthcare, city_tier: 2
  months_since_graduation: 2, emi: 9500
  → Expected: regulatory sub-engine, P(3mo)=5%, note: "board exam delay — not risk"
  → This is the KEY demo moment for Criterion 4 (robustness)

Student 4 — "Meera Iyer"
  course_type: Arts, institute_tier: tier_3
  cgpa: 6.1, internship: none, ppo: false
  target_field: media, city_tier: 2
  months_since_graduation: 6, emi: 7800
  → Expected: HIGH risk, bias flag fires (tier_3 institute), adjacent pivot to education

Student 5-8 — medium risk Engineering students (various institutes, some internships)
Student 9-12 — low risk MBA students (recognized internships, some PPO)
Student 13-16 — mixed Nursing students at different board exam stages
Student 17-20 — Arts/CA students for market sub-engine demonstration

For each demo student:
1. Insert into students table
2. Call score_student() to generate and store risk score
3. Call process_triggers() to fire appropriate triggers
4. Insert pre-set alert_states for Ananya, Meera, Student 6

Print: "Demo data seeded. {n} students ready."
Print: "Key demo students:"
Print each of students 1-4 with their risk tier and active triggers.
```

---

### Prompt 7.2 — README for judges

```
Create README.md at project root

# RepaySignal — Setup Guide for Judges

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ running locally

## Quick setup (5 minutes)

### 1. Clone and install
git clone ...
cd repaysignal

### 2. Backend setup
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env: set DATABASE_URL

### 3. Database + data
python ../scripts/setup_db.py
python data/seed_db.py         # Seeds 2000 students and trains all models (~3 min)
python ../scripts/run_demo_seed.py  # Seeds 20 demo-ready students with pre-fired alerts

### 4. Start backend
uvicorn main:app --reload --port 8000
# API docs available at http://localhost:8000/docs

### 5. Frontend setup
cd ../frontend
npm install
npm run dev
# Opens at http://localhost:5173

## Demo walkthrough
[Same 8-minute script from Section 1]

## Architecture overview
[One-paragraph description of the 7-layer APIS architecture]

## Judging criteria mapping
[Same table from Section 1]

## Note on data
All student data is synthetically generated using the Faker library.
No real student or borrower data is used anywhere in this system.
```

---

## Phase 8 — Submission Checklist (Hour 28–30)

### Final verification before submission

**Backend verification:**
```
[ ] uvicorn starts without errors
[ ] GET /portfolio returns data (not empty)
[ ] GET /risk/{demo_student_1_id} returns all fields including shap_drivers
[ ] POST /risk-card returns text (even if using fallback)
[ ] GET /interventions/{id} returns 3 ranked interventions
[ ] GET /alerts returns pre-fired alerts for demo students
[ ] POST /stress-test returns delta numbers
[ ] PATCH /alerts/{id} successfully resolves an alert
```

**Frontend verification:**
```
[ ] Dashboard loads within 3 seconds
[ ] Portfolio heatmap shows colored dots
[ ] Clicking a dot navigates to student detail
[ ] Survival curve chart renders with CI band
[ ] SHAP driver bars show with correct colors (red=risk, green=reduces)
[ ] LLM card loads (or fallback text shows) within 5 seconds
[ ] 3 intervention cards visible with lift percentages
[ ] Stress test slider changes the portfolio numbers
[ ] Alerts page shows pre-fired triggers
[ ] Marking an alert actioned works and removes it from the default view
[ ] Nursing student (Arun) shows regulatory note instead of standard risk card
[ ] Bias flag visible on Ananya and Meera's cards
```

**Demo script dry run:**
```
[ ] Run the full 8-minute demo script without touching the keyboard unexpectedly
[ ] Verify Arun's 5% P(3mo) shows "board exam delay — not risk" (the key moment)
[ ] Verify stress test slider updates within 1 second
[ ] LLM card generated text makes sense for the displayed student
[ ] All risk tier badges show correct colors
[ ] No console errors in browser
[ ] No 500 errors in terminal during full demo run
```

---

## Prompt Library — Copy-Paste Ready

These are standalone prompts for features you may need to fix or extend
during the build. Use them when stuck.

---

### Fix: SHAP values returning wrong direction

```
In backend/ml/shap_explainer.py, the get_top_drivers function is returning
incorrect directions. Debug by checking:

1. Print shap_values[0] for a known high-risk student (one with no internship)
2. The feature "internship_access_score" should have a NEGATIVE shap value
   (lower internship access = lower score = should increase risk)
   Wait — verify: does a LOWER internship_access_score INCREASE or DECREASE risk?
   If the model trained correctly: lower access = higher risk = POSITIVE shap value
3. Verify by printing the XGBoost model's feature_importances_ and checking
   the direction manually against a few training examples

If shap_values are returning as a 2D array (for binary classifiers):
   Use shap_values[1] (class 1 = high risk) not shap_values[0]
   The correct line is: shap_vals = explainer.shap_values(X)[1][0]
```

---

### Fix: Survival model concordance index too low

```
The Cox PH model concordance index is below 0.60 which indicates the model
is barely better than random. Debug by:

1. Check if the training DataFrame has enough variation in months_to_event
   Print: df_campus['months_to_event'].describe()
   If all values are 1-2, the model has no signal to learn from — increase
   the synthetic data variation range in generate_outcomes()

2. Check if ppo_binary is strongly predictive:
   Print: df.groupby('ppo_binary')['event_observed'].mean()
   If PPO students have 90%+ placement and no-PPO have 30%, the feature is working

3. Try reducing the penalizer from 0.1 to 0.01 for small datasets
   cph = CoxPHFitter(penalizer=0.01)

4. Check if months_to_event has any zeros — Cox PH requires duration > 0
   Fix: df['months_to_event'] = df['months_to_event'].clip(lower=0.5)
```

---

### Fix: MAPIE not fitting because of class imbalance

```
If MapieClassifier raises a ValueError about class distribution:

The risk_label might have too few positive examples (< 10%).
Fix by adjusting the risk_label threshold in features.py:
  Current: risk_label = 1 if event_observed=False or months_to_event > 6
  Change to: risk_label = 1 if event_observed=False or months_to_event > 4
  This will increase positive class proportion

Also check: cv=5 requires at least 5 examples per class per fold
If total positives < 50: reduce cv to 3
  mapie = MapieClassifier(estimator=risk_model, method="score", cv=3)
```

---

### Fix: React Query not refetching after alert is marked actioned

```
In src/pages/Alerts.tsx, after the PATCH call to /alerts/{id} resolves:

Add queryClient.invalidateQueries("alerts") to force a refetch.
The mutation should look like:

const mutation = useMutation(
  (data) => api.alerts.markActioned(alertId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries("alerts")
      queryClient.invalidateQueries(["risk", studentId])
    }
  }
)

If queryClient is not available in the component, wrap the component
in QueryClientProvider at the App.tsx level and use useQueryClient() hook.
```

---

### Extend: Add model_registry display to dashboard

```
In src/pages/Dashboard.tsx, add a small "Model status" card at the bottom:

Fetch: GET /portfolio (model_version field is included)

Display:
  Model version: v{model_registry.id}
  Last trained: {relative time, e.g., "2 days ago"}
  Training labels: {n_new_labels}
  Ensemble weights: S={survival_weight:.0%} C={cohort_weight:.0%} D={demand_weight:.0%}
  Concordance: {meta_learner_r2:.2f}

This makes the feedback loop tangible — judges see the system is learning.
Style: small gray card at dashboard bottom, all values in monospace font.
```

---

### Extend: Intervention catalog admin view

```
If time allows, add a read-only catalog view at /catalog:

Fetch all interventions from backend/data/intervention_catalog.py
Display as a table:
  Columns: Name, Category, Course families, Base lift, Cost tier, Delivery
  Sorted by base_lift descending
  Each row expandable to show lift_modifiers

This slide proves to judges that the intervention layer is designed,
not just described. It takes 30 minutes to build and answers C3 strongly.
```

---

### Emergency: Backend is down, present frontend with mock data

```
If the backend fails to start during the demo:

In src/api/client.ts, add a MOCK_MODE flag:
  const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

Create src/api/mock_data.ts with hardcoded responses for:
  - portfolio summary (20 students, 6 high risk, 3 alerts)
  - risk score for Ananya (the primary demo student)
  - interventions for Ananya

In each api function: if MOCK_MODE return mock data immediately

Set VITE_MOCK_MODE=true in frontend/.env.local to activate

This emergency mode lets you complete the demo even if the backend
is completely non-functional. Build this in Phase 0 as insurance.
```
