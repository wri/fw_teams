import Router from "koa-router";
import { authMiddleware, validatorMiddleware, isAdminOrManager } from "middlewares";
import { TeamModel, validateTeam } from "models/team.model";
import { TeamUserRelationModel, EUserRole, EUserStatus } from "models/teamUserRelation.model";
import { Request } from "koa";
import { isAdmin } from "../../middlewares";

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
// Need to be admin or manager
router.patch("/:teamId", authMiddleware, isAdminOrManager, validatorMiddleware(validateTeam), async () => {});

// DELETE /v3/teams/:teamId
// Need to be admin
type TQuery = {
  loggedUser: string;
  userRole?: string;
};

router.delete("/:teamId", authMiddleware, isAdmin, async ctx => {
  const query = <TQuery>ctx.request.query;
  const { teamId } = ctx.params;
  const { id: userId } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  await TeamModel.findByIdAndRemove(teamId);

  // Remove all team user relations
  await TeamUserRelationModel.remove({
    teamId,
    userId
  });

  ctx.status = 200;
  ctx.body = "";
});

export default router;
