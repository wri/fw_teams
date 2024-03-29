import { Middleware, Request } from "koa";
import { EUserRole } from "models/teamUserRelation.model";
import { TeamModel } from "models/team.model";
import TeamUserRelationService from "../services/teamUserRelation.service";

type TRequest = {
  body: {
    loggedUser: any;
  };
  query: any;
} & Request;

type TParams = {
  teamId: string;
};

export const isUser: Middleware = async (ctx, next) => {
  const { teamId } = <TParams>ctx.params;
  const { body, query } = <TRequest>ctx.request;
  const { id: userId } = body.loggedUser || JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  // ToDo: move this to a new middleware
  const numOfTeams = await TeamModel.count({ _id: teamId });
  if (numOfTeams === 0) {
    ctx.status = 404;
    throw new Error(`Team not found with id: ${teamId}`);
  }

  const teamUserRelation = await TeamUserRelationService.findTeamUser(teamId, userId);

  if (!teamUserRelation || teamUserRelation.role === EUserRole.Left) {
    ctx.status = 401;
    throw new Error("Authenticated User must be part of the team");
  }

  await next();
};
