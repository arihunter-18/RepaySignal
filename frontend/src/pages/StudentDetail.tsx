import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStudentDetail } from '../hooks/useStudents';
import { useRiskScore, useRiskCard } from '../hooks/useRisk';
import { useAlerts, useMarkActioned } from '../hooks/useAlerts';
import { useQuery } from '@tanstack/react-query';
import { interventionsApi } from '../api/interventions';
import { Topbar } from '../components/layout/Topbar';
import { RiskBadge } from '../components/shared/RiskBadge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SurvivalCurveChart } from '../components/student/SurvivalCurveChart';
import { ShapDriverBars } from '../components/student/ShapDriverBars';
import { InterventionPanel } from '../components/student/InterventionPanel';

function getRiskTier(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actionTexts, setActionTexts] = useState<Record<string, string>>({});

  const { data: student, isLoading: sLoading } = useStudentDetail(id);
  const { data: riskScore, isLoading: rLoading } = useRiskScore(id);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(id);
  const { data: alertsList } = useAlerts('triggered');
  const { data: interventionData } = useQuery({
    queryKey: ['interventions', id],
    queryFn: () => interventionsApi.getByStudentId(id!),
    enabled: !!id,
  });
  const markActioned = useMarkActioned();

  if (sLoading || rLoading) return <LoadingSpinner label="Loading risk card..." />;
  if (!student || !riskScore) return <div className="p-6 text-white/30 font-body">Student not found.</div>;

  const tier = getRiskTier(riskScore.risk_score);
  const studentAlerts = (alertsList || []).filter((a: any) => a.student_id === id);

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title={student.name || 'Student detail'} subtitle={`${student.course_type} · ${student.target_field}`} />
      <div className="p-6 max-w-7xl">
        <button onClick={() => navigate('/dashboard')}
          className="text-sm text-purple-400 hover:text-purple-300 mb-5 flex items-center gap-1 font-body">
          ← Back to portfolio
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — Identity */}
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                  student.institute_tier === 'tier_1' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                  student.institute_tier === 'tier_2' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                  'text-white/30 bg-white/5 border-white/10'
                }`}>{student.institute_tier}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                  student.placement_status === 'placed'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>{student.placement_status}</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-white">{student.name || 'Student'}</h2>
              <p className="text-sm text-white/40 font-body mt-0.5">{student.course_type} · {student.target_field}</p>
              <p className="text-xs text-white/20 font-body mt-1">{student.months_since_graduation} months post-graduation</p>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-xs text-white/30 font-body">
                <div>EMI: ₹{Number(student.loan_emi_monthly).toLocaleString('en-IN')}/mo</div>
                <div>CGPA: {student.cgpa} · Certs: {student.cert_count}</div>
                <div>Internship: {student.internship_employer_tier}</div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-white/20 font-body mb-1">Data trust score</p>
                <div className="bg-white/5 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(student.data_trust_score || 0.5) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 text-center">
              <RiskBadge score={riskScore.risk_score} tier={tier} size="lg" />
              <p className="text-xs text-white/25 mt-2 font-body">
                80% CI: {(riskScore.ci_lower * 100).toFixed(0)}%–{(riskScore.ci_upper * 100).toFixed(0)}%
              </p>
              {riskScore.needs_human_review && (
                <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 font-body">
                  ⚠ Wide uncertainty — human review recommended
                </div>
              )}
              {riskScore.regulatory_note && (
                <div className="mt-3 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left font-body">
                  {riskScore.regulatory_note}
                </div>
              )}
            </div>

            {riskScore.bias_flags?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-xs text-amber-300/70 font-body">
                <div className="font-medium text-amber-400 mb-1">⚠ Bias flag</div>
                {riskScore.bias_flags.map((f: any, i: number) => (
                  <p key={i} className="mt-1">{f.warning}</p>
                ))}
              </div>
            )}
          </div>

          {/* MIDDLE — Charts + AI card */}
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs text-white/30 font-body mb-3">Placement probability curve</h3>
              <SurvivalCurveChart p_3mo={riskScore.p_3mo} p_6mo={riskScore.p_6mo} p_12mo={riskScore.p_12mo} />
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs text-white/30 font-body">Repayment stress</h3>
                <span className={`text-xs font-mono ${
                  riskScore.repayment_stress_label === 'CRITICAL' ? 'text-red-400' :
                  riskScore.repayment_stress_label === 'HIGH' ? 'text-orange-400' :
                  riskScore.repayment_stress_label === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{riskScore.repayment_stress_label}</span>
              </div>
              <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all ${
                  riskScore.repayment_stress_index > 0.7 ? 'bg-red-500' :
                  riskScore.repayment_stress_index > 0.5 ? 'bg-orange-500' :
                  riskScore.repayment_stress_index > 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} style={{ width: `${Math.min(riskScore.repayment_stress_index / 2 * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-white/20 mt-2 font-body">
                ₹{(riskScore.predicted_salary_lower / 100000).toFixed(1)}–{(riskScore.predicted_salary_upper / 100000).toFixed(1)}L predicted
              </p>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <ShapDriverBars drivers={riskScore.shap_drivers} />
            </div>

            <div className="bg-purple-500/5 border-l-2 border-purple-500/30 border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-purple-400/60 font-body mb-2 uppercase tracking-wider">AI assessment</p>
              {cardLoading ? (
                <LoadingSpinner label="Generating..." />
              ) : riskCard ? (
                <p className="text-sm text-white/60 font-body leading-relaxed">{riskCard.risk_summary}</p>
              ) : (
                <p className="text-sm text-white/20 font-body">Unavailable</p>
              )}
            </div>
          </div>

          {/* RIGHT — Interventions + Alerts */}
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs text-white/30 font-body mb-4">Recommended actions</h3>
              {interventionData?.interventions ? (
                <InterventionPanel interventions={interventionData.interventions} />
              ) : (
                <p className="text-sm text-white/20 font-body">Loading interventions...</p>
              )}
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs text-white/30 font-body mb-3">Active alerts</h3>
              {studentAlerts.length === 0 && (
                <p className="text-sm text-white/20 font-body">No active alerts</p>
              )}
              {studentAlerts.map((alert: any) => (
                <div key={alert.id} className="border border-white/5 rounded-xl p-3 mb-3 bg-white/2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white/70 font-body">{alert.trigger_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                      alert.severity === 'high'
                        ? 'text-red-400 bg-red-500/10 border-red-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>{alert.severity}</span>
                  </div>
                  {alert.deadline && <p className="text-xs text-white/20 mb-2 font-body">Due: {alert.deadline}</p>}
                  <textarea value={actionTexts[alert.id] || ''} rows={2} placeholder="Describe action taken..."
                    onChange={e => setActionTexts(p => ({ ...p, [alert.id]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/60 placeholder-white/15 resize-none outline-none focus:border-purple-500/40 font-body" />
                  <button
                    onClick={() => markActioned.mutate({ alertId: alert.id, action_taken: actionTexts[alert.id] || '' })}
                    disabled={!actionTexts[alert.id] || markActioned.isPending}
                    className="mt-2 w-full text-xs bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 text-white rounded-lg py-1.5 transition-colors font-body">
                    {markActioned.isPending ? 'Saving...' : 'Mark actioned'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}