import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";

type ControlTowerActivityChartProps = {
  events: UnitMovementEvent[];
  now: Date;
};

function startOfHour(date: Date) {
  const value = new Date(date);
  value.setMinutes(0, 0, 0);
  return value;
}

export function ControlTowerActivityChart({
  events,
  now,
}: ControlTowerActivityChartProps) {
  const data = useMemo(() => {
    const currentHour = startOfHour(now);

    return Array.from({ length: 6 }, (_, index) => {
      const bucketStart = new Date(
        currentHour.getTime() - (5 - index) * 60 * 60 * 1_000,
      );
      const bucketEnd = new Date(bucketStart.getTime() + 60 * 60 * 1_000);
      const count = events.filter((event) => {
        const eventTime = new Date(event.eventAt).getTime();
        return eventTime >= bucketStart.getTime() && eventTime < bucketEnd.getTime();
      }).length;

      return {
        hour: new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          hour12: false,
        }).format(bucketStart),
        eventos: count,
      };
    });
  }, [events, now]);

  return (
    <section className="rounded-xl border border-line bg-panel/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-barlow-condensed text-sm font-bold uppercase tracking-[0.08em]">
            Actividad por hora
          </p>
          <p className="mt-1 font-ibm-plex-mono text-[10px] text-muted">
            Cambios de estado recientes
          </p>
        </div>
        <span className="font-ibm-plex-mono text-2xl font-semibold text-principal">
          {events.length}
        </span>
      </div>

      <div className="mt-4 h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="controlTowerActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8a33d" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#e8a33d" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8f887c", fontSize: 10 }}
            />
            <Tooltip
              cursor={{ stroke: "#e8a33d", strokeOpacity: 0.2 }}
              contentStyle={{
                background: "#1c1914",
                border: "1px solid #3a352d",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#b9b2a5" }}
            />
            <Area
              type="monotone"
              dataKey="eventos"
              stroke="#e8a33d"
              strokeWidth={2.5}
              fill="url(#controlTowerActivity)"
              isAnimationActive
              animationDuration={550}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
