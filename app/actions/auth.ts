"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AuthState = {
  error?: string;
};

function getAuthErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email not confirmed")) {
    return "Debes confirmar tu email antes de ingresar. Revisa tu correo o desactiva la confirmacion de email en Supabase para pruebas.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "Email o contrasena incorrectos.";
  }

  return message;
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { error: "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local." };
  }

  const supabase = await createClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const fullName = getString(formData, "fullName");
  const companyName = getString(formData, "companyName");

  if (!email || !password || !fullName || !companyName) {
    return { error: "Completa todos los campos para crear la cuenta." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(data.session ? "/dashboard" : "/login?mensaje=confirma-email");
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { error: "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local." };
  }

  const supabase = await createClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Ingresa tu email y contrasena." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
