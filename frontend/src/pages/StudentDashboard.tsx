import { useAuth } from '../hooks/useAuth';
import { useRiskScore, useRiskCard } from '../hooks/useRisk';
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

export function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.student_id;

  const { data: riskScore, isLoading: rLoading } = useRiskScore(studentId ?? undefined);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(studentId ?? undefined);
  const { data: interventionData } = useQuery({
    queryKey: ['interventions', studentId],
    queryFn: () => interventionsApi.getByStudentId(studentId!),
    enabled: !!studentId,
  });

  if (!studentId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-body text-sm">No student account linked. Contact your lender.</p>
      </div>
    );
  }

  if (rLoading) return <LoadingSpinner label="Loading your risk profile..." />;

  const tier = riskScore ? getRiskTier(riskScore.risk_score) : 'LOW';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50"> {/* Added slate-50 page background */}
      <Topbar title="My risk card" subtitle="Your placement & repayment outlook" />
      <div className="p-6 max-w-5xl space-y-5">

        {/* Top summary: Swapped for high-contrast slate and subtle gradient */}
        <div className="bg-gradient-to-br from-purple-50 to-teal-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-slate-500 font-body mb-1">Hello, {user?.name}</p>
            <h2 className="font-display text-2xl font-bold text-slate-900">Your placement outlook</h2>
            {riskScore && (
              <p className="text-sm text-slate-600 font-body mt-1">
                3-month probability: <span className="font-semibold">{(riskScore.p_3mo * 100).toFixed(0)}%</span> · 
                6-month: <span className="font-semibold">{(riskScore.p_6mo * 100).toFixed(0)}%</span>
              </p>
            )}
          </div>
          {riskScore && <RiskBadge score={riskScore.risk_score} tier={tier} size="lg" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Survival curve: Solid white with border */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Placement probability</h3>
            {riskScore && (
              <SurvivalCurveChart p_3mo={riskScore.p_3mo} p_6mo={riskScore.p_6mo} p_12mo={riskScore.p_12mo} />
            )}
          </div>

          {/* Why this score: Solid white with border */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">What's driving your score</h3>
            {riskScore?.shap_drivers ? (
              <ShapDriverBars drivers={riskScore.shap_drivers} />
            ) : (
              <p className="text-sm text-slate-300 font-body">No data yet</p>
            )}
          </div>
        </div>

        {/* Repayment stress: Updated bar background and label contrast */}
        {riskScore && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Repayment stress index</h3>
              <span className={`text-xs font-mono font-bold ${
                riskScore.repayment_stress_label === 'CRITICAL' ? 'text-red-600' :
                riskScore.repayment_stress_label === 'HIGH' ? 'text-orange-600' :
                riskScore.repayment_stress_label === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'
              }`}>{riskScore.repayment_stress_label}</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2.5 mb-3">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${
                riskScore.repayment_stress_index > 0.7 ? 'bg-red-500' :
                riskScore.repayment_stress_index > 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} style={{ width: `${Math.min(riskScore.repayment_stress_index / 2 * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-500 font-body">
              Predicted salary: <span className="text-slate-900 font-semibold">₹{(riskScore.predicted_salary_lower / 100000).toFixed(1)}–{(riskScore.predicted_salary_upper / 100000).toFixed(1)}L/yr</span>
            </p>
          </div>
        )}

        {/* Interventions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Actions to improve your outlook</h3>
          {interventionData?.interventions ? (
            <InterventionPanel interventions={interventionData.interventions} />
          ) : (
            <p className="text-sm text-slate-400 font-body">Loading recommendations...</p>
          )}
        </div>

        {/* AI assessment: Adjusted for light purple theme */}
        <div className="bg-purple-50 border border-purple-100 border-l-4 border-l-purple-500 rounded-2xl p-5">
          <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">AI assessment</p>
          {cardLoading ? <LoadingSpinner label="Generating..." /> :
            riskCard ? <p className="text-sm text-slate-700 font-body leading-relaxed">{riskCard.risk_summary}</p> :
            <p className="text-sm text-slate-400 font-body">Unavailable</p>
          }
        </div>
      </div>
    </div>
  );
}