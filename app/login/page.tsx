import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

type LoginPageProps = {
  searchParams: Promise<{
    mensaje?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { mensaje } = await searchParams;
  const showConfirmEmailMessage = mensaje === "confirma-email";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-5">
        {showConfirmEmailMessage ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Cuenta creada. Confirma tu email para ingresar, o desactiva la confirmacion por correo en Supabase mientras pruebas.
          </p>
        ) : null}
        <AuthForm mode="login" />
        <p className="text-center text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-primary">
            Crea tu empresa
          </Link>
        </p>
      </div>
    </main>
  );
}
