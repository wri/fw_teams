import { Request } from "koa";

export type TLoggedUser = {
  id: string;
  email: string;
};

export type TKoaRequest<Body = object, Query = object> = {
  body: {
    loggedUser: TLoggedUser;
  } & Body;
  query: {
    loggedUser: string;
  } & Query &
    Request["query"];
} & Request;
