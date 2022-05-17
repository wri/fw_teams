import { Request } from "koa";

export type TKoaRequest<Body = object, Query = object> = {
  body: {
    loggedUser: any; // ToDo: loggedUser Type
  } & Body;
  query: {
    loggedUser: string; // ToDo: loggedUser Type
  } & Query &
    Request["query"];
} & Request;
