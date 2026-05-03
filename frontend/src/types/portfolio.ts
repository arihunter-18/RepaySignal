export interface SectorExposure {
  field: string;
  student_count: number;
  avg_risk: number;
  demand_percentile: number;
}

export interface RecentAlert {
  id: string;
  student_id: string;
  student_name: string;
  trigger_name: string;
  severity: string;
  deadline: string | null;
  state: string;
}

export interface PortfolioSummary {
  total_students: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_risk_score: number;
  sector_exposure: SectorExposure[];
  recent_alerts: RecentAlert[];
  model_version: any;
}