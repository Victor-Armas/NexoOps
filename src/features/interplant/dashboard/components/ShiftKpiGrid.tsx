type ShiftKpiGridProps = {
    checkedPlants: number;
    totalPlants: number;
    fullCount: number;
    emptyCount: number;
    highRiskPlants: number;
};

export function ShiftKpiGrid({
    checkedPlants,
    totalPlants,
    fullCount,
    emptyCount,
    highRiskPlants,
}: ShiftKpiGridProps) {
    const missingPlants = Math.max(totalPlants - checkedPlants, 0);

    const kpis = [
        {
            label: "Plantas revisadas",
            value: `${checkedPlants}/${totalPlants}`,
        },
        {
            label: "Carros llenos",
            value: fullCount,
        },
        {
            label: "Carros vacíos",
            value: emptyCount,
        },
        {
            label: "Riesgo alto",
            value: highRiskPlants,
        },
        {
            label: "Sin revisar",
            value: missingPlants,
        },
    ];

    return (
        <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mb-4">
                <h2 className="text-lg font-bold">Resumen del turno</h2>
                <p className="text-sm text-slate-400 light:text-slate-500">
                    Datos tomados del último estatus registrado por planta.
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