export function getAuthErrorMessage(error) {
  const message = error?.message || "";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email not confirmed")) {
    return "Debes confirmar tu email antes de ingresar. Revisa tu correo o desactiva la confirmacion de email en Supabase para pruebas.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "Email o contrasena incorrectos.";
  }

  return message || "No se pudo completar la accion.";
}
