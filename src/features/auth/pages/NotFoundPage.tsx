import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-5 py-10 text-white light:text-slate-950">
            <section className="w-full max-w-md text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-3xl bg-principal/10 motion-safe:animate-pulse" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-principal/20 bg-principal/10 text-principal">
                        <SearchX size={30} strokeWidth={1.8} />
                    </div>
                </div>

                <h1 className="mt-3 text-2xl font-bold uppercase tittle">
                    Página no encontrada
                </h1>

                <p className="infield mx-auto mt-3 max-w-sm text-sm leading-6 light:text-slate-500">
                    La ruta que intentas abrir no existe o cambió de ubicación
                    dentro de NexoOps.
                </p>

                <Link
                    to="/app"
                    className="group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-principal px-6 text-sm font-semibold text-surface-dark shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-principal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
                >
                    <ArrowLeft
                        size={18}
                        className="transition-transform duration-200 group-hover:-translate-x-1"
                    />

                    Regresar al inicio
                </Link>

                <p className="mt-6 text-xs text-white/25 light:text-slate-400">
                    NexoOps · Control operativo
                </p>
            </section>
        </main>
    );
}