import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import { getUserContext } from "../services/userContext.js";
import { sendError } from "../utils/http.js";
import { cleanText } from "../utils/text.js";

export const clientesRouter = Router();

function getClientePayload(body) {
  return {
    nombre: cleanText(body.nombre),
    email: cleanText(body.email) || null,
    telefono: cleanText(body.telefono) || null,
    identificacion: cleanText(body.identificacion) || null,
    direccion: cleanText(body.direccion) || null,
  };
}

clientesRouter.get("/", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);

    const { data, error } = await request.supabase
      .from("clientes")
      .select("id, nombre, email, telefono, identificacion, direccion, created_at, updated_at")
      .eq("empresa_id", perfil.empresa_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    response.json({ clientes: data });
  } catch (error) {
    sendError(response, error);
  }
});

clientesRouter.post("/", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const payload = getClientePayload(request.body);

    if (!payload.nombre) {
      response.status(400).json({ error: "El nombre del cliente es obligatorio." });
      return;
    }

    const { data, error } = await request.supabase
      .from("clientes")
      .insert({
        ...payload,
        empresa_id: perfil.empresa_id,
      })
      .select("id, nombre, email, telefono, identificacion, direccion, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    response.status(201).json({ cliente: data });
  } catch (error) {
    sendError(response, error);
  }
});

clientesRouter.put("/:id", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const payload = getClientePayload(request.body);

    if (!payload.nombre) {
      response.status(400).json({ error: "El nombre del cliente es obligatorio." });
      return;
    }

    const { data, error } = await request.supabase
      .from("clientes")
      .update(payload)
      .eq("id", request.params.id)
      .eq("empresa_id", perfil.empresa_id)
      .select("id, nombre, email, telefono, identificacion, direccion, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    response.json({ cliente: data });
  } catch (error) {
    sendError(response, error);
  }
});

clientesRouter.delete("/:id", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);

    const { error } = await request.supabase
      .from("clientes")
      .delete()
      .eq("id", request.params.id)
      .eq("empresa_id", perfil.empresa_id);

    if (error) {
      throw error;
    }

    response.status(204).send();
  } catch (error) {
    sendError(response, error);
  }
});
