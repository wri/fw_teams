import { Middleware } from "koa";
import { AnySchema } from "joi";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logger from "logger";

export function validatorMiddleware(schema: AnySchema): Middleware {
  return async function (ctx, next) {
    logger.info("Validating body data");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const body = { ...ctx.request.body };

    delete body["loggedUser"];
    delete body["token"];

    const { error } = schema.validate(body);
    if (error) {
      ctx.status = 400;
      throw error;
    }

    await next();
  };
}
