interface Props {
  p_3mo: number;
  p_6mo: number;
  p_12mo: number;
}

export function PlacementTimeline({ p_3mo, p_6mo, p_12mo }: Props) {
  const points = [
    { label: '3 months', value: p_3mo, icon: '◷' },
    { label: '6 months', value: p_6mo, icon: '◷' },
    { label: '12 months', value: p_12mo, icon: '◷' },
  ];

  return (
    <div className="space-y-3">
      {points.map((pt, i) => {
        const pct = pt.value * 100;
        const color = pct >= 70 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-red-500';
        const textColor = pct >= 70 ? 'text-emerald-600' : pct >= 45 ? 'text-amber-600' : 'text-red-600';
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm text-slate-600">{pt.label}</span>
              </div>
              <span className={`text-sm font-semibold font-mono ${textColor}`}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400 pt-1">
        Probability of placement within timeframe · 80% CI
      </p>
    </div>
  );
}