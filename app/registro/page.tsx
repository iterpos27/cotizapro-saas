import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-5">
        <AuthForm mode="registro" />
        <p className="text-center text-sm text-muted-foreground">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
