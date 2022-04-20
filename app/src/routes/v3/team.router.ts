import Router from "koa-router";
import { TeamModel } from "models";
import { authMiddleware } from "middlewares";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TeamSerializer from "serializers/team.serializer";

const router = new Router();

// GET v3/teams
router.get("/myteams", authMiddleware, async ctx => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const loggedUser = JSON.parse(ctx.request.query.loggedUser);

  console.log(loggedUser.id);

  const teams = await TeamModel.find({
    $or: [
      { "managers.id": loggedUser.id },
      { "confirmedUsers.id": loggedUser.id },
      { "sentInvitations.id": loggedUser.id }
    ]
  });

  ctx.body = teams;
});

export default router;
