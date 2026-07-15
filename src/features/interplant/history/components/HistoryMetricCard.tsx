type HistoryMetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function HistoryMetricCard({
  label,
  value,
  detail,
}: HistoryMetricCardProps) {
  return (
    <article className="rounded-sm border border-line bg-panel p-3">
      <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-barlow-condensed text-2xl font-bold text-principal">
        {value}
      </p>
      {detail && <p className="mt-1 text-[10px] text-muted">{detail}</p>}
    </article>
  );
}
