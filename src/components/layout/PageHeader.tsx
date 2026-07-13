import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type PageHeaderProps = {
    title?: string;
    subtitle?: string;
    badge?: string | null;
    action?: ReactNode;
};

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
    const badgeLabel = badge === undefined ? "En vivo" : badge;

    return (
        <header className="mb-3 flex items-center justify-between gap-4">
            <div>
                <Link to="/" className="text-base font-semibold uppercase tracking-[0.4em] text-[#E8A33D] light:text-cyan-700">
                    NexoOps
                </Link>
                {title && (
                    <h1 className="mt-1 text-lg font-bold text-white light:text-slate-950">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="mt-0.5 text-sm text-slate-400 light:text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
                {badgeLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300 light:bg-red-100 light:text-red-700">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                        </span>
                        {badgeLabel}
                    </span>
                )}

                {action}
            </div>
        </header>
    );
}
