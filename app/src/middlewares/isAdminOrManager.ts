import { Middleware, Request } from "koa";
import { TeamUserRelationModel, EUserRole } from "models/teamUserRelation.model";
import { TeamModel } from "models/team.model";

type TRequest = {
  body: {
    loggedUser: any;
  };
  query: any;
} & Request;

type TParams = {
  teamId: string;
};

export const isAdminOrManager: Middleware = async (ctx, next) => {
  const { teamId } = <TParams>ctx.params;
  const { body, query } = <TRequest>ctx.request;
  const { id: userId } = body.loggedUser || JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  const numOfTeams = await TeamModel.count({ _id: teamId });
  if (numOfTeams === 0) {
    ctx.status = 404;
    throw new Error(`Team not found with id: ${teamId}`);
  }

  const teamUserRelation = await TeamUserRelationModel.findOne({
    teamId,
    userId
  });

  if (
    teamUserRelation &&
    (teamUserRelation.role === EUserRole.Administrator || teamUserRelation.role === EUserRole.Manager)
  ) {
    await next();
  } else {
    ctx.status = 401;
    throw new Error("Authenticated User must be the Administrator or a Manager of the team");
  }
};
