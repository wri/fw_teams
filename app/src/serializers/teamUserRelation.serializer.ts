import JSONAPISerializer from "json-api-serializer";
import { ITeamUserRelationModel } from "models/teamUserRelation.model";

const Serializer = new JSONAPISerializer();

Serializer.register("teamUser", {
  jsonapiObject: false,
  id: "id",
  whitelist: ["teamId", "userId", "email", "role", "status", "name"],
  convertCase: "camelCase"
});

const serializeTeamUser = (data: ITeamUserRelationModel | ITeamUserRelationModel[]) => {
  return Serializer.serialize("teamUser", data);
};

export default serializeTeamUser;
