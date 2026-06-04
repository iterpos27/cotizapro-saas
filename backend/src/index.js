import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    app: "CotizaPro SaaS API",
    supabaseConfigured: Boolean(supabase),
  });
});

async function requireUser(request, response, next) {
  if (!supabase) {
    response.status(500).json({ error: "Configura SUPABASE_URL y SUPABASE_ANON_KEY en .env.local." });
    return;
  }

  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    response.status(401).json({ error: "Token requerido." });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    response.status(401).json({ error: "Sesion invalida." });
    return;
  }

  request.user = data.user;
  next();
}

app.get("/api/me", requireUser, async (request, response) => {
  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("id, empresa_id, nombre, rol")
    .eq("id", request.user.id)
    .single();

  if (perfilError) {
    response.status(404).json({ error: "Perfil no encontrado para el usuario." });
    return;
  }

  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("id, nombre, logo_url")
    .eq("id", perfil.empresa_id)
    .single();

  if (empresaError) {
    response.status(404).json({ error: "Empresa no encontrada para el usuario." });
    return;
  }

  response.json({
    user: {
      id: request.user.id,
      email: request.user.email,
    },
    perfil,
    empresa,
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendDistPath));
app.get("*", (_request, response) => {
  response.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`CotizaPro API escuchando en http://localhost:${port}`);
});
