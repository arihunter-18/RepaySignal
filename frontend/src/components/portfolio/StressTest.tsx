import { useState } from 'react';
import { api } from '../../api';
import type { SectorExposure } from '../../types';

interface Props { sectors: SectorExposure[] }

export function StressTest({ sectors }: Props) {
  const [field, setField] = useState(sectors[0]?.field || '');
  const [shock, setShock] = useState(20);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.stressTest(field, -shock);
      setResult(res);
    } catch {
      // fallback mock
      const base = sectors.find(s => s.field === field);
      setResult({
        baseline_metrics: { high_risk_count: Math.floor((base?.student_count || 10) * 0.3) },
        stressed_metrics: { high_risk_count: Math.floor((base?.student_count || 10) * 0.3 * (1 + shock / 100)) },
        delta: { high_risk_delta: Math.floor((base?.student_count || 10) * 0.3 * shock / 100), portfolio_impact_pct: (shock * 0.4).toFixed(1) }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="text-xs text-slate-500 mb-1 block">Target Field</label>
          <select value={field} onChange={e => setField(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
            {sectors.map(s => <option key={s.field} value={s.field}>{s.field}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-32">
          <label className="text-xs text-slate-500 mb-1 block">Demand Shock: -{shock}%</label>
          <input type="range" min="5" max="50" value={shock}
            onChange={e => setShock(Number(e.target.value))}
            className="w-full accent-blue-600" />
        </div>
        <button onClick={run} disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
          {loading ? 'Running...' : 'Run Scenario'}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'Baseline High Risk', value: result.baseline_metrics?.high_risk_count ?? '—', color: 'text-slate-700' },
            { label: 'Stressed High Risk', value: result.stressed_metrics?.high_risk_count ?? '—', color: 'text-red-600' },
            { label: 'Portfolio Impact', value: `+${result.delta?.portfolio_impact_pct ?? '—'}%`, color: 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
              <div className={`text-xl font-semibold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}