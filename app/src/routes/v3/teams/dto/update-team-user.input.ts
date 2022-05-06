import Joi from "joi";
import { EUserRole } from "models/teamUserRelation.model";
import { TUserRole } from "./create-team-users.input";

export type DTOUpdateTeamUsers = {
  role: TUserRole;
};

export const updateTeamUsersJoiSchema: Joi.PartialSchemaMap<DTOUpdateTeamUsers> = {
  role: Joi.string().valid(EUserRole.Manager, EUserRole.Monitor).required()
};

export default Joi.object<DTOUpdateTeamUsers>(updateTeamUsersJoiSchema);
