import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import {
  calculateTotals,
  getCotizacionPayload,
  getEstado,
  getItemsPayload,
} from "../services/cotizaciones.js";
import { getUserContext } from "../services/userContext.js";
import { sendError } from "../utils/http.js";

export const cotizacionesRouter = Router();

const cotizacionSelect =
  "id, empresa_id, cliente_id, numero, fecha, vencimiento, estado, subtotal, iva, total, notas, created_at, updated_at, cliente:clientes(id, nombre, email, telefono)";

async function ensureClienteBelongsToEmpresa(request, clienteId, empresaId) {
  const { data, error } = await request.supabase
    .from("clientes")
    .select("id")
    .eq("id", clienteId)
    .eq("empresa_id", empresaId)
    .single();

  if (error || !data) {
    throw new Error("Cliente no encontrado para la empresa.");
  }
}

async function getCotizacion(request, empresaId, id) {
  const { data, error } = await request.supabase
    .from("cotizaciones")
    .select(`${cotizacionSelect}, items:cotizacion_items(id, descripcion, cantidad, precio_unitario, total)`)
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function replaceItems(request, cotizacionId, items) {
  const { error: deleteError } = await request.supabase
    .from("cotizacion_items")
    .delete()
    .eq("cotizacion_id", cotizacionId);

  if (deleteError) {
    throw deleteError;
  }

  if (!items.length) {
    return;
  }

  const { error: insertError } = await request.supabase.from("cotizacion_items").insert(
    items.map((item) => ({
      ...item,
      cotizacion_id: cotizacionId,
    })),
  );

  if (insertError) {
    throw insertError;
  }
}

cotizacionesRouter.get("/", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);

    const { data, error } = await request.supabase
      .from("cotizaciones")
      .select(cotizacionSelect)
      .eq("empresa_id", perfil.empresa_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    response.json({ cotizaciones: data });
  } catch (error) {
    sendError(response, error);
  }
});

cotizacionesRouter.get("/:id", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const cotizacion = await getCotizacion(request, perfil.empresa_id, request.params.id);

    response.json({ cotizacion });
  } catch (error) {
    sendError(response, error, 404);
  }
});

cotizacionesRouter.post("/", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const payload = getCotizacionPayload(request.body);
    const items = getItemsPayload(request.body.items);

    if (!payload.cliente_id) {
      response.status(400).json({ error: "El cliente es obligatorio." });
      return;
    }

    if (!items.length) {
      response.status(400).json({ error: "Agrega al menos un item valido." });
      return;
    }

    await ensureClienteBelongsToEmpresa(request, payload.cliente_id, perfil.empresa_id);

    const totals = calculateTotals(items);
    const { data, error } = await request.supabase
      .from("cotizaciones")
      .insert({
        ...payload,
        ...totals,
        empresa_id: perfil.empresa_id,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await replaceItems(request, data.id, items);

    const cotizacion = await getCotizacion(request, perfil.empresa_id, data.id);
    response.status(201).json({ cotizacion });
  } catch (error) {
    sendError(response, error);
  }
});

cotizacionesRouter.put("/:id", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const payload = getCotizacionPayload(request.body);
    const items = getItemsPayload(request.body.items);

    if (!payload.cliente_id) {
      response.status(400).json({ error: "El cliente es obligatorio." });
      return;
    }

    if (!items.length) {
      response.status(400).json({ error: "Agrega al menos un item valido." });
      return;
    }

    await ensureClienteBelongsToEmpresa(request, payload.cliente_id, perfil.empresa_id);

    const totals = calculateTotals(items);
    const { error } = await request.supabase
      .from("cotizaciones")
      .update({
        ...payload,
        ...totals,
      })
      .eq("id", request.params.id)
      .eq("empresa_id", perfil.empresa_id);

    if (error) {
      throw error;
    }

    await replaceItems(request, request.params.id, items);

    const cotizacion = await getCotizacion(request, perfil.empresa_id, request.params.id);
    response.json({ cotizacion });
  } catch (error) {
    sendError(response, error);
  }
});

cotizacionesRouter.patch("/:id/estado", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const estado = getEstado(request.body.estado, "");

    if (!estado) {
      response.status(400).json({ error: "Estado invalido." });
      return;
    }

    const { error } = await request.supabase
      .from("cotizaciones")
      .update({ estado })
      .eq("id", request.params.id)
      .eq("empresa_id", perfil.empresa_id);

    if (error) {
      throw error;
    }

    const cotizacion = await getCotizacion(request, perfil.empresa_id, request.params.id);
    response.json({ cotizacion });
  } catch (error) {
    sendError(response, error);
  }
});

cotizacionesRouter.delete("/:id", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);

    const { error } = await request.supabase
      .from("cotizaciones")
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
