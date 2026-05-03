export interface StudentListItem {
  student_id: string;
  name: string | null;
  course_type: string;
  course_family: string;
  target_field: string;
  risk_score: number;
  risk_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  months_since_graduation: number;
  placement_status: string;
  institute_tier: string | null;
}

export interface StudentDetail extends StudentListItem {
  cgpa: number;
  internship_employer_tier: string;
  ppo_exists: boolean;
  cert_count: number;
  target_city_tier: number;
  loan_emi_monthly: number;
  data_trust_score: number;
}