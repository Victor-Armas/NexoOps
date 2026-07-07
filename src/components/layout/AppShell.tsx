import { Outlet } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { ThemeToggle } from "../../features/theme/ThemeToggle";

export function AppShell() {
    return (
        <>
            <div className="px-5 mt-3">
                <PageHeader
                    action={<ThemeToggle />}
                />
            </div>
            <div className="min-h-screen bg-slate-950 text-white light:bg-slate-50 light:text-slate-950">
                <main className="mx-auto min-h-screen max-w-md px-4 py-5">
                    <Outlet />
                </main>
            </div>
        </>
    );
}