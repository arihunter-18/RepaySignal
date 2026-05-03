interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  return (
    <header className="bg-[#16161D]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-base font-display font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/30 mt-0.5 font-body">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-body">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>
    </header>
  );
}