import Router from "koa-router";
import { authMiddleware, validatorMiddleware } from "middlewares";
import { validateTeamUser } from "models/teamUserRelation.model";

const router = new Router({
  prefix: "/teams/:teamId/user"
});

// POST /v3/teams/:teamId/user/:userId
// Add user to team, send invitation
router.post("/:userId", authMiddleware, validatorMiddleware(validateTeamUser), async () => {});

// PATCH /v3/teams/:teamId/user/:userId
// Update a user's role on a team
router.post("/:userId", authMiddleware, validatorMiddleware(validateTeamUser), async () => {});

// DELETE /v3/teams/:teamId/user/:userId
// Remove user from team
router.delete("/:userId", authMiddleware, async () => {});

export default router;
