export function sendError(response, error, status = 500) {
  response.status(status).json({ error: error.message || "Error del servidor." });
}
