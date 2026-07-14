import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Switch({
    className,
    disabled,
    ...props
}: SwitchProps) {
    return (
        <label
            className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center",
                disabled && "cursor-not-allowed opacity-50",
                className,
            )}
        >
            <input
                {...props}
                type="checkbox"
                disabled={disabled}
                className="peer sr-only"
            />

            <span
                className="
                    h-5 w-9 rounded-full border border-line-strong bg-surface-dark
                    transition
                    after:absolute after:left-[3px] after:top-1/2
                    after:h-3.5 after:w-3.5 after:-translate-y-1/2
                    after:rounded-full after:bg-muted after:transition
                    peer-checked:border-principal
                    peer-checked:bg-principal
                    peer-checked:after:translate-x-4
                    peer-checked:after:bg-black
                    peer-focus-visible:ring-2
                    peer-focus-visible:ring-principal/40
                "
            />
        </label>
    );
}