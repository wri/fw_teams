import Router from "koa-router";
import { authMiddleware } from "middlewares";

const router = new Router({
  prefix: "/teams/:teamId/user"
});

// POST /v3/teams/:teamId/users
// Add users to team, and send invitations
// body: { users: [ { userId, teamId, email, role, status } ] }
// Only manager or admin can access this router
// ToDo: add middleware for managers or admins
router.post("/", authMiddleware, async () => {});

// PATCH /v3/teams/:teamId/user/:userId
// Update a user's role on a team
// body: { users: [ { userId, teamId, email, role, status } ] }
// Only manager or admin can access this router
router.patch("/:userId", authMiddleware, async () => {});

// PATCH /v3/teams/:teamId/user/:userId/accept
// Update user's role to "confirmed"
// Only if JWT's userid match the one in the URL

// PATCH /v3/teams/:teamId/user/:userId/decline
// Update user's role to "declined"
// Only if JWT's userid match the one in the URL

// PATCH /v3/teams/:teamId/user/:userId/leave
// Update user's role to "left"
// Only if JWT's userid match the one in the URL
// Unless auth user is admin
router.patch("/:userId/leave", authMiddleware, async () => {});

export default router;
