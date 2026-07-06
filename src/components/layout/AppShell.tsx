import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
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
                <main className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-5">
                    <Outlet />
                </main>

                <BottomNavigation />
            </div>
        </>
    );
}