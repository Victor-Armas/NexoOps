import type { ReactNode } from "react";

type PageHeaderProps = {
    action?: ReactNode;
};

export function PageHeader({ action }: PageHeaderProps) {
    return (
        <header className="mb-3 flex items-center justify-between gap-4 ">
            <div>
                <p className="text-base font-semibold uppercase tracking-[0.4em] text-cyan-300 light:text-cyan-700">
                    NexoOps
                </p>
            </div>

            <div className="flex gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300 light:bg-red-100 light:text-red-700">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                    </span>
                    En vivo
                </span>

                <div>

                    {action}
                </div>

            </div>
        </header>
    );
}