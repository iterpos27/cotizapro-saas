"use client";

import { useActionState } from "react";
import { Building2, LogIn, UserPlus } from "lucide-react";
import { signIn, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "registro";
};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "registro" ? signUp : signIn;
  const [state, formAction, pending] = useActionState(action, {});
  const isRegister = mode === "registro";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Building2 className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>{isRegister ? "Crear cuenta" : "Iniciar sesion"}</CardTitle>
        <CardDescription>
          {isRegister ? "Registra tu empresa para empezar con CotizaPro SaaS." : "Entra al panel de tu empresa."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {isRegister ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre del usuario</Label>
                <Input id="fullName" name="fullName" placeholder="Juan Perez" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de empresa</Label>
                <Input id="companyName" name="companyName" placeholder="Servicios Ejemplo S.A." required />
              </div>
            </>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="correo@empresa.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </div>
          {state.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {isRegister ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}
            {pending ? "Procesando..." : isRegister ? "Crear empresa" : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
