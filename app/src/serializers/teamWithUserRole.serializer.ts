import JSONAPISerializer from "json-api-serializer";
import { ITeamModel } from "models/team.model";

const Serializer = new JSONAPISerializer();

Serializer.register("team", {
  jsonapiObject: false,
  id: "id",
  whitelist: ["name", "managers", "userRole", "users", "areas", "layers", "confirmedUsers", "createdAt"],
  convertCase: "camelCase"
});

const serializeTeam = (data: ITeamModel[]) => {
  return Serializer.serialize("team", data);
};

export default serializeTeam;
