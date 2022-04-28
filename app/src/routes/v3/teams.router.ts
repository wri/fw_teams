import Router from "koa-router";
import { authMiddleware, validatorMiddleware } from "middlewares";
import { validateTeam } from "models/team.model";

const router = new Router({
  prefix: "/teams"
});

// GET /v3/teams/:teamId
router.get("/:teamId", authMiddleware, async () => {});

// GET /v3/teams/user/:userId
// Get Teams by user id
router.get("/user/:userId", authMiddleware, async () => {});

// POST /v3/teams
router.post("/", authMiddleware, validatorMiddleware(validateTeam), async () => {});

// PATCH /v3/teams/:teamId
router.patch("/:teamId", authMiddleware, validatorMiddleware(validateTeam), async () => {});

// DELETE /v3/teams/:teamId
router.delete("/:teamId", authMiddleware, async () => {});

export default router;
