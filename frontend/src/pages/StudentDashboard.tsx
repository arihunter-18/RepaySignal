import { useSession, STUDENT_SESSION } from '../context/SessionContext';
import { useRisk, useRiskCard, useInterventions } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskGauge } from '../components/student/RiskGauge';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { WhatIfSimulator } from '../components/student/WhatIfSimulator';
import { ActivityFeed } from '../components/student/ActivityFeed';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskBadge } from '../components/shared/RiskBadge';
import ReactMarkdown from 'react-markdown';

const SID = STUDENT_SESSION.student_id;

export function StudentDashboard() {
  const { student } = useSession();
  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(SID);
  const { data: interventionData, isLoading: iLoading } = useInterventions(SID);

  // Handle loading state for the entire page core metrics
  if (rLoading || iLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" label="Loading live risk profile..." />
      </div>
    );
  }

  // Handle Error state if the backend is unreachable
  if (rError || !risk) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-slate-800">API Connection Error</h2>
        <p className="text-slate-500">Unable to fetch live risk data. Please check your backend connection.</p>
      </div>
    );
  }

  const interventions = interventionData?.interventions || [];
  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW';

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <PageHeader
        title="My Risk Dashboard"
        subtitle={`${student.name} · ${student.course} · MBA`}
        actions={<RiskBadge tier={tier} score={risk.risk_score} size="md" />}
      />

      <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

        {/* Row 1 — Gauge + Timeline + Simulator */}
        <div className="grid grid-cols-12 gap-5 items-stretch">

          {/* Risk Gauge */}
          <Card className="col-span-12 sm:col-span-4 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Placement Risk</h2>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-0.5">Repayment Stress</p>
                    <p className={`font-semibold ${
                      risk.repayment_stress_index >= 0.7 ? 'text-red-600' :
                      risk.repayment_stress_index >= 0.5 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{risk.repayment_stress_label || 'MODERATE'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Salary Range</p>
                    <p className="font-semibold text-slate-700">
                      ₹{(risk.predicted_salary_lower / 100000).toFixed(1)}–{(risk.predicted_salary_upper / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Monthly EMI</p>
                    <p className="font-semibold text-slate-700">₹{student.loan_emi_monthly.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Data Trust</p>
                    <p className="font-semibold text-slate-700">{(risk.data_trust_weight * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              {risk.needs_human_review && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  ⚠ Wide uncertainty — human review recommended
                </div>
              )}
            </div>
          </Card>

          {/* Placement Timeline */}
          <Card className="col-span-12 sm:col-span-4 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Placement Timeline</h2>
            <div className="flex-1 flex items-center">
               <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
            </div>
          </Card>

          {/* What-If Simulator */}
          <Card className="col-span-12 sm:col-span-4 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">What-If Simulator</h2>
            <p className="text-xs text-slate-400 mb-4">See how actions change your risk score</p>
            <div className="flex-1">
              <WhatIfSimulator
                baseRisk={risk}
                currentProfile={{
                  cgpa: student.cgpa,
                  ppo_exists: student.ppo_exists,
                  internship_employer_tier: student.internship_employer_tier,
                  cert_count: student.cert_count,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Row 2 — SHAP + AI Card + Interventions */}
        <div className="grid grid-cols-12 gap-5 items-stretch">

          {/* SHAP Drivers */}
          <Card className="col-span-12 lg:col-span-4 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Risk Drivers</h2>
            <div className="flex-1">
               <ShapDrivers drivers={risk.shap_drivers} />
            </div>
          </Card>

          <Card className="col-span-12 lg:col-span-4 border-l-4 border-l-blue-500 flex flex-col h-full min-h-[320px] max-h-[420px]" padding="md">
  
  <h2 className="text-sm font-semibold text-slate-800 mb-1">AI Assessment</h2>
  <p className="text-xs text-slate-400 mb-3">Generated risk narrative</p>

  {/* Scrollable content */}
  <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
    {cardLoading ? (
      <Spinner size="sm" label="Generating..." />
    ) : riskCard ? (
      <div className="text-sm text-slate-600 leading-relaxed markdown-container">
        <ReactMarkdown 
          components={{
            h2: ({node, ...props}) => <h3 className="font-bold text-slate-800 mt-4 mb-2 border-b border-slate-100 pb-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />
          }}
        >
          {riskCard.risk_summary}
        </ReactMarkdown>
      </div>
    ) : (
      <div className="text-sm text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-200">
        <p className="font-medium text-slate-700 mb-1">Risk Summary</p>
        AI narrative unavailable for this profile.
      </div>
    )}
  </div>

  {/* Fixed bottom note */}
  {risk.regulatory_note && (
    <div className="mt-3 shrink-0 bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-700">
      {risk.regulatory_note}
    </div>
  )}
</Card>

          {/* Interventions */}
          <Card className="col-span-12 lg:col-span-4 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Recommended Actions</h2>
            <p className="text-xs text-slate-400 mb-4">Ranked by placement lift estimate</p>
            <div className="flex-1">
               <InterventionCards interventions={interventions} />
            </div>
          </Card>
        </div>

        {/* Row 3 — Profile stats + Activity feed */}
        <div className="grid grid-cols-12 gap-5 items-stretch">

          {/* Profile snapshot */}
          <Card className="col-span-12 lg:col-span-5 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">My Profile</h2>
            <div className="grid grid-cols-2 gap-4 flex-1 content-start">
              {[
                { label: 'CGPA', value: student.cgpa.toFixed(2), icon: '🎓' },
                { label: 'Internships', value: student.internship_count, icon: '💼' },
                { label: 'Certifications', value: student.cert_count, icon: '📜' },
                { label: 'PPO', value: student.ppo_exists ? 'Yes' : 'No', icon: '✅' },
                { label: '10th Score', value: `${student.tenth_board_score}%`, icon: '📝' },
                { label: '12th Score', value: `${student.twelfth_board_score}%`, icon: '📝' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity feed */}
          <Card className="col-span-12 lg:col-span-7 h-full flex flex-col" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Live Activity Feed</h2>
            <div className="flex-1">
               <ActivityFeed />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}