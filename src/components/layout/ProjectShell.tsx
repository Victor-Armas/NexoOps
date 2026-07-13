import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { HeaderActions } from "./HeaderActions";
import { PageHeader } from "./PageHeader";

export function ProjectShell() {
    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden text-white light:bg-slate-50 light:text-slate-950">
            <div className="mx-auto mt-3 w-full min-w-0 max-w-md px-5 pt-[env(safe-area-inset-top)]">
                <PageHeader action={<HeaderActions />} />
            </div>

            <main className="mx-auto min-h-screen w-full min-w-0 max-w-md overflow-x-hidden px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5">
                <Outlet />
            </main>

            <BottomNavigation />
        </div>
    );
}