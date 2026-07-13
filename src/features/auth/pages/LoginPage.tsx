import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";
import { signInWithPassword } from "../services/auth.service";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const navigate = useNavigate();

    const onSubmit = async (values: LoginFormValues) => {
        const { error } = await signInWithPassword(values.email, values.password);

        if (error) {
            setError("root", {
                message: "Correo o contraseña incorrectos.",
            });
            return;
        }


        navigate("/", { replace: true });
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8">
            <div className="absolute inset-0 " />

            <div className="absolute right-5 top-5 z-10">
                <ThemeToggle />
            </div>

            <section className="relative z-10 w-full max-w-md rounded-sm shadow-sm  p-6  backdrop-blur-xl light:border-slate-200 light:bg-white/80">
                <div className="mb-8 flex flex-col items-center text-center">


                    <h1 className="text-4xl tittle">NexoOps</h1>

                    <p className="mt-2 text-sm light:text-slate-500 sub">
                        Control operativo y trazabilidad
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <label className="block space-y-2">
                        <span className="text-sm font-medium infield light:text-slate-700">
                            Correo
                        </span>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 infield"
                            />

                            <Input
                                type="email"
                                placeholder="usuario@nexoops.com"
                                autoComplete="email"
                                className="pl-11"
                                {...register("email")}
                            />
                        </div>

                        {errors.email && (
                            <p className="text-sm text-red-400 light:text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm font-medium infield light:text-slate-700">
                            Contraseña
                        </span>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 infield"
                            />

                            <Input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="pl-11"
                                {...register("password")}
                            />
                        </div>

                        {errors.password && (
                            <p className="text-sm text-red-400 light:text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </label>

                    {errors.root && (
                        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 light:text-red-600">
                            {errors.root.message}
                        </p>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-xs infield light:text-slate-500">
                    Acceso exclusivo para usuarios autorizados.
                </p>
            </section>
        </main>
    );
}