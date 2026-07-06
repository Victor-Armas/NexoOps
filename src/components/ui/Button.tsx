import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex h-12 shadow items-center justify-center rounded-sm bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
                className,
            )}
            {...props}
        />
    );
}
