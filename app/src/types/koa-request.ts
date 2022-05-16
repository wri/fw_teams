import { Request } from "koa";

export type TKoaRequest<Body = object, Query extends Request["query"]> = {
  body: {
    loggedUser: any;
  } & Body;
  query: {
    loggedUser: string;
  } & Query;
};
