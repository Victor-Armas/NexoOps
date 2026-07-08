import { Outlet } from "react-router-dom";
import { HeaderActions } from "./HeaderActions";
import { PageHeader } from "./PageHeader";

export function AppShell() {
    return (
        <>
            <div className="px-5 mt-3">
                <PageHeader action={<HeaderActions />} />
            </div>
            <div className="min-h-screen bg-slate-950 text-white light:bg-slate-50 light:text-slate-950">
                <main className="mx-auto min-h-screen max-w-md px-4 py-5">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
