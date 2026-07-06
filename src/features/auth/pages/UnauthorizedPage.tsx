import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white light:bg-slate-50 light:text-slate-950">
            <section className="w-full max-w-md rounded-4xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl light:border-slate-200 light:bg-white">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-400">
                    <ShieldAlert size={32} />
                </div>

                <h1 className="mt-5 text-2xl font-bold">Acceso no autorizado</h1>

                <p className="mt-2 text-sm text-slate-400 light:text-slate-500">
                    Tu usuario no tiene permisos para acceder a esta sección o tu perfil no está activo.
                </p>

                <Link
                    to="/login"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                    Volver al login
                </Link>
            </section>
        </main>
    );
}