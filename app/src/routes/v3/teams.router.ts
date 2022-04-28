import Router from "koa-router";
import { authMiddleware, validatorMiddleware } from "middlewares";
import { TeamModel, validateTeam } from "models/team.model";
import { TeamUserRelationModel, EUserRole, EUserStatus } from "models/teamUserRelation.model";
import { Request } from "koa";

type TRequest = {
  body: any; // ToDo: request body
} & Request;

const router = new Router({
  prefix: "/teams"
});

// GET /v3/teams/myinvites
// Find teams the that auth user is invited to

// GET /v3/teams/:teamId
router.get("/:teamId", authMiddleware, async () => {});

// GET /v3/teams/user/:userId
// Get Teams by user id
// Return the user's teams that have admin, manager or monitor roles
router.get("/user/:userId", authMiddleware, async () => {});

// POST /v3/teams
// Add user as admin to teamUserRelation model
router.post("/", authMiddleware, async ctx => {
  const { body } = <TRequest>ctx.request;

  const team = await new TeamModel({
    name: body.name
  }).save();

  // Add auth user to teamUserRelation Model
  const { id: userId, email: userEmail } = body.loggedUser; // ToDo: loggedUser Type

  await new TeamUserRelationModel({
    teamId: team.id,
    userId: userId,
    email: userEmail,
    role: EUserRole.Administrator,
    status: EUserStatus.Confirmed
  }).save();

  ctx.body = team; // ToDo: add serializer
});

// PATCH /v3/teams/:teamId
// Need to be admin
router.patch("/:teamId", authMiddleware, validatorMiddleware(validateTeam), async () => {});

// DELETE /v3/teams/:teamId
// Need to be admin
router.delete("/:teamId", authMiddleware, async () => {});

export default router;