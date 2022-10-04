import Joi from "joi";
import { ITeam } from "models/team.model";

export type DTOCreateTeam = {
  name: ITeam["name"];
};

export const createTeamJoiSchema: Joi.PartialSchemaMap<DTOCreateTeam> = {
  name: Joi.string().min(3).max(1024).required()
};

export default Joi.object<DTOCreateTeam>(createTeamJoiSchema);
