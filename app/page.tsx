import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Multi-tenant con Supabase
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-foreground sm:text-6xl">
            CotizaPro SaaS
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Plataforma para crear empresas, usuarios y luego gestionar clientes y cotizaciones sin mezclar datos entre tenants.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/registro">
                Crear cuenta
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                <FileText className="size-4" />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
