import { createUserSupabaseClient, supabase } from "../config/supabase.js";

export async function requireUser(request, response, next) {
  if (!supabase) {
    response.status(500).json({ error: "Configura SUPABASE_URL y SUPABASE_ANON_KEY." });
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
  request.supabase = createUserSupabaseClient(token);
  next();
}
