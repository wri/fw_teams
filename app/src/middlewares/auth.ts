import { Middleware } from "koa";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logger from "logger";

export const authMiddleware: Middleware = async (ctx, next) => {
  logger.info(`Verifying if user is authenticated`);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { query, body } = ctx.request;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = { ...(query.loggedUser ? JSON.parse(query.loggedUser) : {}), ...body.loggedUser };

  if (!user || !user.id) {
    ctx.throw(401, "Unauthorized");
    return;
  }
  await next();
};
