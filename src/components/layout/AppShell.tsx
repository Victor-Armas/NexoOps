import { Outlet } from "react-router-dom";
import { HeaderActions } from "./HeaderActions";
import { PageHeader } from "./PageHeader";

export function AppShell() {
    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden text-white light:bg-slate-50 light:text-slate-950">

            <div className="mx-auto mt-3 w-full min-w-0 max-w-md px-5 pt-[env(safe-area-inset-top)]">
                <PageHeader action={<HeaderActions />} />
            </div>
            <div className="min-h-screen text-white light:bg-slate-50 light:text-slate-950">
                <main className="mx-auto min-h-screen max-w-md px-4 py-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
