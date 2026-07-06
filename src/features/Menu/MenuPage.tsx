

export function ProjectDashboardPage() {
    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">{`Proyectos Asignados`}</h2>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/10 p-5 light:border-slate-200 light:bg-white">
                <p className="text-sm text-slate-400 light:text-slate-500">
                    Aquí irá el tablero principal del proyecto: turnos, plantas, unidades,
                    incidencias y cierre visual.
                </p>
            </section>
        </>
    );
}