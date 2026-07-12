import type { IncidentMetrics } from "../../incidents/utils/incident-metrics";

type ClosingIncidentSummaryProps = {
  incidentMetrics: IncidentMetrics;
};

export function ClosingIncidentSummary({
  incidentMetrics,
}: ClosingIncidentSummaryProps) {
  const kpis = [
    {
      label: "Incidencias totales",
      value: incidentMetrics.totalIncidents,
    },
    {
      label: "Abiertas",
      value: incidentMetrics.openIncidents,
    },
    {
      label: "Resueltas",
      value: incidentMetrics.resolvedIncidents,
    },
    {
      label: "Alta severidad",
      value: incidentMetrics.highSeverityIncidents,
    },
  ];

  return (
    <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Resumen de incidencias</h3>
        <p className="text-sm text-slate-400 light:text-slate-500">
          Se guardará como evidencia al cerrar el turno.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 light:border-slate-200 light:bg-slate-50"
          >
            <p className="text-sm text-slate-400 light:text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
