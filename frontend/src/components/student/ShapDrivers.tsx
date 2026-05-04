import type { ShapDriver } from '../../types';

interface Props { drivers: ShapDriver[] }

const FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  cgpa_percentile:          { label: 'CGPA Percentile',      icon: '🎓' },
  internship_access_score:  { label: 'Internship Quality',   icon: '💼' },
  ppo_binary:               { label: 'PPO Status',           icon: '✅' },
  demand_percentile:        { label: 'Market Demand',        icon: '📈' },
  months_since_graduation:  { label: 'Job Gap Duration',     icon: '📅' },
  cert_count_norm:          { label: 'Certifications',       icon: '📜' },
  placement_gap_months:     { label: 'Placement Gap',        icon: '⏱' },
  data_trust_weight:        { label: 'Data Trust Score',     icon: '🔒' },
};

export function ShapDrivers({ drivers }: Props) {
  if (!drivers?.length) return <p className="text-sm text-slate-400">No SHAP data available</p>;

  // Use fallback 0 for maxMag calculation
  const maxMag = Math.max(...drivers.map(d => Math.abs(d.value ?? 0)), 0.001);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Positive values increase risk · Negative values reduce risk
      </p>
      {drivers.map((d, i) => {
        const meta = FEATURE_LABELS[d.feature] || { label: d.feature, icon: '◉' };
        
        // Safety: Extract value with a fallback to 0
        const val = d.value ?? 0;
        const isPositive = val > 0;
        const pct = Math.abs(val) / maxMag * 100;

        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{meta.icon}</span>
                <span className="text-sm text-slate-700">{meta.label}</span>
              </div>
              <span className={`text-xs font-mono font-medium ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                {isPositive ? '+' : ''}{val.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex-1 flex justify-end">
                {!isPositive && (
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }} />
                )}
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex-1">
                {isPositive && (
                  <div className="bg-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}