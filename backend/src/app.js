import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { meRouter } from "./routes/me.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json());

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", meRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: "Ruta no encontrada." });
  });

  return app;
}
