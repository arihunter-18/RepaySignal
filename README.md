# RepaySignal MVP

**RepaySignal** is an AI-powered education loan repayment risk scoring engine. It acts as an early warning and intervention system for lenders and educational institutions. Instead of relying purely on historical financial data (which students lack), RepaySignal analyzes employability indicators, institutional quality, target job market demand, and academic engagement to predict the likelihood of on-time loan repayment.

This repository holds the Minimum Viable Product (MVP) designed for a hackathon submission. It includes a comprehensive synthetic data engine, a multi-model machine learning pipeline, and a FastAPI backend.

---

## 🚀 Current Status (Phase 0–3 Completed)

The machine learning core and data pipeline are **100% complete and verified**.

### What's Implemented:
1. **Synthetic Data Engine** (`backend/data/`):
   - Generates highly realistic, non-linear student profiles (2,000 records).
   - Simulates Missing At Random (MAR) logic, unobservable latents (interview skills, network strength), multi-directional label noise, and operational text scars (typos).
   - Generates a volatile 18-month time series for 12 macro job sectors (`demand_index_mock.py`).

2. **Database & ORM** (`backend/models/`):
   - Fully normalized SQLite schema holding `institutes`, `students`, `outcomes`, `demand_index`, `model_registry`, `risk_scores`, and `alert_states`.
   - Populated using `scripts/setup_db.py` and `backend/data/seed_db.py`.

3. **Feature Engineering Pipeline** (`backend/ml/features.py`):
   - Fully vectorized Pandas operations.
   - Computes complex metrics: `cgpa_percentile` (relative to graduation cohort), `internship_access_score` (relative to institute tier), and `repayment_stress_index`.
   - **Trust Score Attenuation:** Automatically attenuates noisy features from low-trust, Tier-3 institutes toward the population mean to prevent data poisoning.

4. **Machine Learning Engines** (`backend/ml/`):
   - **Survival Sub-Engine:** Trains `lifelines` Cox Proportional Hazards models segmented by course family (Campus, Market, Regulatory). Successfully handles collinearity and interval censorship.
   - **Cohort & Salary Sub-Engines:** XGBoost classifiers and regressors that use the institute's `data_trust_score` as the `sample_weight` during training.
   - **Ensemble Meta-Learner:** A `RidgeCV` mixture-of-experts trained using `TimeSeriesSplit` on graduation cohorts to prevent temporal leakage.
   - **Uncertainty & Explainability:** Includes a `mapie` Conformal Prediction wrapper for calibrated confidence intervals (identifying students who need human review), and `shap` TreeExplainers for granular risk drivers.
   - **Fairness:** Integrates `fairlearn` to flag structural disadvantages via Demographic Parity Difference (DPD).

---

## 🛠️ Local Setup & Training

### 1. Requirements

Ensure you have Python 3.11+ installed. The environment uses `pydantic-settings`, `xgboost`, `lifelines`, `shap`, and `mapie`.

Install dependencies:
```bash
pip install -r backend/requirements.txt
```

### 2. Database Initialization & Seeding

The MVP is configured to use a local SQLite database (`repaysignal.db`) by default. 

Run the setup and seeding scripts:
```bash
# Create the SQLite tables
python scripts/setup_db.py

# Seed the database with 2,000 synthetic students, 50 institutes, and demand data
python backend/data/seed_db.py
```

### 3. Model Training Pipeline

Once the database is seeded, you can run the master ML orchestration script. This script executes a 9-step training pipeline: it builds the master dataframe, trains the Cox PH models, trains the XGBoost classifiers, calculates SHAP and MAPIE explainers, fits the RidgeCV ensemble, and registers the artifacts.

```bash
# Run the orchestration script
python scripts/train_models.py
```

On success, you will see `Cached artifacts (9)` successfully saved to the `/models_cache/` directory.

---

## 🗺️ Next Steps
- **Phase 4:** Develop FastAPI Endpoints (`backend/routers/`) to serve predictions, aggregated portfolio views, and alert states.
- **Phase 5:** Build React 18 + TypeScript frontend dashboard.
- **Phase 6:** Integrate the LLM Risk Card layer (Claude/OpenAI) using the SHAP explanation outputs.
