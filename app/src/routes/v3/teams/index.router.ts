import Router from "koa-router";
import { TKoaRequest, TLoggedUser } from "types/koa-request";
import { authMiddleware, validatorMiddleware, isAdminOrManager, validateObjectId, isAdmin, isUser } from "middlewares";
import createTeamInput, { DTOCreateTeam } from "./dto/create-team.input";
import updateTeamInput, { DTOUpdateTeam } from "./dto/update-team.input";
import TeamService from "services/team.service";
import gfwTeamSerializer from "serializers/gfwTeam.serializer";
import { EUserRole, ITeamUserRelationModel } from "models/teamUserRelation.model";
import TeamUserRelationService from "services/teamUserRelation.service";
import AreaService from "services/areas.service";

const router = new Router();

// GET /v3/teams/myinvites
// Find teams that auth user is invited to
router.get("/myinvites", authMiddleware, async ctx => {
  const { query } = <TKoaRequest>ctx.request;
  const { email: loggedEmail } = <TLoggedUser>JSON.parse(query.loggedUser);

  const teams = await TeamService.findAllInvites(loggedEmail);

  ctx.body = gfwTeamSerializer(teams);
});

// GET /v3/teams/:teamId
router.get("/:teamId", authMiddleware, validateObjectId("teamId"), isUser, async ctx => {
  const { teamId } = ctx.params;

  const team = await TeamService.findById(teamId);

  ctx.body = gfwTeamSerializer(team);
});

// GET /v3/teams/user/:userId
// Get Teams by user id
// Return the user's teams that have admin, manager or monitor roles
// ToDo: What security is need?
router.get("/user/:userId", authMiddleware, validateObjectId("userId"), async ctx => {
  const { userId } = ctx.params;

  const teams = await TeamService.findAllByUserId(userId);

  // get members of teams and areas of team
  const teamsToSend = [];
  for await (const team of teams) {
    const { query } = <TKoaRequest>ctx.request;
    const { id: userId } = <TLoggedUser>JSON.parse(query.loggedUser);
    const teamId = team._id;

    const teamUserRelation = await TeamUserRelationService.findTeamUser(teamId, userId);

    let users: ITeamUserRelationModel[] = [];
    if (teamUserRelation.role === EUserRole.Administrator || teamUserRelation.role === EUserRole.Manager) {
      users = await TeamUserRelationService.findAllUsersOnTeam(teamId);
    } else {
      users = await TeamUserRelationService.findAllUsersOnTeam(teamId).select("-status");
    }

    team.members = users;

    // array of area ids
    const areas = await AreaService.getTeamAreas(teamId);
    team.areas = [];
    if (areas && areas.data) team.areas = areas.data;

    teamsToSend.push(team);
  }

  ctx.body = gfwTeamSerializer(teamsToSend);
});

// POST /v3/teams
// Add user as admin to teamUserRelation model
router.post("/", authMiddleware, validatorMiddleware(createTeamInput), async ctx => {
  const { body } = <TKoaRequest<DTOCreateTeam>>ctx.request;

  const team = await TeamService.create(body.name, body.loggedUser);

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
    const { body } = <TKoaRequest<DTOUpdateTeam>>ctx.request;

    const team = await TeamService.update(teamId, body.name);

    ctx.body = gfwTeamSerializer(team);
  }
);

// DELETE /v3/teams/:teamId
// Need to be admin
router.delete("/:teamId", authMiddleware, validateObjectId("teamId"), isAdmin, async ctx => {
  const { teamId } = ctx.params;

  await TeamService.delete(teamId);

  ctx.status = 200;
  ctx.body = "";
});

export default router;
