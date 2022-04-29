import JSONAPISerializer from "json-api-serializer";
import { ITeamModel } from "models/team.model";

const Serializer = new JSONAPISerializer();

Serializer.register("team", {
  jsonapiObject: false,
  id: "id",
  whitelist: ["name", "userRole", "createdAt"],
  convertCase: "camelCase"
});

const serializeTeam = (data: ITeamModel | ITeamModel[]) => {
  return Serializer.serialize("team", data);
};

export default serializeTeam;
