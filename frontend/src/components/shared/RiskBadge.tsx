interface Props {
  score: number;
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  size?: 'sm' | 'lg';
}

const STYLES = {
  HIGH:   { bg: 'bg-red-500/10 border-red-500/30 text-red-400' },
  MEDIUM: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  LOW:    { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
};

export function RiskBadge({ score, tier, size = 'sm' }: Props) {
  const base = size === 'lg'
    ? 'px-4 py-1.5 text-sm font-medium rounded-xl border'
    : 'px-2.5 py-0.5 text-xs font-medium rounded-full border';
  return (
    <span className={`inline-flex items-center gap-1.5 ${base} ${STYLES[tier].bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        tier === 'HIGH' ? 'bg-red-400' : tier === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
      }`} />
      {tier} · {(score * 100).toFixed(0)}%
    </span>
  );
}