import { Middleware, Request } from "koa";
import { TeamUserRelationModel, EUserRole } from "models/teamUserRelation.model";

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

  try {
    await TeamUserRelationModel.findOne({
      teamId,
      userId
    });
  } catch (e) {
    ctx.status = 401;
    throw new Error("Authenticated User must be part of the team");
  }

  await next();
};
