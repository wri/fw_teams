import Router from "koa-router";
import { authMiddleware, validatorMiddleware, isAdminOrManager, validateObjectId } from "middlewares";
import { TeamModel } from "models/team.model";
import createTeamInput from "./dto/create-team.input";
import updateTeamInput from "./dto/update-team.input";
import { TeamUserRelationModel, EUserRole, EUserStatus } from "models/teamUserRelation.model";
import teamUserRelationService from "services/teamUserRelation.service";
import gfwTeamSerializer from "serializers/gfwTeam.serializer";
import { Request } from "koa";
import { isAdmin, isUser } from "middlewares";

type TRequest = {
  body: any; // ToDo: request body
} & Request;

type TQuery = {
  loggedUser: string;
  userRole?: string;
};

const router = new Router();

// GET /v3/teams/myinvites
// Find teams that auth user is invited to
router.get("/myinvites", authMiddleware, async ctx => {
  const query = <TQuery>ctx.request.query;
  const { id: userId } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  const teams = await teamUserRelationService.getTeamsByUserId(userId, {
    status: EUserStatus.Invited
  });

  ctx.body = gfwTeamSerializer(teams);
});

// GET /v3/teams/:teamId
router.get("/:teamId", authMiddleware, validateObjectId("teamId"), isUser, async ctx => {
  const { teamId } = ctx.params;

  const team = await TeamModel.findById(teamId);

  ctx.body = gfwTeamSerializer(team);
});

// GET /v3/teams/user/:userId
// Get Teams by user id
// Return the user's teams that have admin, manager or monitor roles
// ToDo: What security is need?
router.get("/user/:userId", authMiddleware, validateObjectId("userId"), async ctx => {
  const { userId } = ctx.params;

  const teams = await teamUserRelationService.getTeamsByUserId(userId);

  ctx.body = gfwTeamSerializer(teams);
});

// POST /v3/teams
// Add user as admin to teamUserRelation model
router.post("/", authMiddleware, validatorMiddleware(createTeamInput), async ctx => {
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

  ctx.body = gfwTeamSerializer(team);
});

// PATCH /v3/teams/:teamId
// Need to be admin or manager
router.patch(
  "/:teamId",
  authMiddleware,
  validateObjectId("teamId"),
  validatorMiddleware(updateTeamInput),
  isAdminOrManager,
  async ctx => {
    const { teamId } = ctx.params;
    const { body } = <TRequest>ctx.request;

    const team = await TeamModel.findByIdAndUpdate(
      teamId,
      {
        name: body.name
      },
      { new: true }
    );

    ctx.body = gfwTeamSerializer(team);
  }
);

// DELETE /v3/teams/:teamId
// Need to be admin
router.delete("/:teamId", authMiddleware, validateObjectId("teamId"), isAdmin, async ctx => {
  const { teamId } = ctx.params;

  await TeamModel.findByIdAndRemove(teamId);

  // Remove all team user relations
  await TeamUserRelationModel.remove({
    teamId
  });

  ctx.status = 200;
  ctx.body = "";
});

export default router;