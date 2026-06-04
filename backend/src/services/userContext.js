export async function getUserContext(request) {
  const { data: perfil, error: perfilError } = await request.supabase
    .from("perfiles")
    .select("id, empresa_id, nombre, rol")
    .eq("id", request.user.id)
    .single();

  if (perfilError) {
    throw new Error("Perfil no encontrado para el usuario.");
  }

  const { data: empresa, error: empresaError } = await request.supabase
    .from("empresas")
    .select("id, nombre, ruc, razon_social, direccion, telefono, email, logo_url")
    .eq("id", perfil.empresa_id)
    .single();

  if (empresaError) {
    throw new Error("Empresa no encontrada para el usuario.");
  }

  return { perfil, empresa };
}
