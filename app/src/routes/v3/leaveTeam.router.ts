import Router from "koa-router";
import { TeamModel } from "models/team.model";
import teamSerializer from "serializers/teamWithUserRole.serializer";

const router = new Router();

type TQuery = {
  loggedUser: string;
};

type TParams = {
  teamId: string;
};

// GET /v3/teams/leave
router.get("/teams/leave/:teamId", async ctx => {
  const { teamId } = <TParams>ctx.params;
  const query = <TQuery>ctx.request.query;
  const { id: userId } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  // Find the team in DB
  const team = await TeamModel.findById(teamId);

  // Remove user from confirmedUser (Monitor)
  team.confirmedUsers = team.confirmedUsers.filter(confirmedUser => confirmedUser.id !== userId);

  // Remove user from manager area, if not the only manager
  if (team.managers.some(manager => manager.id !== userId)) {
    team.managers = team.managers.filter(manager => manager.id !== userId);
  }

  await team.save();

  ctx.status = 200;
  ctx.body = teamSerializer(team);
});

// GET /v3/reject/:teamId
router.get("/teams/reject/:teamId", async ctx => {
  const { teamId } = <TParams>ctx.params;
  const query = <TQuery>ctx.request.query;
  const { email: userEmail } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  // Find the team in DB
  const team = await TeamModel.findById(teamId);

  // Remove user from users (Invited but not confirmed users)
  team.users = team.users.filter(users => users !== userEmail);

  await team.save();

  ctx.status = 200;
  ctx.body = teamSerializer(team);
});

export default router;
