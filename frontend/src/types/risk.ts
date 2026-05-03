export interface ShapDriver {
  feature: string;
  direction: 'increases_risk' | 'reduces_risk';
  magnitude: number;
  display: string;
}

export interface BiasFlag {
  attribute: string;
  dpd: number;
  warning: string;
}

export interface RiskScore {
  student_id: string;
  risk_score: number;
  ci_lower: number;
  ci_upper: number;
  ci_width: number;
  p_3mo: number;
  p_6mo: number;
  p_12mo: number;
  predicted_salary_lower: number;
  predicted_salary_upper: number;
  repayment_stress_index: number;
  repayment_stress_label: string;
  shap_drivers: ShapDriver[];
  bias_flags: BiasFlag[];
  data_trust_weight: number;
  course_family: string;
  regulatory_note: string | null;
  needs_human_review: boolean;
  scored_at?: string;
}