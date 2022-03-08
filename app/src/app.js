const Koa = require("koa");
const cors = require("@koa/cors");
const logger = require("logger");
const koaLogger = require("koa-logger");
const config = require("config");
const loader = require("loader");
const mongoose = require("mongoose");
const loggedInUserService = require("./services/LoggedInUserService");

mongoose.Promise = Promise;
const ErrorSerializer = require("serializers/error.serializer");

const validate = require("koa-validate");

const koaBody = require("koa-body")({
  multipart: true,
  jsonLimit: "50mb",
  formLimit: "50mb",
  textLimit: "50mb"
});

let dbSecret = config.get("mongodb.secret");
if (typeof dbSecret === "string") {
  dbSecret = JSON.parse(dbSecret);
}

const mongoURL =
  "mongodb://" +
  `${dbSecret.username}:${dbSecret.password}` +
  `@${config.get("mongodb.host")}:${config.get("mongodb.port")}` +
  `/${config.get("mongodb.database")}`;

const onDbReady = err => {
  if (err) {
    logger.error(err);
    throw new Error(err);
  }
};

mongoose.connect(mongoURL, onDbReady);

const app = new Koa();

app.use(cors());
app.use(koaBody);
validate(app);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (inErr) {
    let error = inErr;
    try {
      error = JSON.parse(inErr);
    } catch (e) {
      logger.debug("Could not parse error message - is it JSON?: ", inErr);
      error = inErr;
    }
    ctx.status = error.status || ctx.status || 500;
    if (ctx.status >= 500) {
      logger.error(error);
    } else {
      logger.info(error);
    }

    ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
    if (process.env.NODE_ENV === "prod" && ctx.status === 500) {
      ctx.body = "Unexpected error";
    }
    ctx.response.type = "application/vnd.api+json";
  }
});

app.use(koaLogger());

app.use(async function (ctx, next) {
  await loggedInUserService.setLoggedInUser(ctx, logger);
  await next();
});

loader.loadRoutes(app);

const server = app.listen(config.get("service.port"), () => {});

logger.info("Server started in ", config.get("service.port"));

module.exports = server;
