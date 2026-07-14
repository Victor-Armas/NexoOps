import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Factory,
  TriangleAlert,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Incident } from "../../incidents/types/incident.types";
import type { IncidentMetrics } from "../../incidents/utils/incident-metrics";
import type { Plant } from "../../plants/types/plant.types";
import type { Shift } from "../../shifts/types/shift.types";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementClosingMetrics,
  PlantClosingMetrics,
} from "../utils/closing-metrics";

const CHART_COLORS = {
  principal: "#e8a33d",
  success: "#82ad70",
  danger: "#d95745",
  blue: "#79a7c8",
  muted: "#847c6c",
};

const tooltipStyle = {
  backgroundColor: "#1e1b16",
  border: "1px solid rgba(237, 230, 214, 0.18)",
  borderRadius: "6px",
  color: "#f4efe5",
  fontSize: "12px",
};

type ClosingOperationalReportProps = {
  shift: Shift;
  plantMetrics: PlantClosingMetrics;
  movementMetrics: MovementClosingMetrics;
  incidentMetrics: IncidentMetrics;
  reviewCountByPlantId: Record<string, number>;
  plants: Plant[];
  units: Unit[];
  unitMovements: UnitMovement[];
  incidents: Incident[];
};

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-sm border border-line bg-panel p-3">
      <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-barlow-condensed text-2xl font-bold text-principal">
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-4 text-muted">{detail}</p>
    </article>
  );
}

type ChartCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="rounded-sm border border-line bg-panel p-4">
      <div className="mb-4">
        <p className="font-barlow-condensed text-base font-bold">{title}</p>
        <p className="mt-1 font-ibm-plex-mono text-[9px] leading-4 text-muted">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-sm border border-dashed border-line text-center text-xs text-muted">
      {message}
    </div>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMinutes(value: number | null) {
  if (value === null) return "Sin datos";
  if (value < 60) return `${Math.round(value)} min`;

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return `${hours} h ${minutes} min`;
}

export function ClosingOperationalReport({
  shift,
  plantMetrics,
  movementMetrics,
  incidentMetrics,
  reviewCountByPlantId,
  plants,
  units,
  unitMovements,
  incidents,
}: ClosingOperationalReportProps) {
  const totalReviews = Object.values(reviewCountByPlantId).reduce(
    (total, count) => total + count,
    0,
  );

  const completedDurations = movementMetrics.completedMovements
    .filter((movement) => movement.completedAt)
    .map(
      (movement) =>
        (new Date(movement.completedAt as string).getTime() -
          new Date(movement.startedAt).getTime()) /
        60_000,
    )
    .filter((duration) => duration >= 0);

  const averageTransportMinutes =
    completedDurations.length > 0
      ? completedDurations.reduce((total, duration) => total + duration, 0) /
        completedDurations.length
      : null;

  const reviewData = plants.map((plant) => ({
    name: plant.code,
    value: reviewCountByPlantId[plant.id] ?? 0,
  }));

  const unitMovementData = units
    .map((unit) => ({
      name: `U${unit.code}`,
      value: unitMovements.filter((movement) => movement.unitId === unit.id).length,
    }))
    .filter((item) => item.value > 0);

  const movementStatusData = [
    {
      name: "Completados",
      value: movementMetrics.completedMovements.length,
      color: CHART_COLORS.success,
    },
    {
      name: "Abiertos",
      value: movementMetrics.openMovements.length,
      color: CHART_COLORS.principal,
    },
    {
      name: "Cancelados",
      value: movementMetrics.cancelledMovements.length,
      color: CHART_COLORS.danger,
    },
  ].filter((item) => item.value > 0);

  const incidentSeverityData = [
    {
      name: "Alta",
      value: incidents.filter((incident) => incident.severity === "high").length,
      color: CHART_COLORS.danger,
    },
    {
      name: "Media",
      value: incidents.filter((incident) => incident.severity === "medium").length,
      color: CHART_COLORS.principal,
    },
    {
      name: "Baja",
      value: incidents.filter((incident) => incident.severity === "low").length,
      color: CHART_COLORS.success,
    },
  ].filter((item) => item.value > 0);

  const materialData = [
    { name: "Llenos", value: plantMetrics.fullCount },
    { name: "Vacíos", value: plantMetrics.emptyCount },
    { name: "Pendientes", value: plantMetrics.pendingCount },
  ];

  const warnings = [
    plantMetrics.missingPlants > 0
      ? `${plantMetrics.missingPlants} planta(s) sin revisión registrada.`
      : null,
    movementMetrics.openMovements.length > 0
      ? `${movementMetrics.openMovements.length} movimiento(s) seguirán abiertos.`
      : null,
    incidentMetrics.openIncidents > 0
      ? `${incidentMetrics.openIncidents} incidencia(s) permanecen abiertas.`
      : null,
  ].filter((message): message is string => Boolean(message));

  return (
    <div className="space-y-4">
      <section className="rounded-sm border border-line bg-panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-principal/40 bg-principal/10 text-principal">
              <Activity size={23} />
            </span>
            <div className="min-w-0">
              <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                Resumen ejecutivo
              </p>
              <h3 className="mt-1 font-barlow-condensed text-2xl font-bold">
                {SHIFT_TYPE_LABELS[shift.shiftType]}
              </h3>
              <p className="mt-1 text-xs text-muted">
                Abierto desde las {formatTime(shift.openedAt)}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-success/40 bg-success/10 px-2.5 py-1.5 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Activo
          </span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Recorridos"
          value={totalReviews}
          detail={`${plantMetrics.checkedPlants}/${plantMetrics.totalPlants} plantas revisadas`}
        />
        <MetricCard
          label="Movimientos"
          value={movementMetrics.totalMovements}
          detail={`${movementMetrics.completedMovements.length} completados`}
        />
        <MetricCard
          label="Incidencias"
          value={incidentMetrics.totalIncidents}
          detail={`${incidentMetrics.openIncidents} abiertas`}
        />
        <MetricCard
          label="Traslado promedio"
          value={formatMinutes(averageTransportMinutes)}
          detail={`${completedDurations.length} traslados medidos`}
        />
      </div>

      <section
        className={`rounded-sm border p-4 ${
          warnings.length > 0
            ? "border-principal/40 bg-principal/10"
            : "border-success/40 bg-success/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {warnings.length > 0 ? (
            <AlertTriangle size={21} className="mt-0.5 shrink-0 text-principal" />
          ) : (
            <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-success" />
          )}
          <div>
            <p
              className={`font-semibold ${
                warnings.length > 0 ? "text-principal" : "text-success"
              }`}
            >
              {warnings.length > 0
                ? "Revisa antes de cerrar"
                : "Turno listo para cierre"}
            </p>
            {warnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-muted">
                {warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-muted">
                No hay pendientes operativos críticos registrados.
              </p>
            )}
          </div>
        </div>
      </section>

      <ChartCard
        title="Recorridos por planta"
        subtitle="Cantidad de formularios completados durante el turno"
      >
        {reviewData.length === 0 ? (
          <EmptyChart message="No hay plantas configuradas." />
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reviewData}
                layout="vertical"
                margin={{ top: 4, right: 18, bottom: 4, left: 0 }}
              >
                <CartesianGrid stroke="rgba(237,230,214,0.08)" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#b9b2a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={52}
                  tick={{ fill: "#b9b2a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(232,163,61,0.06)" }} />
                <Bar dataKey="value" name="Revisiones" fill={CHART_COLORS.principal} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Movimientos por unidad"
        subtitle="Carga operativa acumulada por unidad"
      >
        {unitMovementData.length === 0 ? (
          <EmptyChart message="No hay movimientos registrados." />
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={unitMovementData}
                margin={{ top: 4, right: 8, bottom: 4, left: -18 }}
              >
                <CartesianGrid stroke="rgba(237,230,214,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#b9b2a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#b9b2a2", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(232,163,61,0.06)" }} />
                <Bar dataKey="value" name="Movimientos" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard
          title="Estado de movimientos"
          subtitle="Completados, abiertos y cancelados"
        >
          {movementStatusData.length === 0 ? (
            <EmptyChart message="Sin movimientos para graficar." />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={movementStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {movementStatusData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "10px", color: "#b9b2a2" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Incidencias por severidad"
          subtitle="Distribución del impacto registrado"
        >
          {incidentSeverityData.length === 0 ? (
            <EmptyChart message="Sin incidencias para graficar." />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentSeverityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {incidentSeverityData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "10px", color: "#b9b2a2" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Material registrado en plantas"
        subtitle="Conteo final de llenos, vacíos y pendientes"
      >
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={materialData}
              margin={{ top: 4, right: 8, bottom: 4, left: -18 }}
            >
              <CartesianGrid stroke="rgba(237,230,214,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#b9b2a2", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#b9b2a2", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(232,163,61,0.06)" }} />
              <Bar dataKey="value" name="Cantidad" fill={CHART_COLORS.principal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <section className="grid grid-cols-3 gap-2 rounded-sm border border-line bg-panel p-3 text-center">
        <div>
          <Factory size={16} className="mx-auto text-principal" />
          <p className="mt-2 font-barlow-condensed text-xl font-bold">
            {plantMetrics.highRiskPlants}
          </p>
          <p className="font-ibm-plex-mono text-[8px] uppercase text-muted">
            Riesgo alto
          </p>
        </div>
        <div>
          <Truck size={16} className="mx-auto text-principal" />
          <p className="mt-2 font-barlow-condensed text-xl font-bold">
            {movementMetrics.totalQuantity}
          </p>
          <p className="font-ibm-plex-mono text-[8px] uppercase text-muted">
            Cantidad movida
          </p>
        </div>
        <div>
          <TriangleAlert size={16} className="mx-auto text-principal" />
          <p className="mt-2 font-barlow-condensed text-xl font-bold">
            {incidentMetrics.highSeverityIncidents}
          </p>
          <p className="font-ibm-plex-mono text-[8px] uppercase text-muted">
            Incid. altas
          </p>
        </div>
      </section>

      <p className="flex items-center justify-center gap-2 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-faint">
        <Clock3 size={13} /> Información calculada con los registros del turno
      </p>
    </div>
  );
}
