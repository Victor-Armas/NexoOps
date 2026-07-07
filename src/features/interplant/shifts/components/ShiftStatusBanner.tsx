import { Clock } from "lucide-react";
import { SHIFT_TYPE_LABELS, type Shift } from "../types/shift.types";

type ShiftStatusBannerProps = {
    shift: Shift;
    canManage: boolean;
    onCloseClick: () => void;
};

export function ShiftStatusBanner({
    shift,
    canManage,
    onCloseClick,
}: ShiftStatusBannerProps) {
    return (
        <section className="flex items-center justify-between gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 light:border-emerald-200 light:bg-emerald-50">
            <div className="flex items-center gap-2 text-emerald-300 light:text-emerald-700">
                <Clock size={18} />
                <span className="text-sm font-semibold">
                    {SHIFT_TYPE_LABELS[shift.shiftType]} · Abierto
                </span>
            </div>

            {canManage && (
                <button
                    type="button"
                    onClick={onCloseClick}
                    className="text-xs font-semibold text-slate-300 underline underline-offset-2 light:text-slate-500"
                >
                    Cerrar turno
                </button>
            )}
        </section>
    );
}