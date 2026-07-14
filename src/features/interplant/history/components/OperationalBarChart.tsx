type OperationalBarChartItem = {
  id: string;
  label: string;
  value: number;
  detail?: string;
};

type OperationalBarChartProps = {
  title: string;
  items: OperationalBarChartItem[];
  valueSuffix?: string;
  emptyMessage?: string;
};

export function OperationalBarChart({
  title,
  items,
  valueSuffix = "",
  emptyMessage = "No hay información para el rango seleccionado.",
}: OperationalBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <section className="rounded-sm border border-line bg-panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {title}
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const width =
              maxValue > 0 ? Math.max((item.value / maxValue) * 100, 3) : 0;

            return (
              <div key={item.id}>
                <div className="mb-1.5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{item.label}</p>
                    {item.detail && (
                      <p className="mt-0.5 truncate text-[10px] text-muted">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-ibm-plex-mono text-xs font-semibold text-principal">
                    {item.value.toLocaleString("es-MX", {
                      maximumFractionDigits: 1,
                    })}
                    {valueSuffix}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-dark">
                  <div
                    className="h-full rounded-full bg-principal transition-[width] duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
