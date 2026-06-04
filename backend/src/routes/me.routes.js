import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import { getUserContext } from "../services/userContext.js";

export const meRouter = Router();

meRouter.get("/me", requireUser, async (request, response) => {
  try {
    const context = await getUserContext(request);

    response.json({
      user: {
        id: request.user.id,
        email: request.user.email,
      },
      perfil: context.perfil,
      empresa: context.empresa,
    });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
});
