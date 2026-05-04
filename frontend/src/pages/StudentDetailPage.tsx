import { useParams, useNavigate } from 'react-router-dom';
import { useStudent, useRisk, useRiskCard, useInterventions, useAlerts } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskBadge } from '../components/shared/RiskBadge';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskGauge } from '../components/student/RiskGauge';
import ReactMarkdown from 'react-markdown';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading: sLoading } = useStudent(id);
  const { data: risk, isLoading: rLoading } = useRisk(id);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(id);
  const { data: interventions } = useInterventions(id);
  const { data: alertsList } = useAlerts('triggered');

  if (sLoading || rLoading) return <Spinner label="Loading student risk card..." size="lg" />;
  if (!student) return <div className="p-6 text-slate-400">Student not found.</div>;
  if (!risk) return <div className="p-6 text-slate-400">Risk data unavailable.</div>;

  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW';
  const studentAlerts = (alertsList || []).filter((a: any) => a.student_id === id);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <PageHeader
        title={student.name}
        subtitle={`${student.course_type} · ${student.target_field} · ${student.months_since_graduation}mo post-grad`}
        actions={
          <div className="flex items-center gap-3">
            <RiskBadge tier={tier} score={risk.risk_score} size="md" />
            <button onClick={() => navigate(-1)}
              className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">
              ← Back
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
        {/* Changed items-stretch to ensure columns match height */}
        <div className="grid grid-cols-12 gap-5 items-stretch">

          {/* Column 1: Identity card */}
          <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
            <Card className="h-full flex flex-col" padding="md">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-semibold text-slate-600 mx-auto mb-3">
                  {student.name?.charAt(0)}
                </div>
                <p className="font-semibold text-slate-800">{student.name}</p>
                <p className="text-xs text-slate-400">{student.course_type}</p>
              </div>
              <div className="space-y-2.5 text-xs flex-1">
                {[
                  { label: 'Institute', value: student.institute_tier },
                  { label: 'CGPA', value: student.cgpa?.toFixed(2) },
                  { label: 'Internship', value: student.internship_employer_tier },
                  { label: 'PPO', value: student.ppo_exists ? 'Yes' : 'No' },
                  { label: 'Certs', value: student.cert_count },
                  { label: 'EMI', value: `₹${Number(student.loan_emi_monthly).toLocaleString('en-IN')}/mo` },
                  { label: 'City Tier', value: `Tier ${student.target_city_tier}` },
                  { label: 'Data Trust', value: `${((student.data_trust_score || 0.5) * 100).toFixed(0)}%` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-medium text-slate-700">{item.value ?? '—'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  student.placement_status === 'placed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>{student.placement_status}</span>
              </div>
            </Card>
          </div>

          {/* Column 2: Gauge + Timeline */}
          <div className="col-span-12 lg:col-span-3 space-y-5 flex flex-col h-full">
            <Card padding="md" className="flex-1 flex flex-col justify-center">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Risk Score</h2>
              <RiskGauge score={risk.risk_score}
                label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
              {risk.needs_human_review && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700">
                  ⚠ Wide uncertainty — human review recommended
                </div>
              )}
            </Card>
            <Card padding="md" className="flex-1 flex flex-col justify-center">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Placement Timeline</h2>
              <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
            </Card>
          </div>

          {/* Column 3: SHAP + AI card */}
          <div className="col-span-12 lg:col-span-3 space-y-5 flex flex-col h-full">
            <Card padding="md" className="flex-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Risk Drivers (SHAP)</h2>
              <ShapDrivers drivers={risk.shap_drivers} />
            </Card>
            <Card className="border-l-4 border-l-blue-500 flex-1 flex flex-col" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">AI Assessment</h2>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[250px]">
                {cardLoading ? <Spinner size="sm" /> :
                  riskCard ? (
                    <div className="text-xs text-slate-600 leading-relaxed markdown-container">
                      <ReactMarkdown 
                        components={{
                          h2: ({node, ...props}) => <h3 className="font-bold text-slate-800 mt-3 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />
                        }}
                      >{riskCard.risk_summary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">AI narrative unavailable</p>
                  )
                }
              </div>
            </Card>
          </div>

          {/* Column 4: Interventions + Alerts */}
          <div className="col-span-12 lg:col-span-3 space-y-5 flex flex-col h-full">
            <Card padding="md" className="flex-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Interventions</h2>
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                 <InterventionCards interventions={interventions?.interventions || []} />
              </div>
            </Card>
            {studentAlerts.length > 0 && (
              <Card padding="md" className="shrink-0">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">Active Alerts</h2>
                <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin pr-1">
                  {studentAlerts.map((a: any) => (
                    <div key={a.id} className={`text-xs p-3 rounded-lg border ${
                      a.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <p className="font-medium">{a.trigger_name}</p>
                      <p className="text-slate-500 mt-0.5">Due: {a.deadline}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}