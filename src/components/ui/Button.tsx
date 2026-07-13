import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                // Estilos base y transiciones
                "inline-block h-12 shadow items-center tracking-[.07em] justify-center uppercase rounded-sm bg-principal light:bg-cyan-400 px-5 text-md font-semibold text-slate-950 font-barlow-condensed cursor-pointer transition-all duration-100 ease-out",
                // Hover (Escritorio)
                "hover:bg-[#b57e2d] light:hover:bg-cyan-500",
                // EFECTO DE PRESIÓN TÁCTIL (Móvil / Clic)
                "active:scale-95 active:shadow-inner active:brightness-95",
                // Estados deshabilitados
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100",
                className,
            )}
            {...props}
        />
    );
}