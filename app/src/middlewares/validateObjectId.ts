import { Middleware } from "koa";
import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logger from "logger";

export function validateObjectId(paramToCheck: string | string[]): Middleware {
  return async function (ctx, next) {
    logger.info("Validating query params");

    const paramsToCheck = Array.isArray(paramToCheck) ? paramToCheck : [paramToCheck];

    for (let i = 0; i < paramsToCheck.length; i++) {
      const param = ctx.params[paramsToCheck[i]];

      if (param && !mongoose.Types.ObjectId.isValid(param)) {
        ctx.status = 400;
        throw new Error(`Invalid param id: ${param}`);
      }
    }

    await next();
  };
}
