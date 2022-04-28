import { Request } from "koa";
import Router from "koa-router";
import { TeamModel } from "models/team.model";
import { authMiddleware } from "middlewares";
import teamSerializer from "serializers/teamWithUserRole.serializer";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

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

  if (team.administrator.toString() === userId) {
    ctx.status = 400;
    throw new Error("User is the administrator of the team and can't leave");
  }

  if (team.confirmedUsers.some(confirmedUser => confirmedUser.id === userId)) {
    // Remove user from confirmedUsers (Monitor)
    team.confirmedUsers = team.confirmedUsers.filter(confirmedUser => confirmedUser.id !== userId);
  } else if (team.managers.some(manager => manager.id === userId)) {
    // Remove user from managers array
    team.managers = team.managers.filter(manager => manager.id !== userId);
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
