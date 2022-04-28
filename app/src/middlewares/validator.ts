import { Middleware } from "koa";
import { AnySchema } from "joi";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logger from "logger";

export function validator(validator: AnySchema["validate"]): Middleware {
  return function (ctx, next) {
    logger.info("Validating body data");

    const { error } = validator(ctx.body);
    if (error) {
      ctx.status = 400;
      throw error;
    }

    next();
  };
}
