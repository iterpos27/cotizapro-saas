import { redirect } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Supabase pendiente</CardTitle>
            <CardDescription>
              Configura `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para activar el dashboard protegido.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol, empresa_id")
    .eq("id", user.id)
    .single();

  const { data: empresa } = perfil?.empresa_id
    ? await supabase.from("empresas").select("nombre").eq("id", perfil.empresa_id).single()
    : { data: null };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">CotizaPro SaaS</p>
            <h1 className="text-xl font-semibold">{empresa?.nombre ?? "Empresa"}</h1>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard protegido</CardTitle>
            <CardDescription>
              La sesión está activa y el perfil se lee desde Supabase usando el usuario autenticado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="mt-1 font-medium">{perfil?.nombre ?? user.email}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="mt-1 font-medium">{perfil?.rol ?? "admin"}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Tenant</p>
              <p className="mt-1 font-medium">empresa_id obligatorio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-secondary">
              <Users className="size-5 text-primary" aria-hidden="true" />
            </div>
            <CardTitle>Siguiente fase</CardTitle>
            <CardDescription>
              Cuando registro, login y dashboard estén probados, avanzamos a clientes.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
