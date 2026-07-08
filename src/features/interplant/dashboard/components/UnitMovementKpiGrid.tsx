type UnitMovementKpiGridProps = {
    activeUnits: number;
    totalUnits: number;
    openMovements: number;
    completedMovements: number;
    mealUnits: number;
    waitingDockUnits: number;
    loadingOrUnloadingUnits: number;
    totalQuantity: number;
};

export function UnitMovementKpiGrid({
    activeUnits,
    totalUnits,
    openMovements,
    completedMovements,
    mealUnits,
    waitingDockUnits,
    loadingOrUnloadingUnits,
    totalQuantity,
}: UnitMovementKpiGridProps) {
    const kpis = [
        {
            label: "Unidades activas",
            value: `${activeUnits}/${totalUnits}`,
        },
        {
            label: "Mov. abiertos",
            value: openMovements,
        },
        {
            label: "En comida",
            value: mealUnits,
        },
        {
            label: "Esperando rampa",
            value: waitingDockUnits,
        },
        {
            label: "Carga/descarga",
            value: loadingOrUnloadingUnits,
        },
        {
            label: "Completados",
            value: completedMovements,
        },
        {
            label: "Cantidad movida",
            value: totalQuantity,
        },
    ];

    return (
        <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mb-4">
                <h2 className="text-lg font-bold">Resumen de unidades</h2>
                <p className="text-sm text-slate-400 light:text-slate-500">
                    Datos tomados de movimientos y último evento registrado.
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