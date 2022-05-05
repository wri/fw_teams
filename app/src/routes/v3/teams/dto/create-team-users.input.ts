import Joi from "joi";
import { EUserRole, ITeamUserRelation } from "models/teamUserRelation.model";

type TUserRole = Exclude<Exclude<EUserRole, EUserRole.Administrator>, EUserRole.Left>;

export type DTOCreateTeamUsers = {
  users: {
    email: ITeamUserRelation["email"];
    role: TUserRole;
  }[];
};

export const createTeamUsersJoiSchema: Joi.PartialSchemaMap<DTOCreateTeamUsers> = {
  users: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required(),
      role: Joi.string().valid(EUserRole.Manager, EUserRole.Monitor).required()
    }).required()
  )
};

export default Joi.object<DTOCreateTeamUsers>(createTeamUsersJoiSchema);
