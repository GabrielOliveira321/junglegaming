import { useEffect, useRef, useState } from "react";
import { EyeOff } from "lucide-react";
import { useAuthErrorMessage, useLoginMutation, useRegisterMutation } from "@/hooks/useAuth";

type LoginProps = {
    onClose?: () => void;
    onSuccess?: () => void;
    initialMode?: "entrar" | "criar-conta";
};

export function Login({ onClose, onSuccess, initialMode = "criar-conta" }: LoginProps) {
    const [criandoConta, setCriandoConta] = useState(
        initialMode === "criar-conta",
    );
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const { extractApiErrorMessage } = useAuthErrorMessage();
    const isSubmitting = loginMutation.isPending || registerMutation.isPending;
    const dialogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        const getFocusableElements = () =>
            Array.from(
                dialog.querySelectorAll<HTMLElement>(
                    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
                ),
            ).filter((element) => !element.hasAttribute("disabled"));

        const focusables = getFocusableElements();
        focusables[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose?.();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const elements = getFocusableElements();
            if (elements.length === 0) {
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === first) {
                event.preventDefault();
                last.focus();
                return;
            }

            if (!event.shiftKey && activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        dialog.addEventListener("keydown", handleKeyDown);
        return () => {
            dialog.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const inputClassName =
        "h-[50px] w-full rounded-[10px] border border-[#3F2319] bg-transparent px-4 text-[14px] text-[#F7F3EC] placeholder:text-[#8E6F4C] focus:border-[#D28A4C] focus:outline-none";

    const socialClassName =
        "flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[5px] border border-[#3F2319] bg-transparent text-[13px] font-medium text-[#CFB28C] transition hover:border-[#D28A4C] hover:text-[#D28A4C]";

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-dialog-title"
            className={`relative mx-auto flex w-full max-w-[414px] flex-col overflow-hidden rounded-[40px] bg-[#140D0A] px-7 pb-6 pt-20 text-[#F5F1EB] md:max-w-[500px] md:rounded-[12px] md:border md:border-[#3F2319] md:bg-[#1A120E] md:px-8 md:pb-8 md:pt-10 md:shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${criandoConta ? "min-h-[896px] md:min-h-[656px]" : "min-h-[896px] md:min-h-[560px]"
                }`}
        >
            <h1 id="login-dialog-title" className="sr-only">
                Acesso da conta Kurio
            </h1>
            <div className="absolute right-6 top-6 hidden md:flex">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-sm font-bold text-[#D28A4C] transition hover:border-[#D28A4C] hover:bg-[#D28A4C] hover:text-[#140D0A]"
                    aria-label="Fechar"
                >
                    X
                </button>
            </div>

            <div className="mx-auto flex h-[136px] w-full flex-col items-center justify-center">
                <h2 className="text-center text-[32px] font-bold leading-[100%] tracking-[0.1em] text-[#F5F1EB]">
                    KURIO
                </h2>
                <p className="mt-12 text-center text-[20px] font-bold leading-4 text-[#F5F1EB]">
                    {criandoConta ? "Criar perfil de colecionador" : "Entrar"}
                </p>
            </div>

            <form
                onSubmit={async (event) => {
                    event.preventDefault();
                    setErrorMessage("");
                    const formData = new FormData(event.currentTarget);
                    const email = String(formData.get("email") ?? "").trim();
                    const senha = String(formData.get("senha") ?? "").trim();
                    const nome = String(formData.get("nome") ?? "").trim();
                    const confirmarSenha = String(formData.get("confirmarSenha") ?? "").trim();

                    if (criandoConta && senha !== confirmarSenha) {
                        setErrorMessage("A confirmação de senha não confere.");
                        return;
                    }

                    try {
                        if (criandoConta) {
                            await registerMutation.mutateAsync({
                                displayName: nome,
                                email,
                                password: senha,
                            });
                        }

                        await loginMutation.mutateAsync({
                            email,
                            password: senha,
                        });

                        onSuccess?.();
                    } catch (error) {
                        setErrorMessage(
                            extractApiErrorMessage(error, "Não foi possível autenticar. Tente novamente."),
                        );
                    }
                }}
            >
                <div className="flex flex-col gap-3">
                    {criandoConta && (
                        <input
                            type="text"
                            name="nome"
                            placeholder="Nome de usuário"
                            aria-label="Nome"
                            autoComplete="name"
                            required
                            className={inputClassName}
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder={criandoConta ? "Digite seu e-mail" : "contato@email.com"}
                        aria-label="Email"
                        autoComplete="email"
                        required
                        className={inputClassName}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="senha"
                            placeholder={criandoConta ? "Senha" : "**********"}
                            aria-label="Senha"
                            autoComplete={
                                criandoConta ? "new-password" : "current-password"
                            }
                            required
                            className={`${inputClassName} pr-12`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55321F]"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            <EyeOff className="h-4 w-4" />
                        </button>
                    </div>

                    {criandoConta && (
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmarSenha"
                                placeholder="Confirmar senha"
                                aria-label="Confirmar senha"
                                autoComplete="new-password"
                                required
                                className={`${inputClassName} pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((current) => !current)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55321F]"
                                aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                            >
                                <EyeOff className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {!criandoConta && (
                    <div className="mt-3 flex justify-end">
                        <a
                            href="/esqueci-a-senha"
                            className="text-[14px] text-[#E89B55] transition hover:underline"
                        >
                            Esqueceu a senha?
                        </a>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 h-[60px] w-full cursor-pointer rounded-[10px] bg-[#D28A4C] text-[16px] font-bold text-[#140D0A] transition hover:opacity-90"
                >
                    {isSubmitting ? "Enviando..." : criandoConta ? "Criar perfil" : "Entrar"}
                </button>

                {errorMessage && (
                    <p className="mt-3 text-sm text-[#F0805F]" role="alert">
                        {errorMessage}
                    </p>
                )}
            </form>

            <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#3F2319]" />
                <span className="text-[13px] font-normal text-[#F5F1EB]">
                    Ou continue com
                </span>
                <div className="h-px flex-1 bg-[#3F2319]" />
            </div>

            <div className="flex flex-col gap-3">
                <button type="button" className={socialClassName}>
                    <span className="mr-3 text-[20px] text-[#F4B400]">G</span>
                    Continuar com Google
                </button>

                <button type="button" className={socialClassName}>
                    <span className="mr-3 text-[20px] text-[#1877F2]">f</span>
                    Continuar com Facebook
                </button>
            </div>

            <div className="mt-7 text-center text-[15px] text-[#CFB28C]">
                {criandoConta ? (
                    <p>
                        Já tem uma conta?{" "}
                        <button
                            type="button"
                            onClick={() => setCriandoConta(false)}
                            className="text-[#CFB28C] underline-offset-2 hover:underline"
                        >
                            Entre
                        </button>
                    </p>
                ) : (
                    <p>
                        Novo na Kurio?{" "}
                        <button
                            type="button"
                            onClick={() => setCriandoConta(true)}
                            className="text-[#CFB28C] underline-offset-2 hover:underline"
                        >
                            Crie uma conta
                        </button>
                    </p>
                )}
            </div>

            <div className="absolute bottom-0 left-0 hidden h-[10px] w-full bg-[#D28A4C] md:block" />
        </div>
    );
}