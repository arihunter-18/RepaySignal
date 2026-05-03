import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { portfolioApi } from '../api/portfolio';
import { studentsApi } from '../api/students';
import { Topbar } from '../components/layout/Topbar';
import { PortfolioHeatmap } from '../components/portfolio/PortfolioHeatmap';
import { SectorExposureChart } from '../components/portfolio/SectorExposureChart';
import { StressTestSlider } from '../components/portfolio/StressTestSlider';
import { RiskBadge } from '../components/shared/RiskBadge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

function StatCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-colors">
      <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-sm text-white/50 mt-1 font-body">{label}</div>
      {sub && <div className="text-xs text-white/20 mt-0.5 font-body">{sub}</div>}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getSummary,
    refetchInterval: 30_000,
  });
  const { data: studentsList, isLoading: stuLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.list({ limit: 100 }),
  });

  if (sumLoading || stuLoading) return <LoadingSpinner label="Loading portfolio..." />;

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Portfolio dashboard" subtitle="Education loan risk map" />
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total borrowers" value={summary?.total_students ?? 0} />
          <StatCard label="High risk" value={summary?.high_risk_count ?? 0} color="text-red-400" />
          <StatCard label="Active alerts" value={summary?.recent_alerts?.length ?? 0} color="text-amber-400" />
          <StatCard label="Avg risk score" value={`${((summary?.avg_risk_score ?? 0) * 100).toFixed(1)}%`} color="text-purple-400" />
        </div>

        {/* Heatmap + Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-display font-semibold text-white/70 mb-4">Risk map</h2>
            {studentsList && <PortfolioHeatmap students={studentsList} />}
          </div>
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-display font-semibold text-white/70 mb-4">Sector exposure</h2>
            {summary?.sector_exposure && <SectorExposureChart data={summary.sector_exposure} />}
          </div>
        </div>

        {/* Stress test + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-display font-semibold text-white/70 mb-4">Sector stress test</h2>
            {summary?.sector_exposure && <StressTestSlider sectors={summary.sector_exposure} />}
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-display font-semibold text-white/70">Recent alerts</h2>
              <button onClick={() => navigate('/alerts')}
                className="text-xs text-purple-400 hover:text-purple-300 font-body">
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {!summary?.recent_alerts?.length && (
                <p className="text-sm text-white/20 font-body">No active alerts</p>
              )}
              {summary?.recent_alerts?.map(alert => (
                <div key={alert.id} onClick={() => navigate(`/student/${alert.student_id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 cursor-pointer transition-colors border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/80 font-body">{alert.student_name}</div>
                    <div className="text-xs text-white/30 font-body">{alert.trigger_name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                      alert.severity === 'high'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>{alert.severity}</span>
                    {alert.deadline && <span className="text-xs text-white/20 font-body">{alert.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model registry */}
        {summary?.model_version && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4 font-mono text-xs text-white/20">
            <span className="text-white/40 mr-4 font-body font-medium">Model status</span>
            v{summary.model_version.id} · {new Date(summary.model_version.retrained_at).toLocaleDateString()}
            · R²={summary.model_version.meta_learner_r2?.toFixed(2)}
            · Labels={summary.model_version.n_new_labels}
          </div>
        )}
      </div>
    </div>
  );
}