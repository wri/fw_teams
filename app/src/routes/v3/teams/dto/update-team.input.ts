import Joi from "joi";
import { DTOCreateTeam, createTeamJoiSchema } from "./create-team.input";

export type DTOUpdateTeam = DTOCreateTeam;

const updateTeamJoiSchema: Joi.PartialSchemaMap<DTOUpdateTeam> = {
  ...createTeamJoiSchema
};

export default Joi.object<DTOUpdateTeam>(updateTeamJoiSchema);
