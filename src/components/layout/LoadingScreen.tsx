import { Spinner } from "../ui/Spinner";

type LoadingScreenProps = {
    message?: string;
};

export function LoadingScreen({ message = "Preparando operación..." }: LoadingScreenProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white light:bg-slate-50 light:text-slate-950">
            <section className="flex flex-col items-center gap-5 rounded-4xl border border-white/10 bg-white/10 px-8 py-10 shadow-2xl backdrop-blur-xl light:border-slate-200 light:bg-white">
                <Spinner />

                <div className="text-center">
                    <p className="text-sm font-semibold text-cyan-300 light:text-cyan-700">
                        NexoOps
                    </p>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        {message}
                    </p>
                </div>
            </section>
        </main>
    );
}