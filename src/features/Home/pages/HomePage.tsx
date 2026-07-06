import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { UserRound } from "lucide-react"

const kpis = [
    { label: "Recorridos", value: 14 },
    { label: "Movimientos", value: 11 },
    { label: "Cargas", value: 6 },
    { label: "Descargas", value: 5 },
];

export function HomePage() {
    const { profile, signOut } = useAuth();

    return (
        <>

            <section>
                <h2 className="text-2xl font-bold">{`Turno Tarde`}</h2>
                <div className="flex gap-2 justify-between pt-1 text-gray-600">
                    <div>
                        <p>{profile?.fullName}</p>
                    </div>
                    <div className="flex">
                        <UserRound />
                        <p>{profile?.role.name}</p>
                    </div>
                </div>
            </section>

            <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">

                <div className="mt-5 grid grid-cols-2 gap-3">
                    {kpis.map((kpi) => (
                        <article
                            key={kpi.label}
                            className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 light:border-slate-200 light:bg-slate-50"
                        >
                            <p className="text-sm text-slate-400">{kpi.label}</p>
                            <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 light:border-slate-200 light:bg-white">

                <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </section>
        </>
    );
}
