import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { cleanText } from "../utils/text.js";

export const authRouter = Router();

function getAuthErrorMessage(message) {
  const lowerMessage = String(message || "").toLowerCase();

  if (lowerMessage.includes("email not confirmed")) {
    return "Debes confirmar tu email antes de ingresar.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "Email o contrasena incorrectos.";
  }

  return message || "No se pudo completar la autenticacion.";
}

authRouter.post("/register", async (request, response) => {
  if (!supabase) {
    response.status(500).json({ error: "Configura SUPABASE_URL y SUPABASE_ANON_KEY." });
    return;
  }

  const email = cleanText(request.body.email);
  const password = cleanText(request.body.password);
  const nombre = cleanText(request.body.nombre);
  const empresa = cleanText(request.body.empresa);

  if (!email || !password || !nombre || !empresa) {
    response.status(400).json({ error: "Email, contrasena, nombre y empresa son obligatorios." });
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nombre,
        company_name: empresa,
      },
    },
  });

  if (error) {
    response.status(400).json({ error: getAuthErrorMessage(error.message) });
    return;
  }

  response.status(201).json({
    user: data.user,
    session: data.session,
    emailConfirmationRequired: !data.session,
  });
});

authRouter.post("/login", async (request, response) => {
  if (!supabase) {
    response.status(500).json({ error: "Configura SUPABASE_URL y SUPABASE_ANON_KEY." });
    return;
  }

  const email = cleanText(request.body.email);
  const password = cleanText(request.body.password);

  if (!email || !password) {
    response.status(400).json({ error: "Email y contrasena son obligatorios." });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    response.status(400).json({ error: getAuthErrorMessage(error.message) });
    return;
  }

  response.json({
    user: data.user,
    session: data.session,
  });
});
