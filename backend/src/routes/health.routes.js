import { Router } from "express";
import { hasSupabaseConfig } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    ok: true,
    app: "CotizaPro SaaS Backend",
    supabaseConfigured: hasSupabaseConfig(),
  });
});
