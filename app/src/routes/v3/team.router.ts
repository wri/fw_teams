import Router from "koa-router";
import { TeamModel } from "models";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TeamSerializer from "serializers/team.serializer";

const router = new Router({
  prefix: "/teams"
});

// GET v3/teams
router.get("/", async ctx => {
  const teams = await TeamModel.find();

  ctx.body = TeamSerializer.serialize(teams);
});

export default router;
