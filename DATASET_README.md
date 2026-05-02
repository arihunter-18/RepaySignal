# RepaySignal Synthetic Dataset Architecture

## Overview

RepaySignal is a **high-fidelity synthetic dataset** designed to simulate a real-world student employability ecosystem.
Unlike traditional synthetic datasets that rely on deterministic rules or linear relationships, this dataset models:

* **Partial observability** through latent variables
* **Non-linear interactions and stochastic processes**
* **Heavy-tailed outcomes and rare extreme events**
* **Operational data imperfections (noise, missingness, formatting inconsistencies)**

The entire pipeline is **fully reproducible**, driven by a centralized configuration and deterministic seeding.

---

## Data Architecture

The dataset follows a **three-table relational design**, reflecting real-world data collection pipelines.

### 1. `synthetic_institutes.csv`

Represents institutional-level characteristics.

* **Tier (1, 2, 3):** Encodes structural advantages and opportunity access
* **Data Trust Score:** Controls likelihood of data corruption (typos, formatting issues, missing values)

This table acts as a **source of both opportunity bias and data quality variation**.

---

### 2. `synthetic_students.csv`

Contains observable student features with realistic imperfections.

#### Academic Features

* `cgpa`: Primary academic metric with multimodal distribution
* `10th_board_score`, `12th_board_score`:

  * Noisy, partially correlated academic proxies
  * Designed to introduce **redundancy and feature collinearity**
  * Prevent trivial linear reconstruction

#### Profile Characteristics

* `internship_count`, `ppo_exists`, `cert_count`
* Weakly structured but non-deterministic relationships

#### Edge Cases

* `has_profile_contradiction`

  * Explicitly marks cases like high CGPA with zero internships
  * Ensures models encounter **realistic inconsistencies**

#### Data Quality Artifacts

* `is_scarred`: Indicates rows affected by:

  * casing inconsistencies
  * trailing whitespace
* Error probability is **correlated with institute-level trust score**

---

### 3. `synthetic_outcomes.csv`

Contains target variables and outcome signals.

#### Core Targets

* `event_observed`: noisy observed placement label
* `true_event_observed`: underlying ground truth
* `months_to_event`: time-to-placement (supports survival analysis)

#### Compensation

* `actual_salary`:

  * Driven by latent traits and stochastic factors
  * Bounded using **soft saturation (tanh)** to avoid unrealistic explosions
  * Retains heavy-tailed behavior without instability

#### Noise Transparency

* `is_noisy_label`: indicates label corruption
* `noise_type`: explicitly tracks source:

  * `clerical`
  * `false_negative_tier3`
  * `false_positive`

---

## Core Generative Design

### Latent Variables (Partial Observability)

Hidden traits (`interview_skill`, `network_strength`, `market_luck`) drive outcomes.

* Weakly correlated with observable features
* Dominated by independent noise (`~ N(0, 1.5)`)
* **Not accessible to the model pipeline (strict separation enforced)**

This ensures:

> Models must infer signals indirectly rather than reconstruct hidden variables.

---

### Macroeconomic Dynamics

Macroeconomic conditions are simulated using a **stochastic random walk**:

* Year-over-year drift via cumulative Gaussian noise
* No hardcoded regime switches
* Produces gradual trends with occasional fluctuations

---

### Outcome Generation

Placement probability is modeled using:

* Non-linear feature interactions
* Latent variable influence
* Asymmetric noise injection

Noise model:

* Combination of **Gaussian + Exponential components**
* Reflects real-world asymmetry:

  > failing is more common than unexpected success

---

### Anomaly Modeling

Rare extreme cases emerge via:

* Lognormal anomaly scaling
* Conditional amplification of outcomes

These are:

* **emergent**, not rule-based
* controlled to prevent unrealistic distribution collapse

---

## Data Quality Simulation

The dataset explicitly models real-world imperfections:

* Missing values (MAR mechanism tied to institute tier)
* Label noise (multi-directional and tracked)
* Formatting inconsistencies (string-level corruption)

This enables testing:

* robustness
* preprocessing pipelines
* feature cleaning strategies

---

## Validation Strategy

A baseline model is included to validate dataset quality:

* Metrics:

  * Accuracy (target: 60–85%)
  * ROC-AUC
  * Confusion matrix

Interpretation:

* High accuracy (>85%) → potential leakage
* Low accuracy (<60%) → insufficient signal
* Target range ensures **balanced learnability and uncertainty**

---

## Design Guarantees

The dataset enforces:

* **No feature leakage** (latent variables never exposed)
* **Non-deterministic relationships**
* **Overlapping class distributions**
* **Controlled signal-to-noise ratio**

---

## Intended Use Cases

This dataset is suitable for:

* Feature selection under multicollinearity
* Robust model evaluation under noisy labels
* Survival analysis (`months_to_event`)
* Handling real-world messy data pipelines
* Benchmarking tree-based and probabilistic models

---

## Summary

RepaySignal is designed to behave like a **real-world system rather than a synthetic toy dataset**.

It challenges models to:

* handle uncertainty
* learn weak signals
* remain robust to noise and inconsistencies

while maintaining **statistical stability and reproducibility**.
