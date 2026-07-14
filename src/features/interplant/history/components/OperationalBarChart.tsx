import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type ChartDatum = {
  id: string;
  name: string;
  value: number;
  detail: string;
};

function formatValue(value: number, valueSuffix: string) {
  return `${value.toLocaleString("es-MX", {
    maximumFractionDigits: 1,
  })}${valueSuffix}`;
}

export function OperationalBarChart({
  title,
  items,
  valueSuffix = "",
  emptyMessage = "No hay información para el rango seleccionado.",
}: OperationalBarChartProps) {
  const data: ChartDatum[] = items.map((item) => ({
    id: item.id,
    name: item.label,
    value: item.value,
    detail: item.detail ?? "",
  }));

  const chartHeight = Math.max(230, data.length * 48 + 48);

  return (
    <section className="rounded-sm border border-line bg-panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {title}
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {data.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">{emptyMessage}</p>
      ) : (
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 34, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-line)"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                allowDecimals={valueSuffix.length > 0}
                tick={{
                  fill: "var(--color-muted)",
                  fontFamily: "var(--font-ibm-plex-mono)",
                  fontSize: 9,
                }}
                tickFormatter={(value) => formatValue(Number(value), valueSuffix)}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={105}
                tick={{
                  fill: "var(--color-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 10,
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-line)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const datum = payload[0].payload as ChartDatum;

                  return (
                    <div className="max-w-56 rounded-sm border border-line-strong bg-panel-strong p-3 shadow-xl">
                      <p className="text-xs font-bold text-white">
                        {datum.name}
                      </p>
                      <p className="mt-1 font-ibm-plex-mono text-sm font-semibold text-principal">
                        {formatValue(datum.value, valueSuffix)}
                      </p>
                      {datum.detail && (
                        <p className="mt-1 text-[10px] leading-4 text-muted">
                          {datum.detail}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="value"
                name={title}
                fill="var(--color-principal)"
                radius={[0, 4, 4, 0]}
                maxBarSize={22}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
