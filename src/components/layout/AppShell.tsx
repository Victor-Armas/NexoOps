import { Outlet } from "react-router-dom";
import { HeaderActions } from "./HeaderActions";
import { PageHeader } from "./PageHeader";

export function AppShell() {
    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden text-white light:bg-slate-50 light:text-slate-950">
            <header className="sticky top-0 z-40 border-b border-line bg-surface-dark/95 backdrop-blur-md light:bg-white/95">
                <div className="mx-auto w-full min-w-0 max-w-md px-5 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
                    <PageHeader action={<HeaderActions />} />
                </div>
            </header>

            <main className="mx-auto min-h-screen w-full min-w-0 max-w-md px-4 py-5">
                <Outlet />
            </main>
        </div>
    );
}
