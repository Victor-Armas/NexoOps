import { Route } from "lucide-react";
import { cn } from "../../lib/utils/cn";

type SpinnerProps = {
    className?: string;
};

export function Spinner({ className }: SpinnerProps) {
    return (
        <div
            className={cn(
                "relative flex h-16 w-16 items-center justify-center",
                className,
            )}
            aria-label="Cargando"
            role="status"
        >
            <div className="absolute inset-0 rounded-full border-2 border-principal/20" />

            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-principal border-r-principal" />

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-principal">
                <Route size={22} />
            </div>
        </div>
    );
}