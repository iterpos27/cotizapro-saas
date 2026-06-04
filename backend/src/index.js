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

  request.supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  request.user = data.user;
  next();
}

async function getUserContext(request, response) {
  const { data: perfil, error: perfilError } = await request.supabase
    .from("perfiles")
    .select("id, empresa_id, nombre, rol")
    .eq("id", request.user.id)
    .single();

  if (perfilError) {
    response.status(404).json({ error: "Perfil no encontrado para el usuario." });
    return null;
  }

  const { data: empresa, error: empresaError } = await request.supabase
    .from("empresas")
    .select("id, nombre, logo_url")
    .eq("id", perfil.empresa_id)
    .single();

  if (empresaError) {
    response.status(404).json({ error: "Empresa no encontrada para el usuario." });
    return null;
  }

  return { perfil, empresa };
}

function cleanText(value) {
  return String(value || "").trim();
}

function getClientePayload(body) {
  return {
    nombre: cleanText(body.nombre),
    email: cleanText(body.email) || null,
    telefono: cleanText(body.telefono) || null,
    identificacion: cleanText(body.identificacion) || null,
    direccion: cleanText(body.direccion) || null,
  };
}

app.get("/api/me", requireUser, async (request, response) => {
  const context = await getUserContext(request, response);

  if (!context) {
    return;
  }

  response.json({
    user: {
      id: request.user.id,
      email: request.user.email,
    },
    perfil: context.perfil,
    empresa: context.empresa,
  });
});

app.get("/api/clientes", requireUser, async (request, response) => {
  const context = await getUserContext(request, response);

  if (!context) {
    return;
  }

  const { data, error } = await request.supabase
    .from("clientes")
    .select("id, nombre, email, telefono, identificacion, direccion, created_at")
    .eq("empresa_id", context.perfil.empresa_id)
    .order("created_at", { ascending: false });

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.json({ clientes: data });
});

app.post("/api/clientes", requireUser, async (request, response) => {
  const context = await getUserContext(request, response);

  if (!context) {
    return;
  }

  const payload = getClientePayload(request.body);

  if (!payload.nombre) {
    response.status(400).json({ error: "El nombre del cliente es obligatorio." });
    return;
  }

  const { data, error } = await request.supabase
    .from("clientes")
    .insert({
      ...payload,
      empresa_id: context.perfil.empresa_id,
    })
    .select("id, nombre, email, telefono, identificacion, direccion, created_at")
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.status(201).json({ cliente: data });
});

app.put("/api/clientes/:id", requireUser, async (request, response) => {
  const context = await getUserContext(request, response);

  if (!context) {
    return;
  }

  const payload = getClientePayload(request.body);

  if (!payload.nombre) {
    response.status(400).json({ error: "El nombre del cliente es obligatorio." });
    return;
  }

  const { data, error } = await request.supabase
    .from("clientes")
    .update(payload)
    .eq("id", request.params.id)
    .eq("empresa_id", context.perfil.empresa_id)
    .select("id, nombre, email, telefono, identificacion, direccion, created_at")
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.json({ cliente: data });
});

app.delete("/api/clientes/:id", requireUser, async (request, response) => {
  const context = await getUserContext(request, response);

  if (!context) {
    return;
  }

  const { error } = await request.supabase
    .from("clientes")
    .delete()
    .eq("id", request.params.id)
    .eq("empresa_id", context.perfil.empresa_id);

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.status(204).send();
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
