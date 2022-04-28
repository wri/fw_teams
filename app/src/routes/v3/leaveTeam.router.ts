import { Request } from "koa";
import Router from "koa-router";
import { TeamModel } from "models/team.model";
import { authMiddleware } from "middlewares";
import teamSerializer from "serializers/teamWithUserRole.serializer";

const router = new Router();

type TRequest = {
  body: {
    loggedUser: any;
  };
} & Request;

type TParams = {
  teamId: string;
};

// PATCH /v3/teams/leave/:teamId
router.patch("/teams/leave/:teamId", authMiddleware, async ctx => {
  const { teamId } = <TParams>ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: userId } = body.loggedUser; // ToDo: loggedUser Type

  // Find the team in DB
  const team = await TeamModel.findById(teamId);

  if (team.confirmedUsers.some(confirmedUser => confirmedUser.id === userId)) {
    // Remove user from confirmedUsers (Monitor)
    team.confirmedUsers = team.confirmedUsers.filter(confirmedUser => confirmedUser.id !== userId);
  } else if (team.managers.some(manager => manager.id !== userId) && team.managers.length > 1) {
    // Remove user from managers array, if not the only manager
    team.managers = team.managers.filter(manager => manager.id !== userId);
  } else if (team.managers.some(manager => manager.id === userId) && team.managers.length === 1) {
    ctx.status = 400;
    throw new Error("User is the only manager of the team and can't leave");
  } else {
    ctx.status = 400;
    throw new Error("User not member of team");
  }

  await team.save();

  ctx.status = 200;
  ctx.body = teamSerializer(team);
});

// PATCH /v3/reject/:teamId
router.patch("/teams/reject/:teamId", authMiddleware, async ctx => {
  const { teamId } = <TParams>ctx.params;
  const { body } = <TRequest>ctx.request;
  const { email: userEmail } = body.loggedUser; // ToDo: loggedUser Type

  // Find the team in DB
  const team = await TeamModel.findById(teamId);

  if (team.users.some(users => users === userEmail)) {
    // Remove user from users (Invited but not confirmed users)
    team.users = team.users.filter(users => users !== userEmail);
  } else {
    ctx.status = 400;
    throw new Error("User not invited to the team");
  }

  await team.save();

  ctx.status = 200;
  ctx.body = teamSerializer(team);
});

export default router;
