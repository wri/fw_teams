import Router from "koa-router";
import { authMiddleware } from "middlewares";

const router = new Router({
  prefix: "/teams"
});

// GET /v3/teams/:teamId
router.get("/:teamId", authMiddleware, async () => {});

// GET /v3/teams/user/:userId
router.get("/user/:userId", authMiddleware, async () => {});

// POST /v3/teams
router.post("/", authMiddleware, async () => {});

// PATCH /v3/teams/:teamId
router.patch("/:teamId", authMiddleware, async () => {});

// DELETE /v3/teams/:teamId
router.delete("/:teamId", authMiddleware, async () => {});

export default router;
