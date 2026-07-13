import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={cn(
                "h-12 w-full rounded-sm shadow-sm bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-[#847C6C] focus:border-cyan-400 dark:bg-white/10 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400",
                className,
            )}
            {...props}
        />
    );
}