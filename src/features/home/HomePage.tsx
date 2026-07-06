import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth";
import { Button } from "../../components/ui/Button";

export function HomePage() {
    const { profile, signOut } = useAuth();

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white light:bg-slate-50 light:text-slate-950">
            <section className="mx-auto max-w-md rounded-4xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl light:border-slate-200 light:bg-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-cyan-300 light:text-cyan-700">
                            NexoOps
                        </p>

                        <h1 className="text-xl font-bold">
                            Bienvenido, {profile?.fullName ?? "Usuario"}
                        </h1>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 light:border-slate-200 light:bg-slate-50">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Perfil
                    </p>

                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Nombre</span>
                            <span className="font-medium">{profile?.fullName ?? "-"}</span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Correo</span>
                            <span className="max-w-[190px] truncate font-medium">
                                {profile?.email ?? "-"}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Rol</span>
                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                                {profile?.role.name ?? "Sin rol"}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={signOut}
                    className="mt-6 w-full gap-2 bg-red-500 text-white hover:bg-red-400"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </Button>
            </section>
        </main>
    );
}