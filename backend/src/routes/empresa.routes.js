import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import { getUserContext } from "../services/userContext.js";
import { sendError } from "../utils/http.js";
import { cleanText } from "../utils/text.js";

export const empresaRouter = Router();

function getEmpresaPayload(body) {
  return {
    nombre: cleanText(body.nombre),
    razon_social: cleanText(body.razon_social) || null,
    ruc: cleanText(body.ruc) || null,
    direccion: cleanText(body.direccion) || null,
    telefono: cleanText(body.telefono) || null,
    email: cleanText(body.email) || null,
    logo_url: cleanText(body.logo_url) || null,
  };
}

empresaRouter.get("/", requireUser, async (request, response) => {
  try {
    const { empresa } = await getUserContext(request);
    response.json({ empresa });
  } catch (error) {
    sendError(response, error, 404);
  }
});

empresaRouter.put("/", requireUser, async (request, response) => {
  try {
    const { perfil } = await getUserContext(request);
    const payload = getEmpresaPayload(request.body);

    if (!payload.nombre) {
      response.status(400).json({ error: "El nombre comercial de la empresa es obligatorio." });
      return;
    }

    const { data, error } = await request.supabase
      .from("empresas")
      .update(payload)
      .eq("id", perfil.empresa_id)
      .select("id, nombre, ruc, razon_social, direccion, telefono, email, logo_url")
      .single();

    if (error) {
      throw error;
    }

    response.json({ empresa: data });
  } catch (error) {
    sendError(response, error);
  }
});
