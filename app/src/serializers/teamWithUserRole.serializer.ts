import JSONAPISerializer from "json-api-serializer";
import { ITeamModel } from "models/legacy_team.model";

const Serializer = new JSONAPISerializer();

Serializer.register("team", {
  jsonapiObject: false,
  id: "id",
  whitelist: ["name", "managers", "userRole", "users", "areas", "layers", "confirmedUsers", "createdAt"],
  convertCase: "camelCase"
});

const serializeTeam = (data: ITeamModel | ITeamModel[]) => {
  return Serializer.serialize("team", data);
};

export default serializeTeam;
