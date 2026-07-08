import { Clock } from "lucide-react";
import { SHIFT_TYPE_LABELS, type Shift } from "../types/shift.types";

type ShiftStatusBannerProps = {
    shift: Shift;
};

export function ShiftStatusBanner({ shift }: ShiftStatusBannerProps) {
    return (
        <section className="flex items-center justify-between gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 light:border-emerald-200 light:bg-emerald-50">
            <div className="flex items-center gap-2 text-emerald-300 light:text-emerald-700">
                <Clock size={18} />
                <span className="text-sm font-semibold">
                    {SHIFT_TYPE_LABELS[shift.shiftType]} · Abierto
                </span>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
                Turno activo
            </span>
        </section>
    );
}
